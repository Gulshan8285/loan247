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
    const { step } = get();
    if (step < TOTAL_STEPS - 1) set({ step: step + 1, direction: 1 });
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
