import { NextResponse } from "next/server";
import { readSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, settings: await readSiteSettings() });
}
