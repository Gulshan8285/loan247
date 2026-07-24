import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import { GetObjectCommand, PutObjectCommand, S3Client, S3ServiceException } from "@aws-sdk/client-s3";
import type { LoanFormData } from "@/lib/loan-store";
import { connectMongoDB } from "@/lib/mongodb";

export type PaymentStatus = "pending" | "paid" | "rejected";
export type PaymentProvider = "UPI" | "Razorpay";

export type LoanApplicationRecord = {
  id: string;
  reference: string;
  createdAt: string;
  updatedAt: string;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  paymentProvider: PaymentProvider;
  paymentLink: string;
  lastStep?: number;
  lastStepLabel?: string;
  data: LoanFormData;
};

type ApplicationInput = {
  reference: string;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  paymentProvider: PaymentProvider;
  paymentLink: string;
  lastStep?: number;
  lastStepLabel?: string;
  data: LoanFormData;
};

const DATA_FILE = path.join("/tmp", "loan247-applications.json");
const MONGO_COLLECTION = "loan247_applications";
const DEFAULT_STORAGE_BRANCH = "main";
const DEFAULT_STORAGE_PATH = "applications.json";
const DEFAULT_S3_KEY = "applications/applications.json";

type GithubFile = {
  records: LoanApplicationRecord[];
  sha?: string;
};

function githubStorageConfig() {
  const token = process.env.APPLICATIONS_GITHUB_TOKEN || process.env.GITHUB_TOKEN || "";
  const repo = process.env.APPLICATIONS_STORAGE_REPO || "";
  const branch = process.env.APPLICATIONS_STORAGE_BRANCH || DEFAULT_STORAGE_BRANCH;
  const filePath = process.env.APPLICATIONS_STORAGE_PATH || DEFAULT_STORAGE_PATH;

  if (!token || !repo) return null;
  return { token, repo, branch, filePath };
}

function canUseMongoStorage() {
  return Boolean(process.env.MONGODB_URI);
}

function s3StorageConfig() {
  const bucket = process.env.APPLICATIONS_S3_BUCKET || "";
  const region = process.env.AWS_REGION || process.env.AWS_DEFAULT_REGION || "ap-south-1";
  const key = process.env.APPLICATIONS_S3_KEY || DEFAULT_S3_KEY;

  if (!bucket) return null;
  return { bucket, region, key };
}

export function getApplicationsStorageTarget() {
  if (canUseMongoStorage()) {
    return {
      type: "MongoDB",
      location: `collection:${MONGO_COLLECTION}`,
    };
  }

  const s3Config = s3StorageConfig();
  if (s3Config) {
    return {
      type: "AWS S3 private bucket",
      location: `${s3Config.bucket}/${s3Config.key}`,
    };
  }

  const githubConfig = githubStorageConfig();
  if (githubConfig) {
    return {
      type: "GitHub private file",
      location: `${githubConfig.repo}/${githubConfig.filePath}`,
    };
  }

  return {
    type: "Server temp file",
    location: DATA_FILE,
  };
}

function isPaymentStatus(value: unknown): value is PaymentStatus {
  return value === "pending" || value === "paid" || value === "rejected";
}

function normalizeData(data: Partial<LoanFormData> | undefined): LoanFormData {
  return {
    firstName: String(data?.firstName || ""),
    lastName: String(data?.lastName || ""),
    dob: String(data?.dob || ""),
    phone: String(data?.phone || ""),
    address: String(data?.address || ""),
    pincode: String(data?.pincode || ""),
    panCard: String(data?.panCard || "").toUpperCase(),
    loanAmount: Number(data?.loanAmount || 0),
    cibilApprovedAmount: Number(data?.cibilApprovedAmount || 0),
    accountHolderName: String(data?.accountHolderName || ""),
    accountNumber: String(data?.accountNumber || ""),
    ifscCode: String(data?.ifscCode || "").toUpperCase(),
    bankName: String(data?.bankName || ""),
    branch: String(data?.branch || ""),
    googleName: String(data?.googleName || ""),
    googleEmail: String(data?.googleEmail || ""),
    googlePicture: String(data?.googlePicture || ""),
    purpose: data?.purpose || "",
    occupation: data?.occupation || "",
    monthlyIncome: String(data?.monthlyIncome || ""),
    salaryMode: data?.salaryMode || "",
  };
}

function normalizeApplicationRecord(record: Partial<LoanApplicationRecord>): LoanApplicationRecord {
  return {
    id: String(record.id || randomUUID()),
    reference: String(record.reference || ""),
    createdAt: String(record.createdAt || record.updatedAt || new Date().toISOString()),
    updatedAt: String(record.updatedAt || record.createdAt || new Date().toISOString()),
    paymentStatus: isPaymentStatus(record.paymentStatus) ? record.paymentStatus : "pending",
    paymentAmount: Number(record.paymentAmount || 0),
    paymentProvider: record.paymentProvider === "Razorpay" ? "Razorpay" : "UPI",
    paymentLink: String(record.paymentLink || ""),
    lastStep: typeof record.lastStep === "number" ? record.lastStep : undefined,
    lastStepLabel: String(record.lastStepLabel || ""),
    data: normalizeData(record.data),
  };
}

async function ensureDataDir() {
  await mkdir(path.dirname(DATA_FILE), { recursive: true });
}

function githubHeaders(token: string) {
  return {
    Accept: "application/vnd.github+json",
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
    "X-GitHub-Api-Version": "2022-11-28",
  };
}

async function streamToText(stream: unknown): Promise<string> {
  if (!stream) return "";

  const streamWithTransform = stream as { transformToString?: () => Promise<string> };
  if (typeof streamWithTransform.transformToString === "function") {
    return streamWithTransform.transformToString();
  }

  const chunks: Buffer[] = [];
  for await (const chunk of stream as AsyncIterable<Uint8Array>) {
    chunks.push(Buffer.from(chunk));
  }

  return Buffer.concat(chunks).toString("utf8");
}

function s3Client(region: string) {
  return new S3Client({ region });
}

async function readS3Applications(): Promise<LoanApplicationRecord[] | null> {
  const config = s3StorageConfig();
  if (!config) return null;

  try {
    const response = await s3Client(config.region).send(
      new GetObjectCommand({
        Bucket: config.bucket,
        Key: config.key,
      }),
    );
    const raw = await streamToText(response.Body);
    const parsed = JSON.parse(raw || "[]");
    return Array.isArray(parsed) ? parsed.map(normalizeApplicationRecord) : [];
  } catch (error) {
    if (
      error instanceof S3ServiceException &&
      (error.name === "NoSuchKey" || error.$metadata.httpStatusCode === 404)
    ) {
      return [];
    }

    throw error;
  }
}

async function writeS3Applications(records: LoanApplicationRecord[]) {
  const config = s3StorageConfig();
  if (!config) return false;

  await s3Client(config.region).send(
    new PutObjectCommand({
      Bucket: config.bucket,
      Key: config.key,
      Body: JSON.stringify(records, null, 2),
      ContentType: "application/json",
      ServerSideEncryption: "AES256",
    }),
  );

  return true;
}

async function readGithubApplications(): Promise<GithubFile> {
  const config = githubStorageConfig();
  if (!config) return { records: [] };

  const url = `https://api.github.com/repos/${config.repo}/contents/${encodeURIComponent(
    config.filePath,
  )}?ref=${encodeURIComponent(config.branch)}`;
  const response = await fetch(url, {
    headers: githubHeaders(config.token),
    cache: "no-store",
  });

  if (response.status === 404) {
    return { records: [] };
  }

  if (!response.ok) {
    throw new Error("Unable to read private application storage");
  }

  const payload = await response.json();
  const raw = Buffer.from(String(payload.content || ""), "base64").toString("utf8");
  const parsed = JSON.parse(raw || "[]");

  return {
    records: Array.isArray(parsed) ? parsed : [],
    sha: payload.sha,
  };
}

async function writeGithubApplications(records: LoanApplicationRecord[], sha?: string) {
  const config = githubStorageConfig();
  if (!config) return false;

  const url = `https://api.github.com/repos/${config.repo}/contents/${encodeURIComponent(
    config.filePath,
  )}`;
  const body: Record<string, unknown> = {
    message: "Update LOAN247 application data",
    content: Buffer.from(JSON.stringify(records, null, 2)).toString("base64"),
    branch: config.branch,
  };

  if (sha) {
    body.sha = sha;
  }

  const response = await fetch(url, {
    method: "PUT",
    headers: githubHeaders(config.token),
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    throw new Error("Unable to write private application storage");
  }

  return true;
}

async function getMongoApplicationsCollection() {
  const connection = await connectMongoDB();
  const database = connection.connection.db;
  if (!database) throw new Error("MongoDB database is not available.");
  return database.collection<LoanApplicationRecord>(MONGO_COLLECTION);
}

async function readMongoApplications(): Promise<LoanApplicationRecord[] | null> {
  if (!canUseMongoStorage()) return null;

  const collection = await getMongoApplicationsCollection();
  const records = await collection
    .find({})
    .sort({ updatedAt: -1, createdAt: -1 })
    .toArray();

  return records.map(normalizeApplicationRecord);
}

async function upsertMongoApplication(record: LoanApplicationRecord) {
  if (!canUseMongoStorage()) return false;

  const collection = await getMongoApplicationsCollection();
  await collection.updateOne(
    { reference: record.reference },
    { $set: record },
    { upsert: true },
  );

  return true;
}

export async function readApplications(): Promise<LoanApplicationRecord[]> {
  try {
    const mongoRecords = await readMongoApplications();
    if (mongoRecords) return mongoRecords;
  } catch {
    /* fall back to configured backup or local storage */
  }

  try {
    const s3Records = await readS3Applications();
    if (s3Records) {
      if (s3Records.length > 0) return s3Records;

      const localRecords = await readLocalApplications();
      if (localRecords.length > 0) {
        await writeS3Applications(localRecords);
        return localRecords;
      }

      return s3Records;
    }
  } catch {
    /* fall back to configured backup or local storage */
  }

  if (githubStorageConfig()) {
    try {
      const { records } = await readGithubApplications();
      const normalizedRecords = records.map(normalizeApplicationRecord);
      if (normalizedRecords.length > 0) return normalizedRecords;
    } catch {
      /* fall back to local storage */
    }
  }

  return readLocalApplications();
}

async function readLocalApplications(): Promise<LoanApplicationRecord[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.map(normalizeApplicationRecord) : [];
  } catch {
    return [];
  }
}

async function writeApplications(records: LoanApplicationRecord[]) {
  if (await writeS3Applications(records)) {
    return;
  }

  const config = githubStorageConfig();
  if (config) {
    const { sha } = await readGithubApplications();
    await writeGithubApplications(records, sha);
    return;
  }

  await ensureDataDir();
  await writeFile(DATA_FILE, JSON.stringify(records, null, 2));
}

export async function upsertApplication(input: Partial<ApplicationInput>) {
  if (!input.reference || !input.data || !isPaymentStatus(input.paymentStatus)) {
    throw new Error("Invalid application payload");
  }

  const now = new Date().toISOString();
  const mongoRecords = canUseMongoStorage() ? await readMongoApplications() : null;
  const s3Records = !mongoRecords ? await readS3Applications() : null;
  const storage =
    !mongoRecords && !s3Records && githubStorageConfig() ? await readGithubApplications() : null;
  const records = mongoRecords || s3Records || (storage ? storage.records : await readApplications());
  const normalizedData = normalizeData(input.data);
  const existingIndex = records.findIndex((record) => record.reference === input.reference);
  const existingRecord = existingIndex >= 0 ? normalizeApplicationRecord(records[existingIndex]) : null;
  const nextPaymentStatus =
    existingRecord &&
    (existingRecord.paymentStatus === "paid" || existingRecord.paymentStatus === "rejected") &&
    input.paymentStatus === "pending"
      ? existingRecord.paymentStatus
      : input.paymentStatus;

  const nextRecord: LoanApplicationRecord = {
    id: existingRecord ? existingRecord.id : randomUUID(),
    reference: input.reference,
    createdAt: existingRecord ? existingRecord.createdAt : now,
    updatedAt: now,
    paymentStatus: nextPaymentStatus,
    paymentAmount: Number(input.paymentAmount || existingRecord?.paymentAmount || 59),
    paymentProvider: input.paymentProvider === "Razorpay" ? "Razorpay" : "UPI",
    paymentLink: String(input.paymentLink || existingRecord?.paymentLink || ""),
    lastStep:
      typeof input.lastStep === "number"
        ? input.lastStep
        : existingRecord?.lastStep,
    lastStepLabel: String(input.lastStepLabel || existingRecord?.lastStepLabel || ""),
    data: normalizedData,
  };

  if (existingIndex >= 0) {
    records[existingIndex] = nextRecord;
  } else {
    records.unshift(nextRecord);
  }

  if (mongoRecords) {
    await upsertMongoApplication(nextRecord);
  } else if (s3Records) {
    await writeS3Applications(records);
  } else if (storage) {
    await writeGithubApplications(records, storage.sha);
  } else {
    await writeApplications(records);
  }

  return nextRecord;
}

export async function findApplication(reference: string) {
  const records = await readApplications();
  return records.find((record) => record.reference === reference) || null;
}
