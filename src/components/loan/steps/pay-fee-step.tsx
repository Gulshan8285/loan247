"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Lock,
  ShieldCheck,
} from "lucide-react";
import { useLoanStore } from "@/lib/loan-store";
import { StepHeader } from "./step-header";

/**
 * PayFeeStep
 * Because the customer's CIBIL is low, a one-time processing fee of ₹59 is
 * required. The "Pay ₹59" button opens the PayU payment link in a new tab.
 * After the customer completes the payment there, they click "I've completed
 * the payment" to advance to the final "Application In Process" screen.
 *
 * All form data is persisted, so if the customer leaves and returns (or
 * restarts), their previously-filled details are intact and they land back
 * on this step.
 */
const FEE_AMOUNT = 59;
const PAYU_LINK = "https://u.payu.in/PAYUMN/qrmSQjzxzY09";

export function PayFeeStep() {
  const goNext = useLoanStore((s) => s.goNext);
  const data = useLoanStore((s) => s.data);
  const [linkOpened, setLinkOpened] = useState(false);
  const [paid, setPaid] = useState(false);

  // After the customer confirms payment, advance to the final screen.
  useEffect(() => {
    if (!paid) return;
    const id = setTimeout(() => goNext(), 1400);
    return () => clearTimeout(id);
  }, [paid, goNext]);

  function handleOpenPayment() {
    // Open the PayU payment page in a new tab
    window.open(PAYU_LINK, "_blank", "noopener,noreferrer");
    setLinkOpened(true);
  }

  function handleConfirmPaid() {
    setPaid(true);
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
          <p className="text-2xl font-black text-gray-900">₹{FEE_AMOUNT}</p>
        </div>
        <div className="border-t border-gray-200 px-5 py-3 text-xs text-gray-500">
          For {data.firstName || "applicant"} · Loan of ₹
          {new Intl.NumberFormat("en-IN").format(data.loanAmount)}
        </div>
      </div>

      {/* Pay button → confirmation flow */}
      <div className="mt-6 space-y-3">
        {!linkOpened && !paid && (
          <button
            onClick={handleOpenPayment}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 px-6 py-4 text-base font-bold text-white shadow-sm transition-transform hover:brightness-105 active:scale-[0.98]"
          >
            <Lock className="h-4 w-4" />
            Pay ₹{FEE_AMOUNT} now
          </button>
        )}

        {linkOpened && !paid && (
          <>
            <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">
                  Payment page opened in a new tab.
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Complete the ₹{FEE_AMOUNT} payment there. Once done, click the button below to continue.
                  Didn&apos;t open?{" "}
                  <a
                    href={PAYU_LINK}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-600 underline underline-offset-2"
                  >
                    Open again
                  </a>
                </p>
              </div>
            </div>
            <button
              onClick={handleConfirmPaid}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 px-6 py-4 text-base font-bold text-white shadow-sm transition-transform hover:brightness-105 active:scale-[0.98]"
            >
              <CheckCircle2 className="h-4 w-4" />
              I&apos;ve completed the payment — continue
            </button>
          </>
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
        Secured by PayU · 256-bit encryption · This won&apos;t affect your credit score
      </p>
    </div>
  );
}
