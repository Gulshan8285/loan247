import { NextResponse } from "next/server";
import { getVisibleLoanProducts } from "@/lib/loan-products-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, products: await getVisibleLoanProducts() });
}
