import { redirect } from "next/navigation";
import { PhoneLogin } from "@/components/PhoneLogin";
import { LoanLogo } from "@/components/loan/loan-logo";
import { getCurrentUser } from "@/lib/auth";

export const dynamic = "force-dynamic";

type LoginPageProps = {
  searchParams?: Promise<{
    next?: string;
  }>;
};

export default async function LoginPage({ searchParams }: LoginPageProps) {
  const user = await getCurrentUser();

  if (user) {
    redirect("/dashboard");
  }

  const params = searchParams ? await searchParams : {};
  const nextPath = params.next?.startsWith("/") ? params.next : "/dashboard";

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f8fbff_0%,#ffffff_45%,#f0fdf4_100%)] px-4 py-6 sm:px-6">
      <div className="mx-auto flex min-h-[calc(100vh-3rem)] w-full max-w-md flex-col justify-center">
        <div className="mb-7 flex items-center justify-center gap-3">
          <LoanLogo size={48} />
        </div>

        <section className="rounded-[1.75rem] border border-gray-100 bg-white p-5 shadow-xl shadow-blue-100/40 sm:p-7">
          <div className="mb-6 text-center">
            <p className="text-sm font-semibold text-blue-600">Secure login</p>
            <h1 className="mt-2 text-2xl font-bold tracking-tight text-gray-950">
              Continue to Loan247
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-gray-500">
              Verify your +91 mobile number with OTP to access your account.
            </p>
          </div>

          <PhoneLogin mode="embedded" nextPath={nextPath} />
        </section>
      </div>
    </main>
  );
}
