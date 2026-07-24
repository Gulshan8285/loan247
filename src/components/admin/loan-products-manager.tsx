"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Plus, RefreshCw, Save, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { LoanProduct } from "@/lib/loan-products";

type LoanProductsResponse = {
  ok: boolean;
  error?: string;
  products?: LoanProduct[];
  product?: LoanProduct;
};

const EMPTY_PRODUCT: LoanProduct = {
  id: "new",
  slug: "",
  title: "",
  shortTitle: "",
  category: "loan",
  description: "",
  summary: "",
  amount: "",
  rate: "",
  tenure: "",
  processing: "",
  highlights: [],
  documents: [],
  eligibility: [],
  faqs: [],
  visible: true,
  order: 130,
};

const PURPOSES = ["", "Home", "Education", "Business", "Medical", "Travel", "Wedding", "Debt consolidation"];

function slugify(value: string) {
  return value
    .trim()
    .toLowerCase()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function listToText(value: string[] | undefined) {
  return (value || []).join("\n");
}

function textToList(value: string) {
  return value
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean);
}

function faqsToText(value: LoanProduct["faqs"] | undefined) {
  return (value || []).map((faq) => `${faq.question} | ${faq.answer}`).join("\n");
}

function textToFaqs(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [question, ...answerParts] = line.split("|");
      return {
        question: String(question || "").trim(),
        answer: answerParts.join("|").trim(),
      };
    })
    .filter((faq) => faq.question && faq.answer);
}

export function LoanProductsManager({ password }: { password: string }) {
  const [products, setProducts] = useState<LoanProduct[]>([]);
  const [selectedSlug, setSelectedSlug] = useState("");
  const [draft, setDraft] = useState<LoanProduct>(EMPTY_PRODUCT);
  const [highlightsText, setHighlightsText] = useState("");
  const [documentsText, setDocumentsText] = useState("");
  const [eligibilityText, setEligibilityText] = useState("");
  const [faqsText, setFaqsText] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function selectProduct(product: LoanProduct) {
    setSelectedSlug(product.slug);
    setDraft(product);
    setHighlightsText(listToText(product.highlights));
    setDocumentsText(listToText(product.documents));
    setEligibilityText(listToText(product.eligibility));
    setFaqsText(faqsToText(product.faqs));
    setMessage("");
    setError("");
  }

  async function loadProducts(nextPassword = password) {
    if (!nextPassword) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/loan-products", {
        cache: "no-store",
        headers: {
          "x-admin-password": nextPassword,
        },
      });
      const payload = (await response.json()) as LoanProductsResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to load loan categories");
      }

      const nextProducts = payload.products || [];
      setProducts(nextProducts);
      const nextSelected = nextProducts.find((product) => product.slug === selectedSlug) || nextProducts[0];
      if (nextSelected) {
        selectProduct(nextSelected);
      }
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load loan categories");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!password) return;
    const timer = window.setTimeout(() => {
      void loadProducts(password);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [password]);

  function startNewProduct() {
    const nextOrder = Math.max(120, ...products.map((product) => Number(product.order) || 0)) + 10;
    setSelectedSlug("");
    setDraft({ ...EMPTY_PRODUCT, order: nextOrder, visible: true });
    setHighlightsText("");
    setDocumentsText("");
    setEligibilityText("");
    setFaqsText("");
    setMessage("");
    setError("");
  }

  function updateDraft(patch: Partial<LoanProduct>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function buildPayload() {
    return {
      ...draft,
      slug: slugify(draft.slug || draft.title),
      shortTitle: draft.shortTitle.trim() || draft.title.trim(),
      order: Number(draft.order) || 0,
      highlights: textToList(highlightsText),
      documents: textToList(documentsText),
      eligibility: textToList(eligibilityText),
      faqs: textToFaqs(faqsText),
      purpose: draft.purpose || undefined,
    };
  }

  async function saveProduct() {
    if (!password) {
      setError("Please unlock admin first.");
      return;
    }

    const payload = buildPayload();
    if (!payload.title.trim() || !payload.slug || !payload.description.trim() || !payload.summary.trim()) {
      setError("Title, URL, description and summary are required.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    const isNew = !selectedSlug;
    const endpoint = isNew
      ? "/api/admin/loan-products"
      : `/api/admin/loan-products/${encodeURIComponent(selectedSlug)}`;

    try {
      const response = await fetch(endpoint, {
        method: isNew ? "POST" : "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as LoanProductsResponse;

      if (!response.ok || !result.ok || !result.product) {
        throw new Error(result.error || "Unable to save loan category");
      }

      setMessage("Loan category saved. Website content has been updated.");
      await loadProducts(password);
      setSelectedSlug(result.product.slug);
      selectProduct(result.product);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save loan category");
    } finally {
      setLoading(false);
    }
  }

  async function deleteProduct() {
    if (!password || !selectedSlug) return;
    const confirmed = window.confirm(`Delete ${draft.title || selectedSlug}? This removes the loan page from the website.`);
    if (!confirmed) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch(`/api/admin/loan-products/${encodeURIComponent(selectedSlug)}`, {
        method: "DELETE",
        headers: {
          "x-admin-password": password,
        },
      });
      const result = (await response.json()) as LoanProductsResponse;

      if (!response.ok || !result.ok) {
        throw new Error(result.error || "Unable to delete loan category");
      }

      setMessage("Loan category deleted from the website.");
      startNewProduct();
      await loadProducts(password);
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Unable to delete loan category");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold">Loan Categories</h2>
          <p className="text-xs text-gray-500">
            Add, edit, hide, reorder, or remove loan pages. Home cards and public loan pages update automatically.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => loadProducts()}
            disabled={loading || !password}
            variant="outline"
            className="h-10 rounded-xl"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button type="button" onClick={startNewProduct} className="h-10 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700">
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
      </div>

      {message && <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{message}</p>}
      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}

      <div className="mt-4 grid gap-4 lg:grid-cols-[280px_1fr]">
        <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
          <div className="max-h-[680px] space-y-2 overflow-y-auto pr-1">
            {products.map((product) => (
              <button
                key={product.id || product.slug}
                type="button"
                onClick={() => selectProduct(product)}
                className={`w-full rounded-lg border px-3 py-2 text-left transition-colors ${
                  product.slug === selectedSlug
                    ? "border-emerald-200 bg-emerald-50 text-emerald-800"
                    : "border-transparent bg-white text-gray-700 hover:border-gray-200"
                }`}
              >
                <span className="flex items-center justify-between gap-2">
                  <span className="text-sm font-bold">{product.title}</span>
                  {product.visible !== false ? <Eye className="h-3.5 w-3.5" /> : <EyeOff className="h-3.5 w-3.5" />}
                </span>
                <span className="mt-1 block truncate text-xs text-gray-500">/loans/{product.slug}</span>
              </button>
            ))}
            {!products.length && (
              <p className="px-2 py-8 text-center text-sm text-gray-500">
                {password ? "No loan categories found." : "Unlock admin to manage loan categories."}
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
              placeholder="Loan title, e.g. Personal Loan"
            />
            <Input
              value={draft.shortTitle}
              onChange={(event) => updateDraft({ shortTitle: event.target.value })}
              className="h-11 rounded-xl"
              placeholder="Short card title"
            />
            <div className="relative">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm font-medium text-gray-400">/loans/</span>
              <Input
                value={draft.slug}
                onChange={(event) => updateDraft({ slug: slugify(event.target.value) })}
                className="h-11 rounded-xl pl-16"
                placeholder="personal-loan"
              />
            </div>
            <div className="grid grid-cols-[1fr_100px] gap-3">
              <select
                value={draft.category}
                onChange={(event) => updateDraft({ category: event.target.value as LoanProduct["category"] })}
                className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm"
              >
                <option value="loan">Loan</option>
                <option value="tool">Tool</option>
                <option value="guide">Guide</option>
              </select>
              <Input
                type="number"
                value={draft.order || 0}
                onChange={(event) => updateDraft({ order: Number(event.target.value) })}
                className="h-11 rounded-xl"
                placeholder="Order"
              />
            </div>
            <Input
              value={draft.amount}
              onChange={(event) => updateDraft({ amount: event.target.value })}
              className="h-11 rounded-xl"
              placeholder="Amount"
            />
            <Input
              value={draft.rate}
              onChange={(event) => updateDraft({ rate: event.target.value })}
              className="h-11 rounded-xl"
              placeholder="Interest rate"
            />
            <Input
              value={draft.tenure}
              onChange={(event) => updateDraft({ tenure: event.target.value })}
              className="h-11 rounded-xl"
              placeholder="Tenure"
            />
            <Input
              value={draft.processing}
              onChange={(event) => updateDraft({ processing: event.target.value })}
              className="h-11 rounded-xl"
              placeholder="Processing"
            />
          </div>

          <select
            value={draft.purpose || ""}
            onChange={(event) => updateDraft({ purpose: event.target.value as LoanProduct["purpose"] })}
            className="h-11 rounded-xl border border-gray-200 bg-white px-3 text-sm"
          >
            {PURPOSES.map((purpose) => (
              <option key={purpose || "none"} value={purpose}>
                {purpose || "No pre-selected application purpose"}
              </option>
            ))}
          </select>

          <Textarea
            value={draft.description}
            onChange={(event) => updateDraft({ description: event.target.value })}
            className="min-h-20 rounded-xl"
            placeholder="SEO/page description"
          />
          <Textarea
            value={draft.summary}
            onChange={(event) => updateDraft({ summary: event.target.value })}
            className="min-h-20 rounded-xl"
            placeholder="Short card summary"
          />

          <div className="grid gap-3 md:grid-cols-2">
            <Textarea
              value={highlightsText}
              onChange={(event) => setHighlightsText(event.target.value)}
              className="min-h-36 rounded-xl"
              placeholder="Highlights, one per line"
            />
            <Textarea
              value={eligibilityText}
              onChange={(event) => setEligibilityText(event.target.value)}
              className="min-h-36 rounded-xl"
              placeholder="Eligibility points, one per line"
            />
            <Textarea
              value={documentsText}
              onChange={(event) => setDocumentsText(event.target.value)}
              className="min-h-36 rounded-xl"
              placeholder="Documents, one per line"
            />
            <Textarea
              value={faqsText}
              onChange={(event) => setFaqsText(event.target.value)}
              className="min-h-36 rounded-xl"
              placeholder="FAQs, one per line: Question | Answer"
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
              <input
                type="checkbox"
                checked={draft.visible !== false}
                onChange={(event) => updateDraft({ visible: event.target.checked })}
                className="h-4 w-4 rounded border-gray-300 text-emerald-600"
              />
              Show this loan category on website
            </label>

            <div className="flex gap-2">
              {selectedSlug && (
                <Button
                  type="button"
                  onClick={deleteProduct}
                  disabled={loading || !password}
                  variant="outline"
                  className="h-11 rounded-xl border-red-200 text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                  Delete
                </Button>
              )}
              <Button
                type="button"
                onClick={saveProduct}
                disabled={loading || !password}
                className="h-11 rounded-xl bg-gray-950 text-white hover:bg-gray-800"
              >
                <Save className="h-4 w-4" />
                Save Category
              </Button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
