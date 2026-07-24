import { NextResponse } from "next/server";
import { getContentAdminPassword } from "@/lib/admin-auth";
import { readSiteSettings, updateSiteSettings } from "@/lib/site-settings";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function isAuthorized(request: Request) {
  const password = await getContentAdminPassword();
  const supplied = request.headers.get("x-admin-password") || "";
  return Boolean(password) && supplied === password;
}

export async function GET(request: Request) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({ ok: true, settings: await readSiteSettings() });
}

export async function PUT(request: Request) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const settings = await updateSiteSettings(await request.json());
    return NextResponse.json({ ok: true, settings });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unable to save site settings." },
      { status: 400 },
    );
  }
}
