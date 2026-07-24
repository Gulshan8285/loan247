import Link from "next/link";
import { ArrowLeft, Search } from "lucide-react";

export default function NotFound() {
  return (
    <main className="flex min-h-[70dvh] items-center justify-center bg-white px-4 py-16 text-center">
      <div className="max-w-lg">
        <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-50">
          <Search className="h-7 w-7 text-emerald-700" />
        </div>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.24em] text-emerald-600">
          404
        </p>
        <h1 className="mt-3 text-3xl font-black tracking-tight text-gray-950 sm:text-4xl">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-7 text-gray-500">
          The page you opened is not available. You can go back to LOAN247 and continue with
          loan categories, EMI calculator, or application flow.
        </p>
        <Link
          href="/"
          className="mt-7 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-blue-500 to-emerald-500 px-6 py-3 text-sm font-bold text-white shadow-sm transition hover:brightness-105"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Home
        </Link>
      </div>
    </main>
  );
}
