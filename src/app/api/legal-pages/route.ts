import { NextResponse } from "next/server";
import { getVisibleLegalPages } from "@/lib/legal-pages";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  const pages = await getVisibleLegalPages();

  return NextResponse.json({
    ok: true,
    pages: pages.map((page) => ({
      slug: page.slug,
      title: page.title,
      menuLabel: page.menuLabel,
      description: page.description,
      category: page.category,
      order: page.order,
    })),
  });
}
