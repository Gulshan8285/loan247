"use client";

import { CheckCircle2, MapPin } from "lucide-react";
import { formatINR } from "@/lib/loan-store";

/**
 * ReviewsSection
 * Customer testimonials — mirrors the reference design. Header shows the
 * overall rating (4.8 / 1,00,000+ reviews), followed by a grid of review
 * cards (avatar with initials, name + verified badge + location, star rating,
 * review text, loan amount tag).
 */
interface Review {
  initials: string;
  name: string;
  location: string;
  time: string;
  text: string;
  loan: number;
}

const REVIEWS: Review[] = [
  {
    initials: "RK",
    name: "Rajesh Kumar",
    location: "Mumbai, Maharashtra",
    time: "2 days ago",
    text: "Excellent service. My loan was approved in just 5 minutes and it was very helpful during an emergency. Highly recommended.",
    loan: 75000,
  },
  {
    initials: "PS",
    name: "Priya Sharma",
    location: "Delhi",
    time: "1 week ago",
    text: "The process was very simple. There were no hidden charges, the staff was cooperative, and the EMI calculation was accurate.",
    loan: 100000,
  },
  {
    initials: "MR",
    name: "Mohammed Raza",
    location: "Hyderabad, Telangana",
    time: "3 days ago",
    text: "I needed a loan for a medical emergency and received same-day approval. Thank you to the LOAN247 team.",
    loan: 50000,
  },
  {
    initials: "AD",
    name: "Anita Devi",
    location: "Patna, Bihar",
    time: "5 days ago",
    text: "I was unsure at first, but the service felt genuine. The interest rate was reasonable and I would use it again.",
    loan: 80000,
  },
  {
    initials: "SP",
    name: "Suresh Patil",
    location: "Pune, Maharashtra",
    time: "1 day ago",
    text: "I needed urgent funds for my business. LOAN247 helped quickly and the documentation was minimal.",
    loan: 150000,
  },
  {
    initials: "KN",
    name: "Kavitha Nair",
    location: "Kochi, Kerala",
    time: "4 days ago",
    text: "Customer support was very good. Every question was answered clearly and the loan disbursement was on time.",
    loan: 60000,
  },
];

function Stars() {
  return (
    <div className="flex items-center gap-0.5" aria-label="5 out of 5 stars">
      {Array.from({ length: 5 }).map((_, i) => (
        <svg key={i} width="14" height="14" viewBox="0 0 24 24" fill="#facc15" aria-hidden>
          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
        </svg>
      ))}
    </div>
  );
}

export function ReviewsSection() {
  return (
    <section className="mx-auto mt-14 max-w-5xl">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
          Customer Reviews
        </h2>
        <p className="mt-1 text-sm text-gray-500">What our customers say about us</p>
        <div className="mt-3 flex items-center justify-center gap-2">
          <Stars />
          <span className="text-sm font-bold text-gray-900">4.8</span>
          <span className="text-xs text-gray-400">based on 1,00,000+ reviews</span>
        </div>
      </div>

      {/* Review cards grid */}
      <div className="mt-7 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {REVIEWS.map((r) => (
          <div
            key={r.name}
            className="flex flex-col rounded-2xl border border-gray-100 bg-white p-4 shadow-sm"
          >
            {/* Top: avatar + name + verified + location */}
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-sm font-bold text-emerald-700">
                {r.initials}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-1">
                  <p className="truncate text-sm font-bold text-gray-900">{r.name}</p>
                  <CheckCircle2 className="h-3.5 w-3.5 shrink-0 text-emerald-500" />
                </div>
                <p className="flex items-center gap-1 text-[11px] text-gray-400">
                  <MapPin className="h-3 w-3 shrink-0" />
                  {r.location}
                </p>
              </div>
            </div>

            {/* Rating + time */}
            <div className="mt-3 flex items-center justify-between">
              <Stars />
              <span className="text-[11px] text-gray-400">{r.time}</span>
            </div>

            {/* Review text */}
            <p className="mt-2 flex-1 text-sm leading-relaxed text-gray-600">{r.text}</p>

            {/* Loan amount tag */}
            <span className="mt-3 inline-block w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-[11px] font-medium text-emerald-700">
              Loan: ₹{formatINR(r.loan)}
            </span>
          </div>
        ))}
      </div>
    </section>
  );
}
