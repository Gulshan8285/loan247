import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Mail, Phone } from "lucide-react";
import { COMPANY_CONTACT, findLegalPage, getVisibleLegalPages } from "@/lib/legal-pages";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const page = await findLegalPage(slug);

  if (!page) {
    return {
      title: "Page Not Found - LOAN247",
    };
  }

  return {
    title: `${page.title} - LOAN247`,
    description: page.description,
    alternates: {
      canonical: `/${page.slug}`,
    },
    openGraph: {
      title: `${page.title} - LOAN247`,
      description: page.description,
      url: `https://www.loan247.online/${page.slug}`,
      siteName: "LOAN247",
      type: "article",
    },
  };
}

function renderContent(content: string) {
  return content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      if (lines.length === 1 && lines[0].length < 80 && !lines[0].includes(":")) {
        return (
          <h2 key={block} className="mt-8 text-xl font-black tracking-tight text-gray-950">
            {lines[0]}
          </h2>
        );
      }

      return (
        <p key={block} className="text-base leading-8 text-gray-600">
          {lines.map((line, index) => (
            <span key={`${line}-${index}`}>
              {line}
              {index < lines.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      );
    });
}

export default async function LegalContentPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const page = await findLegalPage(slug);
  if (!page) notFound();

  const pages = await getVisibleLegalPages();
  const relatedPages = pages.filter((item) => item.slug !== page.slug).slice(0, 8);

  return (
    <main className="bg-white text-gray-950">
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 sm:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-600">
            LOAN247 Legal
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-gray-950 sm:text-5xl">
            {page.title}
          </h1>
          {page.description && (
            <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">{page.description}</p>
          )}
          <p className="mt-4 text-xs font-medium text-gray-400">
            Last updated:{" "}
            {new Date(page.updatedAt).toLocaleDateString("en-IN", {
              day: "2-digit",
              month: "long",
              year: "numeric",
            })}
          </p>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_280px]">
        <article className="space-y-5">{renderContent(page.content)}</article>

        <aside className="space-y-5">
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-sm font-black uppercase tracking-wide text-gray-700">Contact</h2>
            <div className="mt-4 space-y-3 text-sm text-gray-600">
              <a className="flex items-center gap-2 hover:text-emerald-700" href={`mailto:${COMPANY_CONTACT.email}`}>
                <Mail className="h-4 w-4 text-emerald-600" />
                {COMPANY_CONTACT.email}
              </a>
              {COMPANY_CONTACT.phones.map((phone) => (
                <a key={phone} className="flex items-center gap-2 hover:text-emerald-700" href={`tel:${phone}`}>
                  <Phone className="h-4 w-4 text-emerald-600" />
                  {phone}
                </a>
              ))}
            </div>
          </div>

          <div className="rounded-xl border border-gray-200 bg-white p-5">
            <h2 className="text-sm font-black uppercase tracking-wide text-gray-700">Business Details</h2>
            <div className="mt-4 space-y-2 text-sm leading-6 text-gray-600">
              <p>GSTIN: {COMPANY_CONTACT.gst}</p>
              <p>MSME: {COMPANY_CONTACT.msme}</p>
            </div>
          </div>

          {relatedPages.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-black uppercase tracking-wide text-gray-700">Other Pages</h2>
              <div className="mt-4 grid gap-2">
                {relatedPages.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/${item.slug}`}
                    className="rounded-lg px-2 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    {item.menuLabel}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
