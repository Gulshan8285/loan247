"use client";

import { Clock, Phone, RotateCcw } from "lucide-react";
import { formatINR, getApplicationRef, useLoanStore } from "@/lib/loan-store";

/**
 * ApplicationInProcessStep (terminal)
 * Shown immediately after the ₹59 fee is paid. Tells the customer their
 * application is in process and that we will connect with them. This is the
 * final screen — the application ends here.
 */
export function ApplicationInProcessStep() {
  const data = useLoanStore((s) => s.data);
  const reset = useLoanStore((s) => s.reset);
  const refNo = getApplicationRef(data);
  const name = data.firstName || "Customer";

  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-10">
      {/* Animated-style clock icon */}
      <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-50">
        <Clock className="h-10 w-10 text-emerald-600" />
      </div>

      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        Application submitted
      </span>

      <h1 className="mt-3 text-balance text-3xl font-black tracking-tight text-gray-900 sm:text-4xl">
        Your application is in process
      </h1>
      <p className="mx-auto mt-3 max-w-md text-pretty text-base text-gray-500 sm:text-lg">
        Thank you, {name}. We&apos;ve received your application and ₹59 processing fee.
        Our team will connect with you shortly to take it forward.
      </p>

      {/* Application summary */}
      <div className="mx-auto mt-7 max-w-md overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/60 p-5 text-left">
        <div className="flex items-center justify-between border-b border-gray-200 pb-3">
          <span className="text-xs uppercase tracking-widest text-gray-400">Reference no.</span>
          <span className="text-sm font-bold text-gray-900">{refNo}</span>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-3">
          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-400">Loan amount</p>
            <p className="text-sm font-bold text-emerald-600">
              ₹{formatINR(data.loanAmount)}
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-wide text-gray-400">Fee paid</p>
            <p className="text-sm font-bold text-gray-900">₹59</p>
          </div>
        </div>
      </div>

      {/* "We will connect with you" notice */}
      <div className="mx-auto mt-5 flex max-w-md items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
          <Phone className="h-5 w-5 text-blue-600" />
        </div>
        <div className="text-left">
          <p className="text-sm font-semibold text-gray-900">
            We will connect with you soon
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            Expect a call from our loan officer within 24–48 hours.
          </p>
        </div>
      </div>

      <p className="mt-6 text-[11px] leading-relaxed text-gray-400">
        Please keep your documents ready. You may close this page — your application is safely saved.
      </p>

      <button
        onClick={reset}
        className="mt-6 inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
      >
        <RotateCcw className="h-4 w-4" />
        Start a new application
      </button>
    </div>
  );
}
