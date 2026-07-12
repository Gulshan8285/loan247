/**
 * LoanLogo
 * The LOAN247 brand mark — a rounded badge with a rupee symbol, conveying
 * "loans available 24/7". Uses the brand gradient (blue → emerald).
 *
 * Pass a `size` prop (px) to control dimensions. Defaults to 32.
 */
export function LoanLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`relative inline-flex items-center justify-center rounded-xl bg-gradient-to-br from-blue-500 to-emerald-500 ${className}`}
      style={{ width: size, height: size }}
      aria-hidden
    >
      <svg
        width={size * 0.62}
        height={size * 0.62}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.4}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="text-white"
      >
        {/* Rupee symbol */}
        <path d="M6 3h12" />
        <path d="M6 8h12" />
        <path d="M6 13l9 8" />
        <path d="M6 13h3a5 5 0 0 0 0-10" />
      </svg>
    </span>
  );
}
