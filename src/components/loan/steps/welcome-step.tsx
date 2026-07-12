"use client";

import { ArrowRight, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { useLoanStore } from "@/lib/loan-store";

export function WelcomeStep() {
  const goNext = useLoanStore((s) => s.goNext);

  const features = [
    { icon: Zap, title: "60-second analysis", desc: "10 simple steps, real-time verification" },
    { icon: ShieldCheck, title: "Bank-grade secure", desc: "Your data stays encrypted & private" },
    { icon: Sparkles, title: "Curated offers", desc: "We match you to the best lenders" },
  ];

  return (
    <div className="text-center">
      <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-500 to-emerald-500 shadow-lg shadow-emerald-500/20">
        <span className="text-4xl font-black text-white">₹</span>
      </div>

      <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Welcome to Aurora Lend
      </span>

      <h1 className="text-balance text-3xl font-black leading-tight tracking-tight text-gray-900 sm:text-5xl">
        Your loan, made simple.
      </h1>

      <p className="mx-auto mt-4 max-w-md text-pretty text-base text-gray-500 sm:text-lg">
        A clean, fast journey from your details to a curated loan offer — no paperwork, no fuss.
      </p>

      <div className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl border border-gray-100 bg-white p-4 text-left shadow-sm">
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-50">
              <f.icon className="h-4.5 w-4.5 text-emerald-600" />
            </div>
            <p className="text-sm font-semibold text-gray-900">{f.title}</p>
            <p className="mt-0.5 text-xs text-gray-500">{f.desc}</p>
          </div>
        ))}
      </div>

      <button
        onClick={goNext}
        className="mt-8 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 px-8 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/20 transition-transform hover:brightness-105 active:scale-[0.98]"
      >
        Begin your journey
        <ArrowRight className="h-5 w-5" />
      </button>
    </div>
  );
}
