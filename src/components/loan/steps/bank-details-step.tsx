"use client";

import { Building2, Hash, Landmark, User } from "lucide-react";
import { useLoanStore } from "@/lib/loan-store";
import { StepHeader } from "./step-header";

/**
 * BankDetailsStep
 * Collects the customer's bank account details for loan disbursal.
 * Fields: Account holder name, Account number, IFSC code, Bank name, Branch.
 */
export function BankDetailsStep() {
  const data = useLoanStore((s) => s.data);
  const update = useLoanStore((s) => s.update);

  const ifscValid = /^[A-Z]{4}0[A-Z0-9]{6}$/.test(data.ifscCode);
  const ifscError = data.ifscCode.length > 0 && !ifscValid ? "Enter a valid IFSC (e.g. HDFC0001234)" : undefined;
  const acctError =
    data.accountNumber.length > 0 && data.accountNumber.replace(/\s/g, "").length < 9
      ? "Account number must be at least 9 digits"
      : undefined;

  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-9">
      <StepHeader
        title="Bank account details"
        subtitle="Where should we disburse your loan amount?"
        badge="Step 6 · Bank details"
      />

      <div className="mt-7 grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <FlatField
            label="Account holder name"
            required
            placeholder="Enter account holder name"
            icon={<User className="h-4 w-4" />}
            value={data.accountHolderName}
            onChange={(e) => update({ accountHolderName: e.target.value })}
            autoComplete="cc-name"
          />
          <FlatField
            label="Bank name"
            required
            placeholder="e.g. HDFC Bank"
            icon={<Building2 className="h-4 w-4" />}
            value={data.bankName}
            onChange={(e) => update({ bankName: e.target.value })}
          />
        </div>

        <FlatField
          label="Account number"
          required
          placeholder="Enter your account number"
          icon={<Hash className="h-4 w-4" />}
          inputMode="numeric"
          value={data.accountNumber}
          error={acctError}
          onChange={(e) => update({ accountNumber: e.target.value.replace(/[^\d]/g, "").slice(0, 18) })}
          autoComplete="off"
        />

        <div className="grid gap-5 sm:grid-cols-2">
          <FlatField
            label="IFSC code"
            required
            placeholder="HDFC0001234"
            hint="11-character IFSC"
            icon={<Landmark className="h-4 w-4" />}
            maxLength={11}
            value={data.ifscCode}
            valid={ifscValid}
            error={ifscError}
            onChange={(e) =>
              update({ ifscCode: e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "").slice(0, 11) })
            }
            autoComplete="off"
          />
          <FlatField
            label="Branch"
            hint="Optional"
            placeholder="Enter branch name"
            value={data.branch}
            onChange={(e) => update({ branch: e.target.value })}
          />
        </div>

        {ifscValid && (
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
            <Landmark className="h-3.5 w-3.5" />
            IFSC format looks good — we&apos;ll verify this with your bank.
          </div>
        )}
      </div>

      <p className="mt-6 text-center text-[11px] leading-relaxed text-gray-400">
        Your bank details are encrypted &amp; used only for loan disbursal. Never shared without consent.
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
        <input
          id={inputId}
          className={`w-full bg-transparent px-3.5 py-3 text-base text-gray-900 placeholder:text-gray-400 focus:outline-none ${icon ? "pl-2" : ""} ${className}`}
          placeholder={placeholder}
          value={value}
          onChange={onChange}
          {...props}
        />
        {valid && <CheckMark />}
      </div>
      {error && <p className="mt-1.5 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

function CheckMark() {
  return (
    <span className="pr-3.5 text-emerald-500">
      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 6 9 17l-5-5" />
      </svg>
    </span>
  );
}
