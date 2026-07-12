"use client";

import { motion, AnimatePresence } from "framer-motion";
import { Check, ShieldCheck, Loader2, Lock } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useLoanStore } from "@/lib/loan-store";

/**
 * AnalyserStep
 * A realistic 60-second analysis screen shown right after Basic Info.
 * Progresses through trust-building verification stages with a circular
 * progress ring, live percentage, and auto-advances on completion.
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
        // brief pause to show 100%, then advance
        setTimeout(() => goNext(), 900);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [goNext]);

  // current stage index based on progress
  const stageIdx = STAGES.reduce((acc, s, i) => (progress >= s.at ? i : acc), 0);
  const pct = Math.round(progress);

  const ringSize = 168;
  const stroke = 10;
  const r = (ringSize - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (progress / 100) * circ;

  return (
    <div
      className="relative w-full overflow-hidden rounded-3xl bg-white p-6 text-neutral-900 sm:p-10"
      style={{ boxShadow: "0 24px 70px -28px rgba(0,0,0,0.55), 0 0 0 1px rgba(255,255,255,0.6) inset" }}
    >
      {/* Header */}
      <div className="text-center">
        <motion.span
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700"
        >
          <Lock className="h-3 w-3" /> Secure analysis in progress
        </motion.span>
        <h2 className="mt-3 text-2xl font-bold tracking-tight text-neutral-900 sm:text-3xl">
          {done ? "All set" : "Analyzing your profile"}
          {firstName ? `, ${firstName}` : ""}
        </h2>
        <p className="mt-1.5 text-sm text-neutral-500 sm:text-base">
          {done
            ? "We've curated the best options for you."
            : "Hang tight — this usually takes about 60 seconds."}
        </p>
      </div>

      {/* Progress ring */}
      <div className="mt-8 flex justify-center">
        <div className="relative" style={{ width: ringSize, height: ringSize }}>
          <svg width={ringSize} height={ringSize} className="-rotate-90">
            <circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={r}
              fill="none"
              stroke="#E5E7EB"
              strokeWidth={stroke}
            />
            <defs>
              <linearGradient id="analyser-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stopColor="#3498db" />
                <stop offset="100%" stopColor="#2ecc71" />
              </linearGradient>
            </defs>
            <motion.circle
              cx={ringSize / 2}
              cy={ringSize / 2}
              r={r}
              fill="none"
              stroke="url(#analyser-grad)"
              strokeWidth={stroke}
              strokeLinecap="round"
              strokeDasharray={circ}
              animate={{ strokeDashoffset: offset }}
              transition={{ ease: "linear", duration: 0.1 }}
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <AnimatePresence mode="popLayout">
              {!done ? (
                <motion.div
                  key="pct"
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  className="flex flex-col items-center"
                >
                  <span className="text-4xl font-black tabular-nums text-neutral-900">{pct}%</span>
                  <span className="mt-1 text-[10px] font-medium uppercase tracking-widest text-neutral-400">
                    Analyzing
                  </span>
                </motion.div>
              ) : (
                <motion.div
                  key="done"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: "spring", stiffness: 220, damping: 14 }}
                  className="flex h-16 w-16 items-center justify-center rounded-full"
                  style={{ background: "linear-gradient(135deg, #2ecc71, #3498db)" }}
                >
                  <Check className="h-9 w-9 text-white" strokeWidth={3} />
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Stage list */}
      <div className="mx-auto mt-8 max-w-md space-y-2.5">
        {STAGES.map((s, i) => {
          const state = done || i < stageIdx ? "done" : i === stageIdx ? "active" : "pending";
          return (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: state === "pending" ? 0.4 : 1, x: 0 }}
              transition={{ delay: i * 0.05 }}
              className="flex items-center gap-3 rounded-xl border border-neutral-100 bg-neutral-50/60 px-3.5 py-2.5"
            >
              <span
                className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full"
                style={{
                  background:
                    state === "done"
                      ? "linear-gradient(135deg, #2ecc71, #3498db)"
                      : state === "active"
                        ? "#ffffff"
                        : "#f1f5f9",
                  border: state === "active" ? "1px solid #3498db" : "none",
                }}
              >
                {state === "done" ? (
                  <Check className="h-3.5 w-3.5 text-white" strokeWidth={3} />
                ) : state === "active" ? (
                  <Loader2 className="h-3.5 w-3.5 animate-spin text-blue-500" />
                ) : (
                  <s.icon className="h-3.5 w-3.5 text-neutral-400" />
                )}
              </span>
              <span
                className={`text-sm ${
                  state === "active" ? "font-semibold text-neutral-900" : "font-medium text-neutral-600"
                }`}
              >
                {s.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Trust footer */}
      <div className="mt-7 flex items-center justify-center gap-2 text-center text-[11px] text-neutral-400">
        <Lock className="h-3 w-3" />
        Bank-grade encryption · This won&apos;t affect your credit score
      </div>
    </div>
  );
}
