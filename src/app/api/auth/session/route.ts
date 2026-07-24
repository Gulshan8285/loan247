import { NextResponse } from "next/server";
import {
  AUTH_COOKIE_NAME,
  SESSION_MAX_AGE_SECONDS,
  createOrUpdateUser,
  createSessionCookie,
  verifyIdToken,
} from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const idToken = typeof body.idToken === "string" ? body.idToken : "";

    if (!idToken) {
      return NextResponse.json({ error: "Firebase ID token is required" }, { status: 400 });
    }

    const decoded = await verifyIdToken(idToken);
    const user = await createOrUpdateUser(decoded);
    const sessionCookie = await createSessionCookie(idToken);

    const response = NextResponse.json({ user });
    response.cookies.set({
      name: AUTH_COOKIE_NAME,
      value: sessionCookie,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: SESSION_MAX_AGE_SECONDS,
    });

    return response;
  } catch (error) {
    const message = error instanceof Error ? error.message : "Authentication failed";
    return NextResponse.json({ error: message }, { status: 401 });
  }
}
