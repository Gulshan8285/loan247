import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  BadgeIndianRupee,
  CheckCircle2,
  Clock3,
  FileCheck2,
  Percent,
  ShieldCheck,
} from "lucide-react";
import type { LoanProduct } from "@/lib/loan-products";
import { findLoanProduct } from "@/lib/loan-products-store";

const SITE_URL = "https://www.loan247.online";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await findLoanProduct(slug);

  if (!product) {
    return {
      title: "Loan Page Not Found - LOAN247",
    };
  }

  const url = `${SITE_URL}/loans/${product.slug}`;

  return {
    title: `${product.title} - LOAN247`,
    description: product.description,
    alternates: {
      canonical: `/loans/${product.slug}`,
    },
    openGraph: {
      title: `${product.title} - LOAN247`,
      description: product.description,
      url,
      siteName: "LOAN247",
      images: [{ url: "/images/hero-loan.png", width: 1200, height: 630, alt: product.title }],
      locale: "en_IN",
      type: "article",
    },
    twitter: {
      card: "summary_large_image",
      title: `${product.title} - LOAN247`,
      description: product.description,
      images: ["/images/hero-loan.png"],
    },
  };
}

function LoanJsonLd({ product }: { product: LoanProduct }) {
  const url = `${SITE_URL}/loans/${product.slug}`;
  const jsonLd = [
    {
      "@context": "https://schema.org",
      "@type": "WebPage",
      "@id": `${url}#webpage`,
      url,
      name: `${product.title} - LOAN247`,
      description: product.description,
      isPartOf: { "@id": `${SITE_URL}/#website` },
      breadcrumb: { "@id": `${url}#breadcrumb` },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "@id": `${url}#breadcrumb`,
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: SITE_URL },
        { "@type": "ListItem", position: 2, name: product.title, item: url },
      ],
    },
    {
      "@context": "https://schema.org",
      "@type": "Service",
      "@id": `${url}#service`,
      name: product.title,
      serviceType: product.title,
      provider: { "@id": `${SITE_URL}/#financialservice` },
      areaServed: "IN",
      description: product.description,
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "@id": `${url}#faq`,
      mainEntity: product.faqs.map((faq) => ({
        "@type": "Question",
        name: faq.question,
        acceptedAnswer: { "@type": "Answer", text: faq.answer },
      })),
    },
    {
      "@context": "https://schema.org",
      "@type": "Article",
      "@id": `${url}#article`,
      headline: product.title,
      description: product.description,
      author: { "@id": `${SITE_URL}/#organization` },
      publisher: { "@id": `${SITE_URL}/#organization` },
      dateModified: "2026-07-23",
      mainEntityOfPage: { "@id": `${url}#webpage` },
    },
  ];

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
    />
  );
}

export default async function LoanDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await findLoanProduct(slug);
  if (!product) notFound();

  const applyHref = `/?selectLoan=1&loan=${product.slug}`;

  return (
    <main className="bg-white text-gray-950">
      <LoanJsonLd product={product} />
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 sm:px-6">
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-600 transition-colors hover:bg-gray-50"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            All loans
          </Link>
          <Link
            href={applyHref}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 px-4 py-2.5 text-xs font-bold text-white shadow-sm transition hover:brightness-105"
          >
            Apply Now
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </header>

      <section className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 sm:py-14 lg:grid-cols-[1fr_360px]">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-600">
              LOAN247 Finance
            </p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-gray-950 sm:text-5xl">
              {product.title}
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-8 text-gray-600">{product.description}</p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Link
                href={applyHref}
                className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:brightness-105"
              >
                Apply Now
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/"
                className="inline-flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-6 py-3 text-sm font-bold text-gray-700 transition hover:bg-gray-50"
              >
                EMI Calculator
              </Link>
            </div>
          </div>

          <div className="grid gap-3 rounded-xl border border-gray-200 bg-white p-4 shadow-sm">
            {[
              { icon: BadgeIndianRupee, label: "Amount", value: product.amount },
              { icon: Percent, label: "Interest", value: product.rate },
              { icon: Clock3, label: "Tenure", value: product.tenure },
              { icon: ShieldCheck, label: "Processing", value: product.processing },
            ].map((item) => (
              <div key={item.label} className="flex items-start gap-3 rounded-lg bg-gray-50 p-3">
                <item.icon className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                <div>
                  <p className="text-[11px] font-bold uppercase tracking-wide text-gray-400">{item.label}</p>
                  <p className="mt-0.5 text-sm font-semibold leading-6 text-gray-900">{item.value}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-6xl gap-6 px-4 py-10 sm:px-6 lg:grid-cols-3">
        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-black text-gray-950">Highlights</h2>
          <div className="mt-4 grid gap-3">
            {product.highlights.map((item) => (
              <p key={item} className="flex items-start gap-2 text-sm leading-6 text-gray-600">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                {item}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-black text-gray-950">Eligibility</h2>
          <div className="mt-4 grid gap-3">
            {product.eligibility.map((item) => (
              <p key={item} className="flex items-start gap-2 text-sm leading-6 text-gray-600">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                {item}
              </p>
            ))}
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-5">
          <h2 className="text-lg font-black text-gray-950">Documents Required</h2>
          <div className="mt-4 grid gap-3">
            {product.documents.map((item) => (
              <p key={item} className="flex items-start gap-2 text-sm leading-6 text-gray-600">
                <FileCheck2 className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
                {item}
              </p>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 pb-12 sm:px-6">
        <div className="rounded-xl border border-gray-200 bg-gray-50 p-5 sm:p-6">
          <h2 className="text-xl font-black text-gray-950">FAQs</h2>
          <div className="mt-5 grid gap-4 sm:grid-cols-2">
            {product.faqs.map((faq) => (
              <div key={faq.question} className="rounded-lg border border-gray-200 bg-white p-4">
                <h3 className="text-sm font-black text-gray-900">{faq.question}</h3>
                <p className="mt-2 text-sm leading-6 text-gray-600">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </main>
  );
}
