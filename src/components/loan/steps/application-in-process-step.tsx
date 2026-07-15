"use client";

import {
  Calendar,
  CheckCircle2,
  CreditCard,
  IndianRupee,
  Landmark,
  MapPin,
  Phone,
  RotateCcw,
  User,
} from "lucide-react";
import { formatINR, getApplicationRef, useLoanStore } from "@/lib/loan-store";
import { SiteFooter } from "../site-footer";

/**
 * ApplicationInProcessStep (terminal)
 * Shown after the ₹59 fee is paid. Confirms the application is in process and
 * that we will connect with the customer.
 *
 * Layout (per requirement):
 *  - Header: "Your application is in process" + "we will connect you"
 *  - 3 saved-data sections at the top:
 *      1. Customer profile (name, DOB, PAN, pincode)
 *      2. Bank account details
 *      3. Loan approval amount
 *  - Payment receipt (₹59 paid) at the bottom
 *  - "Start a new application" button
 */
export function ApplicationInProcessStep() {
  const data = useLoanStore((s) => s.data);
  const reset = useLoanStore((s) => s.reset);
  const setSupportOpen = useLoanStore((s) => s.setSupportOpen);
  const refNo = getApplicationRef(data);
  const name = data.firstName || "Customer";

  const profileRows = [
    {
      icon: User,
      label: "Name",
      value: [data.firstName, data.lastName].filter(Boolean).join(" ") || "—",
    },
    {
      icon: Calendar,
      label: "Date of birth",
      value: data.dob
        ? new Date(data.dob).toLocaleDateString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })
        : "—",
    },
    { icon: CreditCard, label: "PAN number", value: data.panCard || "—" },
    { icon: Phone, label: "Mobile", value: data.phone || "—" },
    { icon: MapPin, label: "Address", value: data.address || "—" },
    { icon: MapPin, label: "Pin code", value: data.pincode || "—" },
  ];

  const accountRows = [
    { icon: User, label: "Account holder", value: data.accountHolderName || "—" },
    {
      icon: Landmark,
      label: "Account number",
      value: data.accountNumber ? `••••${data.accountNumber.slice(-4)}` : "—",
    },
    { icon: CreditCard, label: "IFSC code", value: data.ifscCode || "—" },
    { icon: Landmark, label: "Bank", value: data.bankName || "—" },
  ];

  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-9">
      {/* Header */}
      <div className="text-center">
        <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-50">
          <CheckCircle2 className="h-9 w-9 text-emerald-600" />
        </div>
        <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
          Application submitted
        </span>
        <h1 className="mt-3 text-balance text-2xl font-black tracking-tight text-gray-900 sm:text-3xl">
          Your application is in process
        </h1>
        <p className="mx-auto mt-2 max-w-md text-pretty text-sm text-gray-500 sm:text-base">
          Thank you, {name}. Your application and ₹59 fee have been received.
          Our team will connect with you shortly to take it forward.
        </p>
      </div>

      {/* Reference no. + "we will connect" notice */}
      <div className="mx-auto mt-5 flex max-w-md items-center gap-3 rounded-2xl border border-blue-100 bg-blue-50/50 p-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-100">
          <Phone className="h-5 w-5 text-blue-600" />
        </div>
        <div className="flex-1 text-left">
          <p className="text-sm font-semibold text-gray-900">We will connect with you soon</p>
          <p className="mt-0.5 text-xs text-gray-500">
            Expect a call within 24–48 hours.
          </p>
        </div>
        <span className="text-right text-[10px] uppercase tracking-wide text-gray-400">
          Ref no.
          <br />
          <span className="text-xs font-bold text-gray-900">{refNo}</span>
        </span>
      </div>

      {/* ===== 3 saved-data sections at the top ===== */}
      <div className="mx-auto mt-6 max-w-md space-y-4">
        {/* Section 1: Customer profile */}
        <DataSection title="Customer profile" rows={profileRows} />

        {/* Section 2: Bank account details */}
        <DataSection title="Bank account details" rows={accountRows} />

        {/* Section 3: Loan approval amount */}
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/60">
          <p className="border-b border-gray-200 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
            Loan approval amount
          </p>
          <div className="px-4 py-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-50">
                <IndianRupee className="h-5 w-5 text-emerald-600" />
              </div>
              <div className="flex-1">
                <p className="text-[10px] uppercase tracking-wide text-gray-400">Approved amount</p>
                <p className="text-2xl font-black text-emerald-600">
                  ₹{formatINR(data.cibilApprovedAmount || data.loanAmount)}
                </p>
              </div>
            </div>
            <div className="mt-3 flex items-center justify-between border-t border-gray-200 pt-3 text-xs">
              <span className="text-gray-500">Selected loan amount</span>
              <span className="font-semibold text-gray-900">₹{formatINR(data.loanAmount)}</span>
            </div>
          </div>
        </div>

        {/* Payment receipt (bottom) */}
        <div className="overflow-hidden rounded-2xl border border-emerald-100 bg-emerald-50/40">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-2.5">
              <CheckCircle2 className="h-5 w-5 text-emerald-600" />
              <span className="text-sm font-semibold text-gray-900">Processing fee paid</span>
            </div>
            <span className="text-base font-black text-emerald-600">₹59</span>
          </div>
          <div className="border-t border-emerald-100 px-4 py-2.5 text-[11px] text-gray-500">
            Paid via Razorpay · Non-refundable except where required by law
          </div>
        </div>
      </div>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-gray-400">
        Please keep your documents ready. You may close this page — your application is safely saved.
      </p>

      <div className="mt-5 flex justify-center">
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
        >
          <RotateCcw className="h-4 w-4" />
          Start a new application
        </button>
      </div>

      {/* Site footer */}
      <SiteFooter onContactClick={() => setSupportOpen(true)} />
    </div>
  );
}

function DataSection({
  title,
  rows,
}: {
  title: string;
  rows: { icon: React.ElementType; label: string; value: string }[];
}) {
  return (
    <div className="overflow-hidden rounded-2xl border border-gray-100 bg-gray-50/60">
      <p className="border-b border-gray-200 px-4 py-2.5 text-[11px] font-semibold uppercase tracking-wider text-gray-500">
        {title}
      </p>
      <div className="grid grid-cols-2 gap-px bg-gray-200/60">
        {rows.map((r) => (
          <div key={r.label} className="flex items-center gap-2.5 bg-gray-50/60 px-4 py-3">
            <r.icon className="h-4 w-4 shrink-0 text-gray-400" />
            <div className="min-w-0">
              <p className="text-[10px] uppercase tracking-wide text-gray-400">{r.label}</p>
              <p className="truncate text-sm font-medium text-gray-900">{r.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
