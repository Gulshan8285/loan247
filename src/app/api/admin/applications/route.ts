import { NextResponse } from "next/server";
import { readApplications } from "@/lib/application-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function configuredAdminPassword() {
  if (process.env.ADMIN_PASSWORD) return process.env.ADMIN_PASSWORD;
  if (process.env.NODE_ENV !== "production") return "loan247-admin";
  return "";
}

function isAuthorized(request: Request) {
  const password = configuredAdminPassword();
  const supplied = request.headers.get("x-admin-password") || "";
  return Boolean(password) && supplied === password;
}

export async function GET(request: Request) {
  if (!configuredAdminPassword()) {
    return NextResponse.json(
      { ok: false, error: "ADMIN_PASSWORD is not configured." },
      { status: 503 },
    );
  }

  if (!isAuthorized(request)) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const applications = await readApplications();

  return NextResponse.json({
    ok: true,
    applications,
    stats: {
      total: applications.length,
      paid: applications.filter((application) => application.paymentStatus === "paid").length,
      paymentOpened: applications.filter(
        (application) => application.paymentStatus === "payment_opened",
      ).length,
      cancelled: applications.filter((application) => application.paymentStatus === "cancelled")
        .length,
      totalPaidAmount: applications
        .filter((application) => application.paymentStatus === "paid")
        .reduce((sum, application) => sum + application.paymentAmount, 0),
    },
  });
}
