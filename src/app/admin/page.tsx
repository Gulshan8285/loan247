"use client";

import { useEffect, useMemo, useState } from "react";
import {
  BadgeIndianRupee,
  Download,
  Eye,
  EyeOff,
  FileJson,
  KeyRound,
  Lock,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { LoanApplicationRecord } from "@/lib/application-store";
import { formatINR } from "@/lib/loan-store";

type AdminResponse = {
  ok: boolean;
  error?: string;
  applications?: LoanApplicationRecord[];
  stats?: {
    total: number;
    paid: number;
    paymentOpened: number;
    cancelled: number;
    totalPaidAmount: number;
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

function csvEscape(value: unknown) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function exportRows(applications: LoanApplicationRecord[]) {
  return applications.map((application) => ({
    reference: application.reference,
    status: application.paymentStatus,
    createdAt: application.createdAt,
    updatedAt: application.updatedAt,
    paymentAmount: application.paymentAmount,
    paymentProvider: application.paymentProvider,
    paymentLink: application.paymentLink,
    firstName: application.data.firstName,
    lastName: application.data.lastName,
    email: application.data.googleEmail,
    phone: application.data.phone,
    address: application.data.address,
    dob: application.data.dob,
    pincode: application.data.pincode,
    panCard: application.data.panCard,
    loanAmount: application.data.loanAmount,
    cibilApprovedAmount: application.data.cibilApprovedAmount,
    accountHolderName: application.data.accountHolderName,
    accountNumber: application.data.accountNumber,
    ifscCode: application.data.ifscCode,
    bankName: application.data.bankName,
    branch: application.data.branch,
    purpose: application.data.purpose,
    occupation: application.data.occupation,
    monthlyIncome: application.data.monthlyIncome,
    salaryMode: application.data.salaryMode,
  }));
}

function downloadBlob(filename: string, content: string, type: string) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export default function AdminPage() {
  const [password, setPassword] = useState(() =>
    typeof window === "undefined" ? "" : sessionStorage.getItem("loan247-admin-password") || "",
  );
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [applications, setApplications] = useState<LoanApplicationRecord[]>([]);
  const [stats, setStats] = useState<AdminResponse["stats"]>();
  const [passwordForm, setPasswordForm] = useState({
    email: "Gulshanyadav62000@gmail.com",
    currentPassword: "",
    newPassword: "",
  });
  const [passwordMessage, setPasswordMessage] = useState("");

  async function loadApplications(nextPassword = password) {
    if (!nextPassword) return;

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/admin/applications", {
        cache: "no-store",
        headers: {
          "x-admin-password": nextPassword,
        },
      });
      const payload = (await response.json()) as AdminResponse;

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to load admin data");
      }

      sessionStorage.setItem("loan247-admin-password", nextPassword);
      setApplications(payload.applications || []);
      setStats(payload.stats);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Unable to load admin data");
      setApplications([]);
      setStats(undefined);
    } finally {
      setLoading(false);
    }
  }

  const filteredApplications = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return applications;

    return applications.filter((application) => {
      const data = application.data;
      return [
        application.reference,
        data.firstName,
        data.lastName,
        data.googleEmail,
        data.phone,
        data.address,
        data.panCard,
        data.pincode,
        data.bankName,
        data.ifscCode,
        application.paymentStatus,
      ]
        .join(" ")
        .toLowerCase()
        .includes(needle);
    });
  }, [applications, query]);

  const statCards = [
    { label: "Total applications", value: stats?.total ?? 0, icon: Users },
    { label: "Paid payments", value: stats?.paid ?? 0, icon: ShieldCheck },
    { label: "Payment opened", value: stats?.paymentOpened ?? 0, icon: RefreshCw },
    {
      label: "Paid amount",
      value: `₹${formatINR(stats?.totalPaidAmount ?? 0)}`,
      icon: BadgeIndianRupee,
    },
  ];

  async function changePassword() {
    setLoading(true);
    setPasswordMessage("");
    setError("");

    try {
      const response = await fetch("/api/admin/password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(passwordForm),
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Unable to change password");
      }

      setPassword(passwordForm.newPassword);
      sessionStorage.setItem("loan247-admin-password", passwordForm.newPassword);
      setPasswordForm((form) => ({ ...form, currentPassword: "", newPassword: "" }));
      setPasswordMessage("Password changed successfully.");
    } catch (changeError) {
      setError(changeError instanceof Error ? changeError.message : "Unable to change password");
    } finally {
      setLoading(false);
    }
  }

  function downloadData(format: "json" | "csv") {
    const rows = exportRows(applications);
    const date = new Date().toISOString().slice(0, 10);

    if (format === "json") {
      downloadBlob(
        `loan247-applications-${date}.json`,
        JSON.stringify(applications, null, 2),
        "application/json",
      );
      return;
    }

    const headers = Object.keys(rows[0] || {});
    const csv = [
      headers.join(","),
      ...rows.map((row) => headers.map((header) => csvEscape(row[header as keyof typeof row])).join(",")),
    ].join("\n");

    downloadBlob(`loan247-applications-${date}.csv`, csv, "text/csv;charset=utf-8");
  }

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-6 text-gray-950 sm:px-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <header className="flex flex-col justify-between gap-4 border-b border-gray-200 pb-5 sm:flex-row sm:items-center">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-600">
              LOAN247 Admin
            </p>
            <h1 className="mt-1 text-2xl font-black tracking-tight sm:text-3xl">
              Applications Dashboard
            </h1>
          </div>
          <div className="flex flex-col gap-2 sm:w-[420px] sm:flex-row">
            <div className="relative flex-1">
              <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === "Enter") void loadApplications();
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
              onClick={() => loadApplications()}
              disabled={loading || !password}
              className="h-11 rounded-xl bg-emerald-600 px-5 text-white hover:bg-emerald-700"
            >
              {loading ? "Loading..." : "Unlock"}
            </Button>
          </div>
        </header>

        {error && (
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm font-medium text-red-700">
            {error}
          </div>
        )}

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {statCards.map((card) => (
            <div key={card.label} className="rounded-xl border border-gray-200 bg-white p-4">
              <div className="flex items-center justify-between">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  {card.label}
                </p>
                <card.icon className="h-4 w-4 text-emerald-600" />
              </div>
              <p className="mt-3 text-2xl font-black tracking-tight">{card.value}</p>
            </div>
          ))}
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <KeyRound className="h-4 w-4 text-emerald-600" />
            <h2 className="text-base font-bold">Change Admin Password</h2>
          </div>
          <div className="grid gap-3 lg:grid-cols-4">
            <Input
              value={passwordForm.email}
              onChange={(event) =>
                setPasswordForm((form) => ({ ...form, email: event.target.value }))
              }
              className="h-11 rounded-xl"
              placeholder="Authorized email"
            />
            <div className="relative">
              <Input
                type={showCurrentPassword ? "text" : "password"}
                value={passwordForm.currentPassword}
                onChange={(event) =>
                  setPasswordForm((form) => ({ ...form, currentPassword: event.target.value }))
                }
                className="h-11 rounded-xl pr-10"
                placeholder="Current password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword((visible) => !visible)}
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label={showCurrentPassword ? "Hide current password" : "Show current password"}
                title={showCurrentPassword ? "Hide current password" : "Show current password"}
              >
                {showCurrentPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <div className="relative">
              <Input
                type={showNewPassword ? "text" : "password"}
                value={passwordForm.newPassword}
                onChange={(event) =>
                  setPasswordForm((form) => ({ ...form, newPassword: event.target.value }))
                }
                className="h-11 rounded-xl pr-10"
                placeholder="New password"
              />
              <button
                type="button"
                onClick={() => setShowNewPassword((visible) => !visible)}
                className="absolute right-3 top-1/2 flex h-7 w-7 -translate-y-1/2 items-center justify-center rounded-lg text-gray-400 transition-colors hover:bg-gray-100 hover:text-gray-700"
                aria-label={showNewPassword ? "Hide new password" : "Show new password"}
                title={showNewPassword ? "Hide new password" : "Show new password"}
              >
                {showNewPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            <Button
              type="button"
              onClick={changePassword}
              disabled={loading || !passwordForm.currentPassword || passwordForm.newPassword.length < 8}
              className="h-11 rounded-xl bg-gray-950 px-5 text-white hover:bg-gray-800"
            >
              Change Password
            </Button>
          </div>
          {passwordMessage && (
            <p className="mt-2 text-sm font-medium text-emerald-700">{passwordMessage}</p>
          )}
          <p className="mt-2 text-xs text-gray-500">
            Only Gulshanyadav62000@gmail.com is allowed to change this password.
          </p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white">
          <div className="flex flex-col gap-3 border-b border-gray-200 p-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-base font-bold">Applicant Data</h2>
              <p className="text-xs text-gray-500">
                Records are retained in private storage and are not deletable from this panel.
              </p>
            </div>
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <Button
                type="button"
                onClick={() => downloadData("csv")}
                disabled={!applications.length}
                variant="outline"
                className="h-10 rounded-xl"
              >
                <Download className="h-4 w-4" />
                CSV
              </Button>
              <Button
                type="button"
                onClick={() => downloadData("json")}
                disabled={!applications.length}
                variant="outline"
                className="h-10 rounded-xl"
              >
                <FileJson className="h-4 w-4" />
                JSON
              </Button>
              <div className="relative sm:w-80">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                <Input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search name, PAN, email, bank..."
                  className="h-10 rounded-xl pl-10"
                />
              </div>
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Reference</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Phone</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>DOB</TableHead>
                <TableHead>Pincode</TableHead>
                <TableHead>PAN</TableHead>
                <TableHead>Loan</TableHead>
                <TableHead>Bank</TableHead>
                <TableHead>Account Holder</TableHead>
                <TableHead>Account</TableHead>
                <TableHead>IFSC</TableHead>
                <TableHead>Updated</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredApplications.map((application) => (
                <TableRow key={application.id}>
                  <TableCell className="font-semibold">{application.reference}</TableCell>
                  <TableCell>
                    <Badge className={statusClass(application.paymentStatus)} variant="outline">
                      {statusLabel(application.paymentStatus)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {[application.data.firstName, application.data.lastName].filter(Boolean).join(" ") ||
                      "-"}
                  </TableCell>
                  <TableCell>{application.data.googleEmail || "-"}</TableCell>
                  <TableCell>{application.data.phone || "-"}</TableCell>
                  <TableCell className="max-w-[320px] whitespace-normal">
                    {application.data.address || "-"}
                  </TableCell>
                  <TableCell>{application.data.dob || "-"}</TableCell>
                  <TableCell>{application.data.pincode || "-"}</TableCell>
                  <TableCell>{application.data.panCard || "-"}</TableCell>
                  <TableCell>₹{formatINR(application.data.loanAmount || 0)}</TableCell>
                  <TableCell>{application.data.bankName || "-"}</TableCell>
                  <TableCell>{application.data.accountHolderName || "-"}</TableCell>
                  <TableCell>{application.data.accountNumber || "-"}</TableCell>
                  <TableCell>{application.data.ifscCode || "-"}</TableCell>
                  <TableCell>
                    {new Date(application.updatedAt).toLocaleString("en-IN", {
                      dateStyle: "medium",
                      timeStyle: "short",
                    })}
                  </TableCell>
                </TableRow>
              ))}
              {!filteredApplications.length && (
                <TableRow>
                  <TableCell className="py-10 text-center text-sm text-gray-500" colSpan={15}>
                    {applications.length ? "No matching applications found." : "No applications found yet."}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </section>
      </div>
    </main>
  );
}
