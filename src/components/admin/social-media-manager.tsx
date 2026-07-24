"use client";

import { useEffect, useState } from "react";
import { RefreshCw, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { SiteSettings, SocialLinkKey } from "@/lib/site-settings";

type SiteSettingsResponse = {
  ok: boolean;
  error?: string;
  settings?: SiteSettings;
};

const SOCIAL_FIELDS: Array<{ key: SocialLinkKey; label: string; placeholder: string }> = [
  { key: "twitter", label: "X / Twitter", placeholder: "https://twitter.com/loan247online" },
  { key: "linkedin", label: "LinkedIn", placeholder: "https://www.linkedin.com/company/loan247-online" },
  { key: "facebook", label: "Facebook", placeholder: "https://facebook.com/..." },
  { key: "instagram", label: "Instagram", placeholder: "https://instagram.com/..." },
  { key: "youtube", label: "YouTube", placeholder: "https://youtube.com/..." },
];

const EMPTY_SETTINGS: SiteSettings = {
  socialLinks: {
    twitter: "",
    linkedin: "",
    facebook: "",
    instagram: "",
    youtube: "",
  },
  updatedAt: "",
};

export function SocialMediaManager({ password }: { password: string }) {
  const [settings, setSettings] = useState<SiteSettings>(EMPTY_SETTINGS);
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

      if (!response.ok || !payload.ok || !payload.settings) {
        throw new Error(payload.error || "Unable to load social media settings");
      }

      setSettings(payload.settings);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load social media settings");
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

  function updateSocialLink(key: SocialLinkKey, value: string) {
    setSettings((current) => ({
      ...current,
      socialLinks: {
        ...current.socialLinks,
        [key]: value,
      },
    }));
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
        body: JSON.stringify({
          socialLinks: settings.socialLinks,
        }),
      });
      const payload = (await response.json()) as SiteSettingsResponse;

      if (!response.ok || !payload.ok || !payload.settings) {
        throw new Error(payload.error || "Unable to save social media settings");
      }

      setSettings(payload.settings);
      setMessage("Social media links saved. Footer has been updated.");
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : "Unable to save social media settings");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="rounded-xl border border-gray-200 bg-white p-4">
      <div className="flex flex-col gap-3 border-b border-gray-100 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-base font-bold">Social Media</h2>
          <p className="text-xs text-gray-500">
            Add or update footer social media links. Blank fields are hidden on the website.
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
            Save Social
          </Button>
        </div>
      </div>

      {message && <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-medium text-emerald-700">{message}</p>}
      {error && <p className="mt-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-red-700">{error}</p>}

      <div className="mt-4 grid gap-3 md:grid-cols-2">
        {SOCIAL_FIELDS.map((field) => (
          <label key={field.key} className="grid gap-1.5">
            <span className="text-xs font-semibold uppercase tracking-wide text-gray-500">
              {field.label}
            </span>
            <Input
              value={settings.socialLinks[field.key] || ""}
              onChange={(event) => updateSocialLink(field.key, event.target.value)}
              className="h-11 rounded-xl"
              placeholder={field.placeholder}
            />
          </label>
        ))}
      </div>
    </section>
  );
}
