import { NextResponse } from "next/server";
import { createBlogPost, readBlogPosts } from "@/lib/blog-posts";
import { getContentAdminPassword } from "@/lib/admin-auth";

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

  return NextResponse.json({ ok: true, posts: await readBlogPosts() });
}

export async function POST(request: Request) {
  if (!(await isAuthorized(request))) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  try {
    const post = await createBlogPost(await request.json());
    return NextResponse.json({ ok: true, post });
  } catch (error) {
    return NextResponse.json(
      { ok: false, error: error instanceof Error ? error.message : "Unable to save blog post." },
      { status: 400 },
    );
  }
}
