"use client";

import { useEffect, useState } from "react";
import {
  AlertTriangle,
  CheckCircle2,
  ExternalLink,
  Lock,
  RotateCcw,
  ShieldCheck,
  XCircle,
} from "lucide-react";
import { getApplicationRef, useLoanStore } from "@/lib/loan-store";
import { StepHeader } from "./step-header";

/**
 * PayFeeStep
 * Because the customer's CIBIL is low, a one-time processing fee of ₹59 is
 * required. The "Pay ₹59 now" button opens the customer's UPI app.
 *
 * After UPI opens, the customer confirms whether the payment was completed
 * or cancelled.
 */
const FEE_AMOUNT = 59;
const UPI_ID = "gulshanyadav62000-6@oksbi";

function getUpiLink(reference: string) {
  const params = new URLSearchParams({
    pa: UPI_ID,
    pn: "LOAN247",
    am: String(FEE_AMOUNT),
    cu: "INR",
    tn: `LOAN247 processing fee ${reference}`,
  });
  return `upi://pay?${params.toString()}`;
}

type Phase = "idle" | "opened" | "paid" | "cancelled";

export function PayFeeStep() {
  const goNext = useLoanStore((s) => s.goNext);
  const data = useLoanStore((s) => s.data);
  const [phase, setPhase] = useState<Phase>("idle");
  const [saving, setSaving] = useState(false);
  const reference = getApplicationRef(data);
  const upiLink = getUpiLink(reference);

  // After the customer confirms payment is done, advance to the final screen.
  useEffect(() => {
    if (phase !== "paid") return;
    const id = setTimeout(() => goNext(), 1400);
    return () => clearTimeout(id);
  }, [phase, goNext]);

  async function saveApplication(paymentStatus: "pending" | "paid" | "rejected") {
    setSaving(true);
    try {
      await fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reference,
          paymentStatus,
          paymentAmount: FEE_AMOUNT,
          paymentProvider: "UPI",
          paymentLink: upiLink,
          data,
        }),
      });
    } finally {
      setSaving(false);
    }
  }

  function handleOpenPayment() {
    void saveApplication("pending");
    window.location.href = upiLink;
    setPhase("opened");
  }

  async function handlePaid() {
    await saveApplication("paid");
    setPhase("paid");
  }

  async function handleCancelled() {
    await saveApplication("rejected");
    setPhase("cancelled");
  }

  function handleRetry() {
    setPhase("idle");
  }

  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-9">
      <StepHeader
        title="Processing fee"
        subtitle="A small one-time fee to continue your application."
        badge="Step 9 · Fee"
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

      {/* Action area — changes based on payment phase */}
      <div className="mt-6 space-y-3">
        {/* IDLE: show the Pay button */}
        {phase === "idle" && (
          <button
            onClick={handleOpenPayment}
            disabled={saving}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 px-6 py-4 text-base font-bold text-white shadow-sm transition-transform hover:brightness-105 active:scale-[0.98]"
          >
            <Lock className="h-4 w-4" />
            {saving ? "Preparing payment..." : `Pay ₹${FEE_AMOUNT} now`}
          </button>
        )}

        {/* OPENED: link opened, customer reports the result */}
        {phase === "opened" && (
          <>
            <div className="flex items-start gap-3 rounded-xl border border-blue-100 bg-blue-50/60 p-4">
              <ExternalLink className="mt-0.5 h-4 w-4 shrink-0 text-blue-600" />
              <div className="text-left">
                <p className="text-sm font-semibold text-gray-900">
                  UPI payment opened.
                </p>
                <p className="mt-0.5 text-xs text-gray-500">
                  Complete the ₹{FEE_AMOUNT} payment to UPI ID <span className="font-semibold text-gray-700">{UPI_ID}</span>, then tell us the result below.
                  Didn&apos;t open?{" "}
                  <a
                    href={upiLink}
                    className="font-semibold text-blue-600 underline underline-offset-2"
                  >
                    Open again
                  </a>
                </p>
              </div>
            </div>
            <button
              onClick={handlePaid}
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 px-6 py-4 text-base font-bold text-white shadow-sm transition-transform hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-70"
            >
              <CheckCircle2 className="h-5 w-5" />
              {saving ? "Saving..." : "Payment done — continue"}
            </button>
            <button
              onClick={handleCancelled}
              disabled={saving}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-4 text-base font-bold text-gray-600 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-70"
            >
              <XCircle className="h-5 w-5" />
              Payment cancelled
            </button>
          </>
        )}

        {/* PAID: success, advancing */}
        {phase === "paid" && (
          <div className="flex items-center justify-center gap-2 rounded-xl border border-emerald-100 bg-emerald-50/60 px-6 py-4 text-emerald-700">
            <CheckCircle2 className="h-5 w-5" />
            <span className="text-sm font-semibold">Payment successful! Continuing…</span>
          </div>
        )}

        {/* CANCELLED: show cancelled, offer retry */}
        {phase === "cancelled" && (
          <>
            <div className="flex items-center justify-center gap-2 rounded-xl border border-amber-100 bg-amber-50/60 px-6 py-4 text-amber-700">
              <XCircle className="h-5 w-5" />
              <span className="text-sm font-semibold">
                Payment cancelled. You haven&apos;t been charged.
              </span>
            </div>
            <button
              onClick={handleRetry}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 px-6 py-4 text-base font-bold text-white shadow-sm transition-transform hover:brightness-105 active:scale-[0.98]"
            >
              <RotateCcw className="h-4 w-4" />
              Try again
            </button>
          </>
        )}
      </div>

      <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-[11px] text-gray-400">
        <Lock className="h-3 w-3" />
        Pay using any UPI app · UPI ID: {UPI_ID} · This won&apos;t affect your credit score
      </p>
    </div>
  );
}
