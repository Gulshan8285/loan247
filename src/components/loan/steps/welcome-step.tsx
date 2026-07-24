"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Clock, IndianRupee, ShieldCheck, Sparkles, Star, TrendingUp, Zap } from "lucide-react";
import { useLoanStore } from "@/lib/loan-store";
import type { LoanProduct } from "@/lib/loan-products";
import type { HomePageSettings, SiteSettings } from "@/lib/site-settings";
import { EmiCalculator } from "../emi-calculator";
import { ReviewsSection } from "../reviews-section";
import { LoanProductsSection } from "../loan-products-section";
import { LoanSelectionModal } from "../loan-selection-modal";

const DEFAULT_HOME_PAGE: HomePageSettings = {
  seoTitle: "LOAN247 - Personal Loan Application Online",
  seoDescription: "Apply for a LOAN247 personal loan through a simple, secure, mobile-friendly online application journey.",
  badgeText: "Welcome to LOAN247",
  headline: "Instant Personal Loans",
  amountText: "Up to Rs. 8,00,000",
  description:
    "Get approved in minutes with minimal documentation. Quick disbursement directly to your bank account - available 24/7.",
  trustLine: "RBI Registered NBFC · Bank-grade encryption · No impact on credit score",
};

type SiteSettingsResponse = {
  ok: boolean;
  settings?: SiteSettings;
};

export function WelcomeStep() {
  const goNext = useLoanStore((s) => s.goNext);
  const update = useLoanStore((s) => s.update);
  const [homePage, setHomePage] = useState<HomePageSettings>(DEFAULT_HOME_PAGE);
  const [selectionOpen, setSelectionOpen] = useState(false);
  const [selectedLoanSlug, setSelectedLoanSlug] = useState<string | null>(() => {
    if (typeof window === "undefined") return null;
    return new URLSearchParams(window.location.search).get("loan");
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const shouldOpenSelection = params.get("selectLoan") === "1" || params.get("apply") === "1";
    if (!selectedLoanSlug) return;

    let active = true;
    fetch("/api/loan-products", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (!active || !payload?.ok || !Array.isArray(payload.products)) return;
        const product = (payload.products as LoanProduct[]).find((item) => item.slug === selectedLoanSlug);
        if (product?.purpose) {
          update({ purpose: product.purpose });
        }

        if (product) {
          update({
            selectedLoanSlug: product.slug,
            selectedLoanTitle: product.title,
            ...(product.purpose ? { purpose: product.purpose } : {}),
          });
        }
      })
      .catch(() => undefined);

    if (shouldOpenSelection) {
      setSelectionOpen(true);
    }

    return () => {
      active = false;
    };
  }, [selectedLoanSlug, update]);

  useEffect(() => {
    if (typeof window === "undefined") return;
    const params = new URLSearchParams(window.location.search);
    if (!selectedLoanSlug && (params.get("selectLoan") === "1" || params.get("apply") === "1")) {
      setSelectionOpen(true);
    }
  }, [selectedLoanSlug]);

  useEffect(() => {
    let active = true;
    fetch("/api/site-settings", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload: SiteSettingsResponse) => {
        if (!active || !payload?.ok || !payload.settings?.homePage) return;
        setHomePage(payload.settings.homePage);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  function startApplyFlow() {
    setSelectionOpen(true);
  }

  function selectLoan(product: LoanProduct) {
    setSelectedLoanSlug(product.slug);
    update({
      selectedLoanSlug: product.slug,
      selectedLoanTitle: product.title,
      ...(product.purpose ? { purpose: product.purpose } : {}),
    });
    setSelectionOpen(false);
    window.history.replaceState(null, "", "/");
    goNext();
  }

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
      <div className="mx-auto mb-8 flex justify-center">
        <img
          src="/images/hero-loan.png"
          alt="Instant loan approval illustration"
          className="h-44 w-44 rounded-3xl object-cover shadow-lg shadow-emerald-500/10 sm:h-56 sm:w-56"
        />
      </div>

      {/* Trust badges */}
      <div className="mb-6 flex flex-wrap items-center justify-center gap-2.5">
        {trustBadges.map((b) => (
          <span
            key={b.label}
            className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-4 py-2 text-xs font-semibold text-gray-700 shadow-sm"
          >
            <b.icon className="h-4 w-4 text-emerald-600" />
            {b.label}
          </span>
        ))}
      </div>

      <span className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-4 py-1.5 text-xs font-medium text-emerald-700">
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
        {homePage.badgeText}
      </span>

      <h1 className="text-balance text-4xl font-black leading-tight tracking-tight text-gray-900 sm:text-6xl">
        {homePage.headline}
      </h1>
      <p className="mt-3 text-2xl font-black text-emerald-600 sm:text-4xl">{homePage.amountText}</p>

      <p className="mx-auto mt-5 max-w-lg text-pretty text-base leading-relaxed text-gray-500 sm:text-lg">
        {homePage.description}
      </p>

      {/* Stats */}
      <div className="mx-auto mt-9 grid max-w-xl grid-cols-3 gap-4">
        {stats.map((s) => (
          <div key={s.label} className="rounded-2xl border border-gray-100 bg-white p-4 text-center shadow-sm">
            <div className="mx-auto mb-2 flex h-10 w-10 items-center justify-center rounded-full bg-emerald-50">
              <s.icon className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-lg font-black text-gray-900">{s.value}</p>
            <p className="text-xs text-gray-500">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Feature cards */}
      <div className="mx-auto mt-10 grid max-w-3xl gap-4 sm:grid-cols-3">
        {features.map((f) => (
          <div key={f.title} className="rounded-2xl border border-gray-100 bg-white p-5 text-left shadow-sm">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50">
              <f.icon className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="text-base font-semibold text-gray-900">{f.title}</p>
            <p className="mt-1 text-sm leading-relaxed text-gray-500">{f.desc}</p>
          </div>
        ))}
      </div>

      <button
        onClick={startApplyFlow}
        className="mt-10 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 px-10 py-4 text-base font-bold text-white shadow-lg shadow-emerald-500/25 transition-transform hover:brightness-105 active:scale-[0.98]"
      >
        Apply Now
        <ArrowRight className="h-5 w-5" />
      </button>

      <div className="mt-6 flex items-center justify-center gap-1.5 text-[11px] text-gray-400">
        <ShieldCheck className="h-3 w-3" />
        {homePage.trustLine}
      </div>

      {/* Loan categories */}
      <LoanProductsSection selectedSlug={selectedLoanSlug} />

      {/* EMI Calculator */}
      <EmiCalculator />

      {/* Customer reviews */}
      <ReviewsSection />

      <LoanSelectionModal
        open={selectionOpen}
        selectedSlug={selectedLoanSlug}
        onClose={() => setSelectionOpen(false)}
        onSelect={selectLoan}
      />
    </div>
  );
}
