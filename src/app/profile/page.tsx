import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { LoanLogo } from "@/components/loan/loan-logo";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/profile");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-3xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <LoanLogo size={38} />
            <div>
              <p className="text-xs font-bold uppercase tracking-widest text-gray-400">Profile</p>
            </div>
          </Link>
          <LogoutButton />
        </div>
      </header>

      <section className="mx-auto max-w-3xl px-4 py-6 sm:px-6 sm:py-10">
        <Link
          href="/dashboard"
          className="mb-5 inline-flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-gray-950"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm sm:p-7">
          <h1 className="text-2xl font-bold tracking-tight text-gray-950">Profile</h1>
          <dl className="mt-6 divide-y divide-gray-100">
            <div className="grid gap-1 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Phone</dt>
              <dd className="text-sm font-semibold text-gray-950 sm:col-span-2">{user.phone}</dd>
            </div>
            <div className="grid gap-1 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Firebase UID</dt>
              <dd className="break-all text-sm font-semibold text-gray-950 sm:col-span-2">
                {user.firebaseUid}
              </dd>
            </div>
            <div className="grid gap-1 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Verified</dt>
              <dd className="text-sm font-semibold text-gray-950 sm:col-span-2">
                {user.isVerified ? "Yes" : "No"}
              </dd>
            </div>
            <div className="grid gap-1 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Created</dt>
              <dd className="text-sm font-semibold text-gray-950 sm:col-span-2">
                {new Intl.DateTimeFormat("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Asia/Kolkata",
                }).format(new Date(user.createdAt))}
              </dd>
            </div>
            <div className="grid gap-1 py-4 sm:grid-cols-3 sm:gap-4">
              <dt className="text-sm font-medium text-gray-500">Last login</dt>
              <dd className="text-sm font-semibold text-gray-950 sm:col-span-2">
                {new Intl.DateTimeFormat("en-IN", {
                  dateStyle: "medium",
                  timeStyle: "short",
                  timeZone: "Asia/Kolkata",
                }).format(new Date(user.lastLogin))}
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </main>
  );
}
