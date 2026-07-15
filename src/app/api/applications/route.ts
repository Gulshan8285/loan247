import { NextResponse } from "next/server";
import { findApplication, upsertApplication } from "@/lib/application-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const application = await upsertApplication(body);
    return NextResponse.json({ ok: true, application });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unable to save application";
    return NextResponse.json({ ok: false, error: message }, { status: 400 });
  }
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const reference = searchParams.get("reference") || "";

  if (!reference) {
    return NextResponse.json({ ok: false, error: "Missing reference" }, { status: 400 });
  }

  const application = await findApplication(reference);
  return NextResponse.json({ ok: true, application });
}
