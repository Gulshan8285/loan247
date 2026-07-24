import { NextResponse } from "next/server";
import { findApplication, getApplicationsStorageTarget } from "@/lib/application-store";
import { getAdminPassword } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function isAuthorized(request: Request) {
  const password = await getAdminPassword();
  const supplied = request.headers.get("x-admin-password") || "";
  return Boolean(password) && supplied === password;
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ reference: string }> },
) {
  if (!(await getAdminPassword())) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_PASSWORD is not configured." },
      { status: 503 },
    );
  }

  if (!(await isAuthorized(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const { reference } = await params;
  const application = await findApplication(decodeURIComponent(reference || ""));

  if (!application) {
    return NextResponse.json({ ok: false, error: "Application not found" }, { status: 404 });
  }

  return NextResponse.json({
    ok: true,
    application,
    storage: getApplicationsStorageTarget(),
  });
}
