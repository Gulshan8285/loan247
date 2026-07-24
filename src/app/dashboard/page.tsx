import Link from "next/link";
import { redirect } from "next/navigation";
import { BadgeCheck, Clock3, UserRound } from "lucide-react";
import { LogoutButton } from "@/components/LogoutButton";
import { LoanLogo } from "@/components/loan/loan-logo";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  return (
    <main className="min-h-screen bg-gray-50">
      <header className="border-b border-gray-100 bg-white">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-3 px-4 py-4 sm:px-6">
          <Link href="/dashboard" className="flex items-center gap-2.5">
            <LoanLogo size={34} />
            <div>
              <p className="text-sm font-bold tracking-tight text-gray-950">LOAN247</p>
              <p className="text-[10px] uppercase tracking-widest text-gray-400">Dashboard</p>
            </div>
          </Link>
          <LogoutButton />
        </div>
      </header>

      <section className="mx-auto max-w-5xl px-4 py-6 sm:px-6 sm:py-10">
        <div className="mb-6">
          <p className="text-sm font-semibold text-blue-600">Welcome back</p>
          <h1 className="mt-1 text-2xl font-bold tracking-tight text-gray-950 sm:text-3xl">
            Your Loan247 account
          </h1>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <UserRound className="h-5 w-5 text-blue-600" />
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-gray-400">
              Mobile
            </p>
            <p className="mt-1 text-lg font-bold text-gray-950">{user.phone}</p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <BadgeCheck className="h-5 w-5 text-emerald-600" />
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-gray-400">
              Status
            </p>
            <p className="mt-1 text-lg font-bold text-gray-950">
              {user.isVerified ? "Verified" : "Pending"}
            </p>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
            <Clock3 className="h-5 w-5 text-amber-600" />
            <p className="mt-4 text-xs font-medium uppercase tracking-wider text-gray-400">
              Last login
            </p>
            <p className="mt-1 text-lg font-bold text-gray-950">
              {new Intl.DateTimeFormat("en-IN", {
                dateStyle: "medium",
                timeStyle: "short",
                timeZone: "Asia/Kolkata",
              }).format(new Date(user.lastLogin))}
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/"
            className="rounded-xl bg-gradient-to-r from-blue-600 to-emerald-500 px-5 py-3 text-sm font-semibold text-white shadow-sm transition hover:brightness-105"
          >
            Start loan journey
          </Link>
          <Link
            href="/profile"
            className="rounded-xl border border-gray-200 bg-white px-5 py-3 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            View profile
          </Link>
        </div>
      </section>
    </main>
  );
}
