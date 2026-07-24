"use client";

import { useEffect, useState } from "react";
import { Eye, EyeOff, Lock, Newspaper, Settings2 } from "lucide-react";
import { BlogPostsManager } from "@/components/admin/blog-posts-manager";
import { LegalPagesManager } from "@/components/admin/legal-pages-manager";
import { LoanProductsManager } from "@/components/admin/loan-products-manager";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ContentAdminPage() {
  const [password, setPassword] = useState("");
  const [unlockedPassword, setUnlockedPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  function unlock() {
    setUnlockedPassword(password);
  }

  useEffect(() => {
    const clearAdminSession = () => {
      setPassword("");
      setUnlockedPassword("");
    };

    const clearWhenHidden = () => {
      if (document.visibilityState === "hidden") clearAdminSession();
    };

    window.addEventListener("pagehide", clearAdminSession);
    window.addEventListener("beforeunload", clearAdminSession);
    document.addEventListener("visibilitychange", clearWhenHidden);
    return () => {
      clearAdminSession();
      window.removeEventListener("pagehide", clearAdminSession);
      window.removeEventListener("beforeunload", clearAdminSession);
      document.removeEventListener("visibilitychange", clearWhenHidden);
    };
  }, []);

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 text-gray-950 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              LOAN247 Admin 2
            </p>
            <h1 className="mt-1 flex items-center gap-2 text-2xl font-black tracking-tight sm:text-3xl">
              <Settings2 className="h-6 w-6 text-emerald-600" />
              Content Dashboard
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-gray-500">
              Manage loan category pages, legal/footer pages, and website blog posts.
            </p>
          </div>

          <div className="flex flex-col gap-2 sm:w-[420px] sm:flex-row">
            <div className="relative flex-1">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") unlock();
                }}
                placeholder="Admin2 password"
                className="h-11 rounded-xl bg-white pl-10 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword((visible) => !visible)}
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button
              type="button"
              onClick={unlock}
              disabled={!password}
              className="h-11 rounded-xl bg-emerald-600 px-5 text-white hover:bg-emerald-700"
            >
              Unlock
            </Button>
          </div>
        </header>

        {!unlockedPassword && (
          <section className="rounded-xl border border-gray-200 bg-white p-6 text-center">
            <Newspaper className="mx-auto h-8 w-8 text-emerald-600" />
            <h2 className="mt-3 text-lg font-black">Unlock content admin</h2>
            <p className="mt-1 text-sm text-gray-500">
              Enter the Admin2 password to edit loan pages, legal pages, and blogs.
            </p>
          </section>
        )}

        {unlockedPassword && (
          <>
            <LoanProductsManager password={unlockedPassword} />
            <LegalPagesManager password={unlockedPassword} />
            <BlogPostsManager password={unlockedPassword} />
          </>
        )}
      </div>
    </main>
  );
}
