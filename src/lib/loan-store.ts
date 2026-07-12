import { create } from "zustand";

export type OccupationType = "Salaried" | "Self-employed" | "Student" | "Business owner" | "";
export type SalaryMode = "Bank transfer" | "Cash" | "Cheque" | "";
export type LoanPurpose =
  | "Home"
  | "Vehicle"
  | "Education"
  | "Business"
  | "Medical"
  | "Travel"
  | "Wedding"
  | "Debt consolidation"
  | "";

export interface LoanFormData {
  firstName: string;
  lastName: string;
  dob: string; // ISO yyyy-mm-dd
  pincode: string;
  panCard: string;
  loanAmount: number;
  cibilApprovedAmount: number; // max allowed (from CIBIL), 0 = not set
  // Bank details
  accountHolderName: string;
  accountNumber: string;
  ifscCode: string;
  bankName: string;
  branch: string;
  purpose: LoanPurpose;
  occupation: OccupationType;
  monthlyIncome: string;
  salaryMode: SalaryMode;
}

export interface LoanState {
  step: number;
  direction: 1 | -1;
  data: LoanFormData;
  setStep: (step: number) => void;
  goNext: () => void;
  goBack: () => void;
  update: (patch: Partial<LoanFormData>) => void;
  reset: () => void;
}

export const TOTAL_STEPS = 13;

const initialData: LoanFormData = {
  firstName: "",
  lastName: "",
  dob: "",
  pincode: "",
  panCard: "",
  loanAmount: 100000,
  cibilApprovedAmount: 0,
  accountHolderName: "",
  accountNumber: "",
  ifscCode: "",
  bankName: "",
  branch: "",
  purpose: "",
  occupation: "",
  monthlyIncome: "",
  salaryMode: "",
};

export const useLoanStore = create<LoanState>((set, get) => ({
  step: 0,
  direction: 1,
  data: initialData,
  setStep: (step) => set({ step, direction: step >= get().step ? 1 : -1 }),
  goNext: () => {
    const { step, data } = get();
    if (step >= TOTAL_STEPS - 1) return;
    // Block forward navigation until the current step is valid
    if (!isStepValid(step, data)) return;
    set({ step: step + 1, direction: 1 });
  },
  goBack: () => {
    const { step } = get();
    if (step > 0) set({ step: step - 1, direction: -1 });
  },
  update: (patch) => set((s) => ({ data: { ...s.data, ...patch } })),
  reset: () => set({ step: 0, direction: 1, data: initialData }),
}));

export function formatINR(n: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

/** Valid PAN format: 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F) */
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

/**
 * Returns the list of missing/invalid field keys for a given step.
 * Empty array means the step is valid and the user may proceed.
 *
 * Step indices:
 *  0 Welcome          — no fields
 *  1 Basic Info       — firstName, lastName, dob, pincode(6), panCard(valid)
 *  2 Analyser         — auto-advances
 *  3 CIBIL Report     — auto-advances
 *  4 Loan Amount      — always has a default value
 *  5 Bank Details     — accountHolderName, accountNumber(>=9), ifsc(valid), bankName
 *  6 Bank Processing  — auto-advances (30s)
 *  7 Pay Fee (₹59)    — custom pay button (handled in-step)
 *  8 Purpose          — purpose selected
 *  9 Occupation       — occupation selected
 *  10 Income          — monthlyIncome(>0), salaryMode selected
 *  11 Review          — always valid
 *  12 Success         — terminal
 */
export function validateStep(step: number, data: LoanFormData): string[] {
  switch (step) {
    case 1: {
      const errs: string[] = [];
      if (!data.firstName.trim()) errs.push("firstName");
      if (!data.lastName.trim()) errs.push("lastName");
      if (!data.dob) errs.push("dob");
      if (data.pincode.length !== 6) errs.push("pincode");
      if (!PAN_REGEX.test(data.panCard)) errs.push("panCard");
      return errs;
    }
    case 5: {
      const errs: string[] = [];
      if (!data.accountHolderName.trim()) errs.push("accountHolderName");
      if (data.accountNumber.replace(/\s/g, "").length < 9) errs.push("accountNumber");
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.ifscCode)) errs.push("ifscCode");
      if (!data.bankName.trim()) errs.push("bankName");
      return errs;
    }
    case 8:
      return data.purpose ? [] : ["purpose"];
    case 9:
      return data.occupation ? [] : ["occupation"];
    case 10: {
      const errs: string[] = [];
      if (!data.monthlyIncome || Number(data.monthlyIncome) <= 0) errs.push("monthlyIncome");
      if (!data.salaryMode) errs.push("salaryMode");
      return errs;
    }
    default:
      return [];
  }
}

export function isStepValid(step: number, data: LoanFormData): boolean {
  return validateStep(step, data).length === 0;
}

/**
 * Deterministic CIBIL score & approved amount for a given customer.
 *
 * Derived from a stable hash of the PAN (falls back to name+dob when PAN is
 * absent) so that the SAME customer always sees the SAME score & approved
 * amount — even after a refresh or revisiting the step.
 *
 * Score is in the low band 440–450 (per product requirement).
 */
const CIBIL_SCORE_MIN = 440;
const CIBIL_SCORE_MAX = 450;
const APPROVED_OPTIONS = [300000, 400000, 500000, 600000, 700000, 800000];

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h);
}

export function getCibilForCustomer(data: LoanFormData): {
  score: number;
  approvedAmount: number;
} {
  const seed =
    data.panCard.trim() ||
    `${data.firstName}|${data.lastName}|${data.dob}`.toUpperCase();
  const h = hashString(seed || "anon");
  const score = CIBIL_SCORE_MIN + (h % (CIBIL_SCORE_MAX - CIBIL_SCORE_MIN + 1));
  const approvedAmount = APPROVED_OPTIONS[h % APPROVED_OPTIONS.length];
  return { score, approvedAmount };
}
