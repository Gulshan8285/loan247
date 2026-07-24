"use client";

import { useEffect } from "react";
import { Clock, Mail, MapPin, MessageCircle, Phone, ShieldCheck, X } from "lucide-react";
import { LoanLogo } from "./loan-logo";

/**
 * SupportModal
 * A small popup that opens when the customer clicks "Support" in the header.
 * Shows all contact info: email (support@loan247.online), phone, hours, and
 * a quick-message prompt. Closes on backdrop click or the X button.
 */
export function SupportModal({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Close on Escape key
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", handler);
    // Lock body scroll while open
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label="Support & Contact"
    >
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close support"
      />

      {/* Modal card */}
      <div className="relative z-10 w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-500 to-emerald-500 px-6 pb-6 pt-7 text-white">
          <button
            onClick={onClose}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <LoanLogo size={40} />
            <div>
              <h2 className="text-lg font-bold leading-tight">LOAN247 Support</h2>
              <p className="text-xs text-white/80">We&apos;re here to help, 24/7</p>
            </div>
          </div>
        </div>

        {/* Body */}
        <div className="space-y-3 p-5">
          {/* Email — primary */}
          <a
            href="mailto:support@loan247.online"
            className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4 transition-colors hover:bg-gray-100"
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50">
              <Mail className="h-5 w-5 text-emerald-600" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-wide text-gray-400">Email us</p>
              <p className="truncate text-sm font-semibold text-gray-900">support@loan247.online</p>
            </div>
            <MessageCircle className="h-4 w-4 shrink-0 text-gray-300" />
          </a>

          {/* Phone */}
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-blue-50">
              <Phone className="h-5 w-5 text-blue-600" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-400">Call us</p>
              <p className="text-sm font-semibold text-gray-900">9319903728 · 8810381949</p>
            </div>
          </div>

          {/* Hours */}
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50">
              <Clock className="h-5 w-5 text-amber-500" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-400">Support hours</p>
              <p className="text-sm font-semibold text-gray-900">24 hours · 7 days a week</p>
            </div>
          </div>

          {/* Office */}
          <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-violet-50">
              <MapPin className="h-5 w-5 text-violet-600" />
            </div>
            <div>
              <p className="text-[11px] uppercase tracking-wide text-gray-400">Registered office</p>
              <p className="text-sm font-semibold text-gray-900">Bengaluru, Karnataka, India</p>
            </div>
          </div>

          {/* Trust note */}
          <div className="flex items-center gap-2 rounded-xl bg-emerald-50/60 px-4 py-3 text-xs text-emerald-700">
            <ShieldCheck className="h-4 w-4 shrink-0" />
            <span>GST: 06IFSPK3336A1ZG · MSME: UDYAM-HR-05-0004197</span>
          </div>
        </div>

        {/* Footer */}
        <div className="border-t border-gray-100 px-5 py-3 text-center text-[11px] text-gray-400">
          © 2026 LOAN247 · Loans, 24/7
        </div>
      </div>
    </div>
  );
}
