"use client";

import { CheckCircle2, Minus, Plus, TrendingUp, Info } from "lucide-react";
import { formatINR, useLoanStore } from "@/lib/loan-store";
import { StepHeader } from "./step-header";

const MIN = 10000;
const DEFAULT_MAX = 5000000; // fallback if no CIBIL approval yet
const STEP = 10000;

const QUICK_AMOUNTS = [50000, 200000, 500000, 1000000, 2000000];

export function LoanAmountStep() {
  const amount = useLoanStore((s) => s.data.loanAmount);
  const approved = useLoanStore((s) => s.data.cibilApprovedAmount);
  const update = useLoanStore((s) => s.update);

  // Cap the maximum at the CIBIL-approved amount (decrease only, never increase)
  const MAX = approved > 0 ? approved : DEFAULT_MAX;

  function setAmount(v: number) {
    const clamped = Math.max(MIN, Math.min(MAX, v));
    update({ loanAmount: clamped });
  }

  const progress = ((amount - MIN) / (MAX - MIN)) * 100;
  const atMax = amount >= MAX;

  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-9">
      <StepHeader
        title="Select your loan amount"
        subtitle="What loan amount are you seeking?"
        badge="Step 4 · Amount"
      />

      {/* Amount display */}
      <div className="mt-8 flex flex-col items-center">
        <span className="mb-2.5 inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          <CheckCircle2 className="h-3.5 w-3.5" /> Pre-approved amount
        </span>
        <div className="flex items-center justify-center rounded-2xl border border-gray-100 bg-gray-50/60 px-6 py-8 sm:px-12">
          <span className="mr-2 text-3xl font-bold text-emerald-600 sm:text-4xl">₹</span>
          <span className="text-5xl font-black tabular-nums tracking-tight text-gray-900 sm:text-7xl">
            {formatINR(amount)}
          </span>
        </div>

        {/* +/- controls — + is disabled at the approved maximum */}
        <div className="mt-6 flex items-center gap-4">
          <ControlButton onClick={() => setAmount(amount - STEP)} disabled={amount <= MIN}>
            <Minus className="h-5 w-5" />
          </ControlButton>

          <div className="flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest text-gray-400">Adjust</span>
            <span className="text-sm font-medium text-gray-600">− ₹{formatINR(STEP / 1000)}k</span>
          </div>

          <ControlButton onClick={() => setAmount(amount + STEP)} disabled={atMax}>
            <Plus className="h-5 w-5" />
          </ControlButton>
        </div>
      </div>

      {/* Range slider — capped at the approved amount */}
      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between text-xs text-gray-500">
          <span>₹{formatINR(MIN)}</span>
          <span>₹{formatINR(MAX)} (approved)</span>
        </div>
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="amount-slider w-full"
          style={{
            background: `linear-gradient(90deg, #3b82f6 0%, #10b981 ${progress}%, #e5e7eb ${progress}%)`,
          }}
        />
      </div>

      {/* Quick amounts — only those at or below the approved cap are selectable */}
      <div className="mt-7">
        <p className="mb-2.5 text-xs font-medium uppercase tracking-wider text-gray-400">Quick pick</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((q) => {
            const active = amount === q;
            const overCap = q > MAX;
            return (
              <button
                key={q}
                onClick={() => !overCap && setAmount(q)}
                disabled={overCap}
                className={`rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                  overCap
                    ? "cursor-not-allowed border border-gray-100 bg-gray-50 text-gray-300 line-through"
                    : active
                      ? "bg-gradient-to-r from-blue-500 to-emerald-500 text-white"
                      : "border border-gray-200 bg-white text-gray-700 hover:bg-gray-50"
                }`}
              >
                ₹{formatINR(q)}
              </button>
            );
          })}
        </div>
      </div>

      {/* Decrease-only notice */}
      <div className="mt-6 flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
          <Info className="h-4 w-4 text-emerald-600" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            You can decrease the amount below your approved limit of ₹{formatINR(MAX)}.
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            The approved amount is based on your CIBIL profile — it can&apos;t be increased here.
          </p>
        </div>
      </div>

      {/* EMI hint */}
      <div className="mt-4 flex items-start gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-50">
          <TrendingUp className="h-4 w-4 text-amber-500" />
        </div>
        <div>
          <p className="text-sm font-medium text-gray-900">
            Estimated EMI from ₹{formatINR(Math.round(amount * 0.009))}/mo*
          </p>
          <p className="mt-0.5 text-xs text-gray-500">*Indicative only, subject to eligibility &amp; tenure.</p>
        </div>
      </div>

      <style>{`
        .amount-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 8px;
          border-radius: 999px;
          outline: none;
          cursor: pointer;
        }
        .amount-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid #10b981;
          box-shadow: 0 2px 8px rgba(0,0,0,0.15);
          cursor: pointer;
        }
        .amount-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid #10b981;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}

function ControlButton({
  children,
  onClick,
  disabled,
}: {
  children: React.ReactNode;
  onClick: () => void;
  disabled?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 text-white shadow-sm transition-transform hover:brightness-105 active:scale-95 disabled:cursor-not-allowed disabled:opacity-30"
    >
      {children}
    </button>
  );
}
