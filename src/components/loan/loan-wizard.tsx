"use client";

import { ArrowLeft, ArrowRight, Info, RotateCcw, Sparkles } from "lucide-react";
import { isStepValid, useLoanStore } from "@/lib/loan-store";
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
  const data = useLoanStore((s) => s.data);
  const goNext = useLoanStore((s) => s.goNext);
  const goBack = useLoanStore((s) => s.goBack);
  const reset = useLoanStore((s) => s.reset);

  const CurrentStep = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;
  const isAnalysing = step === 2; // AnalyserStep auto-advances
  const canProceed = isStepValid(step, data);

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      {/* Top bar */}
      <header className="sticky top-0 z-30 border-b border-gray-100 bg-white/90 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500">
              <Sparkles className="h-4.5 w-4.5 text-white" strokeWidth={2.5} />
            </div>
            <div className="leading-tight">
              <p className="text-sm font-semibold tracking-tight text-gray-900">Aurora Lend</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-400">Loan Journey</p>
            </div>
          </div>
          {!isFirst && (
            <button
              onClick={reset}
              className="flex items-center gap-1.5 rounded-full border border-gray-200 px-3 py-1.5 text-xs font-medium text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-700"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Restart</span>
            </button>
          )}
        </div>
      </header>

      {/* Progress (hidden on welcome & success) */}
      {!isFirst && !isLast && (
        <div className="sticky top-[57px] z-20 border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
            <ProgressTrack />
          </div>
        </div>
      )}

      {/* Step content */}
      <main className="flex flex-1 items-start justify-center px-4 pt-6 pb-32 sm:px-6 sm:pt-10 sm:pb-36">
        <div className="w-full max-w-3xl">
          <CurrentStep />
        </div>
      </main>

      {/* Sticky footer nav */}
      {!isFirst && !isLast && !isAnalysing && (
        <footer className="sticky bottom-0 z-30 border-t border-gray-100 bg-white/90 px-4 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3 backdrop-blur sm:px-6">
          <div className="mx-auto max-w-3xl">
            {!canProceed && (
              <p className="mb-2 flex items-center justify-center gap-1.5 text-center text-xs font-medium text-amber-600">
                <Info className="h-3.5 w-3.5" />
                Please fill all required fields to continue
              </p>
            )}
            <div className="flex items-center gap-3">
              <button
                onClick={goBack}
                disabled={isFirst}
                className="flex items-center gap-1.5 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 transition-colors hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-30"
              >
                <ArrowLeft className="h-4 w-4" />
                <span className="hidden sm:inline">Back</span>
              </button>
              <div className="flex-1" />
              <button
                onClick={goNext}
                disabled={!canProceed}
                className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 px-7 py-3 text-sm font-semibold text-white shadow-sm transition-all hover:brightness-105 active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:brightness-100 sm:px-8"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
