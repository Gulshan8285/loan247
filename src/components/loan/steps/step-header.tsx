"use client";

export function StepHeader({
  title,
  subtitle,
  badge,
}: {
  title: string;
  subtitle?: string;
  badge?: string;
}) {
  return (
    <div>
      {badge && (
        <span className="mb-3 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-[11px] font-medium uppercase tracking-wider text-emerald-700">
          {badge}
        </span>
      )}
      <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">{title}</h2>
      {subtitle && <p className="mt-1.5 text-sm text-gray-500 sm:text-base">{subtitle}</p>}
    </div>
  );
}
