"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Headset, Linkedin, ShieldCheck, Twitter } from "lucide-react";
import { LoanLogo } from "./loan-logo";

type FooterPage = {
  slug: string;
  title: string;
  menuLabel: string;
  category: "company" | "legal" | "support";
  order: number;
};

type FooterBlogPost = {
  slug: string;
  title: string;
  order: number;
};

const FALLBACK_PAGES: FooterPage[] = [
  { slug: "about-us", title: "About Us", menuLabel: "About Us", category: "company", order: 10 },
  { slug: "contact-us", title: "Contact Us", menuLabel: "Contact Us", category: "support", order: 20 },
  { slug: "privacy-policy", title: "Privacy Policy", menuLabel: "Privacy Policy", category: "legal", order: 30 },
  { slug: "terms-conditions", title: "Terms & Conditions", menuLabel: "Terms & Conditions", category: "legal", order: 40 },
  { slug: "disclaimer", title: "Disclaimer", menuLabel: "Disclaimer", category: "legal", order: 50 },
];

const contactButtonClass =
  "inline-flex items-center gap-1.5 rounded-full border border-emerald-200 bg-emerald-50 px-4 py-2 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100";

export function SiteFooter({ onContactClick }: { onContactClick?: () => void }) {
  const [pages, setPages] = useState<FooterPage[]>(FALLBACK_PAGES);
  const [blogPosts, setBlogPosts] = useState<FooterBlogPost[]>([]);

  useEffect(() => {
    let active = true;
    fetch("/api/legal-pages", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (!active || !payload?.ok || !Array.isArray(payload.pages)) return;
        setPages(payload.pages);
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    let active = true;
    fetch("/api/blog-posts", { cache: "no-store" })
      .then((response) => response.json())
      .then((payload) => {
        if (!active || !payload?.ok || !Array.isArray(payload.posts)) return;
        setBlogPosts(payload.posts.slice(0, 4));
      })
      .catch(() => undefined);

    return () => {
      active = false;
    };
  }, []);

  const companyPages = useMemo(
    () => pages.filter((page) => page.category === "company" || page.category === "support").slice(0, 5),
    [pages],
  );
  const legalPages = useMemo(() => pages.filter((page) => page.category === "legal").slice(0, 8), [pages]);

  return (
    <footer className="mt-auto border-t border-gray-200 bg-gray-50">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:py-12">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-5">
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
              GST: 06IFSPK3336A1ZG
            </span>
            <p className="mt-2 text-[11px] font-medium text-gray-500">MSME: UDYAM-HR-05-0004197</p>
            <div className="mt-4 flex items-center gap-2">
              <a
                href="https://twitter.com/loan247online"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LOAN247 on X"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-emerald-200 hover:text-emerald-700"
              >
                <Twitter className="h-4 w-4" />
              </a>
              <a
                href="https://www.linkedin.com/company/loan247-online"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="LOAN247 on LinkedIn"
                className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 bg-white text-gray-500 transition-colors hover:border-emerald-200 hover:text-emerald-700"
              >
                <Linkedin className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-700">Quick Links</p>
            <ul className="space-y-2 text-sm text-gray-500">
              {companyPages.map((page) => (
                <li key={page.slug}>
                  <Link href={`/${page.slug}`} className="transition-colors hover:text-emerald-600">
                    {page.menuLabel}
                  </Link>
                </li>
              ))}
              <li>
                <a href="/" className="transition-colors hover:text-emerald-600">
                  EMI Calculator
                </a>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-700">Legal</p>
            <ul className="space-y-2 text-sm text-gray-500">
              {legalPages.map((page) => (
                <li key={page.slug}>
                  <Link href={`/${page.slug}`} className="transition-colors hover:text-emerald-600">
                    {page.menuLabel}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Blog */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-700">Blog</p>
            <ul className="space-y-2 text-sm text-gray-500">
              <li>
                <Link href="/blog" className="transition-colors hover:text-emerald-600">
                  Blog Home
                </Link>
              </li>
              {blogPosts.map((post) => (
                <li key={post.slug}>
                  <Link href={`/blog/${post.slug}`} className="transition-colors hover:text-emerald-600">
                    {post.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Support — opens the Support modal (contact details live there) */}
          <div>
            <p className="mb-3 text-xs font-bold uppercase tracking-wider text-gray-700">Need Help?</p>
            <p className="mb-3 text-xs leading-relaxed text-gray-500">
              support@loan247.online
              <br />
              9319903728 · 8810381949
            </p>
            {onContactClick ? (
              <button onClick={onContactClick} className={contactButtonClass}>
                <Headset className="h-3.5 w-3.5" />
                Contact Support
              </button>
            ) : (
              <a href="mailto:support@loan247.online" className={contactButtonClass}>
                <Headset className="h-3.5 w-3.5" />
                Contact Support
              </a>
            )}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-8 border-t border-gray-200 pt-5 text-center text-[11px] text-gray-400">
          © 2026 LOAN247. All rights reserved. | GST: 06IFSPK3336A1ZG | MSME: UDYAM-HR-05-0004197
        </div>
      </div>
    </footer>
  );
}
