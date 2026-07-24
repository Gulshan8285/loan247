"use client";

import { useEffect, useState } from "react";
import { Home, RefreshCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import type { HomePageSettings, SiteSettings } from "@/lib/site-settings";

type SiteSettingsResponse = {
  ok: boolean;
  error?: string;
  settings?: SiteSettings;
};

const EMPTY_HOME_PAGE: HomePageSettings = {
  seoTitle: "",
  seoDescription: "",
  badgeText: "",
  headline: "",
  amountText: "",
  description: "",
  trustLine: "",
};

export function HomePageManager({ password }: { password: string }) {
  const [homePage, setHomePage] = useState<HomePageSettings>(EMPTY_HOME_PAGE);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  async function loadSettings(nextPassword = password) {
    if (!nextPassword) return;

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/site-settings", {
        cache: "no-store",
        headers: {
          "x-admin-password": nextPassword,
        },
      });
      const payload = (await response.json()) as SiteSettingsResponse;

      if (!response.ok || !payload.ok || !payload.settings?.homePage) {
        throw new Error(payload.error || "Unable to load home page content");
      }

      setHomePage(payload.settings.homePage);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load home page content");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!password) return;
    const timer = window.setTimeout(() => {
      void loadSettings(password);
    }, 0);
    return () => window.clearTimeout(timer);
  }, [password]);

  function updateField(key: keyof HomePageSettings, value: string) {
    setHomePage((current) => ({ ...current, [key]: value }));
  }

  async function saveSettings() {
    if (!password) {
      setError("Please unlock admin2 first.");
      return;
    }

    setLoading(true);
    setError("");
    setMessage("");

    try {
      const response = await fetch("/api/admin/site-settings", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-admin-password": password,
        },
        body: JSON.stringify({ homePage }),
      });
      const payload = (await response.json()) as SiteSettingsResponse;

      if (!response.ok || !payload.ok || !payload.settings?.homePage) {
        throw new Error(payload.error || "Unable to save home page content");
      }

      setHomePage(payload.settings.homePage);
      setMessage("Home page content and SEO saved.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save home page content");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-base font-bold">
            <Home className="h-4 w-4 text-emerald-600" />
            Home Page & SEO
          </h2>
          <p className="text-xs text-gray-500">
            Edit home page text, SEO title, and SEO description.
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            onClick={() => loadSettings()}
            disabled={loading || !password}
            variant="outline"
            className="h-10 rounded-xl"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </Button>
          <Button
            type="button"
            onClick={saveSettings}
            disabled={loading || !password}
            className="h-10 rounded-xl bg-gray-950 text-white hover:bg-gray-800"
          >
            <Save className="h-4 w-4" />
            Save Home
          </Button>
        </div>
      </div>

      {message && <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{message}</p>}
      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}

      <div className="mt-4 grid gap-4">
        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">SEO Title</span>
            <Input
              value={homePage.seoTitle}
              onChange={(event) => updateField("seoTitle", event.target.value)}
              className="h-11 rounded-xl"
              placeholder="LOAN247 - Personal Loan Application Online"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Badge Text</span>
            <Input
              value={homePage.badgeText}
              onChange={(event) => updateField("badgeText", event.target.value)}
              className="h-11 rounded-xl"
              placeholder="Welcome to LOAN247"
            />
          </label>
        </div>

        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">SEO Description</span>
          <Textarea
            value={homePage.seoDescription}
            onChange={(event) => updateField("seoDescription", event.target.value)}
            className="min-h-20 rounded-xl"
            placeholder="Home page meta description"
          />
        </label>

        <div className="grid gap-3 md:grid-cols-2">
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Headline</span>
            <Input
              value={homePage.headline}
              onChange={(event) => updateField("headline", event.target.value)}
              className="h-11 rounded-xl"
              placeholder="Instant Personal Loans"
            />
          </label>
          <label className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Amount Text</span>
            <Input
              value={homePage.amountText}
              onChange={(event) => updateField("amountText", event.target.value)}
              className="h-11 rounded-xl"
              placeholder="Up to Rs. 8,00,000"
            />
          </label>
        </div>

        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Hero Description</span>
          <Textarea
            value={homePage.description}
            onChange={(event) => updateField("description", event.target.value)}
            className="min-h-24 rounded-xl"
            placeholder="Main home page description"
          />
        </label>

        <label className="grid gap-1.5">
          <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">Trust Line</span>
          <Input
            value={homePage.trustLine}
            onChange={(event) => updateField("trustLine", event.target.value)}
            className="h-11 rounded-xl"
            placeholder="RBI Registered NBFC · Bank-grade encryption · No impact on credit score"
          />
        </label>
      </div>
    </section>
  );
}
