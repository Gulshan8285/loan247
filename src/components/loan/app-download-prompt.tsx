"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Download, ShieldCheck, Smartphone, X } from "lucide-react";

type AppDownloadPromptProps = {
  compact?: boolean;
};

const DOWNLOAD_ENDPOINT = "/api/app-download";

export function AppDownloadPrompt({ compact = false }: AppDownloadPromptProps) {
  const [open, setOpen] = useState(false);
  const [checking, setChecking] = useState(true);
  const [downloadReady, setDownloadReady] = useState(true);
  const [downloadStarted, setDownloadStarted] = useState(false);

  useEffect(() => {
    if (compact) return;
    const timer = window.setTimeout(() => setOpen(true), 450);
    return () => window.clearTimeout(timer);
  }, [compact]);

  useEffect(() => {
    let cancelled = false;

    async function checkDownload() {
      try {
        const response = await fetch(DOWNLOAD_ENDPOINT, {
          method: "HEAD",
          cache: "no-store",
          redirect: "manual",
        });
        if (!cancelled) {
          setDownloadReady(response.ok || response.type === "opaqueredirect" || response.status === 302);
        }
      } catch {
        if (!cancelled) {
          setDownloadReady(false);
        }
      } finally {
        if (!cancelled) {
          setChecking(false);
        }
      }
    }

    checkDownload();

    return () => {
      cancelled = true;
    };
  }, []);

  const statusText = useMemo(() => {
    if (checking) return "Preparing your app download...";
    if (downloadReady) return "Your app download is ready";
    return "Download is ready";
  }, [checking, downloadReady]);

  function startDownload() {
    if (checking) return;

    setDownloadStarted(true);

    const link = document.createElement("a");
    link.href = DOWNLOAD_ENDPOINT;
    link.download = "loan247.apk";
    link.rel = "noopener";
    document.body.appendChild(link);
    link.click();
    link.remove();
  }

  const downloadButton = (
    <button
      type="button"
      onClick={startDownload}
      disabled={checking}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 ${
        compact ? "px-3 py-2" : "w-full px-5 py-3"
      }`}
    >
      <Download className="h-4 w-4" />
      Download App
    </button>
  );

  if (compact) {
    return downloadButton;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 bottom-4 z-40 inline-flex h-12 w-12 items-center justify-center rounded-full bg-gray-950 text-white shadow-lg shadow-gray-900/20 transition hover:bg-gray-800 sm:hidden"
        aria-label="Download LOAN247 app"
      >
        <Download className="h-5 w-5" />
      </button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-950/55 px-4 py-6 backdrop-blur-sm">
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-2xl shadow-gray-900/20">
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="absolute right-3 top-3 inline-flex h-9 w-9 items-center justify-center rounded-full text-gray-500 transition hover:bg-gray-100 hover:text-gray-800"
              aria-label="Close app download popup"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="border-b border-gray-100 px-6 pb-5 pt-7">
              <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                <Smartphone className="h-6 w-6" />
              </div>
              <h2 className="pr-10 text-2xl font-bold tracking-tight text-gray-950">LOAN247 App Download</h2>
              <p className="mt-2 text-sm leading-6 text-gray-600">
                Download the LOAN247 app to continue your loan application faster. Tap the button and the download will start automatically.
              </p>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <CheckCircle2 className="mb-2 h-4 w-4 text-emerald-600" />
                  <p className="text-sm font-semibold text-gray-900">Quick application</p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">Complete your loan journey faster on mobile.</p>
                </div>
                <div className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <ShieldCheck className="mb-2 h-4 w-4 text-blue-600" />
                  <p className="text-sm font-semibold text-gray-900">Secure access</p>
                  <p className="mt-1 text-xs leading-5 text-gray-500">Downloads are served from the official LOAN247 website.</p>
                </div>
              </div>

              <div className="flex items-center justify-between gap-3 rounded-xl border border-gray-100 px-3 py-2.5">
                <span className="text-xs font-medium text-gray-500">{statusText}</span>
                <span
                  className={`h-2.5 w-2.5 rounded-full ${
                    checking ? "bg-amber-400" : downloadReady ? "bg-emerald-500" : "bg-red-400"
                  }`}
                />
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <div className="flex-1">{downloadButton}</div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="inline-flex items-center justify-center rounded-xl border border-gray-200 px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
                >
                  Later
                </button>
              </div>

              {downloadStarted && (
                <p className="rounded-xl bg-emerald-50 px-3 py-2 text-xs font-medium text-emerald-700">
                  Download started. If your browser asks, choose Allow or Keep to save the file.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
