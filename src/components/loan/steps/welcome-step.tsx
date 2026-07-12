"use client";

import { ArrowRight, Clock, IndianRupee, ShieldCheck, Sparkles, Star, TrendingUp, Zap } from "lucide-react";
import { useLoanStore } from "@/lib/loan-store";
import { LoanLogo } from "../loan-logo";

export function WelcomeStep() {
  const goNext = useLoanStore((s) => s.goNext);

  const trustBadges = [
    { label: "RBI Registered", icon: ShieldCheck },
    { label: "4.8/5 Rated", icon: Star },
    { label: "Verified", icon: ShieldCheck },
  ];

  const stats = [
    { icon: TrendingUp, value: "1M+", label: "Customers" },
    { icon: IndianRupee, value: "₹500Cr+", label: "Disbursed" },
    { icon: Clock, value: "24hr", label: "Disbursement" },
  ];

  const features = [
    { icon: Zap, title: "Quick Approval", desc: "Get approved within 5 minutes. AI-powered instant processing." },
    { icon: ShieldCheck, title: "100% Secure", desc: "Bank-grade 256-bit SSL encryption. Your data is safe." },
    { icon: Sparkles, title: "Best Rates", desc: "Interest rates starting at 12% p.a. No hidden charges." },
  ];

  return (
    <div className="text-center">
      {/* Hero illustration image */}
      <div className="mx-auto mb-6 flex justify-center">
        <img
          src="/images/hero-loan.png"
          alt="Instant loan approval illustration"
          className="h-40 w-40 rounded-3xl object-cover sm:h-48 sm:w-48"
        />
      </div>

      {/* Trust badges */}
      <div className="mb-5 flex flex-wrap items-center justify-center gap-2">
        {trustBadges.map((b) => (
          <span
            key={b.label}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-semibold text-gray-700"
          >
            <b.icon className="h-3.5 w-3.5 text-emerald-600" />
            {b.label}
          </span>
        ))}
      </div>

      <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-medium text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        Welcome to LOAN247
      </span>

      <h1 className="text-balance text-3xl font-black leading-tight tracking-tight text-gray-900 sm:text-5xl">
        Instant Personal Loans
      </h1>
      <p className="mt-1 text-2xl font-black text-emerald-600 sm:text-4xl">Up to ₹8,00,000</p>

      <p className="mx-auto mt-4 max-w-md text-pretty text-base text-gray-500 sm:text-lg">
        Get approved in minutes with minimal documentation. Quick disbursement directly to your bank account — available 24/7.
      </p>

      {/* Stats */}
      <div className="mx-auto mt-7 grid max-w-lg grid-cols-3 gap-3">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-3 text-center shadow-sm">
            <div className="mx-auto mb-1.5 flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50">
              <s.icon className="h-4.5 w-4.5 text-emerald-600" />
            </div>
            <p className="text-base font-black text-gray-900">{s.value}</p>
            <p className="text-[11px] text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div className="mx-auto mt-7 grid max-w-2xl gap-3 sm:grid-cols-3">
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

      <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
        <ShieldCheck className="h-3 w-3" />
        RBI Registered NBFC · Bank-grade encryption · No impact on credit score
      </div>
    </div>
  );
}
