"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  BadgeIndianRupee,
  BriefcaseBusiness,
  Building2,
  GraduationCap,
  Home,
  Landmark,
  SearchCheck,
  Star,
  X,
} from "lucide-react";
import { LOAN_PRODUCTS, type LoanProduct } from "@/lib/loan-products";

const iconBySlug = {
  "personal-loan": BadgeIndianRupee,
  "business-loan": BriefcaseBusiness,
  "home-loan": Home,
  "gold-loan": Star,
  "education-loan": GraduationCap,
  "loan-against-property": Building2,
  "pm-mudra-loan": Landmark,
} as const;

type LoanSelectionModalProps = {
  open: boolean;
  selectedSlug?: string | null;
  onClose: () => void;
  onSelect: (product: LoanProduct) => void;
};

function sortProducts(products: LoanProduct[]) {
  return [...products]
    .filter((product) => product.visible !== false)
    .sort((a, b) => (a.order || 0) - (b.order || 0) || a.title.localeCompare(b.title));
}

export function LoanSelectionModal({ open, selectedSlug, onClose, onSelect }: LoanSelectionModalProps) {
  const [products, setProducts] = useState<LoanProduct[]>(() => sortProducts(LOAN_PRODUCTS));

  useEffect(() => {
    if (!open) return;
    let active = true;
    fetch("/api/loan-products", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (!active || !payload?.ok || !Array.isArray(payload.products)) return;
        setProducts(sortProducts(payload.products));
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[70] flex items-end justify-center bg-gray-950/45 px-3 pb-3 pt-16 backdrop-blur-sm sm:items-center sm:p-6">
      <div className="max-h-[86vh] w-full max-w-4xl overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-2xl">
        <div className="flex items-start justify-between gap-3 border-b border-gray-100 px-4 py-4 sm:px-6">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
              <SearchCheck className="h-3.5 w-3.5" />
              Select loan first
            </span>
            <h2 className="mt-3 text-xl font-black text-gray-950 sm:text-2xl">Choose a loan category</h2>
            <p className="mt-1 max-w-xl text-sm leading-6 text-gray-500">
              Select the loan you want. After this, Google login will open automatically.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50 hover:text-gray-900"
            aria-label="Close loan selection"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="max-h-[62vh] overflow-y-auto px-4 py-4 sm:px-6">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {products.map((product) => {
              const Icon = iconBySlug[product.slug as keyof typeof iconBySlug] || BadgeIndianRupee;
              const selected = selectedSlug === product.slug;

              return (
                <button
                  key={product.slug}
                  type="button"
                  data-loan-selection-slug={product.slug}
                  onClick={() => onSelect(product)}
                  className={[
                    "group flex min-h-[150px] flex-col rounded-2xl border bg-white p-4 text-left shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md",
                    selected ? "border-2 border-emerald-500 ring-4 ring-emerald-100" : "border-gray-200",
                  ].join(" ")}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-emerald-50">
                      <Icon className="h-5 w-5 text-emerald-700" />
                    </div>
                    <span className="rounded-full border border-gray-200 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                      {product.category}
                    </span>
                  </div>
                  <h3 className="mt-3 text-base font-black text-gray-950">{product.title}</h3>
                  <p className="mt-1 line-clamp-2 flex-1 text-sm leading-6 text-gray-500">{product.summary}</p>
                  <span className="mt-3 inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    Continue to Google
                    <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1" />
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
