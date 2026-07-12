"use client";

import { motion, useMotionValue, useSpring, useTransform, animate } from "framer-motion";
import { Minus, Plus, TrendingUp } from "lucide-react";
import { useEffect, useState } from "react";
import { formatINR, useLoanStore } from "@/lib/loan-store";
import { TiltCard } from "../field-3d";
import { StepHeader } from "./step-header";

const MIN = 10000;
const MAX = 5000000;
const STEP = 10000;

const QUICK_AMOUNTS = [50000, 200000, 500000, 1000000, 2000000];

export function LoanAmountStep() {
  const amount = useLoanStore((s) => s.data.loanAmount);
  const update = useLoanStore((s) => s.update);

  // animated display number
  const mv = useMotionValue(amount);
  const spring = useSpring(mv, { stiffness: 120, damping: 20 });
  const [display, setDisplay] = useState(amount);

  useEffect(() => {
    mv.set(amount);
  }, [amount, mv]);

  useEffect(() => {
    return spring.on("change", (v) => setDisplay(Math.round(v)));
  }, [spring]);

  function setAmount(v: number) {
    const clamped = Math.max(MIN, Math.min(MAX, v));
    update({ loanAmount: clamped });
  }

  const progress = ((amount - MIN) / (MAX - MIN)) * 100;

  return (
    <TiltCard className="p-6 sm:p-9" intensity={4}>
      <StepHeader
        title="Select your loan amount"
        subtitle="What loan amount are you seeking?"
        badge="Step 3 · Amount"
      />

      {/* Big 3D amount display */}
      <div className="perspective-2000 mt-8 flex flex-col items-center">
        <motion.div
          className="relative flex items-center justify-center rounded-3xl px-6 py-8 sm:px-12"
          style={{
            background: "linear-gradient(135deg, rgba(52,211,153,0.12), rgba(167,139,250,0.12))",
            border: "1px solid rgba(255,255,255,0.12)",
            boxShadow: "0 20px 60px -20px rgba(52,211,153,0.4), inset 0 1px 0 rgba(255,255,255,0.1)",
          }}
          whileHover={{ scale: 1.02 }}
        >
          <span className="mr-2 text-3xl font-bold text-aurora sm:text-4xl">₹</span>
          <span className="text-5xl font-black tabular-nums tracking-tight sm:text-7xl" key={display}>
            <AnimatedDigits value={display} />
          </span>
          {/* glow underlay */}
          <motion.div
            className="absolute -inset-2 -z-10 rounded-3xl opacity-50"
            style={{ background: "linear-gradient(120deg, #34d399, #22d3ee, #a78bfa)", filter: "blur(30px)" }}
            animate={{ opacity: [0.3, 0.6, 0.3] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
        </motion.div>

        {/* +/- controls */}
        <div className="mt-6 flex items-center gap-4">
          <ControlButton onClick={() => setAmount(amount - STEP)} disabled={amount <= MIN}>
            <Minus className="h-5 w-5" />
          </ControlButton>

          <div className="flex flex-col items-center">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Adjust</span>
            <span className="text-sm font-medium text-foreground/70">± ₹{formatINR(STEP / 1000)}k</span>
          </div>

          <ControlButton onClick={() => setAmount(amount + STEP)} disabled={amount >= MAX}>
            <Plus className="h-5 w-5" />
          </ControlButton>
        </div>
      </div>

      {/* Range slider */}
      <div className="mt-8">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>₹{formatINR(MIN)}</span>
          <span>₹{formatINR(MAX)}</span>
        </div>
        <input
          type="range"
          min={MIN}
          max={MAX}
          step={STEP}
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          className="aurora-slider w-full"
          style={{
            background: `linear-gradient(90deg, #34d399 0%, #22d3ee ${progress * 0.4}%, #a78bfa ${progress}%, rgba(255,255,255,0.1) ${progress}%)`,
          }}
        />
      </div>

      {/* Quick amounts */}
      <div className="mt-7">
        <p className="mb-2.5 text-xs font-medium uppercase tracking-wider text-muted-foreground">Quick pick</p>
        <div className="flex flex-wrap gap-2">
          {QUICK_AMOUNTS.map((q) => {
            const active = amount === q;
            return (
              <motion.button
                key={q}
                whileHover={{ scale: 1.05, y: -2 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setAmount(q)}
                className="rounded-xl px-4 py-2 text-sm font-semibold transition-all"
                style={
                  active
                    ? {
                        background: "linear-gradient(120deg, #34d399, #22d3ee)",
                        color: "#04040a",
                        boxShadow: "0 6px 20px -6px rgba(52,211,153,0.6)",
                      }
                    : {
                        background: "rgba(255,255,255,0.05)",
                        border: "1px solid rgba(255,255,255,0.1)",
                        color: "rgba(255,255,255,0.8)",
                      }
                }
              >
                ₹{formatINR(q)}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Hint card */}
      <div className="mt-7 flex items-start gap-3 rounded-2xl glass p-4">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: "linear-gradient(135deg, rgba(251,191,36,0.25), rgba(244,114,182,0.25))" }}>
          <TrendingUp className="h-4 w-4 text-amber-300" />
        </div>
        <div>
          <p className="text-sm font-medium">Estimated EMI from ₹{formatINR(Math.round((amount * 0.009) / 1))}/mo*</p>
          <p className="mt-0.5 text-xs text-muted-foreground">*Indicative only, subject to eligibility &amp; tenure.</p>
        </div>
      </div>

      <style>{`
        .aurora-slider {
          -webkit-appearance: none;
          appearance: none;
          height: 8px;
          border-radius: 999px;
          outline: none;
          cursor: pointer;
        }
        .aurora-slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: linear-gradient(135deg, #fff, #e0fff5);
          border: 3px solid #34d399;
          box-shadow: 0 0 0 4px rgba(52,211,153,0.2), 0 4px 14px rgba(0,0,0,0.4);
          cursor: pointer;
          transition: transform 0.15s;
        }
        .aurora-slider::-webkit-slider-thumb:hover { transform: scale(1.15); }
        .aurora-slider::-moz-range-thumb {
          width: 26px;
          height: 26px;
          border-radius: 50%;
          background: #fff;
          border: 3px solid #34d399;
          box-shadow: 0 0 0 4px rgba(52,211,153,0.2);
          cursor: pointer;
        }
      `}</style>
    </TiltCard>
  );
}

function ControlButton({ children, onClick, disabled }: { children: React.ReactNode; onClick: () => void; disabled?: boolean }) {
  return (
    <motion.button
      whileHover={{ scale: disabled ? 1 : 1.1, rotate: disabled ? 0 : 5 }}
      whileTap={{ scale: disabled ? 1 : 0.9 }}
      onClick={onClick}
      disabled={disabled}
      className="flex h-14 w-14 items-center justify-center rounded-2xl text-[#04040a] transition-opacity disabled:opacity-30"
      style={{
        background: "linear-gradient(135deg, #34d399, #22d3ee)",
        boxShadow: "0 8px 24px -6px rgba(52,211,153,0.5)",
      }}
    >
      {children}
    </motion.button>
  );
}

function AnimatedDigits({ value }: { value: number }) {
  const str = formatINR(value);
  return (
    <span className="inline-flex">
      {str.split("").map((ch, i) => (
        <motion.span
          key={i}
          initial={{ y: -8, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.2, delay: i * 0.01 }}
          className="inline-block tabular-nums"
        >
          {ch === "," ? <span className="text-foreground/40">,</span> : ch}
        </motion.span>
      ))}
    </span>
  );
}
