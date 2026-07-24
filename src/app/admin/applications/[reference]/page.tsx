"use client";

import Link from "next/link";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { ArrowLeft, Copy, ExternalLink, Eye, EyeOff, Lock, RefreshCw } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import type { LoanApplicationRecord } from "@/lib/application-store";
import { formatINR } from "@/lib/loan-store";

type ApplicationResponse = {
  ok: boolean;
  error?: string;
  application?: LoanApplicationRecord;
  storage?: {
    type: string;
    location: string;
  };
};

function statusLabel(status: LoanApplicationRecord["paymentStatus"]) {
  if (status === "paid") return "Paid";
  if (status === "rejected") return "Rejected";
  return "Pending";
}

function statusClass(status: LoanApplicationRecord["paymentStatus"]) {
  if (status === "paid") return "border-emerald-200 bg-emerald-50 text-emerald-700";
  if (status === "rejected") return "border-amber-200 bg-amber-50 text-amber-700";
  return "border-blue-200 bg-blue-50 text-blue-700";
}

function DetailField({ label, value }: { label: string; value: unknown }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-4">
      <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">{label}</p>
      <p className="mt-1 break-words text-sm font-bold text-gray-950">{String(value || "-")}</p>
    </div>
  );
}

export default function AdminApplicationDetailPage() {
  const params = useParams<{ reference: string }>();
  const reference = decodeURIComponent(params.reference || "");
  const [password, setPassword] = useState(() =>
    typeof window === "undefined" ? "" : sessionStorage.getItem("loan247-admin-password") || "",
  );
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [application, setApplication] = useState<LoanApplicationRecord | null>(null);
  const [storage, setStorage] = useState<ApplicationResponse["storage"]>();

  const adminLink = useMemo(() => {
    if (typeof window === "undefined") return `/admin/applications/${encodeURIComponent(reference)}`;
    return `${window.location.origin}/admin/applications/${encodeURIComponent(reference)}`;
  }, [reference]);

  async function loadApplication(nextPassword = password) {
    if (!nextPassword || !reference) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch(`/api/admin/applications/${encodeURIComponent(reference)}`, {
        cache: "no-store",
        headers: {
          "x-admin-password": nextPassword,
        },
      });
      const payload = (await response.json()) as ApplicationResponse;

      if (!response.ok || !payload.ok || !payload.application) {
        throw new Error(payload.error || "Unable to load application");
      }

      sessionStorage.setItem("loan247-admin-password", nextPassword);
      setApplication(payload.application);
      setStorage(payload.storage);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load application");
      setApplication(null);
      setStorage(undefined);
    } finally {
      setLoading(false);
    }
  }

  async function copyLink() {
    await navigator.clipboard.writeText(adminLink);
    setCopied(true);
    window.setTimeout(() => setCopied(false), 1600);
  }

  useEffect(() => {
    if (password) void loadApplication(password);
    // loadApplication intentionally stays outside deps to avoid refetching on every password edit.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reference]);

  const data = application?.data;

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 text-gray-950 sm:px-6">
      <div className="mx-auto max-w-6xl space-y-5">
        <header className="flex flex-col justify-between gap-4 border-b border-gray-200 pb-5 lg:flex-row lg:items-center">
          <div>
            <Link
              href="/admin"
              className="mb-3 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-950"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to admin
            </Link>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              LOAN247 Admin Detail
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
              Application {reference}
            </h1>
          </div>

          <div className="flex flex-col gap-2 sm:w-[460px] sm:flex-row">
            <div className="relative flex-1">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void loadApplication();
                }}
                placeholder="Admin password"
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
              onClick={() => loadApplication()}
              disabled={loading || !password}
              className="h-11 rounded-xl bg-emerald-600 px-5 text-white hover:bg-emerald-700"
            >
              <RefreshCw className="h-4 w-4" />
              {loading ? "Loading..." : "Load"}
            </Button>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        {application && data && (
          <>
            <section className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge className={statusClass(application.paymentStatus)} variant="outline">
                      {statusLabel(application.paymentStatus)}
                    </Badge>
                    <Badge variant="outline" className="border-gray-200 bg-gray-50 text-gray-700">
                      {application.lastStepLabel || "Application captured"}
                    </Badge>
                  </div>
                  <h2 className="mt-3 text-xl font-black">
                    {[data.firstName, data.lastName].filter(Boolean).join(" ") || "Applicant"}
                  </h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Stored in {storage?.type || "private storage"}
                    {storage?.location ? ` (${storage.location})` : ""}.
                  </p>
                </div>

                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="outline" className="h-10 rounded-xl" onClick={copyLink}>
                    <Copy className="h-4 w-4" />
                    {copied ? "Copied" : "Copy admin link"}
                  </Button>
                  {application.paymentLink && (
                    <Button asChild variant="outline" className="h-10 rounded-xl">
                      <a href={application.paymentLink}>
                        <ExternalLink className="h-4 w-4" />
                        Payment link
                      </a>
                    </Button>
                  )}
                </div>
              </div>
            </section>

            <section className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
              <DetailField label="Reference" value={application.reference} />
              <DetailField label="Created" value={new Date(application.createdAt).toLocaleString("en-IN")} />
              <DetailField label="Updated" value={new Date(application.updatedAt).toLocaleString("en-IN")} />
              <DetailField label="Processing fee" value={`₹${formatINR(application.paymentAmount || 0)}`} />
              <DetailField label="First name" value={data.firstName} />
              <DetailField label="Last name" value={data.lastName} />
              <DetailField label="DOB" value={data.dob} />
              <DetailField label="Phone" value={data.phone} />
              <DetailField label="Google name" value={data.googleName} />
              <DetailField label="Google email" value={data.googleEmail} />
              <DetailField label="PAN" value={data.panCard} />
              <DetailField label="Pincode" value={data.pincode} />
              <DetailField label="Loan amount" value={`₹${formatINR(data.loanAmount || 0)}`} />
              <DetailField label="CIBIL approved amount" value={`₹${formatINR(data.cibilApprovedAmount || 0)}`} />
              <DetailField label="Purpose" value={data.purpose} />
              <DetailField label="Occupation" value={data.occupation} />
              <DetailField label="Monthly income" value={data.monthlyIncome} />
              <DetailField label="Salary mode" value={data.salaryMode} />
              <DetailField label="Account holder" value={data.accountHolderName} />
              <DetailField label="Account number" value={data.accountNumber} />
              <DetailField label="IFSC" value={data.ifscCode} />
              <DetailField label="Bank" value={data.bankName} />
              <DetailField label="Branch" value={data.branch} />
              <DetailField label="Payment provider" value={application.paymentProvider} />
            </section>

            <section className="rounded-xl border border-gray-200 bg-white p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wide text-gray-400">
                Full address
              </p>
              <p className="mt-1 text-sm font-semibold text-gray-950">{data.address || "-"}</p>
            </section>
          </>
        )}
      </div>
    </main>
  );
}
