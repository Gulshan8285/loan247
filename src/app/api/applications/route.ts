import { NextResponse } from "next/server";
import { upsertApplication } from "@/lib/application-store";

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
