"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { BlogPost } from "@/lib/blog-posts";

type BlogPostsResponse = {
  ok: boolean;
  error?: string;
  posts?: BlogPost[];
  post?: BlogPost;
};

const EMPTY_POST: BlogPost = {
  id: "new",
  slug: "",
  title: "",
  excerpt: "",
  content: "",
  author: "LOAN247 Team",
  coverImage: "",
  published: true,
  order: 100,
  createdAt: "",
  updatedAt: "",
};

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

export function BlogPostsManager({ password }: { password: string }) {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [draft, setDraft] = useState<BlogPost>(EMPTY_POST);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function selectPost(post: BlogPost) {
    setSelectedSlug(post.slug);
    setDraft(post);
    setMessage("");
    setError("");
  }

  async function loadPosts(nextPassword = password) {
    if (!nextPassword) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/blog-posts", {
        cache: "no-store",
        headers: {
          "x-admin-password": nextPassword,
        },
      });
      const payload = (await response.json()) as BlogPostsResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to load blog posts");
      }

      const nextPosts = payload.posts || [];
      setPosts(nextPosts);
      const nextSelected = nextPosts.find((post) => post.slug === selectedSlug) || nextPosts[0];
      if (nextSelected) selectPost(nextSelected);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load blog posts");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!password) return;
    const timer = window.setTimeout(() => {
      void loadPosts(password);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [password]);

  function startNewPost() {
    const nextOrder = Math.max(100, ...posts.map((post) => Number(post.order) || 0)) + 10;
    setSelectedSlug("");
    setDraft({ ...EMPTY_POST, order: nextOrder, published: true });
    setMessage("");
    setError("");
  }

  function updateDraft(patch: Partial<BlogPost>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  async function savePost() {
    if (!password) {
      setError("Please unlock admin2 first.");
      return;
    }

    const normalizedSlug = slugify(draft.slug || draft.title);
    if (!draft.title.trim() || !normalizedSlug || !draft.excerpt.trim() || !draft.content.trim()) {
      setError("Title, URL, excerpt and content are required.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const isNew = !selectedSlug;
    const endpoint = isNew
      ? "/api/admin/blog-posts"
      : `/api/admin/blog-posts/${encodeURIComponent(selectedSlug)}`;

    try {
      const response = await fetch(endpoint, {
        method: isNew ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({
          ...draft,
          slug: normalizedSlug,
          author: draft.author.trim() || "LOAN247 Team",
          order: Number(draft.order) || 0,
        }),
      });
      const payload = (await response.json()) as BlogPostsResponse;

      if (!response.ok || !payload.ok || !payload.post) {
        throw new Error(payload.error || "Unable to save blog post");
      }

      setMessage("Blog post saved. Blog section has been updated.");
      await loadPosts(password);
      setSelectedSlug(payload.post.slug);
      setDraft(payload.post);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save blog post");
    } finally {
      setLoading(false);
    }
  }

  async function deletePost() {
    if (!password || !selectedSlug) return;
    const confirmed = window.confirm(`Delete ${draft.title || selectedSlug}? This removes the blog post from the website.`);
    if (!confirmed) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/blog-posts/${encodeURIComponent(selectedSlug)}`, {
        method: "DELETE",
        headers: {
          "x-admin-password": password,
        },
      });
      const payload = (await response.json()) as BlogPostsResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to delete blog post");
      }

      setMessage("Blog post deleted from the website.");
      setSelectedSlug("");
      setDraft(EMPTY_POST);
      await loadPosts(password);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete blog post");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold">Blog Posts</h2>
          <p className="text-xs text-gray-500">
            Add, edit, publish, hide, or delete website blog posts. Footer blog link updates automatically.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => loadPosts()}
            disabled={loading || !password}
            variant="outline"
            className="h-10 rounded-xl"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button type="button" onClick={startNewPost} className="h-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            Add Blog
          </Button>
        </div>
      </div>

      {message && <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{message}</p>}
      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}

      <div className="mt-4 grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
          <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
            {posts.map((post) => (
              <button
                key={post.id}
                type="button"
                onClick={() => selectPost(post)}
                className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                  post.slug === selectedSlug
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-transparent bg-white text-gray-700 hover:border-gray-200"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold">{post.title}</span>
                  {post.published ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </span>
                <span className="mt-1 block truncate text-xs text-gray-500">/blog/{post.slug}</span>
              </button>
            ))}
            {!posts.length && (
              <p className="px-2 py-8 text-center text-sm text-gray-500">
                {password ? "No blog posts found." : "Unlock admin2 to manage blog posts."}
              </p>
            )}
          </div>
        </div>

        <div className="grid gap-3">
          <div className="grid gap-3 md:grid-cols-2">
            <Input
              value={draft.title}
              onChange={(event) => updateDraft({ title: event.target.value })}
              className="h-11 rounded-xl"
              placeholder="Blog title"
            />
            <Input
              value={draft.author}
              onChange={(event) => updateDraft({ author: event.target.value })}
              className="h-11 rounded-xl"
              placeholder="Author"
            />
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">/blog/</span>
              <Input
                value={draft.slug}
                onChange={(event) => updateDraft({ slug: slugify(event.target.value) })}
                className="h-11 rounded-xl pl-14"
                placeholder="loan-guide"
              />
            </div>
            <Input
              type="number"
              value={draft.order}
              onChange={(event) => updateDraft({ order: Number(event.target.value) })}
              className="h-11 rounded-xl"
              placeholder="Order"
            />
          </div>

          <Input
            value={draft.coverImage}
            onChange={(event) => updateDraft({ coverImage: event.target.value })}
            className="h-11 rounded-xl"
            placeholder="Cover image URL (optional)"
          />
          <Textarea
            value={draft.excerpt}
            onChange={(event) => updateDraft({ excerpt: event.target.value })}
            className="min-h-20 rounded-xl"
            placeholder="Short excerpt shown on blog listing"
          />
          <Textarea
            value={draft.content}
            onChange={(event) => updateDraft({ content: event.target.value })}
            className="min-h-72 rounded-xl font-mono text-sm"
            placeholder="Blog content. Use blank lines between sections."
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={draft.published}
                onChange={(event) => updateDraft({ published: event.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600"
              />
              Publish this blog post
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={deletePost}
                disabled={loading || !selectedSlug}
                variant="outline"
                className="h-10 rounded-xl border-red-200 text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
              <Button
                type="button"
                onClick={savePost}
                disabled={loading || !password}
                className="h-10 rounded-xl bg-gray-950 text-white hover:bg-gray-800"
              >
                <Save className="h-4 w-4" />
                Save Blog
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
