"use client";

import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Download, Menu, PlusSquare, ShieldCheck, Smartphone, X } from "lucide-react";

type AppDownloadPromptProps = {
  compact?: boolean;
};

type InstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
};

function isRunningStandalone() {
  if (typeof window === "undefined") return false;
  const navigatorWithStandalone = window.navigator as Navigator & { standalone?: boolean };
  return window.matchMedia("(display-mode: standalone)").matches || navigatorWithStandalone.standalone === true;
}

export function AppDownloadPrompt({ compact = false }: AppDownloadPromptProps) {
  const [open, setOpen] = useState(false);
  const [installPrompt, setInstallPrompt] = useState<InstallPromptEvent | null>(null);
  const [installing, setInstalling] = useState(false);
  const [installed, setInstalled] = useState(() => isRunningStandalone());
  const [manualStepsOpen, setManualStepsOpen] = useState(false);

  useEffect(() => {
    if (compact) return;
    const timer = window.setTimeout(() => setOpen(true), 450);
    return () => window.clearTimeout(timer);
  }, [compact]);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => undefined);
    }

    function handleBeforeInstallPrompt(event: Event) {
      event.preventDefault();
      setInstallPrompt(event as InstallPromptEvent);
    }

    function handleInstalled() {
      setInstalled(true);
      setInstallPrompt(null);
      setManualStepsOpen(false);
    }

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    window.addEventListener("appinstalled", handleInstalled);

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
      window.removeEventListener("appinstalled", handleInstalled);
    };
  }, []);

  const canInstall = Boolean(installPrompt) && !installed;

  const statusText = useMemo(() => {
    if (installed) return "LOAN247 is already available in app mode";
    if (canInstall) return "Your LOAN247 app is ready to install";
    return "Install LOAN247 from your browser menu";
  }, [canInstall, installed]);

  async function startInstall() {
    if (installed) {
      setOpen(false);
      return;
    }

    if (!installPrompt) {
      setManualStepsOpen(true);
      setOpen(true);
      return;
    }

    setInstalling(true);
    try {
      await installPrompt.prompt();
      const choice = await installPrompt.userChoice;
      if (choice.outcome === "accepted") {
        setInstalled(true);
        setOpen(false);
      }
      setInstallPrompt(null);
    } finally {
      setInstalling(false);
    }
  }

  const downloadButton = (
    <button
      type="button"
      onClick={startInstall}
      disabled={installing}
      className={`inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white shadow-sm transition-all hover:bg-emerald-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-gray-300 disabled:text-gray-500 ${
        compact ? "px-3 py-2" : "w-full px-5 py-3"
      }`}
    >
      <Download className="h-4 w-4" />
      {installing ? "Installing..." : installed ? "App Installed" : "Download App"}
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
                Install LOAN247 on your phone or desktop. It opens in a clean app window, without browser tabs, and keeps your loan journey fast.
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
                    installed || canInstall ? "bg-emerald-500" : "bg-amber-400"
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

              {manualStepsOpen && !installed && (
                <div className="space-y-2 rounded-xl bg-amber-50 px-3 py-3 text-xs leading-5 text-amber-800">
                  <p className="font-semibold text-amber-900">If the install popup does not appear:</p>
                  <p className="flex gap-2">
                    <Menu className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    Open your browser menu.
                  </p>
                  <p className="flex gap-2">
                    <PlusSquare className="mt-0.5 h-3.5 w-3.5 shrink-0" />
                    Choose <span className="font-semibold">Install app</span> or{" "}
                    <span className="font-semibold">Add to Home Screen</span>.
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
