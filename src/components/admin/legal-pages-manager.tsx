"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type LegalPageCategory = "company" | "legal" | "support";

type LegalPage = {
  id: string;
  slug: string;
  title: string;
  menuLabel: string;
  description: string;
  content: string;
  category: LegalPageCategory;
  visible: boolean;
  order: number;
  createdAt: string;
  updatedAt: string;
};

type LegalPagesResponse = {
  ok: boolean;
  error?: string;
  pages?: LegalPage[];
  page?: LegalPage;
};

const EMPTY_PAGE: LegalPage = {
  id: "new",
  slug: "",
  title: "",
  menuLabel: "",
  description: "",
  content: "",
  category: "legal",
  visible: true,
  order: 110,
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

export function LegalPagesManager({ password }: { password: string }) {
  const [pages, setPages] = useState<LegalPage[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [draft, setDraft] = useState<LegalPage>(EMPTY_PAGE);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadPages(nextPassword = password) {
    if (!nextPassword) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/legal-pages", {
        cache: "no-store",
        headers: {
          "x-admin-password": nextPassword,
        },
      });
      const payload = (await response.json()) as LegalPagesResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to load legal pages");
      }

      const nextPages = payload.pages || [];
      setPages(nextPages);
      const nextSelected = selectedSlug || nextPages[0]?.slug || "";
      setSelectedSlug(nextSelected);
      setDraft(nextPages.find((page) => page.slug === nextSelected) || EMPTY_PAGE);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load legal pages");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!password) return;
    const timer = window.setTimeout(() => {
      void loadPages(password);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [password]);

  function startNewPage() {
    const nextOrder = Math.max(100, ...pages.map((page) => Number(page.order) || 0)) + 10;
    setSelectedSlug("");
    setDraft({ ...EMPTY_PAGE, order: nextOrder });
    setMessage("");
    setError("");
  }

  function updateDraft(patch: Partial<LegalPage>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  async function savePage() {
    if (!password) {
      setError("Please unlock admin first.");
      return;
    }

    const normalizedSlug = slugify(draft.slug || draft.title);
    if (!draft.title.trim() || !normalizedSlug || !draft.content.trim()) {
      setError("Title, URL and content are required.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const isNew = !selectedSlug;
    const endpoint = isNew
      ? "/api/admin/legal-pages"
      : `/api/admin/legal-pages/${encodeURIComponent(selectedSlug)}`;

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
          menuLabel: draft.menuLabel.trim() || draft.title.trim(),
          order: Number(draft.order) || 0,
        }),
      });
      const payload = (await response.json()) as LegalPagesResponse;

      if (!response.ok || !payload.ok || !payload.page) {
        throw new Error(payload.error || "Unable to save legal page");
      }

      setMessage("Page saved. Website content has been updated.");
      await loadPages(password);
      setSelectedSlug(payload.page.slug);
      setDraft(payload.page);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save legal page");
    } finally {
      setLoading(false);
    }
  }

  async function deletePage() {
    if (!password || !selectedSlug) return;
    const confirmed = window.confirm(`Delete ${draft.title || selectedSlug}? This removes the page from the website.`);
    if (!confirmed) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/legal-pages/${encodeURIComponent(selectedSlug)}`, {
        method: "DELETE",
        headers: {
          "x-admin-password": password,
        },
      });
      const payload = (await response.json()) as LegalPagesResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to delete legal page");
      }

      setMessage("Page deleted from the website.");
      setSelectedSlug("");
      setDraft(EMPTY_PAGE);
      await loadPages(password);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete legal page");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold">Legal Pages</h2>
          <p className="text-xs text-gray-500">
            Add, edit, hide, reorder, or remove website pages. Footer links update automatically.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => loadPages()}
            disabled={loading || !password}
            variant="outline"
            className="h-10 rounded-xl"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button type="button" onClick={startNewPage} className="h-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            Add Page
          </Button>
        </div>
      </div>

      {message && <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{message}</p>}
      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}

      <div className="mt-4 grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
          <div className="max-h-[560px] space-y-2 overflow-y-auto pr-1">
            {pages.map((page) => (
              <button
                key={page.id}
                type="button"
                onClick={() => {
                  setSelectedSlug(page.slug);
                  setDraft(page);
                }}
                className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                  page.slug === selectedSlug
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-transparent bg-white text-gray-700 hover:border-gray-200"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold">{page.menuLabel}</span>
                  {page.visible ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </span>
                <span className="mt-1 block truncate text-xs text-gray-500">/{page.slug}</span>
              </button>
            ))}
            {!pages.length && (
              <p className="px-2 py-8 text-center text-sm text-gray-500">
                {password ? "No legal pages found." : "Unlock admin to manage pages."}
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
              placeholder="Page title, e.g. Privacy Policy"
            />
            <Input
              value={draft.menuLabel}
              onChange={(event) => updateDraft({ menuLabel: event.target.value })}
              className="h-11 rounded-xl"
              placeholder="Footer label"
            />
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">/</span>
              <Input
                value={draft.slug}
                onChange={(event) => updateDraft({ slug: slugify(event.target.value) })}
                className="h-11 rounded-xl pl-7"
                placeholder="privacy-policy"
              />
            </div>
            <div className="grid grid-cols-[1fr_100px] gap-3">
              <select
                value={draft.category}
                onChange={(event) => updateDraft({ category: event.target.value as LegalPageCategory })}
                className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm"
              >
                <option value="company">Company</option>
                <option value="legal">Legal</option>
                <option value="support">Support</option>
              </select>
              <Input
                type="number"
                value={draft.order}
                onChange={(event) => updateDraft({ order: Number(event.target.value) })}
                className="h-11 rounded-xl"
                placeholder="Order"
              />
            </div>
          </div>

          <Textarea
            value={draft.description}
            onChange={(event) => updateDraft({ description: event.target.value })}
            className="min-h-20 rounded-xl"
            placeholder="Short page description"
          />
          <Textarea
            value={draft.content}
            onChange={(event) => updateDraft({ content: event.target.value })}
            className="min-h-72 rounded-xl font-mono text-sm"
            placeholder="Page content. Use blank lines between sections."
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={draft.visible}
                onChange={(event) => updateDraft({ visible: event.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600"
              />
              Show this page on website
            </label>
            <div className="flex gap-2">
              <Button
                type="button"
                onClick={deletePage}
                disabled={loading || !selectedSlug}
                variant="outline"
                className="h-10 rounded-xl border-red-200 text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4" />
                Delete
              </Button>
              <Button
                type="button"
                onClick={savePage}
                disabled={loading || !password}
                className="h-10 rounded-xl bg-gray-950 text-white hover:bg-gray-800"
              >
                <Save className="h-4 w-4" />
                Save Page
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
