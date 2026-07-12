"use client";

import { motion } from "framer-motion";
import { TOTAL_STEPS, useLoanStore } from "@/lib/loan-store";
import { Check } from "lucide-react";

const STEP_LABELS = [
  "Welcome",
  "Identity",
  "Analyser",
  "Amount",
  "Purpose",
  "Occupation",
  "Income",
  "Review",
  "Done",
];

/**
 * ProgressTrack
 * A 3D, glassmorphic progress indicator showing the current step out of TOTAL_STEPS.
 * Features a glowing animated fill, per-step nodes, and depth via layered shadows.
 */
export function ProgressTrack() {
  const step = useLoanStore((s) => s.step);
  const setStep = useLoanStore((s) => s.setStep);
  const progress = (step / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="w-full">
      <div className="mb-3 flex items-center justify-between text-xs">
        <span className="font-medium text-muted-foreground">
          Step <span className="text-foreground">{Math.min(step + 1, TOTAL_STEPS)}</span> / {TOTAL_STEPS}
        </span>
        <span className="font-medium text-aurora">{Math.round(progress)}% complete</span>
      </div>

      {/* 3D track */}
      <div className="perspective-1000">
        <div
          className="relative h-3 w-full rounded-full glass-strong overflow-hidden"
          style={{ transform: "rotateX(35deg)", transformStyle: "preserve-3d" }}
        >
          {/* animated gradient fill */}
          <motion.div
            className="absolute inset-y-0 left-0 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, #34d399 0%, #22d3ee 40%, #a78bfa 75%, #f472b6 100%)",
              boxShadow: "0 0 18px rgba(52,211,153,0.7), 0 0 40px rgba(34,211,238,0.4)",
            }}
            initial={false}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
          {/* moving shimmer */}
          <motion.div
            className="absolute inset-y-0 w-16 rounded-full"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.55), transparent)",
            }}
            animate={{ left: ["-10%", "110%"] }}
            transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
          />
        </div>
      </div>

      {/* Step nodes */}
      <div className="mt-4 hidden items-center justify-between sm:flex">
        {STEP_LABELS.map((label, i) => {
          const done = i < step;
          const active = i === step;
          return (
            <button
              key={label}
              type="button"
              onClick={() => i <= step && setStep(i)}
              disabled={i > step}
              className="group flex flex-col items-center gap-1.5 disabled:cursor-not-allowed"
              aria-label={`Go to ${label}`}
            >
              <motion.div
                className="relative flex h-7 w-7 items-center justify-center rounded-full text-[11px] font-semibold"
                animate={{
                  scale: active ? 1.15 : 1,
                }}
                transition={{ type: "spring", stiffness: 300, damping: 18 }}
                style={
                  done
                    ? {
                        background: "linear-gradient(135deg, #34d399, #22d3ee)",
                        color: "#04040a",
                        boxShadow: "0 0 16px rgba(52,211,153,0.6)",
                      }
                    : active
                      ? {
                          background: "linear-gradient(135deg, rgba(167,139,250,0.95), rgba(244,114,182,0.95))",
                          color: "#04040a",
                          boxShadow: "0 0 18px rgba(167,139,250,0.65)",
                        }
                      : {
                          background: "rgba(255,255,255,0.06)",
                          color: "rgba(255,255,255,0.4)",
                          border: "1px solid rgba(255,255,255,0.1)",
                        }
                }
              >
                {done ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : i + 1}
                {active && (
                  <motion.span
                    className="absolute inset-0 rounded-full"
                    style={{ border: "2px solid rgba(244,114,182,0.6)" }}
                    animate={{ scale: [1, 1.5], opacity: [0.7, 0] }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                  />
                )}
              </motion.div>
              <span
                className={`text-[10px] font-medium uppercase tracking-wide transition-colors ${
                  active ? "text-foreground" : done ? "text-muted-foreground" : "text-muted-foreground/50"
                }`}
              >
                {label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
