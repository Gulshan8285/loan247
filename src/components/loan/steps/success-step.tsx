"use client";

import { motion } from "framer-motion";
import { Check, PartyPopper, Sparkles } from "lucide-react";
import { formatINR, useLoanStore } from "@/lib/loan-store";

export function SuccessStep() {
  const data = useLoanStore((s) => s.data);
  const reset = useLoanStore((s) => s.reset);
  const name = data.firstName || "friend";

  return (
    <div className="relative text-center">
      {/* Confetti burst */}
      <Confetti />

      {/* Big animated check */}
      <div className="perspective-2000 mx-auto mb-8 flex h-32 w-32 items-center justify-center">
        <motion.div
          initial={{ scale: 0, rotateY: -180 }}
          animate={{ scale: 1, rotateY: 0 }}
          transition={{ type: "spring", stiffness: 200, damping: 14, delay: 0.1 }}
          className="relative flex h-28 w-28 items-center justify-center rounded-full"
          style={{
            background: "linear-gradient(135deg, #34d399, #22d3ee)",
            boxShadow: "0 0 60px -8px rgba(52,211,153,0.7), 0 0 120px -20px rgba(34,211,238,0.5)",
          }}
        >
          <motion.span
            className="absolute -inset-3 rounded-full"
            style={{ border: "2px solid rgba(52,211,153,0.5)" }}
            animate={{ scale: [1, 1.5], opacity: [0.6, 0] }}
            transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
          />
          <Check className="h-14 w-14 text-[#04040a]" strokeWidth={3} />
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <span className="mb-3 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-medium text-aurora">
          <PartyPopper className="h-3.5 w-3.5" /> Application submitted
        </span>
        <h1 className="text-balance text-3xl font-black tracking-tight sm:text-5xl">
          You're pre-qualified, <span className="text-aurora">{name}</span>!
        </h1>
        <p className="mx-auto mt-4 max-w-md text-pretty text-base text-muted-foreground sm:text-lg">
          Based on your details, here's your indicative offer. Our team will finalise the rest.
        </p>
      </motion.div>

      {/* Offer card */}
      <motion.div
        initial={{ opacity: 0, y: 24, rotateX: -10 }}
        animate={{ opacity: 1, y: 0, rotateX: 0 }}
        transition={{ delay: 0.45, type: "spring", stiffness: 180, damping: 18 }}
        style={{ transformStyle: "preserve-3d" }}
        className="mx-auto mt-8 max-w-md overflow-hidden rounded-3xl"
      >
        <div
          className="relative p-6 text-left"
          style={{
            background: "linear-gradient(135deg, rgba(52,211,153,0.16), rgba(167,139,250,0.16))",
            border: "1px solid rgba(255,255,255,0.14)",
            boxShadow: "0 20px 60px -20px rgba(52,211,153,0.4)",
          }}
        >
          <div className="flex items-center justify-between">
            <span className="text-xs uppercase tracking-widest text-muted-foreground">Approved amount</span>
            <Sparkles className="h-4 w-4 text-amber-300" />
          </div>
          <p className="mt-1 text-4xl font-black text-aurora sm:text-5xl">₹{formatINR(data.loanAmount)}</p>
          <div className="mt-5 grid grid-cols-3 gap-3 border-t border-white/10 pt-5">
            <Stat label="EMI" value={`₹${formatINR(Math.round(data.loanAmount * 0.009))}`} />
            <Stat label="Tenure" value="60 mo" />
            <Stat label="Rate" value="10.8%" />
          </div>
          <motion.div
            className="absolute -right-8 -top-8 h-32 w-32 rounded-full opacity-40"
            style={{ background: "linear-gradient(135deg, #fbbf24, #f472b6)", filter: "blur(36px)" }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.3, 0.5, 0.3] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={reset}
        className="mt-8 inline-flex items-center gap-2 rounded-2xl glass px-6 py-3 text-sm font-semibold text-foreground transition-colors hover:bg-white/10"
      >
        Start a new application
      </motion.button>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{label}</p>
      <p className="text-sm font-bold">{value}</p>
    </div>
  );
}

function Confetti() {
  const colors = ["#34d399", "#22d3ee", "#a78bfa", "#f472b6", "#fbbf24"];
  const pieces = Array.from({ length: 36 });
  return (
    <div className="pointer-events-none absolute inset-0 -z-0 overflow-hidden">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 0.5;
        const duration = 1.8 + Math.random() * 1.4;
        const color = colors[i % colors.length];
        const size = 6 + Math.random() * 8;
        return (
          <motion.span
            key={i}
            className="absolute top-0 rounded-sm"
            style={{
              left: `${left}%`,
              width: size,
              height: size * 0.5,
              background: color,
              boxShadow: `0 0 8px ${color}`,
            }}
            initial={{ y: -20, opacity: 0, rotate: 0 }}
            animate={{ y: "110vh", opacity: [0, 1, 1, 0], rotate: 720 }}
            transition={{ duration, delay, repeat: Infinity, repeatDelay: Math.random() * 2, ease: "easeIn" }}
          />
        );
      })}
    </div>
  );
}
