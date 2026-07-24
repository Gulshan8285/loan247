"use client";

import { Loader2, RotateCw, ShieldCheck } from "lucide-react";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { Button } from "@/components/ui/button";

type OtpVerificationProps = {
  phone: string;
  otp: string;
  attempts: number;
  maxAttempts: number;
  resendSeconds: number;
  isVerifying: boolean;
  isResending: boolean;
  error?: string;
  onOtpChange: (otp: string) => void;
  onVerify: () => void;
  onResend: () => void;
  onChangePhone: () => void;
};

export function OtpVerification({
  phone,
  otp,
  attempts,
  maxAttempts,
  resendSeconds,
  isVerifying,
  isResending,
  error,
  onOtpChange,
  onVerify,
  onResend,
  onChangePhone,
}: OtpVerificationProps) {
  const attemptsLeft = Math.max(0, maxAttempts - attempts);
  const locked = attemptsLeft === 0;

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-emerald-100 bg-emerald-50 px-4 py-3 text-left">
        <div className="flex items-start gap-3">
          <ShieldCheck className="mt-0.5 h-5 w-5 text-emerald-600" />
          <div>
            <p className="text-sm font-semibold text-emerald-950">OTP sent to {phone}</p>
            <p className="mt-1 text-xs leading-relaxed text-emerald-700">
              Enter the 6 digit code from SMS to securely continue with Loan247.
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-3">
        <label className="block text-left text-sm font-semibold text-gray-800">
          Verification code
        </label>
        <InputOTP
          maxLength={6}
          value={otp}
          onChange={(value) => onOtpChange(value.replace(/\D/g, ""))}
          disabled={isVerifying || locked}
          containerClassName="justify-center gap-2"
        >
          <InputOTPGroup className="gap-2">
            {Array.from({ length: 6 }).map((_, index) => (
              <InputOTPSlot
                key={index}
                index={index}
                className="h-12 w-10 rounded-xl border border-gray-200 bg-white text-base font-semibold shadow-sm sm:w-12"
              />
            ))}
          </InputOTPGroup>
        </InputOTP>
        <div className="flex items-center justify-between gap-3 text-xs">
          <span className={locked ? "font-medium text-red-600" : "text-gray-500"}>
            {attemptsLeft} attempts left
          </span>
          <button
            type="button"
            onClick={onChangePhone}
            className="font-medium text-blue-600 hover:text-blue-700"
            disabled={isVerifying}
          >
            Change number
          </button>
        </div>
        {error && <p className="text-left text-xs font-medium text-red-600">{error}</p>}
      </div>

      <Button
        type="button"
        onClick={onVerify}
        disabled={otp.length !== 6 || isVerifying || locked}
        className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-sm font-semibold text-white shadow-sm hover:brightness-105"
      >
        {isVerifying ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Verifying OTP
          </>
        ) : (
          "Verify OTP"
        )}
      </Button>

      <Button
        type="button"
        variant="outline"
        onClick={onResend}
        disabled={resendSeconds > 0 || isResending || isVerifying}
        className="h-11 w-full rounded-xl border-gray-200 bg-white text-sm font-semibold text-gray-700"
      >
        {isResending ? (
          <>
            <Loader2 className="h-4 w-4 animate-spin" />
            Resending
          </>
        ) : resendSeconds > 0 ? (
          `Resend OTP in ${resendSeconds}s`
        ) : (
          <>
            <RotateCw className="h-4 w-4" />
            Resend OTP
          </>
        )}
      </Button>
    </div>
  );
}
