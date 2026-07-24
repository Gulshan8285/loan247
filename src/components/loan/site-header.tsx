"use client";

import Link from "next/link";
import { Headset } from "lucide-react";
import { useState } from "react";
import { useLoanStore } from "@/lib/loan-store";
import { AppDownloadPrompt } from "./app-download-prompt";
import { LoanLogo } from "./loan-logo";
import { SupportModal } from "./support-modal";

export function SiteHeader() {
  const [supportOpen, setSupportOpen] = useState(false);
  const resetJourney = useLoanStore((s) => s.reset);

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 backdrop-blur">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3 sm:px-6 lg:px-8">
          <Link
            href="/"
            aria-label="Go to LOAN247 home"
            onClick={() => {
              resetJourney();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
            className="flex min-w-0 items-center rounded-2xl pr-2 transition-opacity hover:opacity-90"
          >
            <LoanLogo size={50} />
          </Link>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <div className="hidden sm:block">
              <AppDownloadPrompt compact />
            </div>
            <button
              type="button"
              onClick={() => setSupportOpen(true)}
              className="inline-flex items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-2 text-sm font-semibold text-gray-600 shadow-sm transition-colors hover:bg-gray-50 hover:text-gray-900 sm:px-5 sm:py-3 sm:text-base"
            >
              <Headset className="h-5 w-5" />
              <span>Support</span>
            </button>
          </div>
        </div>
      </header>

      <SupportModal open={supportOpen} onClose={() => setSupportOpen(false)} />
    </>
  );
}
