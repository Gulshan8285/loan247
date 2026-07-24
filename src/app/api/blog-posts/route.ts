import { NextResponse } from "next/server";
import { getPublishedBlogPosts } from "@/lib/blog-posts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function GET() {
  return NextResponse.json({ ok: true, posts: await getPublishedBlogPosts() });
}
