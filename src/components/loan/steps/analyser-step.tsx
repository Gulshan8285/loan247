"use client";

import { Check, Loader2, Lock, ShieldCheck } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLoanStore } from "@/lib/loan-store";

/**
 * AnalyserStep
 * A simple, realistic 60-second analysis screen shown right after Basic Info.
 * Plain progress bar + a list of verification stages. Auto-advances on completion.
 */
export const ANALYSER_DURATION_MS = 60_000;

const STAGES = [
  { at: 0, label: "Verifying your PAN details", icon: ShieldCheck },
  { at: 20, label: "Fetching your credit profile", icon: Lock },
  { at: 38, label: "Analyzing repayment capacity", icon: ShieldCheck },
  { at: 56, label: "Scanning 40+ lender partners", icon: ShieldCheck },
  { at: 80, label: "Curating your personalized offers", icon: Check },
];

export function AnalyserStep() {
  const goNext = useLoanStore((s) => s.goNext);
  const firstName = useLoanStore((s) => s.data.firstName);
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
      const p = Math.min(100, (elapsed / ANALYSER_DURATION_MS) * 100);
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

  const stageIdx = STAGES.reduce((acc, s, i) => (progress >= s.at ? i : acc), 0);
  const pct = Math.round(progress);

  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-10">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
        <Lock className="h-3 w-3" /> Secure analysis in progress
      </span>
      <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        {done ? "All set" : "Analyzing your profile"}
        {firstName ? `, ${firstName}` : ""}
      </h2>
      <p className="mt-1.5 text-sm text-gray-500 sm:text-base">
        {done ? "We've curated the best options for you." : "Hang tight — this usually takes about 60 seconds."}
      </p>

      {/* Percentage */}
      <div className="mt-8 flex items-center justify-center gap-2">
        <span className="text-5xl font-black tabular-nums text-gray-900">{pct}%</span>
        <span className="pb-1 text-xs font-medium uppercase tracking-widest text-gray-400">Analyzing</span>
      </div>

      {/* Flat progress bar — no CSS transition; rAF already drives 60fps smooth updates */}
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
                  <s.icon className="h-3.5 w-3.5" />
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
        Bank-grade encryption · This won&apos;t affect your credit score
      </div>
    </div>
  );
}
