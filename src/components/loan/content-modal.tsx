"use client";

import { useEffect } from "react";
import { ArrowRight, X } from "lucide-react";
import { type ContentPage, useLoanStore } from "@/lib/loan-store";
import { LoanLogo } from "./loan-logo";

/**
 * ContentModal
 * A popup that shows informational content (About Us, EMI Calculator info,
 * Disclaimer, Privacy Policy, Terms of Service). Each page has an "Apply Now"
 * button at the bottom that closes the popup and jumps to the Google Login
 * step (step 1) to start the application flow.
 */
const PAGE_CONTENT: Record<
  Exclude<ContentPage, null>,
  { title: string; subtitle: string; sections: { heading: string; body: string }[] }
> = {
  about: {
    title: "About LOAN247",
    subtitle: "India's trusted instant loan platform",
    sections: [
      {
        heading: "Who we are",
        body: "LOAN247 is a digital lending platform that provides instant personal loans up to ₹8,00,000 with minimal documentation. We're an RBI Registered NBFC committed to making credit accessible to every Indian, 24/7.",
      },
      {
        heading: "Our mission",
        body: "To empower millions of Indians with quick, transparent, and hassle-free access to credit — whenever they need it, wherever they are. No long queues, no paperwork, no waiting.",
      },
      {
        heading: "Why choose us",
        body: "With 1M+ happy customers and ₹500Cr+ disbursed, we use AI-powered processing to approve loans in under 5 minutes. Our interest rates start at just 12% p.a. with no hidden charges, and your data is protected with bank-grade 256-bit SSL encryption.",
      },
    ],
  },
  emi: {
    title: "EMI Calculator",
    subtitle: "Plan your loan repayment",
    sections: [
      {
        heading: "How it works",
        body: "Our EMI calculator helps you estimate your monthly installment before you apply. Adjust the loan amount, interest rate, and tenure to see your monthly EMI, total interest, and total payable amount instantly.",
      },
      {
        heading: "EMI Formula",
        body: "EMI = P × r × (1+r)^n / ((1+r)^n − 1), where P is the principal, r is the monthly interest rate, and n is the loan tenure in months.",
      },
      {
        heading: "Tips to lower your EMI",
        body: "Choose a longer tenure to reduce your monthly EMI, maintain a good credit score for better interest rates, and borrow only what you need. Use the EMI calculator on our home page to find the right balance.",
      },
    ],
  },
  disclaimer: {
    title: "Disclaimer",
    subtitle: "Please read carefully",
    sections: [
      {
        heading: "Service fee acknowledgement",
        body: "By proceeding with the ₹59 service fee, you acknowledge and agree to the following:",
      },
      {
        heading: "Processing and verification",
        body: "The ₹59 fee is charged only for application processing, verification, and platform services.",
      },
      {
        heading: "No approval guarantee",
        body: "Payment of the service fee does not guarantee loan approval, loan disbursement, or any specific loan amount.",
      },
      {
        heading: "Eligibility and lender decision",
        body: "Loan approval is subject to eligibility checks, document verification, credit assessment (including CIBIL/Credit Score where applicable), lender policies, and other internal evaluation criteria. The final decision to approve or reject a loan application rests solely with the respective lending partner.",
      },
      {
        heading: "Rejected applications",
        body: "If your application is rejected or you do not meet the lender's eligibility criteria, the loan may not be approved even after payment of the service fee.",
      },
      {
        heading: "Refund policy",
        body: "The service fee is non-refundable, except where required under applicable law or as stated in our Refund Policy.",
      },
      {
        heading: "Your agreement",
        body: "By clicking \"Continue\" or making the payment, you confirm that you have read, understood, and agreed to this disclaimer and our Terms & Conditions.",
      },
    ],
  },
  privacy: {
    title: "Privacy Policy",
    subtitle: "How we handle your data",
    sections: [
      {
        heading: "Information we collect",
        body: "We collect personal details (name, date of birth, PAN, contact), bank account details for disbursal, and credit profile information necessary for loan assessment.",
      },
      {
        heading: "How we use your data",
        body: "Your information is used solely for loan processing, verification, disbursal, and communication. We never sell your data to third parties. Data is shared with partner lenders only with your consent.",
      },
      {
        heading: "Data security",
        body: "All data is encrypted with bank-grade 256-bit SSL encryption and stored on secure servers. We comply with RBI data protection guidelines and Indian data privacy laws.",
      },
    ],
  },
  terms: {
    title: "Terms of Service",
    subtitle: "Your agreement with LOAN247",
    sections: [
      {
        heading: "Eligibility",
        body: "To apply, you must be an Indian citizen aged 21–60 years with a valid PAN card and an active bank account. You must provide accurate, truthful information at every step.",
      },
      {
        heading: "Loan agreement",
        body: "Approved loans are governed by a loan agreement detailing the principal, interest rate, tenure, EMI, and repayment schedule. By accepting the loan, you agree to repay as per the schedule.",
      },
      {
        heading: "Late payment",
        body: "Late EMI payments attract penalty charges as per the loan agreement. Persistent defaults may be reported to credit bureaus, affecting your credit score and future borrowing capacity.",
      },
    ],
  },
};

export function ContentModal() {
  const contentPage = useLoanStore((s) => s.contentPage);
  const setContentPage = useLoanStore((s) => s.setContentPage);
  const setStep = useLoanStore((s) => s.setStep);

  // Close on Escape key + lock scroll
  useEffect(() => {
    if (!contentPage) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") setContentPage(null);
    };
    window.addEventListener("keydown", handler);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", handler);
      document.body.style.overflow = "";
    };
  }, [contentPage, setContentPage]);

  if (!contentPage) return null;

  const content = PAGE_CONTENT[contentPage];

  function handleApply() {
    setContentPage(null);
    // Jump to the Google Login step (step 1) to start the application flow
    setStep(1);
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={content.title}
    >
      {/* Backdrop */}
      <button
        className="absolute inset-0 bg-gray-900/40 backdrop-blur-sm"
        onClick={() => setContentPage(null)}
        aria-label="Close"
      />

      {/* Modal card */}
      <div className="relative z-10 flex max-h-[85vh] w-full max-w-lg flex-col overflow-hidden rounded-3xl bg-white shadow-2xl">
        {/* Header */}
        <div className="relative bg-gradient-to-br from-blue-500 to-emerald-500 px-6 pb-5 pt-6 text-white">
          <button
            onClick={() => setContentPage(null)}
            className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/20 text-white transition-colors hover:bg-white/30"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-3">
            <LoanLogo size={36} />
            <div>
              <h2 className="text-lg font-bold leading-tight">{content.title}</h2>
              <p className="text-xs text-white/80">{content.subtitle}</p>
            </div>
          </div>
        </div>

        {/* Body — scrollable */}
        <div className="flex-1 overflow-y-auto p-5">
          <div className="space-y-4">
            {content.sections.map((s) => (
              <div key={s.heading}>
                <h3 className="text-sm font-bold text-gray-900">{s.heading}</h3>
                <p className="mt-1 text-sm leading-relaxed text-gray-600">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Footer — Apply button */}
        <div className="border-t border-gray-100 bg-gray-50/60 p-4">
          <button
            onClick={handleApply}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 px-6 py-3.5 text-sm font-bold text-white shadow-sm transition-transform hover:brightness-105 active:scale-[0.98]"
          >
            Apply Now
            <ArrowRight className="h-4 w-4" />
          </button>
          <p className="mt-2 text-center text-[11px] text-gray-400">
            Start your loan application in minutes
          </p>
        </div>
      </div>
    </div>
  );
}
