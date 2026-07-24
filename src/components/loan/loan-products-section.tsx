"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  ArrowRight,
  BadgeIndianRupee,
  BookOpenCheck,
  BriefcaseBusiness,
  Building2,
  Calculator,
  FileCheck2,
  GraduationCap,
  HelpCircle,
  Home,
  Landmark,
  Scale,
  ShieldCheck,
  Star,
} from "lucide-react";
import { LOAN_PRODUCTS, type LoanProduct } from "@/lib/loan-products";

const iconBySlug = {
  "personal-loan": BadgeIndianRupee,
  "business-loan": BriefcaseBusiness,
  "home-loan": Home,
  "gold-loan": Star,
  "education-loan": GraduationCap,
  "loan-against-property": Building2,
  "eligibility-checker": ShieldCheck,
  "interest-rate": Calculator,
  "documents-required": FileCheck2,
  "cibil-score-guide": Scale,
  "loan-faq": HelpCircle,
  "pm-mudra-loan": Landmark,
} as const;

export function LoanProductsSection({ selectedSlug }: { selectedSlug?: string | null }) {
  const [products, setProducts] = useState<LoanProduct[]>(() =>
    LOAN_PRODUCTS.filter((product) => product.visible !== false).sort(
      (a, b) => (a.order || 0) - (b.order || 0) || a.title.localeCompare(b.title),
    ),
  );

  useEffect(() => {
    let active = true;
    fetch("/api/loan-products", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (!active || !payload?.ok || !Array.isArray(payload.products)) return;
        setProducts(payload.products);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  return (
    <section id="loan-products" className="mx-auto mt-14 max-w-5xl scroll-mt-24 text-left">
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          <BookOpenCheck className="h-3.5 w-3.5" />
          Loan options
        </span>
        <h2 className="mt-3 text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
          Choose your loan category
        </h2>
        <p className="mx-auto mt-1.5 max-w-xl text-sm leading-6 text-gray-500">
          Tap any category to open its full page, check details, then apply with the same Google login flow.
        </p>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {products.map((product) => {
          const Icon = iconBySlug[product.slug as keyof typeof iconBySlug] || BadgeIndianRupee;
          const selected = selectedSlug === product.slug;

          return (
            <Link
              key={product.slug}
              href={`/loans/${product.slug}`}
              className={[
                "group flex min-h-[190px] flex-col rounded-xl border bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md",
                selected
                  ? "border-2 border-emerald-500 ring-4 ring-emerald-100"
                  : "border-gray-200",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
                  <Icon className="h-5 w-5 text-emerald-700" />
                </div>
                <span className="rounded-full border border-gray-200 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                  {product.category}
                </span>
              </div>
              <h3 className="mt-4 text-base font-black text-gray-950">{product.title}</h3>
              <p className="mt-2 line-clamp-3 flex-1 text-sm leading-6 text-gray-500">
                {product.summary}
              </p>
              <div className="mt-4 flex items-center justify-between gap-3 border-t border-gray-100 pt-3">
                <span className="text-xs font-semibold text-emerald-700">{product.rate}</span>
                <ArrowRight className="h-4 w-4 text-gray-400 transition-transform group-hover:translate-x-1 group-hover:text-emerald-600" />
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
