"use client";

import { TOTAL_STEPS, useLoanStore } from "@/lib/loan-store";
import { Check } from "lucide-react";

const STEP_LABELS = [
  "Welcome",
  "Login",
  "Identity",
  "Analyser",
  "CIBIL",
  "Amount",
  "Bank",
  "Verify",
  "Fee",
  "Submitted",
];

/**
 * ProgressTrack
 * Simple, flat progress bar with step count and clickable step nodes.
 */
export function ProgressTrack() {
  const step = useLoanStore((s) => s.step);
  const setStep = useLoanStore((s) => s.setStep);
  const progress = (step / (TOTAL_STEPS - 1)) * 100;

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-xs">
        <span className="font-medium text-gray-500">
          Step <span className="text-gray-900">{Math.min(step + 1, TOTAL_STEPS)}</span> / {TOTAL_STEPS}
        </span>
        <span className="font-medium text-emerald-600">{Math.round(progress)}% complete</span>
      </div>

      {/* Flat track */}
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-200">
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-[width] duration-300"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step nodes */}
      <div className="mt-3 hidden items-center justify-between sm:flex">
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
              <span
                className={`flex h-6 w-6 items-center justify-center rounded-full border text-[10px] font-semibold transition-colors ${
                  done
                    ? "border-emerald-500 bg-emerald-500 text-white"
                    : active
                      ? "border-emerald-500 bg-white text-emerald-600 ring-2 ring-emerald-500/20"
                      : "border-gray-300 bg-white text-gray-400"
                }`}
              >
                {done ? <Check className="h-3 w-3" strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={`text-[10px] font-medium uppercase tracking-wide transition-colors ${
                  active ? "text-gray-900" : done ? "text-gray-500" : "text-gray-400"
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
