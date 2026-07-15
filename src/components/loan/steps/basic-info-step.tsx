"use client";

import { CalendarIcon, Check, Home, Phone, User } from "lucide-react";
import { PAN_REGEX, useLoanStore } from "@/lib/loan-store";
import { StepHeader } from "./step-header";

/**
 * BasicInfoStep
 * Clean, flat, white form matching the reference design.
 * Fields: First Name, Last Name, Date of birth, Phone, Address, Pin code, PAN Card number.
 * Per-field validation hints appear once the user starts editing a field.
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

  const panValid = PAN_REGEX.test(data.panCard);
  // Show PAN format error only after the user has typed something
  const panError = data.panCard.length > 0 && !panValid ? "Enter a valid 10-character PAN" : undefined;
  // Pincode error only when partially typed
  const pinError = data.pincode.length > 0 && data.pincode.length !== 6 ? "Pincode must be 6 digits" : undefined;
  const phoneError =
    data.phone.length > 0 && data.phone.replace(/\D/g, "").length !== 10
      ? "Enter a valid 10-digit mobile number"
      : undefined;

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

        <FlatField
          label="Mobile number"
          required
          placeholder="Enter your mobile number"
          inputMode="numeric"
          maxLength={10}
          icon={<Phone className="h-4 w-4" />}
          value={data.phone}
          error={phoneError}
          onChange={(e) => update({ phone: e.target.value.replace(/\D/g, "").slice(0, 10) })}
          autoComplete="tel"
        />

        <FlatField
          label="Full address"
          required
          placeholder="House number, street, city, state"
          icon={<Home className="h-4 w-4" />}
          value={data.address}
          error={
            data.address.length > 0 && data.address.trim().length < 8
              ? "Enter your complete address"
              : undefined
          }
          onChange={(e) => update({ address: e.target.value })}
          autoComplete="street-address"
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <FlatField
            label="Pin code"
            required
            placeholder="Enter your pincode"
            inputMode="numeric"
            maxLength={6}
            value={data.pincode}
            error={pinError}
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
            error={panError}
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
  error,
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
  error?: string;
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
      <div
        className={`flex items-center rounded-xl border bg-white transition-all focus-within:ring-2 hover:border-gray-300 ${
          error
            ? "border-red-300 focus-within:border-red-400 focus-within:ring-red-400/20"
            : "border-gray-200 focus-within:border-emerald-400 focus-within:ring-emerald-400/20"
        }`}
      >
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
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
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
