"use client";

import { Briefcase, Calendar, CreditCard, IndianRupee, Landmark, MapPin, Target, User } from "lucide-react";
import { formatINR, useLoanStore } from "@/lib/loan-store";
import { StepHeader } from "./step-header";

export function ReviewStep() {
  const data = useLoanStore((s) => s.data);

  const rows = [
    { icon: User, label: "Name", value: [data.firstName, data.lastName].filter(Boolean).join(" ") || "—" },
    {
      icon: Calendar,
      label: "Date of birth",
      value: data.dob
        ? new Date(data.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" })
        : "—",
    },
    { icon: MapPin, label: "Pin code", value: data.pincode || "—" },
    { icon: CreditCard, label: "PAN number", value: data.panCard || "—" },
    { icon: IndianRupee, label: "Loan amount", value: `₹${formatINR(data.loanAmount)}`, highlight: true },
    { icon: Landmark, label: "Bank account", value: data.accountNumber ? `${data.bankName} ••${data.accountNumber.slice(-4)}` : "—" },
    { icon: Target, label: "Purpose", value: data.purpose || "—" },
    { icon: Briefcase, label: "Occupation", value: data.occupation || "—" },
    {
      icon: IndianRupee,
      label: "Monthly income",
      value: data.monthlyIncome ? `₹${formatINR(Number(data.monthlyIncome))}` : "—",
    },
    { icon: Briefcase, label: "Salary mode", value: data.salaryMode || "—" },
  ];

  const estEMI = Math.round(data.loanAmount * 0.009);

  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-9">
      <StepHeader
        title="Review your application"
        subtitle="Everything look right? Hit finish to see your offer."
        badge="Step 8 · Review"
      />

      {/* Highlight hero card */}
      <div className="mt-7 overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/60 p-6">
        <p className="text-xs uppercase tracking-widest text-gray-400">You&apos;re borrowing</p>
        <p className="mt-1 text-4xl font-black text-emerald-600 sm:text-5xl">
          ₹{formatINR(data.loanAmount)}
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-sm">
          <div>
            <p className="text-gray-500">Est. EMI</p>
            <p className="font-semibold text-gray-900">₹{formatINR(estEMI)}/mo</p>
          </div>
          <div>
            <p className="text-gray-500">Tenure</p>
            <p className="font-semibold text-gray-900">60 months</p>
          </div>
          <div>
            <p className="text-gray-500">Rate</p>
            <p className="font-semibold text-gray-900">10.8% p.a.</p>
          </div>
        </div>
      </div>

      {/* Detail rows */}
      <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
        {rows.map((r) => (
          <div
            key={r.label}
            className="flex items-center gap-3 rounded-xl border border-gray-100 bg-white px-4 py-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-50">
              <r.icon className="h-4 w-4 text-emerald-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-wide text-gray-400">{r.label}</p>
              <p className={`truncate text-sm font-medium ${r.highlight ? "text-emerald-600" : "text-gray-900"}`}>
                {r.value}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
