import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
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
  data: LoanFormData;
};

type ApplicationInput = {
  reference: string;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  paymentProvider: PaymentProvider;
  paymentLink: string;
  data: LoanFormData;
};

const DATA_FILE = path.join("/tmp", "loan247-applications.json");
const MONGO_COLLECTION = "loan247_applications";
const DEFAULT_STORAGE_BRANCH = "main";
const DEFAULT_STORAGE_PATH = "applications.json";

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

  return records.map((record) => ({
    id: String(record.id || randomUUID()),
    reference: String(record.reference || ""),
    createdAt: String(record.createdAt || record.updatedAt || new Date().toISOString()),
    updatedAt: String(record.updatedAt || record.createdAt || new Date().toISOString()),
    paymentStatus: isPaymentStatus(record.paymentStatus) ? record.paymentStatus : "pending",
    paymentAmount: Number(record.paymentAmount || 0),
    paymentProvider: record.paymentProvider === "Razorpay" ? "Razorpay" : "UPI",
    paymentLink: String(record.paymentLink || ""),
    data: normalizeData(record.data),
  }));
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

  if (githubStorageConfig()) {
    const { records } = await readGithubApplications();
    return records;
  }

  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeApplications(records: LoanApplicationRecord[]) {
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
  const storage = !mongoRecords && githubStorageConfig() ? await readGithubApplications() : null;
  const records = mongoRecords || (storage ? storage.records : await readApplications());
  const normalizedData = normalizeData(input.data);
  const existingIndex = records.findIndex((record) => record.reference === input.reference);

  const nextRecord: LoanApplicationRecord = {
    id: existingIndex >= 0 ? records[existingIndex].id : randomUUID(),
    reference: input.reference,
    createdAt: existingIndex >= 0 ? records[existingIndex].createdAt : now,
    updatedAt: now,
    paymentStatus: input.paymentStatus,
    paymentAmount: Number(input.paymentAmount || 59),
    paymentProvider: input.paymentProvider === "Razorpay" ? "Razorpay" : "UPI",
    paymentLink: String(input.paymentLink || ""),
    data: normalizedData,
  };

  if (existingIndex >= 0) {
    records[existingIndex] = nextRecord;
  } else {
    records.unshift(nextRecord);
  }

  if (mongoRecords) {
    await upsertMongoApplication(nextRecord);
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
