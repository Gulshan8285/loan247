import type { MetadataRoute } from "next";
import { getVisibleLoanProducts } from "@/lib/loan-products-store";
import { getVisibleLegalPages } from "@/lib/legal-pages";

const SITE_URL = "https://www.loan247.online";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const legalPages = await getVisibleLegalPages();
  const loanProducts = await getVisibleLoanProducts();

  return [
    {
      url: SITE_URL,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1,
    },
    ...loanProducts.map((product) => ({
      url: `${SITE_URL}/loans/${product.slug}`,
      lastModified: now,
      changeFrequency: "weekly" as const,
      priority: product.category === "loan" ? 0.9 : 0.75,
    })),
    ...legalPages.map((page) => ({
      url: `${SITE_URL}/${page.slug}`,
      lastModified: new Date(page.updatedAt),
      changeFrequency: "monthly" as const,
      priority: page.category === "legal" ? 0.5 : 0.65,
    })),
  ];
}
