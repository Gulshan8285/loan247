"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, CheckCircle2, Loader2, Lock, ShieldCheck } from "lucide-react";
import { useLoanStore } from "@/lib/loan-store";
import { StepHeader } from "./step-header";

/**
 * PayFeeStep
 * Because the customer's CIBIL is low, a small one-time processing fee of
 * ₹59 is required to continue. The "Pay ₹59" button triggers a brief payment
 * processing state, then advances to the next step.
 */
const FEE_AMOUNT = 59;

export function PayFeeStep() {
  const goNext = useLoanStore((s) => s.goNext);
  const data = useLoanStore((s) => s.data);
  const [paying, setPaying] = useState(false);
  const [paid, setPaid] = useState(false);

  // After the (simulated) payment completes, advance to the next step.
  useEffect(() => {
    if (!paid) return;
    const id = setTimeout(() => goNext(), 1400);
    return () => clearTimeout(id);
  }, [paid, goNext]);

  function handlePay() {
    setPaying(true);
    // Simulate a payment gateway round-trip (~1.8s)
    setTimeout(() => {
      setPaying(false);
      setPaid(true);
    }, 1800);
  }

  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-9">
      <StepHeader
        title="Processing fee"
        subtitle="A small one-time fee to continue your application."
        badge="Step 8 · Fee"
      />

      {/* CIBIL low notice */}
      <div className="mt-7 flex items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-4">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Your CIBIL is low, so a one-time processing fee applies.
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            Because your credit profile is in the low band, we charge a small ₹{FEE_AMOUNT} verification
            &amp; processing fee to continue with the best lender match. This is fully refundable if your
            loan isn&apos;t disbursed.
          </p>
        </div>
      </div>

      {/* Fee summary card */}
      <div className="mt-5 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/60">
        <div className="flex items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
              <ShieldCheck className="h-5 w-5 text-emerald-600" />
            </div>
            <div>
              <p className="text-sm font-semibold text-gray-900">Processing fee</p>
              <p className="text-xs text-gray-500">One-time · Refundable</p>
            </div>
          </div>
          <p className="text-2xl font-black text-gray-900">
            ₹{FEE_AMOUNT}
          </p>
        </div>
        <div className="border-t border-gray-200 px-5 py-3 text-xs text-gray-500">
          For {data.firstName || "applicant"} · Loan of ₹{new Intl.NumberFormat("en-IN").format(data.loanAmount)}
        </div>
      </div>

      {/* Pay button / processing / paid states */}
      <div className="mt-6">
        {!paid && !paying && (
          <button
            onClick={handlePay}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 px-6 py-4 text-base font-bold text-white shadow-sm transition-transform hover:brightness-105 active:scale-[0.98]"
          >
            <Lock className="h-4 w-4" />
            Pay ₹{FEE_AMOUNT} &amp; continue
          </button>
        )}

        {paying && (
          <button
            disabled
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-300 px-6 py-4 text-base font-bold text-white"
          >
            <Loader2 className="h-4 w-4 animate-spin" />
            Processing payment…
          </button>
        )}

        {paid && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-6 py-4 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-semibold">Payment successful! Continuing…</span>
          </div>
        )}
      </div>

      <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] text-gray-400">
        <Lock className="h-3 w-3" />
        Secured payment · 256-bit encryption · This won&apos;t affect your credit score
      </p>
    </div>
  );
}
