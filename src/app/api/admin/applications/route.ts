import { NextResponse } from "next/server";
import { readApplications } from "@/lib/application-store";
import { getAdminPassword } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function isAuthorized(request: Request) {
  const password = await getAdminPassword();
  const supplied = request.headers.get("x-admin-password") || "";
  return Boolean(password) && supplied === password;
}

export async function GET(request: Request) {
  if (!(await getAdminPassword())) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_PASSWORD is not configured." },
      { status: 503 },
    );
  }

  if (!(await isAuthorized(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const applications = await readApplications();

  return NextResponse.json({
    ok: true,
    applications,
    stats: {
      total: applications.length,
      paid: applications.filter((application) => application.paymentStatus === "paid").length,
      paymentOpened: applications.filter((application) => application.paymentStatus === "pending")
        .length,
      cancelled: applications.filter((application) => application.paymentStatus === "rejected")
        .length,
      totalPaidAmount: applications
        .filter((application) => application.paymentStatus === "paid")
        .reduce((sum, application) => sum + application.paymentAmount, 0),
    },
  });
}
