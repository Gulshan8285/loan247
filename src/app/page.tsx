import type { Metadata } from "next";
import { HomeJsonLd } from "@/components/loan/home-json-ld";
import { LoanWizard } from "@/components/loan/loan-wizard";
import { readSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata(): Promise<Metadata> {
  const settings = await readSiteSettings();

  return {
    title: settings.homePage.seoTitle,
    description: settings.homePage.seoDescription,
    alternates: {
      canonical: "/",
    },
    openGraph: {
      title: settings.homePage.seoTitle,
      description: settings.homePage.seoDescription,
      url: "https://www.loan247.online/",
      siteName: "LOAN247",
      images: [{ url: "/images/hero-loan.png", width: 1200, height: 630, alt: "LOAN247 personal loan application" }],
      locale: "en_IN",
      type: "website",
    },
    twitter: {
      card: "summary_large_image",
      title: settings.homePage.seoTitle,
      description: settings.homePage.seoDescription,
      images: ["/images/hero-loan.png"],
    },
  };
}

export default function Home() {
  return (
    <>
      <HomeJsonLd />
      <LoanWizard />
    </>
  );
}
