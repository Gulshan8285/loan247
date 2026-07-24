"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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

type LoanProductsSectionProps = {
  selectedSlug?: string | null;
  variant?: "home" | "journey";
};

export function LoanProductsSection({ selectedSlug, variant = "home" }: LoanProductsSectionProps) {
  const sectionRef = useRef<HTMLElement | null>(null);
  const scrollerRef = useRef<HTMLDivElement | null>(null);
  const cardRefs = useRef<Array<HTMLAnchorElement | null>>([]);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isMobileCarousel, setIsMobileCarousel] = useState(false);
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

  useEffect(() => {
    const query = window.matchMedia("(max-width: 639px)");
    const updateMode = () => setIsMobileCarousel(query.matches);

    updateMode();
    query.addEventListener("change", updateMode);
    return () => query.removeEventListener("change", updateMode);
  }, []);

  const updateActiveCard = useCallback(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;

    const scrollerCenter = scroller.getBoundingClientRect().left + scroller.clientWidth / 2;
    let nextActiveIndex = 0;
    let closestDistance = Number.POSITIVE_INFINITY;

    cardRefs.current.forEach((card, index) => {
      if (!card) return;
      const cardRect = card.getBoundingClientRect();
      const cardCenter = cardRect.left + cardRect.width / 2;
      const distance = Math.abs(scrollerCenter - cardCenter);

      if (distance < closestDistance) {
        closestDistance = distance;
        nextActiveIndex = index;
      }
    });

    setActiveIndex(nextActiveIndex);
  }, []);

  useEffect(() => {
    if (!isMobileCarousel || products.length < 2) return;
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const interval = window.setInterval(() => {
      setActiveIndex((currentIndex) => {
        const nextIndex = (currentIndex + 1) % products.length;
        const scroller = scrollerRef.current;
        const nextCard = cardRefs.current[nextIndex];

        if (scroller && nextCard) {
          const nextLeft = nextCard.offsetLeft - (scroller.clientWidth - nextCard.clientWidth) / 2;
          scroller.scrollTo({ left: Math.max(0, nextLeft), behavior: "smooth" });
        }

        return nextIndex;
      });
    }, 3400);

    return () => window.clearInterval(interval);
  }, [isMobileCarousel, products.length]);

  const isJourney = variant === "journey";
  const title = isJourney ? "Recommended loan categories" : "Choose your loan category";
  const subtitle = isJourney
    ? "You can explore any category while completing the application."
    : "Tap any category to open its full page, check details, then apply with the same Google login flow.";

  return (
    <section
      ref={sectionRef}
      id={isJourney ? undefined : "loan-products"}
      className={[
        "mx-auto max-w-5xl scroll-mt-24 text-left",
        isJourney ? "mt-9 rounded-2xl border border-emerald-100 bg-emerald-50/40 px-4 py-5 sm:px-5" : "mt-14",
      ].join(" ")}
    >
      <div className="text-center">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
          <BookOpenCheck className="h-3.5 w-3.5" />
          {isJourney ? "Suggestions" : "Loan options"}
        </span>
        <h2 className="mt-3 text-2xl font-black text-gray-900 sm:text-3xl">{title}</h2>
        <p className="mx-auto mt-1.5 max-w-xl text-sm leading-6 text-gray-500">
          {subtitle}
        </p>
      </div>

      <div
        ref={scrollerRef}
        onScroll={updateActiveCard}
        className="-mx-4 mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-4 pt-1 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:p-0 lg:grid-cols-4"
      >
        {products.map((product, index) => {
          const Icon = iconBySlug[product.slug as keyof typeof iconBySlug] || BadgeIndianRupee;
          const selected = selectedSlug === product.slug;
          const active = selected || (isMobileCarousel && activeIndex === index);

          return (
            <Link
              key={product.slug}
              ref={(node) => {
                cardRefs.current[index] = node;
              }}
              href={`/loans/${product.slug}`}
              aria-label={`Open ${product.title} details`}
              className={[
                "group flex min-h-[218px] w-[78vw] max-w-[20rem] shrink-0 snap-center flex-col rounded-2xl border bg-white p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md sm:min-h-[190px] sm:w-auto sm:max-w-none sm:rounded-xl",
                active
                  ? "border-2 border-emerald-500 shadow-lg shadow-emerald-500/15 ring-4 ring-emerald-100 sm:shadow-sm"
                  : "border-gray-200",
              ].join(" ")}
            >
              <div className="flex items-start justify-between gap-3">
                <div
                  className={[
                    "flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors sm:h-10 sm:w-10 sm:rounded-lg",
                    active ? "bg-emerald-100" : "bg-emerald-50",
                  ].join(" ")}
                >
                  <Icon className="h-5 w-5 text-emerald-700" />
                </div>
                <span className="rounded-full border border-gray-200 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-gray-500">
                  {product.category}
                </span>
              </div>
              <h3 className="mt-4 text-lg font-black text-gray-950 sm:text-base">{product.title}</h3>
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

      {isMobileCarousel && products.length > 1 && (
        <div className="mt-1 flex justify-center gap-1.5 sm:hidden" aria-hidden>
          {products.map((product, index) => (
            <span
              key={product.slug}
              className={[
                "h-1.5 rounded-full transition-all duration-300",
                activeIndex === index ? "w-6 bg-emerald-600" : "w-1.5 bg-gray-300",
              ].join(" ")}
            />
          ))}
        </div>
      )}
    </section>
  );
}
