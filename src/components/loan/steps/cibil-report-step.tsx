"use client";

import { useEffect, useRef, useState } from "react";
import { AlertTriangle, Check, ShieldCheck } from "lucide-react";
import { useLoanStore } from "@/lib/loan-store";

/**
 * CibilReportStep
 * Shown right after the Analyser. Displays:
 *  - A semicircular CIBIL meter gauge with the needle in the "low" zone (~640)
 *  - "Your CIBIL is low, but don't worry — we're here to help" message
 *  - A 10-second countdown timer ("calculating your approved loan amount")
 *  - Reveals the eligible loan amount at the end, then auto-advances.
 */
export const CIBIL_TIMER_MS = 10_000;
const CIBIL_SCORE = 642; // low zone
const ELIGIBLE_AMOUNT = 800000; // ₹8,00,000

export function CibilReportStep() {
  const goNext = useLoanStore((s) => s.goNext);
  const firstName = useLoanStore((s) => s.data.firstName);
  const [remaining, setRemaining] = useState(CIBIL_TIMER_MS / 1000);
  const [revealed, setRevealed] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const left = Math.max(0, CIBIL_TIMER_MS - elapsed);
      setRemaining(Math.ceil(left / 1000));
      if (left > 0) {
        raf = requestAnimationFrame(tick);
      } else {
        setRevealed(true);
        // Brief pause to show the approved amount, then advance
        setTimeout(() => goNext(), 1600);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [goNext]);

  // Gauge geometry
  const size = 260;
  const cx = size / 2;
  const cy = size / 2 + 8;
  const r = 110;
  // Semicircle from 180° (left) to 360°/0° (right)
  const startAngle = 180;
  const endAngle = 360;
  // Map CIBIL score (300..900) to angle (180..360)
  const scoreAngle = startAngle + ((CIBIL_SCORE - 300) / (900 - 300)) * (endAngle - startAngle);

  function polar(angleDeg: number, radius: number) {
    const a = (angleDeg * Math.PI) / 180;
    return { x: cx + radius * Math.cos(a), y: cy + radius * Math.sin(a) };
  }

  function arcPath(a0: number, a1: number, radius: number) {
    const p0 = polar(a0, radius);
    const p1 = polar(a1, radius);
    const large = a1 - a0 > 180 ? 1 : 0;
    return `M ${p0.x} ${p0.y} A ${radius} ${radius} 0 ${large} 1 ${p1.x} ${p1.y}`;
  }

  // Zone arcs: Poor (300-550), Low (550-650), Good (650-750), Excellent (750-900)
  const zones = [
    { from: 300, to: 550, color: "#ef4444" },
    { from: 550, to: 650, color: "#f59e0b" },
    { from: 650, to: 750, color: "#eab308" },
    { from: 750, to: 900, color: "#10b981" },
  ];

  const needle = polar(scoreAngle, r - 18);
  const timerPct = (remaining / (CIBIL_TIMER_MS / 1000)) * 100;

  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-10">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
        <ShieldCheck className="h-3 w-3" /> CIBIL Report
      </span>
      <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        Your CIBIL score
      </h2>

      {/* Gauge */}
      <div className="mt-6 flex justify-center">
        <svg width={size} height={size / 2 + 50} viewBox={`0 0 ${size} ${size / 2 + 50}`}>
          {/* Zone arcs */}
          {zones.map((z) => {
            const a0 = startAngle + ((z.from - 300) / 600) * 180;
            const a1 = startAngle + ((z.to - 300) / 600) * 180;
            return (
              <path
                key={z.from}
                d={arcPath(a0, a1, r)}
                fill="none"
                stroke={z.color}
                strokeWidth={18}
                strokeLinecap="butt"
                opacity={z.from === 550 ? 1 : 0.25}
              />
            );
          })}
          {/* Tick labels */}
          <text x={polar(180, r + 22).x} y={polar(180, r + 22).y} textAnchor="middle" className="fill-gray-400 text-[10px]">300</text>
          <text x={polar(270, r + 22).x} y={polar(270, r + 22).y} textAnchor="middle" className="fill-gray-400 text-[10px]">600</text>
          <text x={polar(360, r + 22).x} y={polar(360, r + 22).y} textAnchor="middle" className="fill-gray-400 text-[10px]">900</text>
          {/* Needle */}
          <line
            x1={cx}
            y1={cy}
            x2={needle.x}
            y2={needle.y}
            stroke="#1f2937"
            strokeWidth={3}
            strokeLinecap="round"
          />
          <circle cx={cx} cy={cy} r={7} fill="#1f2937" />
          {/* Score value */}
          <text x={cx} y={cy - 28} textAnchor="middle" className="fill-gray-900 text-[28px] font-bold">
            {CIBIL_SCORE}
          </text>
        </svg>
      </div>

      <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">
        Low
      </span>

      {/* Don't worry message */}
      <div className="mx-auto mt-5 flex max-w-md items-start gap-3 rounded-2xl border border-amber-100 bg-amber-50/60 p-4 text-left">
        <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0 text-amber-500" />
        <div>
          <p className="text-sm font-semibold text-gray-900">
            Your CIBIL is low, but don&apos;t worry — we&apos;re here to help{firstName ? `, ${firstName}` : ""}.
          </p>
          <p className="mt-0.5 text-xs text-gray-500">
            We work with 40+ lenders who offer loans even with lower scores. Let&apos;s find your best match.
          </p>
        </div>
      </div>

      {/* Timer / reveal */}
      <div className="mx-auto mt-6 max-w-md">
        {!revealed ? (
          <div>
            <p className="text-sm font-medium text-gray-600">
              Calculating your approved loan amount…
            </p>
            <div className="mt-3 flex items-center justify-center gap-2">
              <span className="text-4xl font-black tabular-nums text-gray-900">{remaining}</span>
              <span className="pb-1 text-xs font-medium uppercase tracking-widest text-gray-400">sec</span>
            </div>
            {/* countdown bar */}
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500 transition-[width] duration-150"
                style={{ width: `${timerPct}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
            <div className="flex items-center justify-center gap-2 text-emerald-600">
              <Check className="h-5 w-5" strokeWidth={3} />
              <span className="text-sm font-semibold">Great news!</span>
            </div>
            <p className="mt-1 text-3xl font-black text-emerald-600">
              ₹{new Intl.NumberFormat("en-IN").format(ELIGIBLE_AMOUNT)}
            </p>
            <p className="mt-1 text-xs text-gray-500">You&apos;re eligible for up to this amount</p>
          </div>
        )}
      </div>

      <p className="mt-6 text-[11px] text-gray-400">
        This is an indicative estimate. Final approval depends on additional details.
      </p>
    </div>
  );
}
