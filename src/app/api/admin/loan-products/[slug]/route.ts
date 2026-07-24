import { NextResponse } from "next/server";
import { deleteLoanProduct, updateLoanProduct } from "@/lib/loan-products-store";
import { getContentAdminPassword } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

async function isAuthorized(request: Request) {
  const password = await getContentAdminPassword();
  const supplied = request.headers.get("x-admin-password") || "";
  return Boolean(password) && supplied === password;
}

export async function PUT(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug } = await params;
    const product = await updateLoanProduct(slug, await request.json());
    return NextResponse.json({ ok: true, product });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unable to update loan category." },
      { status: 400 },
    );
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ slug: string }> }) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { slug } = await params;
    await deleteLoanProduct(slug);
    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unable to delete loan category." },
      { status: 400 },
    );
  }
}
