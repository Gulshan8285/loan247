"use client";

import { Banknote, Check, CreditCard, Landmark, Wallet } from "lucide-react";
import { type SalaryMode, useLoanStore } from "@/lib/loan-store";
import { StepHeader } from "./step-header";

const SALARY_MODES: { key: SalaryMode; label: string; icon: React.ElementType; color: string }[] = [
  { key: "Bank transfer", label: "Bank transfer", icon: Landmark, color: "#10b981" },
  { key: "Cash", label: "Cash", icon: Banknote, color: "#f59e0b" },
  { key: "Cheque", label: "Cheque", icon: CreditCard, color: "#8b5cf6" },
];

export function IncomeStep() {
  const data = useLoanStore((s) => s.data);
  const update = useLoanStore((s) => s.update);

  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-9">
      <StepHeader
        title="Income & salary"
        subtitle="A few details about how you earn."
        badge="Step 7 · Income"
      />

      <div className="mt-7 grid gap-5">
        {/* Monthly income */}
        <div>
          <label htmlFor="income" className="mb-1.5 flex items-center gap-1 text-sm font-medium text-gray-800">
            Your monthly income <span className="text-red-500">*</span>
          </label>
          <div className="flex items-center rounded-xl border border-gray-200 bg-white transition-all focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 hover:border-gray-300">
            <span className="pl-3.5 text-base font-semibold text-gray-700">₹</span>
            <input
              id="income"
              className="w-full bg-transparent px-3.5 py-3 pl-2 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none"
              placeholder="Enter the amount"
              inputMode="numeric"
              value={data.monthlyIncome}
              onChange={(e) => update({ monthlyIncome: e.target.value.replace(/[^\d]/g, "") })}
            />
          </div>
          {data.monthlyIncome && Number(data.monthlyIncome) > 0 && (
            <p className="mt-1.5 text-xs text-gray-500">
              That&apos;s{" "}
              <span className="font-semibold text-emerald-600">
                ₹{new Intl.NumberFormat("en-IN").format(Number(data.monthlyIncome))}
              </span>{" "}
              / month
            </p>
          )}
        </div>

        {/* Salary mode */}
        <div>
          <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-gray-800">
            How do you receive your salary? <span className="text-red-500">*</span>
          </label>
          <div className="grid grid-cols-3 gap-2.5">
            {SALARY_MODES.map((o) => {
              const active = data.salaryMode === o.key;
              return (
                <button
                  key={o.key}
                  onClick={() => update({ salaryMode: o.key })}
                  className={`relative flex flex-col items-center gap-2 rounded-2xl border p-3 text-center transition-all ${
                    active
                      ? "border-emerald-500 bg-emerald-50/50 ring-2 ring-emerald-500/10"
                      : "border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50"
                  }`}
                >
                  <span
                    className="flex h-10 w-10 items-center justify-center rounded-xl"
                    style={{ background: `${o.color}1a` }}
                  >
                    <o.icon className="h-5 w-5" style={{ color: o.color }} />
                  </span>
                  <span className="text-[11px] font-semibold leading-tight text-gray-800 sm:text-xs">
                    {o.label}
                  </span>
                  {active && (
                    <span
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full text-white"
                      style={{ background: o.color }}
                    >
                      <Check className="h-3 w-3" strokeWidth={3} />
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Eligibility card */}
        <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
            <Wallet className="h-5 w-5 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-semibold text-gray-900">Eligibility snapshot</p>
            <p className="text-xs text-gray-500">Based on your inputs so far</p>
          </div>
        </div>
      </div>
    </div>
  );
}
