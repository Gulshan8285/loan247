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
  phone: string;
  address: string;
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
  // Google account (from sign-in)
  googleName: string;
  googleEmail: string;
  googlePicture: string;
  selectedLoanSlug: string;
  selectedLoanTitle: string;
  purpose: LoanPurpose;
  occupation: OccupationType;
  monthlyIncome: string;
  salaryMode: SalaryMode;
}

export interface LoanState {
  step: number;
  direction: 1 | -1;
  data: LoanFormData;
  hydrated: boolean; // true once persisted state has been loaded on the client
  supportOpen: boolean; // Support modal open state (shared across components)
  setStep: (step: number) => void;
  goNext: () => void;
  goBack: () => void;
  update: (patch: Partial<LoanFormData>) => void;
  reset: () => void;
  hydrate: () => void;
  setSupportOpen: (open: boolean) => void;
}

/**
 * Flow (10 steps):
 *  0 Welcome
 *  1 Google Login
 *  2 Basic Info
 *  3 Analyser        (auto-advances, 60s)
 *  4 CIBIL Report    (auto-advances, 30s)
 *  5 Loan Amount     (capped at approved amount — decrease only)
 *  6 Bank Details
 *  7 Bank Processing (auto-advances, 30s)
 *  8 Pay Fee (₹59)   (own button)
 *  9 Application In Process  (terminal — "we will connect you")
 */
export const TOTAL_STEPS = 10;

const initialData: LoanFormData = {
  firstName: "",
  lastName: "",
  dob: "",
  phone: "",
  address: "",
  pincode: "",
  panCard: "",
  loanAmount: 100000,
  cibilApprovedAmount: 0,
  accountHolderName: "",
  accountNumber: "",
  ifscCode: "",
  bankName: "",
  branch: "",
  googleName: "",
  googleEmail: "",
  googlePicture: "",
  selectedLoanSlug: "",
  selectedLoanTitle: "",
  purpose: "",
  occupation: "",
  monthlyIncome: "",
  salaryMode: "",
};

/* ----------------------------- Persistence ----------------------------- */
// Form data + current step are persisted to localStorage so a returning
// customer lands on the Pay step with all previously-filled details intact.

const STORAGE_KEY = "aurora-lend-state-v1";

function persistState(state: LoanState) {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ step: state.step, data: state.data }),
    );
  } catch {
    /* ignore quota / privacy errors */
  }
}

export function loadPersistedState(): { step: number; data: LoanFormData } | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (typeof parsed.step !== "number" || typeof parsed.data !== "object") return null;
    return {
      step: Math.max(0, Math.min(TOTAL_STEPS - 1, parsed.step)),
      data: { ...initialData, ...parsed.data },
    };
  } catch {
    return null;
  }
}

function clearPersistedState() {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* ignore */
  }
}

function hasGoogleLogin(data: LoanFormData) {
  return data.googleEmail.trim().length > 0;
}

function requireGoogleLogin(step: number, data: LoanFormData) {
  return step > 1 && !hasGoogleLogin(data) ? 1 : step;
}

export const useLoanStore = create<LoanState>((set, get) => ({
  step: 0,
  direction: 1,
  data: initialData,
  hydrated: false,
  supportOpen: false,
  setStep: (step) => {
    const nextStep = requireGoogleLogin(
      Math.max(0, Math.min(TOTAL_STEPS - 1, step)),
      get().data,
    );
    set({ step: nextStep, direction: nextStep >= get().step ? 1 : -1 });
    persistState(get());
  },
  goNext: () => {
    const { step, data } = get();
    if (step >= TOTAL_STEPS - 1) return;
    if (!isStepValid(step, data)) return;
    set({ step: step + 1, direction: 1 });
    persistState(get());
  },
  goBack: () => {
    const { step } = get();
    if (step > 0) {
      set({ step: step - 1, direction: -1 });
      persistState(get());
    }
  },
  update: (patch) => {
    set((s) => ({ data: { ...s.data, ...patch } }));
    persistState(get());
  },
  reset: () => {
    set({ step: 0, direction: 1, data: initialData });
    clearPersistedState();
  },
  hydrate: () => {
    if (get().hydrated) return;
    const persisted = loadPersistedState();
    if (persisted) {
      set({
        step: requireGoogleLogin(persisted.step, persisted.data),
        data: persisted.data,
        hydrated: true,
      });
    } else {
      set({ hydrated: true });
    }
  },
  setSupportOpen: (open) => set({ supportOpen: open }),
}));

export function formatINR(n: number): string {
  return new Intl.NumberFormat("en-IN", { maximumFractionDigits: 0 }).format(n);
}

/** Valid PAN format: 5 letters + 4 digits + 1 letter (e.g. ABCDE1234F) */
export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/;

/**
 * Returns the list of missing/invalid field keys for a given step.
 * Empty array means the step is valid and the user may proceed.
 */
export function validateStep(step: number, data: LoanFormData): string[] {
  switch (step) {
    case 1:
      return hasGoogleLogin(data) ? [] : ["googleEmail"];
    case 2: {
      // Basic Info
      const errs: string[] = [];
      if (!data.firstName.trim()) errs.push("firstName");
      if (!data.lastName.trim()) errs.push("lastName");
      if (!data.dob) errs.push("dob");
      if (data.phone.replace(/\D/g, "").length !== 10) errs.push("phone");
      if (data.address.trim().length < 8) errs.push("address");
      if (data.pincode.length !== 6) errs.push("pincode");
      if (!PAN_REGEX.test(data.panCard)) errs.push("panCard");
      return errs;
    }
    case 6: {
      // Bank Details
      const errs: string[] = [];
      if (!data.accountHolderName.trim()) errs.push("accountHolderName");
      if (data.accountNumber.replace(/\s/g, "").length < 9) errs.push("accountNumber");
      if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.ifscCode)) errs.push("ifscCode");
      if (!data.bankName.trim()) errs.push("bankName");
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
 * absent) so the SAME customer always sees the SAME score & approved amount
 * — even after a refresh or revisiting the step.
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

/** Stable application reference number (derived from PAN) for the final screen. */
export function getApplicationRef(data: LoanFormData): string {
  const seed = data.panCard.trim() || `${data.firstName}${data.dob}`;
  const h = hashString(seed || "anon");
  return `AUR${(h % 900000 + 100000).toString()}`;
}
