import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";
import type { LoanFormData } from "@/lib/loan-store";

export type PaymentStatus = "payment_opened" | "paid" | "cancelled";

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

function isPaymentStatus(value: unknown): value is PaymentStatus {
  return value === "payment_opened" || value === "paid" || value === "cancelled";
}

function normalizeData(data: Partial<LoanFormData> | undefined): LoanFormData {
  return {
    firstName: String(data?.firstName || ""),
    lastName: String(data?.lastName || ""),
    dob: String(data?.dob || ""),
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

export async function readApplications(): Promise<LoanApplicationRecord[]> {
  try {
    const raw = await readFile(DATA_FILE, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function writeApplications(records: LoanApplicationRecord[]) {
  await ensureDataDir();
  await writeFile(DATA_FILE, JSON.stringify(records, null, 2));
}

export async function upsertApplication(input: Partial<ApplicationInput>) {
  if (!input.reference || !input.data || !isPaymentStatus(input.paymentStatus)) {
    throw new Error("Invalid application payload");
  }

  const now = new Date().toISOString();
  const records = await readApplications();
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

  await writeApplications(records);
  return nextRecord;
}
