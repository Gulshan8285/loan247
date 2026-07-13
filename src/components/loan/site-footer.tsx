"use client";

import { Mail, MapPin, Phone, ShieldCheck } from "lucide-react";
import { LoanLogo } from "./loan-logo";

/**
 * SiteFooter
 * The site-wide footer shown on the Welcome and final "Application In Process"
 * pages. Mirrors the reference design: branding + tagline, Quick Links,
 * Legal, and Contact (phone + support@loan247.online).
 */
export function SiteFooter() {
  return (
    <footer className="mt-10 border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid grid-cols-2 gap-8 sm:grid-cols-4">
          {/* Branding */}
          <div className="col-span-2 sm:col-span-1">
            <div className="flex items-center gap-2.5">
              <LoanLogo size={32} />
              <div className="leading-tight">
                <p className="text-sm font-bold tracking-tight text-gray-900">LOAN247</p>
                <p className="text-[10px] uppercase tracking-widest text-gray-400">Loans, 24/7</p>
              </div>
            </div>
            <p className="mt-3 text-xs leading-relaxed text-gray-500">
              India&apos;s trusted instant loan platform.
            </p>
            <span className="mt-3 inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-2.5 py-1 text-[10px] font-semibold text-gray-600">
              <ShieldCheck className="h-3 w-3 text-emerald-600" />
              RBI Registered
            </span>
          </div>

          {/* Quick Links */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-700">Quick Links</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <a href="#" className="transition-colors hover:text-emerald-600">Home</a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-emerald-600">About Us</a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-emerald-600">Contact Us</a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-700">Legal</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <a href="#" className="transition-colors hover:text-emerald-600">Disclaimer</a>
              </li>
              <li>
                <a href="#" className="transition-colors hover:text-emerald-600">Privacy Policy</a>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-700">Contact</p>
            <ul className="space-y-2.5 text-sm text-gray-500">
              <li className="flex items-center gap-2">
                <Phone className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                <span>1800-247-2470</span>
              </li>
              <li className="flex items-center gap-2">
                <Mail className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                <a
                  href="mailto:support@loan247.online"
                  className="transition-colors hover:text-emerald-600"
                >
                  support@loan247.online
                </a>
              </li>
              <li className="flex items-center gap-2">
                <MapPin className="h-3.5 w-3.5 shrink-0 text-gray-400" />
                <span>Bengaluru, India</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-gray-200 pt-5 text-center text-[11px] text-gray-400">
          © 2026 LOAN247. All rights reserved. | RBI Registered NBFC
        </div>
      </div>
    </footer>
  );
}
