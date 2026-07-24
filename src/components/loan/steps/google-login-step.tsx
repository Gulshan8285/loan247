"use client";

import { useEffect, useRef, useState } from "react";
import { ShieldCheck } from "lucide-react";
import { useLoanStore } from "@/lib/loan-store";
import { StepHeader } from "./step-header";

/**
 * GoogleLoginStep
 * Shown right after the Welcome screen. The customer must sign in with Google
 * to continue. Uses Google Identity Services (GIS) client-side sign-in, which
 * only requires the Client ID (the Client Secret is NEVER used on the client
 * — it's for server-side flows only).
 *
 * On success, the customer's Google name/email/picture are stored and the
 * first/last name fields are pre-filled for the Basic Info step.
 *
 * NOTE: For the Google button to work, this site's origin must be added to
 * the OAuth client's "Authorized JavaScript origins" in Google Cloud Console.
 */

const GOOGLE_CLIENT_ID =
  "441098481051-82h3je197jq52b8jgd8bskc3u5cc11lb.apps.googleusercontent.com";

declare global {
  interface Window {
    google?: {
      accounts: {
        id: {
          initialize: (config: unknown) => void;
          renderButton: (el: HTMLElement, config: unknown) => void;
        };
      };
    };
  }
}

/** Decode a JWT credential's payload (client-side; no signature verification). */
function decodeCredential(token: string): {
  name?: string;
  email?: string;
  picture?: string;
} | null {
  try {
    const payload = token.split(".")[1];
    const json = atob(payload.replace(/-/g, "+").replace(/_/g, "/"));
    return JSON.parse(decodeURIComponent(escape(json)));
  } catch {
    return null;
  }
}

export function GoogleLoginStep() {
  const goNext = useLoanStore((s) => s.goNext);
  const update = useLoanStore((s) => s.update);
  const selectedLoanTitle = useLoanStore((s) => s.data.selectedLoanTitle);
  const btnContainerRef = useRef<HTMLDivElement>(null);
  const initializedRef = useRef(false);

  // `ready` = GIS script loaded successfully (set only from script.onload)
  // `loadError` = GIS script failed to load (set only from script.onerror)
  // These are set from async event callbacks, not synchronously in an effect.
  const [ready, setReady] = useState(false);
  const [loadError, setLoadError] = useState(false);

  // 1. Load the GIS script (only sets state from onload/onerror callbacks)
  useEffect(() => {
    const existing = document.getElementById("google-gsi-script") as HTMLScriptElement | null;
    if (existing) {
      // If the script is already present, defer state updates to its load
      // event (or a microtask) so we don't call setState synchronously here.
      if (window.google) {
        Promise.resolve().then(() => setReady(true));
      } else {
        existing.addEventListener("load", () => setReady(true));
      }
      return;
    }
    const s = document.createElement("script");
    s.id = "google-gsi-script";
    s.src = "https://accounts.google.com/gsi/client";
    s.async = true;
    s.defer = true;
    s.onload = () => setReady(true);
    s.onerror = () => setLoadError(true);
    document.head.appendChild(s);
  }, []);

  // 2. Initialize + render the button once the GIS script is ready
  useEffect(() => {
    if (!ready || !window.google || initializedRef.current) return;
    initializedRef.current = true;

    window.google.accounts.id.initialize({
      client_id: GOOGLE_CLIENT_ID,
      callback: (response: { credential?: string }) => {
        if (!response?.credential) return;
        const user = decodeCredential(response.credential);
        if (!user) return;
        const full = user.name || "";
        const parts = full.trim().split(/\s+/);
        update({
          googleName: full,
          googleEmail: user.email || "",
          googlePicture: user.picture || "",
          firstName: parts[0] || "",
          lastName: parts.slice(1).join(" ") || "",
        });
        goNext();
      },
    });

    if (btnContainerRef.current) {
      window.google.accounts.id.renderButton(btnContainerRef.current, {
        theme: "outline",
        size: "large",
        width: 320,
        text: "continue_with",
        shape: "pill",
        locale: "en",
      });
    }
  }, [ready, update, goNext]);

  const showSpinner = !ready && !loadError;

  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-10">
      <StepHeader
        title="Sign in with Google"
        subtitle={
          selectedLoanTitle
            ? `Continue securely with Google to apply for ${selectedLoanTitle}.`
            : "Continue securely with your Google account to start your application."
        }
        badge="Step 2 · Login"
      />

      <div className="mt-8 flex flex-col items-center">
        {/* Google logo mark */}
        <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-gray-100 bg-white shadow-sm">
          <GoogleIcon />
        </div>

        {/* GIS renders the official Sign-In button here */}
        <div ref={btnContainerRef} className="min-h-[44px]" />

        {showSpinner && (
          <div className="h-11 w-[320px] animate-pulse rounded-full bg-gray-100" />
        )}

        {loadError && (
          <p className="mt-4 max-w-sm text-xs text-amber-600">
            Couldn&apos;t load Google Sign-In. Check your connection or add this
            site&apos;s origin to the OAuth client&apos;s authorized origins in
            Google Cloud Console.
          </p>
        )}

        <p className="mt-6 max-w-sm text-[11px] leading-relaxed text-gray-400">
          We use your Google account only to verify your identity and pre-fill
          your name. Your password is never shared with us.
        </p>

        <div className="mt-4 flex items-center gap-1.5 text-[11px] text-gray-400">
          <ShieldCheck className="h-3 w-3" />
          Secured by Google · 256-bit encryption
        </div>
      </div>
    </div>
  );
}

function GoogleIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" aria-hidden>
      <path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84C6.71 7.31 9.14 5.38 12 5.38z"
      />
    </svg>
  );
}
