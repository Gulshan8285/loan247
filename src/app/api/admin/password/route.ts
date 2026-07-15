import { NextResponse } from "next/server";
import {
  ADMIN_PASSWORD_CHANGE_EMAIL,
  getAdminPassword,
  setAdminPassword,
} from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await request.json();
  const email = String(body.email || "").trim();
  const currentPassword = String(body.currentPassword || "");
  const newPassword = String(body.newPassword || "");
  const configuredPassword = await getAdminPassword();

  if (email.toLowerCase() !== ADMIN_PASSWORD_CHANGE_EMAIL.toLowerCase()) {
    return NextResponse.json(
      { ok: false, error: "Only Gulshanyadav62000@gmail.com can change the password." },
      { status: 403 },
    );
  }

  if (!configuredPassword || currentPassword !== configuredPassword) {
    return NextResponse.json({ ok: false, error: "Current password is incorrect." }, { status: 401 });
  }

  if (newPassword.length < 8) {
    return NextResponse.json(
      { ok: false, error: "New password must be at least 8 characters." },
      { status: 400 },
    );
  }

  await setAdminPassword(newPassword);
  return NextResponse.json({ ok: true });
}
