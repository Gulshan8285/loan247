"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ArrowLeft, ArrowRight, RotateCcw, Sparkles } from "lucide-react";
import { useLoanStore } from "@/lib/loan-store";
import { AuroraBackground } from "./aurora-background";
import { ProgressTrack } from "./progress-track";
import { WelcomeStep } from "./steps/welcome-step";
import { BasicInfoStep } from "./steps/basic-info-step";
import { AnalyserStep } from "./steps/analyser-step";
import { LoanAmountStep } from "./steps/loan-amount-step";
import { LoanPurposeStep } from "./steps/loan-purpose-step";
import { OccupationStep } from "./steps/occupation-step";
import { IncomeStep } from "./steps/income-step";
import { ReviewStep } from "./steps/review-step";
import { SuccessStep } from "./steps/success-step";

const STEPS = [
  WelcomeStep,
  BasicInfoStep,
  AnalyserStep,
  LoanAmountStep,
  LoanPurposeStep,
  OccupationStep,
  IncomeStep,
  ReviewStep,
  SuccessStep,
] as const;

export function LoanWizard() {
  const step = useLoanStore((s) => s.step);
  const direction = useLoanStore((s) => s.direction);
  const goNext = useLoanStore((s) => s.goNext);
  const goBack = useLoanStore((s) => s.goBack);
  const reset = useLoanStore((s) => s.reset);

  const CurrentStep = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;
  const isAnalysing = step === 2; // AnalyserStep auto-advances

  return (
    <div className="relative flex min-h-screen flex-col">
      <AuroraBackground />

      {/* Top bar */}
      <header className="sticky top-0 z-30 px-4 pt-4 sm:px-6 sm:pt-6">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 rounded-2xl glass px-4 py-3">
          <div className="flex items-center gap-2.5">
            <div className="relative flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #34d399, #22d3ee)" }}>
              <Sparkles className="h-5 w-5 text-[#04040a]" strokeWidth={2.5} />
              <span className="absolute inset-0 rounded-xl animate-pulse-glow" style={{ background: "linear-gradient(135deg, #34d399, #22d3ee)", filter: "blur(14px)", opacity: 0.5, zIndex: -1 }} />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight">Aurora Lend</p>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground">3D Loan Journey</p>
            </div>
          </div>
          {!isFirst && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 rounded-full glass px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Restart</span>
            </button>
          )}
        </div>
      </header>

      {/* Progress (hidden on welcome & success for cleaner hero) */}
      {!isFirst && !isLast && (
        <div className="sticky top-[84px] z-20 px-4 pt-3 sm:px-6">
          <div className="mx-auto max-w-3xl rounded-2xl glass px-4 py-3">
            <ProgressTrack />
          </div>
        </div>
      )}

      {/* Step content */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-4 pt-2 pb-32 sm:px-6 sm:pt-4 sm:pb-36">
        <div className="w-full max-w-3xl">
          <AnimatePresence mode="wait" custom={direction}>
            <motion.div
              key={step}
              custom={direction}
              initial={{ opacity: 0, x: direction * 60, rotateY: direction * -12, scale: 0.96 }}
              animate={{ opacity: 1, x: 0, rotateY: 0, scale: 1 }}
              exit={{ opacity: 0, x: direction * -60, rotateY: direction * 12, scale: 0.96 }}
              transition={{ type: "spring", stiffness: 260, damping: 28 }}
              style={{ transformStyle: "preserve-3d", perspective: 1200 }}
            >
              <CurrentStep />
            </motion.div>
          </AnimatePresence>
        </div>
      </main>

      {/* Sticky footer nav (hidden on welcome, analyser & success) */}
      {!isFirst && !isLast && !isAnalysing && (
        <footer className="sticky bottom-0 z-30 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] pt-2 sm:px-6">
          <div className="mx-auto flex max-w-3xl items-center gap-3 rounded-2xl glass-strong px-3 py-3 sm:px-4">
            <button
              onClick={goBack}
              disabled={isFirst}
              className="flex items-center gap-1.5 rounded-xl px-4 py-3 text-sm font-medium text-foreground/80 transition-all hover:bg-white/5 disabled:cursor-not-allowed disabled:opacity-30"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Back</span>
            </button>
            <div className="flex-1" />
            <ContinueButton onClick={goNext} isLast={isLast} />
          </div>
        </footer>
      )}
    </div>
  );
}

function ContinueButton({ onClick, isLast }: { onClick: () => void; isLast: boolean }) {
  return (
    <motion.button
      onClick={onClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.97 }}
      className="group relative flex items-center gap-2 overflow-hidden rounded-xl px-6 py-3 text-sm font-semibold text-[#04040a] sm:px-8"
      style={{
        background: "linear-gradient(120deg, #34d399 0%, #22d3ee 50%, #a78bfa 100%)",
        backgroundSize: "200% auto",
        boxShadow: "0 8px 30px -6px rgba(52,211,153,0.5), 0 0 0 1px rgba(255,255,255,0.15) inset",
      }}
    >
      <motion.span
        className="absolute inset-0"
        style={{ background: "linear-gradient(120deg, transparent, rgba(255,255,255,0.4), transparent)" }}
        animate={{ x: ["-100%", "200%"] }}
        transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.6 }}
      />
      <span className="relative">{isLast ? "Finish" : "Continue"}</span>
      <ArrowRight className="relative h-4 w-4 transition-transform group-hover:translate-x-0.5" />
    </motion.button>
  );
}
