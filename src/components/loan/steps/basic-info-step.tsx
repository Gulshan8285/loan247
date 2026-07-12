"use client";

import { CalendarIcon, Check, User } from "lucide-react";
import { useLoanStore } from "@/lib/loan-store";
import { StepHeader } from "./step-header";

/**
 * BasicInfoStep
 * Clean, flat, white form matching the reference design.
 * Fields: First Name, Last Name, Date of birth, Pin code, PAN Card number.
 */
export function BasicInfoStep() {
  const data = useLoanStore((s) => s.data);
  const update = useLoanStore((s) => s.update);

  const dobDisplay = data.dob
    ? (() => {
        const d = new Date(data.dob);
        if (isNaN(d.getTime())) return "";
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        return `${dd}-${mm}-${d.getFullYear()}`;
      })()
    : "";

  const panValid = /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(data.panCard);

  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-9">
      <StepHeader
        title="Basic information"
        subtitle="To help us curate the best loan options for you"
      />

      <div className="mt-7 grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FlatField
            label="First Name"
            hint="As per PAN"
            required
            placeholder="Enter your first name"
            icon={<User className="h-4 w-4" />}
            value={data.firstName}
            onChange={(e) => update({ firstName: e.target.value })}
            autoComplete="given-name"
          />
          <FlatField
            label="Last Name"
            hint="As per PAN"
            required
            placeholder="Enter your last name"
            value={data.lastName}
            onChange={(e) => update({ lastName: e.target.value })}
            autoComplete="family-name"
          />
        </div>

        <DOBField value={data.dob} display={dobDisplay} onChange={(iso) => update({ dob: iso })} />

        <div className="grid gap-5 sm:grid-cols-2">
          <FlatField
            label="Pin code"
            required
            placeholder="Enter your pincode"
            inputMode="numeric"
            maxLength={6}
            value={data.pincode}
            onChange={(e) => update({ pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
          />
          <FlatField
            label="PAN Card number"
            required
            placeholder="ABCDE1234F"
            hint="10-character PAN"
            maxLength={10}
            value={data.panCard}
            valid={panValid}
            onChange={(e) =>
              update({ panCard: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 10) })
            }
            autoComplete="off"
          />
        </div>

        {panValid && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
            <Check className="h-3.5 w-3.5" strokeWidth={3} />
            Valid PAN format — we&apos;ll verify this during analysis.
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-gray-400">
        Your data is encrypted &amp; never shared without consent. This won&apos;t affect your credit score.
      </p>
    </div>
  );
}

function FlatField({
  label,
  hint,
  required,
  placeholder,
  icon,
  prefix,
  value,
  onChange,
  valid,
  className = "",
  ...props
}: {
  label: string;
  hint?: string;
  required?: boolean;
  placeholder?: string;
  icon?: React.ReactNode;
  prefix?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  valid?: boolean;
  className?: string;
} & Omit<React.InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "size">) {
  const inputId = label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className="w-full">
      <label htmlFor={inputId} className="mb-1.5 flex items-baseline gap-1.5 text-sm font-medium text-gray-800">
        <span>
          {label}
          {required && <span className="text-red-500">*</span>}
        </span>
        {hint && <span className="text-xs font-normal text-gray-400">({hint})</span>}
      </label>
      <div className="flex items-center rounded-xl border border-gray-200 bg-white transition-all focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 hover:border-gray-300">
        {icon && <span className="pl-3.5 text-gray-400">{icon}</span>}
        {prefix && <span className="pl-3.5 text-base font-semibold text-gray-700">{prefix}</span>}
        <input
          id={inputId}
          className={`w-full bg-transparent px-3.5 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none ${icon ? "pl-2" : ""} ${prefix ? "pl-2" : ""} ${className}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          {...props}
        />
        {valid && (
          <span className="pr-3.5 text-emerald-500">
            <Check className="h-4 w-4" strokeWidth={3} />
          </span>
        )}
      </div>
    </div>
  );
}

function DOBField({
  value,
  display,
  onChange,
}: {
  value: string;
  display: string;
  onChange: (iso: string) => void;
}) {
  return (
    <div className="w-full">
      <label htmlFor="dob" className="mb-1.5 flex items-center gap-1.5 text-sm font-medium text-gray-800">
        Date of birth <span className="text-red-500">*</span>
      </label>
      <div className="group relative flex items-center rounded-xl border border-gray-200 bg-white transition-all focus-within:border-emerald-400 focus-within:ring-2 focus-within:ring-emerald-400/20 hover:border-gray-300">
        <input
          id="dob"
          type="text"
          readOnly
          placeholder="DD-MM-YYYY"
          value={display}
          className="w-full cursor-pointer bg-transparent px-3.5 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none"
        />
        <input
          type="date"
          value={value}
          max={new Date().toISOString().split("T")[0]}
          min="1940-01-01"
          onChange={(e) => onChange(e.target.value)}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="Select date of birth"
        />
        <span className="pr-3.5 text-gray-700">
          <CalendarIcon className="h-4 w-4" />
        </span>
      </div>
    </div>
  );
}
