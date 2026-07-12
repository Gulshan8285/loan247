"use client";

import { Check, Sparkles } from "lucide-react";
import { formatINR, useLoanStore } from "@/lib/loan-store";

export function SuccessStep() {
  const data = useLoanStore((s) => s.data);
  const reset = useLoanStore((s) => s.reset);
  const name = data.firstName || "friend";

  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-10">
      {/* Check mark */}
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500">
        <Check className="h-11 w-11 text-white" strokeWidth={3} />
      </div>

      <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
        Application submitted
      </span>
      <h1 className="text-balance text-3xl font-black tracking-tight text-gray-900 sm:text-5xl">
        You&apos;re pre-qualified, {name}!
      </h1>
      <p className="mx-auto mt-4 max-w-md text-pretty text-base text-gray-500 sm:text-lg">
        Based on your details, here&apos;s your indicative offer. Our team will finalise the rest.
      </p>

      {/* Offer card */}
      <div className="mx-auto mt-8 max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/60 p-6 text-left">
        <div className="flex items-center justify-between">
          <span className="text-xs uppercase tracking-widest text-gray-400">Approved amount</span>
          <Sparkles className="h-4 w-4 text-amber-500" />
        </div>
        <p className="mt-1 text-4xl font-black text-emerald-600 sm:text-5xl">
          ₹{formatINR(data.loanAmount)}
        </p>
        <div className="mt-5 grid grid-cols-3 gap-3 border-t border-gray-200 pt-5">
          <Stat label="EMI" value={`₹${formatINR(Math.round(data.loanAmount * 0.009))}`} />
          <Stat label="Tenure" value="60 mo" />
          <Stat label="Rate" value="10.8%" />
        </div>
      </div>

      <button
        onClick={reset}
        className="mt-8 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
      >
        Start a new application
      </button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-gray-400">{label}</p>
      <p className="text-sm font-bold text-gray-900">{value}</p>
    </div>
  );
}
