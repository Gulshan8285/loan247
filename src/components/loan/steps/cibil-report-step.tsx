"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { useLoanStore } from "@/lib/loan-store";

/**
 * CibilReportStep
 * Shown right after the Analyser.
 *
 * 1. A professional semicircular CIBIL gauge whose needle scans while the
 *    score is being "calculated", then settles on a random low score
 *    (443–450) per person.
 * 2. Once revealed: shows the "Low" badge + "Your CIBIL is low, but don't
 *    worry — we're here to help" message.
 * 3. Then reveals "Your loan demand is approved" with an approved amount,
 *    which is written to the store so the Amount page shows the same figure.
 * 4. Auto-advances to the Amount page.
 */
export const CIBIL_TIMER_MS = 10_000;
const SCORE_MIN = 443;
const SCORE_MAX = 450;

export function CibilReportStep() {
  const goNext = useLoanStore((s) => s.goNext);
  const update = useLoanStore((s) => s.update);
  const firstName = useLoanStore((s) => s.data.firstName);

  // Random final score (443–450) and approved amount, generated once per visit
  const finalScore = useMemo(
    () => SCORE_MIN + Math.floor(Math.random() * (SCORE_MAX - SCORE_MIN + 1)),
    [],
  );
  const approvedAmount = useMemo(
    () => (3 + Math.floor(Math.random() * 6)) * 100000, // ₹3,00,000 – ₹8,00,000
    [],
  );

  const [progress, setProgress] = useState(0); // 0..100
  const [revealed, setRevealed] = useState(false);
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const p = Math.min(100, (elapsed / CIBIL_TIMER_MS) * 100);
      setProgress(p);
      if (p < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        // Score settled — reveal the result, write approved amount to store
        setRevealed(true);
        update({ loanAmount: approvedAmount });
        // Let the customer read the approved amount, then advance
        setTimeout(() => goNext(), 2400);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [goNext, update, approvedAmount]);

  // ---- Gauge geometry ----
  const size = 280;
  const cx = size / 2;
  const cy = size / 2 + 12;
  const r = 116;
  const startAngle = 180; // left
  const endAngle = 360; // right

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

  // Zones (300..900 mapped to 180..360)
  const zones = [
    { from: 300, to: 550, color: "#f59e0b", label: "Low" },
    { from: 550, to: 650, color: "#eab308", label: "Fair" },
    { from: 650, to: 750, color: "#84cc16", label: "Good" },
    { from: 750, to: 900, color: "#10b981", label: "Excellent" },
  ];

  // Needle animation: eases from the high end toward the final low score,
  // with a damped oscillation while "calculating".
  const finalScoreAngle = startAngle + ((finalScore - 300) / 600) * (endAngle - startAngle);
  const t = progress / 100;
  const eased = 1 - Math.pow(1 - t, 3); // easeOutCubic
  const baseAngle = startAngle + (finalScoreAngle - startAngle) * eased;
  const wobble = revealed ? 0 : 14 * Math.sin(t * Math.PI * 5) * (1 - t);
  const needleAngle = revealed ? finalScoreAngle : baseAngle + wobble;
  const liveScore = Math.round(300 + ((needleAngle - startAngle) / (endAngle - startAngle)) * 600);
  const displayScore = revealed ? finalScore : liveScore;

  const needle = polar(needleAngle, r - 16);
  const remaining = Math.max(0, Math.ceil((CIBIL_TIMER_MS * (1 - t)) / 1000));

  // Tick marks at 300, 450, 600, 750, 900
  const ticks = [300, 450, 600, 750, 900];

  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-6 text-center shadow-sm sm:p-10">
      <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
        <ShieldCheck className="h-3 w-3" /> CIBIL Report
      </span>
      <h2 className="mt-3 text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
        Your CIBIL score
      </h2>
      <p className="mt-1.5 text-sm text-gray-500">
        {revealed
          ? "Here's your credit profile"
          : "Analyzing your credit profile…"}
      </p>

      {/* Professional gauge */}
      <div className="mt-6 flex justify-center">
        <svg
          width={size}
          height={size / 2 + 56}
          viewBox={`0 0 ${size} ${size / 2 + 56}`}
          className="max-w-full"
        >
          {/* Background track */}
          <path
            d={arcPath(startAngle, endAngle, r)}
            fill="none"
            stroke="#f1f5f9"
            strokeWidth={20}
            strokeLinecap="round"
          />
          {/* Zone arcs */}
          {zones.map((z) => {
            const a0 = startAngle + ((z.from - 300) / 600) * 180;
            const a1 = startAngle + ((z.to - 300) / 600) * 180;
            const isActive = finalScore >= z.from && finalScore < z.to;
            return (
              <path
                key={z.from}
                d={arcPath(a0, a1, r)}
                fill="none"
                stroke={z.color}
                strokeWidth={14}
                strokeLinecap="butt"
                opacity={revealed && isActive ? 1 : 0.35}
              />
            );
          })}
          {/* Tick marks */}
          {ticks.map((tv) => {
            const ang = startAngle + ((tv - 300) / 600) * 180;
            const p0 = polar(ang, r - 24);
            const p1 = polar(ang, r - 14);
            const lbl = polar(ang, r + 20);
            return (
              <g key={tv}>
                <line x1={p0.x} y1={p0.y} x2={p1.x} y2={p1.y} stroke="#cbd5e1" strokeWidth={1.5} />
                <text
                  x={lbl.x}
                  y={lbl.y}
                  textAnchor="middle"
                  dominantBaseline="middle"
                  className="fill-gray-400"
                  style={{ fontSize: 10 }}
                >
                  {tv}
                </text>
              </g>
            );
          })}
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
          <circle cx={cx} cy={cy} r={8} fill="#1f2937" />
          <circle cx={cx} cy={cy} r={3} fill="#fff" />
          {/* Score value */}
          <text
            x={cx}
            y={cy - 30}
            textAnchor="middle"
            className="fill-gray-900"
            style={{ fontSize: 30, fontWeight: 800 }}
          >
            {displayScore}
          </text>
        </svg>
      </div>

      {revealed && (
        <span className="inline-block rounded-full bg-amber-100 px-3 py-1 text-sm font-bold text-amber-700">
          Low
        </span>
      )}

      {/* "Don't worry" message — shown once the low score is revealed */}
      {revealed && (
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
      )}

      {/* Timer OR approved reveal */}
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
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-gray-200">
              <div
                className="h-full rounded-full bg-gradient-to-r from-blue-500 to-emerald-500"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        ) : (
          <div className="rounded-2xl border border-emerald-100 bg-emerald-50/60 p-5">
            <div className="flex items-center justify-center gap-2 text-emerald-600">
              <CheckCircle2 className="h-5 w-5" />
              <span className="text-sm font-semibold">Your loan demand is approved!</span>
            </div>
            <p className="mt-1 text-3xl font-black text-emerald-600">
              ₹{new Intl.NumberFormat("en-IN").format(approvedAmount)}
            </p>
            <p className="mt-1 text-xs text-gray-500">
              You&apos;re approved for up to this amount — let&apos;s confirm your selection.
            </p>
          </div>
        )}
      </div>

      <p className="mt-6 text-[11px] text-gray-400">
        This is an indicative estimate. Final approval depends on additional details.
      </p>
    </div>
  );
}
