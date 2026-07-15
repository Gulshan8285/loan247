import { createHmac, timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { findApplication, upsertApplication } from "@/lib/application-store";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

function verifySignature(rawBody: string, signature: string) {
  const secret = process.env.RAZORPAY_WEBHOOK_SECRET;
  if (!secret) return true;

  const expected = createHmac("sha256", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected);
  const signatureBuffer = Buffer.from(signature);

  return (
    expectedBuffer.length === signatureBuffer.length &&
    timingSafeEqual(expectedBuffer, signatureBuffer)
  );
}

function extractReference(payload: any) {
  return (
    payload?.payload?.payment?.entity?.notes?.reference ||
    payload?.payload?.payment?.entity?.notes?.loan_reference ||
    payload?.payload?.payment_link?.entity?.reference_id ||
    payload?.reference ||
    ""
  );
}

function statusFromEvent(event: string) {
  if (event.includes("paid") || event.includes("captured")) return "paid" as const;
  if (event.includes("failed") || event.includes("cancelled") || event.includes("expired")) {
    return "rejected" as const;
  }
  return null;
}

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-razorpay-signature") || "";

  if (!verifySignature(rawBody, signature)) {
    return NextResponse.json({ ok: false, error: "Invalid signature" }, { status: 401 });
  }

  const payload = JSON.parse(rawBody);
  const reference = extractReference(payload);
  const paymentStatus = statusFromEvent(String(payload?.event || ""));

  if (!reference || !paymentStatus) {
    return NextResponse.json({ ok: true, ignored: true });
  }

  const existing = await findApplication(reference);
  if (!existing) {
    return NextResponse.json({ ok: true, ignored: true, reason: "reference_not_found" });
  }

  const application = await upsertApplication({
    reference,
    paymentStatus,
    paymentAmount: existing.paymentAmount,
    paymentProvider: "Razorpay",
    paymentLink: existing.paymentLink,
    data: existing.data,
  });

  return NextResponse.json({ ok: true, application });
}
