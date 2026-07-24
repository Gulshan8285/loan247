/**
 * LoanLogo
 * The LOAN247 brand wordmark. Pass a `size` prop (px) to control height.
 */
export function LoanLogo({ size = 32, className = "" }: { size?: number; className?: string }) {
  return (
    <span
      className={`relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-xl bg-[#10a7ac] shadow-sm shadow-teal-700/15 ring-1 ring-teal-900/10 ${className}`}
      style={{ width: Math.round(size * 3.2), height: size }}
      aria-hidden
    >
      <img
        src="/images/loan247-logo-wordmark.jpg"
        alt=""
        className="h-full w-full object-contain"
        draggable={false}
      />
    </span>
  );
}
