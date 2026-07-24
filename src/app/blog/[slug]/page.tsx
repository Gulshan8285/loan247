import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarDays, UserRound } from "lucide-react";
import { findBlogPost, getPublishedBlogPosts } from "@/lib/blog-posts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await findBlogPost(slug);

  if (!post) return { title: "Blog Not Found - LOAN247" };

  return {
    title: `${post.title} - LOAN247 Blog`,
    description: post.excerpt,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title: `${post.title} - LOAN247 Blog`,
      description: post.excerpt,
      url: `https://www.loan247.online/blog/${post.slug}`,
      siteName: "LOAN247",
      type: "article",
    },
  };
}

function renderContent(content: string) {
  return content
    .split(/\n{2,}/)
    .map((block) => block.trim())
    .filter(Boolean)
    .map((block) => {
      const lines = block.split("\n").map((line) => line.trim()).filter(Boolean);
      if (lines.length === 1 && lines[0].length < 90 && !lines[0].includes(":")) {
        return (
          <h2 key={block} className="mt-8 text-xl font-black tracking-tight text-gray-950">
            {lines[0]}
          </h2>
        );
      }

      return (
        <p key={block} className="text-base leading-8 text-gray-600">
          {lines.map((line, index) => (
            <span key={`${line}-${index}`}>
              {line}
              {index < lines.length - 1 ? <br /> : null}
            </span>
          ))}
        </p>
      );
    });
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await findBlogPost(slug);
  if (!post) notFound();

  const relatedPosts = (await getPublishedBlogPosts()).filter((item) => item.slug !== post.slug).slice(0, 5);

  return (
    <main className="bg-white text-gray-950">
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 sm:py-14">
          <Link
            href="/blog"
            className="inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-emerald-700"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to blog
          </Link>
          <p className="mt-8 text-xs font-bold uppercase tracking-[0.22em] text-emerald-600">
            LOAN247 Blog
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-gray-950 sm:text-5xl">
            {post.title}
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">{post.excerpt}</p>
          <div className="mt-5 flex flex-wrap gap-4 text-xs font-medium text-gray-400">
            <span className="inline-flex items-center gap-1.5">
              <UserRound className="h-3.5 w-3.5" />
              {post.author}
            </span>
            <span className="inline-flex items-center gap-1.5">
              <CalendarDays className="h-3.5 w-3.5" />
              {new Date(post.updatedAt).toLocaleDateString("en-IN", {
                day: "2-digit",
                month: "long",
                year: "numeric",
              })}
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto grid max-w-5xl gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_280px]">
        <article className="space-y-5">{renderContent(post.content)}</article>

        <aside>
          {relatedPosts.length > 0 && (
            <div className="rounded-xl border border-gray-200 bg-white p-5">
              <h2 className="text-sm font-black uppercase tracking-wide text-gray-700">More Posts</h2>
              <div className="mt-4 grid gap-2">
                {relatedPosts.map((item) => (
                  <Link
                    key={item.slug}
                    href={`/blog/${item.slug}`}
                    className="rounded-lg px-2 py-1.5 text-sm font-medium text-gray-600 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                  >
                    {item.title}
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
    </main>
  );
}
