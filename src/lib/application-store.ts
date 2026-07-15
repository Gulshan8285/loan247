import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type { LoanFormData } from "@/lib/loan-store";

export type PaymentStatus = "pending" | "paid" | "rejected";

export type LoanApplicationRecord = {
  id: string;
  reference: string;
  createdAt: string;
  updatedAt: string;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  paymentProvider: "Razorpay";
  paymentLink: string;
  data: LoanFormData;
};

type ApplicationInput = {
  reference: string;
  paymentStatus: PaymentStatus;
  paymentAmount: number;
  paymentProvider: "Razorpay";
  paymentLink: string;
  data: LoanFormData;
};

const DATA_FILE = path.join("/tmp", "loan247-applications.json");
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

export async function readApplications(): Promise<LoanApplicationRecord[]> {
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
  const storage = githubStorageConfig() ? await readGithubApplications() : null;
  const records = storage ? storage.records : await readApplications();
  const normalizedData = normalizeData(input.data);
  const existingIndex = records.findIndex((record) => record.reference === input.reference);

  const nextRecord: LoanApplicationRecord = {
    id: existingIndex >= 0 ? records[existingIndex].id : randomUUID(),
    reference: input.reference,
    createdAt: existingIndex >= 0 ? records[existingIndex].createdAt : now,
    updatedAt: now,
    paymentStatus: input.paymentStatus,
    paymentAmount: Number(input.paymentAmount || 59),
    paymentProvider: "Razorpay",
    paymentLink: String(input.paymentLink || ""),
    data: normalizedData,
  };

  if (existingIndex >= 0) {
    records[existingIndex] = nextRecord;
  } else {
    records.unshift(nextRecord);
  }

  if (storage) {
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
