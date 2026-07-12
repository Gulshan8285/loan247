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

export const TOTAL_STEPS = 9;

const initialData: LoanFormData = {
  firstName: "",
  lastName: "",
  dob: "",
  pincode: "",
  panCard: "",
  loanAmount: 100000,
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
 *  0 Welcome       — no fields
 *  1 Basic Info    — firstName, lastName, dob, pincode(6), panCard(valid)
 *  2 Analyser      — auto-advances
 *  3 Loan Amount   — always has a default value
 *  4 Purpose       — purpose selected
 *  5 Occupation    — occupation selected
 *  6 Income        — monthlyIncome(>0), salaryMode selected
 *  7 Review        — always valid
 *  8 Success       — terminal
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
    case 4:
      return data.purpose ? [] : ["purpose"];
    case 5:
      return data.occupation ? [] : ["occupation"];
    case 6: {
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
