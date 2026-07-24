"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import {
  ConfirmationResult,
  RecaptchaVerifier,
  User,
  onAuthStateChanged,
  signInWithPhoneNumber,
  signOut,
} from "firebase/auth";
import { Loader2, Smartphone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OtpVerification } from "@/components/OtpVerification";
import { getFirebaseAuth } from "@/lib/firebase";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const RESEND_SECONDS = 30;
const MAX_OTP_ATTEMPTS = 5;
const RECAPTCHA_CONTAINER_ID = "loan247-recaptcha-container";

type PhoneLoginProps = {
  mode?: "panel" | "embedded";
  redirectTo?: string;
  nextPath?: string;
  onVerified?: (phone: string) => void;
  className?: string;
};

declare global {
  interface Window {
    recaptchaVerifier?: RecaptchaVerifier;
  }
}

function normalizeIndianMobile(value: string) {
  const digits = value.replace(/\D/g, "");
  if (digits.startsWith("91") && digits.length === 12) return digits.slice(2);
  return digits.slice(0, 10);
}

function formatPhone(digits: string) {
  return `+91${digits}`;
}

function isValidIndianMobile(digits: string) {
  return /^[6-9]\d{9}$/.test(digits);
}

function isValidOtp(otp: string) {
  return /^\d{6}$/.test(otp);
}

function firebaseMessage(error: unknown) {
  const code = typeof error === "object" && error && "code" in error ? String(error.code) : "";

  if (code.includes("invalid-phone-number")) return "Enter a valid Indian mobile number.";
  if (code.includes("too-many-requests")) return "Too many requests. Please try again later.";
  if (code.includes("invalid-verification-code")) return "Invalid OTP. Please check and try again.";
  if (code.includes("code-expired")) return "OTP expired. Please resend a fresh OTP.";
  if (code.includes("captcha-check-failed")) return "reCAPTCHA check failed. Please try again.";
  if (error instanceof Error) return error.message;
  return "Something went wrong. Please try again.";
}

export function PhoneLogin({
  mode = "panel",
  redirectTo = "/dashboard",
  nextPath,
  onVerified,
  className,
}: PhoneLoginProps) {
  const router = useRouter();
  const [phoneDigits, setPhoneDigits] = useState("");
  const [otp, setOtp] = useState("");
  const [confirmation, setConfirmation] = useState<ConfirmationResult | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [resendSeconds, setResendSeconds] = useState(0);
  const [isSending, setIsSending] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [error, setError] = useState("");
  const [configError, setConfigError] = useState("");
  const syncingRef = useRef(false);

  const phone = useMemo(() => formatPhone(phoneDigits), [phoneDigits]);
  const destination = nextPath?.startsWith("/") ? nextPath : redirectTo;

  const syncSession = useCallback(
    async (firebaseUser: User, verifiedPhone: string) => {
      if (syncingRef.current) return;
      syncingRef.current = true;

      try {
        const idToken = await firebaseUser.getIdToken(true);
        const response = await fetch("/api/auth/session", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ idToken }),
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload.error || "Unable to create session");
        }

        toast({
          title: "Login successful",
          description: "Your mobile number has been verified.",
        });

        onVerified?.(verifiedPhone);

        if (!onVerified) {
          router.replace(destination);
          router.refresh();
        }
      } catch (sessionError) {
        await signOut(getFirebaseAuth());
        setError(firebaseMessage(sessionError));
        toast({
          title: "Login failed",
          description: firebaseMessage(sessionError),
          variant: "destructive",
        });
      } finally {
        syncingRef.current = false;
      }
    },
    [destination, onVerified, router],
  );

  useEffect(() => {
    let auth;
    try {
      auth = getFirebaseAuth();
      Promise.resolve().then(() => setConfigError(""));
    } catch (authError) {
      const message = firebaseMessage(authError);
      Promise.resolve().then(() => setConfigError(message));
      return;
    }

    return onAuthStateChanged(auth, (firebaseUser) => {
      const verifiedPhone = firebaseUser?.phoneNumber;
      if (firebaseUser && verifiedPhone?.startsWith("+91")) {
        void syncSession(firebaseUser, verifiedPhone);
      }
    });
  }, [syncSession]);

  useEffect(() => {
    if (resendSeconds <= 0) return;
    const timer = window.setTimeout(() => setResendSeconds((value) => value - 1), 1000);
    return () => window.clearTimeout(timer);
  }, [resendSeconds]);

  useEffect(() => {
    return () => {
      window.recaptchaVerifier?.clear();
      window.recaptchaVerifier = undefined;
    };
  }, []);

  const getRecaptchaVerifier = useCallback(() => {
    const auth = getFirebaseAuth();

    if (!window.recaptchaVerifier) {
      window.recaptchaVerifier = new RecaptchaVerifier(auth, RECAPTCHA_CONTAINER_ID, {
        size: "invisible",
      });
    }

    return window.recaptchaVerifier;
  }, []);

  const sendOtp = useCallback(
    async (isResend = false) => {
      setError("");

      if (configError) {
        setError(configError);
        return;
      }

      if (!isValidIndianMobile(phoneDigits)) {
        setError("Enter a valid 10 digit Indian mobile number.");
        return;
      }

      if (isResend) {
        setIsResending(true);
      } else {
        setIsSending(true);
      }

      try {
        const auth = getFirebaseAuth();
        const verifier = getRecaptchaVerifier();
        const result = await signInWithPhoneNumber(auth, phone, verifier);
        setConfirmation(result);
        setOtp("");
        setAttempts(0);
        setResendSeconds(RESEND_SECONDS);
        toast({
          title: "OTP sent",
          description: `Verification code sent to ${phone}.`,
        });
      } catch (sendError) {
        const message = firebaseMessage(sendError);
        setError(message);
        toast({
          title: "Could not send OTP",
          description: message,
          variant: "destructive",
        });
        window.recaptchaVerifier?.clear();
        window.recaptchaVerifier = undefined;
      } finally {
        setIsSending(false);
        setIsResending(false);
      }
    },
    [configError, getRecaptchaVerifier, phone, phoneDigits],
  );

  const verifyOtp = useCallback(async () => {
    setError("");

    if (!confirmation) {
      setError("Please send OTP first.");
      return;
    }

    if (!isValidOtp(otp)) {
      setError("Enter the 6 digit OTP.");
      return;
    }

    if (attempts >= MAX_OTP_ATTEMPTS) {
      setError("Maximum OTP attempts reached. Please resend OTP.");
      return;
    }

    setIsVerifying(true);
    setAttempts((value) => value + 1);

    try {
      const credential = await confirmation.confirm(otp);
      const verifiedPhone = credential.user.phoneNumber || phone;
      await syncSession(credential.user, verifiedPhone);
    } catch (verifyError) {
      const message = firebaseMessage(verifyError);
      setError(message);
      toast({
        title: "OTP verification failed",
        description: message,
        variant: "destructive",
      });
    } finally {
      setIsVerifying(false);
    }
  }, [attempts, confirmation, otp, phone, syncSession]);

  const resetPhone = () => {
    setConfirmation(null);
    setOtp("");
    setAttempts(0);
    setResendSeconds(0);
    setError("");
  };

  return (
    <div
      className={cn(
        mode === "panel" &&
          "w-full rounded-3xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7",
        className,
      )}
    >
      {!confirmation ? (
        <div className="space-y-5">
          <div className="space-y-1 text-left">
            <div className="flex items-center gap-2 text-sm font-semibold text-gray-900">
              <Smartphone className="h-4 w-4 text-blue-600" />
              Mobile OTP Login
            </div>
            <p className="text-xs leading-relaxed text-gray-500">
              Use your +91 mobile number. Loan247 will keep you signed in securely.
            </p>
          </div>

          <div className="space-y-2">
            <label className="block text-left text-sm font-semibold text-gray-800">
              Mobile number
            </label>
            <div className="flex h-12 overflow-hidden rounded-xl border border-gray-200 bg-white shadow-sm focus-within:ring-2 focus-within:ring-blue-100">
              <div className="flex items-center border-r border-gray-200 bg-gray-50 px-3 text-sm font-semibold text-gray-700">
                +91
              </div>
              <Input
                value={phoneDigits}
                inputMode="numeric"
                autoComplete="tel-national"
                maxLength={10}
                placeholder="9876543210"
                onChange={(event) => setPhoneDigits(normalizeIndianMobile(event.target.value))}
                disabled={isSending}
                className="h-full rounded-none border-0 bg-transparent text-base shadow-none focus-visible:ring-0"
              />
            </div>
            {(configError || error) && (
              <p className="text-left text-xs font-medium text-red-600">
                {configError || error}
              </p>
            )}
          </div>

          <Button
            type="button"
            onClick={() => void sendOtp(false)}
            disabled={!isValidIndianMobile(phoneDigits) || isSending || Boolean(configError)}
            className="h-12 w-full rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 text-sm font-semibold text-white shadow-sm hover:brightness-105"
          >
            {isSending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Sending OTP
              </>
            ) : (
              "Send OTP"
            )}
          </Button>
        </div>
      ) : (
        <OtpVerification
          phone={phone}
          otp={otp}
          attempts={attempts}
          maxAttempts={MAX_OTP_ATTEMPTS}
          resendSeconds={resendSeconds}
          isVerifying={isVerifying}
          isResending={isResending}
          error={error}
          onOtpChange={setOtp}
          onVerify={() => void verifyOtp()}
          onResend={() => void sendOtp(true)}
          onChangePhone={resetPhone}
        />
      )}

      <div id={RECAPTCHA_CONTAINER_ID} />
    </div>
  );
}
