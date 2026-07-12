"use client";

import { useEffect, useRef, useState } from "react";
import { Check, Landmark, Loader2, Lock } from "lucide-react";
import { useLoanStore } from "@/lib/loan-store";

/**
 * BankProcessingStep
 * A 30-second processing screen shown after the customer submits bank details.
 * Verifies the account/IFSC and prepares the disbursal, then auto-advances.
 */
export const BANK_PROC_TIMER_MS = 30_000;

const STAGES = [
  { at: 0, label: "Verifying your account number" },
  { at: 35, label: "Validating IFSC with your bank" },
  { at: 65, label: "Linking account for disbursal" },
  { at: 88, label: "Preparing loan agreement" },
];

export function BankProcessingStep() {
  const goNext = useLoanStore((s) => s.goNext);
  const data = useLoanStore((s) => s.data);
  const [progress, setProgress] = useState(0);
  const [done, setDone] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(100, (elapsed / BANK_PROC_TIMER_MS) * 100);
      setProgress(p);
      if (p < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setDone(true);
        setTimeout(() => goNext(), 900);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [goNext]);

  const pct = Math.round(progress);
  const stageIdx = STAGES.reduce((acc, s, i) => (progress >= s.at ? i : acc), 0);
  const remaining = Math.max(0, Math.ceil((BANK_PROC_TIMER_MS * (1 - progress / 100)) / 1000));
  const bankLabel = data.bankName || "your bank";

  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-10">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        <Lock className="h-3 w-3" /> Secure verification
      </span>
      <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        {done ? "Bank verified" : "Verifying your bank details"}
      </h2>
      <p className="mt-1.5 text-sm text-gray-500 sm:text-base">
        {done
          ? "Your account is linked and ready for disbursal."
          : `We're securely verifying your details with ${bankLabel}. Hang tight…`}
      </p>

      {/* Percentage */}
      <div className="mt-8 flex items-center justify-center gap-2">
        <span className="text-5xl font-black tabular-nums text-gray-900">{pct}%</span>
        <span className="pb-1 text-xs font-medium uppercase tracking-widest text-gray-400">
          {done ? "Done" : `~${remaining}s left`}
        </span>
      </div>

      {/* Flat progress bar */}
      <div className="mx-auto mt-4 h-2.5 w-full max-w-md overflow-hidden rounded-full bg-gray-200">
        <div
          className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Stage list */}
      <div className="mx-auto mt-8 max-w-md space-y-2.5 text-left">
        {STAGES.map((s, i) => {
          const state = done || i < stageIdx ? "done" : i === stageIdx ? "active" : "pending";
          return (
            <div
              key={s.label}
              className={`flex items-center gap-3 rounded-xl border px-3.5 py-2.5 transition-colors ${
                state === "pending"
                  ? "border-gray-100 bg-gray-50/50 opacity-50"
                  : "border-gray-100 bg-white"
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${
                  state === "done"
                    ? "bg-emerald-500 text-white"
                    : state === "active"
                      ? "border border-blue-500 bg-white text-blue-500"
                      : "bg-gray-100 text-gray-400"
                }`}
              >
                {state === "done" ? (
                  <Check className="h-3.5 w-3.5" strokeWidth={3} />
                ) : state === "active" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                ) : (
                  <Landmark className="h-3.5 w-3.5" />
                )}
              </span>
              <span
                className={`text-sm ${
                  state === "active" ? "font-semibold text-gray-900" : "font-medium text-gray-600"
                }`}
              >
                {s.label}
              </span>
            </div>
          );
        })}
      </div>

      <div className="mt-7 flex items-center justify-center gap-2 text-center text-[11px] text-gray-400">
        <Lock className="h-3 w-3" />
        Bank-grade encryption · Don&apos;t refresh or close this page
      </div>
    </div>
  );
}
