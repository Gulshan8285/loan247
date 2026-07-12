"use client";

import {
  Briefcase,
  Car,
  CreditCard,
  GraduationCap,
  Heart,
  Home,
  Plane,
  Stethoscope,
} from "lucide-react";
import { type LoanPurpose, useLoanStore } from "@/lib/loan-store";
import { StepHeader } from "./step-header";

const PURPOSES: { key: LoanPurpose; label: string; icon: React.ElementType; color: string }[] = [
  { key: "Home", label: "Home", icon: Home, color: "#10b981" },
  { key: "Vehicle", label: "Vehicle", icon: Car, color: "#3b82f6" },
  { key: "Education", label: "Education", icon: GraduationCap, color: "#8b5cf6" },
  { key: "Business", label: "Business", icon: Briefcase, color: "#ec4899" },
  { key: "Medical", label: "Medical", icon: Stethoscope, color: "#f59e0b" },
  { key: "Travel", label: "Travel", icon: Plane, color: "#14b8a6" },
  { key: "Wedding", label: "Wedding", icon: Heart, color: "#f43f5e" },
  { key: "Debt consolidation", label: "Debt consolidation", icon: CreditCard, color: "#84cc16" },
];

export function LoanPurposeStep() {
  const purpose = useLoanStore((s) => s.data.purpose);
  const update = useLoanStore((s) => s.update);

  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-9">
      <StepHeader
        title="What's the loan for?"
        subtitle="Pick a purpose — we'll tailor the terms accordingly."
        badge="Step 5 · Purpose"
      />

      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PURPOSES.map((p) => {
          const active = purpose === p.key;
          return (
            <button
              key={p.key}
              onClick={() => update({ purpose: p.key })}
              className={`flex flex-col items-center gap-3 rounded-2xl border p-4 text-center transition-all ${
                active
                  ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/10"
                  : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl"
                style={{ background: `${p.color}1a` }}
              >
                <p.icon className="h-6 w-6" style={{ color: p.color }} strokeWidth={2.2} />
              </div>
              <span className="text-xs font-semibold leading-tight text-gray-800 sm:text-sm">{p.label}</span>
            </button>
          );
        })}
      </div>

      {purpose && (
        <div className="mt-6 flex items-center gap-2 rounded-xl border border-gray-100 bg-gray-50/60 px-4 py-3 text-sm text-gray-600">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          Selected: <span className="font-semibold text-gray-900">{purpose}</span>
        </div>
      )}
    </div>
  );
}
