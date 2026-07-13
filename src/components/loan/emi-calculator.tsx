"use client";

import { useMemo, useState } from "react";
import { IndianRupee, Percent, CalendarClock } from "lucide-react";
import { formatINR } from "@/lib/loan-store";

/**
 * EmiCalculator
 * A clean, professional EMI calculator with three sliders (loan amount,
 * interest rate, tenure) and three live outputs (monthly EMI, total interest,
 * total payable). Inserted on the welcome page to help customers estimate
 * their repayments.
 *
 * Formula: EMI = P × r × (1+r)^n / ((1+r)^n − 1)
 *   P = principal, r = monthly rate (annual/12/100), n = tenure months
 */
const MIN_AMOUNT = 5000;
const MAX_AMOUNT = 800000;
const MIN_RATE = 12;
const MAX_RATE = 24;
const MIN_TENURE = 6;
const MAX_TENURE = 60;

export function EmiCalculator() {
  const [amount, setAmount] = useState(100000);
  const [rate, setRate] = useState(14);
  const [tenure, setTenure] = useState(24);

  const { emi, totalInterest, totalPayable } = useMemo(() => {
    const r = rate / 12 / 100;
    const n = tenure;
    const factor = Math.pow(1 + r, n);
    const e = r === 0 ? amount / n : (amount * r * factor) / (factor - 1);
    const total = e * n;
    return {
      emi: Math.round(e),
      totalInterest: Math.round(total - amount),
      totalPayable: Math.round(total),
    };
  }, [amount, rate, tenure]);

  const amountPct = ((amount - MIN_AMOUNT) / (MAX_AMOUNT - MIN_AMOUNT)) * 100;
  const ratePct = ((rate - MIN_RATE) / (MAX_RATE - MIN_RATE)) * 100;
  const tenurePct = ((tenure - MIN_TENURE) / (MAX_TENURE - MIN_TENURE)) * 100;

  return (
    <section className="mx-auto mt-16 max-w-3xl">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Plan your loan
        </span>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
          EMI Calculator
        </h2>
        <p className="mt-1.5 text-sm text-gray-500">
          Adjust the sliders to estimate your monthly EMI
        </p>
      </div>

      <div className="mt-7 rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-8">
        {/* Sliders */}
        <div className="space-y-7">
          {/* Loan Amount */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <IndianRupee className="h-3.5 w-3.5 text-gray-400" />
                Loan Amount
              </label>
              <span className="text-lg font-bold text-emerald-600">₹{formatINR(amount)}</span>
            </div>
            <input
              type="range"
              min={MIN_AMOUNT}
              max={MAX_AMOUNT}
              step={5000}
              value={amount}
              onChange={(e) => setAmount(Number(e.target.value))}
              className="emi-slider w-full"
              style={{
                background: `linear-gradient(90deg, #3b82f6 0%, #10b981 ${amountPct}%, #e5e7eb ${amountPct}%)`,
              }}
            />
            <div className="mt-1.5 flex justify-between text-[11px] text-gray-400">
              <span>₹{formatINR(MIN_AMOUNT)}</span>
              <span>₹{formatINR(MAX_AMOUNT)}</span>
            </div>
          </div>

          {/* Interest Rate */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <Percent className="h-3.5 w-3.5 text-gray-400" />
                Interest Rate (p.a.)
              </label>
              <span className="text-lg font-bold text-emerald-600">{rate}%</span>
            </div>
            <input
              type="range"
              min={MIN_RATE}
              max={MAX_RATE}
              step={0.5}
              value={rate}
              onChange={(e) => setRate(Number(e.target.value))}
              className="emi-slider w-full"
              style={{
                background: `linear-gradient(90deg, #3b82f6 0%, #10b981 ${ratePct}%, #e5e7eb ${ratePct}%)`,
              }}
            />
            <div className="mt-1.5 flex justify-between text-[11px] text-gray-400">
              <span>{MIN_RATE}%</span>
              <span>{MAX_RATE}%</span>
            </div>
          </div>

          {/* Tenure */}
          <div>
            <div className="mb-2 flex items-center justify-between">
              <label className="flex items-center gap-1.5 text-sm font-medium text-gray-700">
                <CalendarClock className="h-3.5 w-3.5 text-gray-400" />
                Tenure (months)
              </label>
              <span className="text-lg font-bold text-emerald-600">{tenure} mo</span>
            </div>
            <input
              type="range"
              min={MIN_TENURE}
              max={MAX_TENURE}
              step={1}
              value={tenure}
              onChange={(e) => setTenure(Number(e.target.value))}
              className="emi-slider w-full"
              style={{
                background: `linear-gradient(90deg, #3b82f6 0%, #10b981 ${tenurePct}%, #e5e7eb ${tenurePct}%)`,
              }}
            />
            <div className="mt-1.5 flex justify-between text-[11px] text-gray-400">
              <span>{MIN_TENURE} mo</span>
              <span>{MAX_TENURE} mo</span>
            </div>
          </div>
        </div>

        {/* Outputs */}
        <div className="mt-7 grid grid-cols-3 gap-3">
          <div className="rounded-2xl bg-gray-50 p-4 text-center">
            <p className="text-[11px] uppercase tracking-wide text-gray-400">Monthly EMI</p>
            <p className="mt-1 text-lg font-black text-emerald-600 sm:text-xl">
              ₹{formatINR(emi)}
            </p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4 text-center">
            <p className="text-[11px] uppercase tracking-wide text-gray-400">Total Interest</p>
            <p className="mt-1 text-lg font-black text-gray-900 sm:text-xl">
              ₹{formatINR(totalInterest)}
            </p>
          </div>
          <div className="rounded-2xl bg-gray-50 p-4 text-center">
            <p className="text-[11px] uppercase tracking-wide text-gray-400">Total Payable</p>
            <p className="mt-1 text-lg font-black text-gray-900 sm:text-xl">
              ₹{formatINR(totalPayable)}
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .emi-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 8px;
          border-radius: 999px;
          outline: none;
          cursor: pointer;
        }
        .emi-slider::-webkit-slider-thumb {
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
        .emi-slider::-moz-range-thumb {
          width: 24px;
          height: 24px;
          border-radius: 50%;
          background: #ffffff;
          border: 3px solid #10b981;
          cursor: pointer;
        }
      `}</style>
    </section>
  );
}
