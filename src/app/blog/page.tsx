import type { Metadata } from "next";
import Link from "next/link";
import { CalendarDays, UserRound } from "lucide-react";
import { getPublishedBlogPosts } from "@/lib/blog-posts";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

export const metadata: Metadata = {
  title: "Blog - LOAN247",
  description: "Loan guides, eligibility tips, and financial education from LOAN247.",
  alternates: {
    canonical: "/blog",
  },
};

export default async function BlogPage() {
  const posts = await getPublishedBlogPosts();

  return (
    <main className="bg-white text-gray-950">
      <section className="border-b border-gray-100 bg-gray-50">
        <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 sm:py-14">
          <p className="text-xs font-bold uppercase tracking-[0.22em] text-emerald-600">
            LOAN247 Blog
          </p>
          <h1 className="mt-3 text-4xl font-black tracking-tight text-gray-950 sm:text-5xl">
            Loan guides and updates
          </h1>
          <p className="mt-4 max-w-2xl text-base leading-7 text-gray-600">
            Helpful posts from the LOAN247 team for customers comparing loans, documents,
            eligibility, CIBIL, and repayment planning.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        {posts.length > 0 ? (
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {posts.map((post) => (
              <Link
                key={post.id}
                href={`/blog/${post.slug}`}
                className="rounded-xl border border-gray-200 bg-white p-5 transition hover:border-emerald-200 hover:bg-emerald-50/30"
              >
                <p className="text-xs font-bold uppercase tracking-wide text-emerald-600">
                  Blog
                </p>
                <h2 className="mt-3 text-xl font-black tracking-tight text-gray-950">
                  {post.title}
                </h2>
                <p className="mt-3 line-clamp-3 text-sm leading-6 text-gray-600">{post.excerpt}</p>
                <div className="mt-5 flex flex-wrap gap-3 text-xs font-medium text-gray-400">
                  <span className="inline-flex items-center gap-1.5">
                    <UserRound className="h-3.5 w-3.5" />
                    {post.author}
                  </span>
                  <span className="inline-flex items-center gap-1.5">
                    <CalendarDays className="h-3.5 w-3.5" />
                    {new Date(post.updatedAt).toLocaleDateString("en-IN", {
                      day: "2-digit",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center">
            <h2 className="text-xl font-black">No blog posts yet</h2>
            <p className="mt-2 text-sm text-gray-500">New LOAN247 blog posts will appear here.</p>
          </div>
        )}
      </section>
    </main>
  );
}
