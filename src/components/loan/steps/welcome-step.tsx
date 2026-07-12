"use client";

import { motion } from "framer-motion";
import { ArrowRight, ShieldCheck, Sparkles, Zap } from "lucide-react";
import { useLoanStore } from "@/lib/loan-store";

export function WelcomeStep() {
  const goNext = useLoanStore((s) => s.goNext);

  const features = [
    { icon: Zap, title: "60-second journey", desc: "8 smart steps, no paperwork friction" },
    { icon: ShieldCheck, title: "Bank-grade secure", desc: "Your data stays encrypted & private" },
    { icon: Sparkles, title: "Curated offers", desc: "AI matches you to the best lenders" },
  ];

  return (
    <div className="text-center">
      {/* Floating 3D coin / orb hero */}
      <div className="perspective-2000 mx-auto mb-8 flex h-40 w-40 items-center justify-center sm:h-48 sm:w-48">
        <motion.div
          className="relative flex h-32 w-32 items-center justify-center rounded-full sm:h-40 sm:w-40"
          style={{
            background: "conic-gradient(from 0deg, #34d399, #22d3ee, #a78bfa, #f472b6, #fbbf24, #34d399)",
            boxShadow: "0 0 60px -10px rgba(52,211,153,0.7), 0 0 120px -20px rgba(167,139,250,0.5)",
          }}
          animate={{ rotateY: 360, rotateX: [0, 12, 0, -12, 0] }}
          transition={{ rotateY: { duration: 8, repeat: Infinity, ease: "linear" }, rotateX: { duration: 6, repeat: Infinity, ease: "easeInOut" } }}
        >
          <div className="absolute inset-1.5 rounded-full" style={{ background: "radial-gradient(circle at 35% 30%, rgba(255,255,255,0.5), rgba(6,6,13,0.9) 70%)" }} />
          <span className="relative text-4xl font-black text-aurora sm:text-5xl" style={{ textShadow: "0 0 20px rgba(52,211,153,0.6)" }}>
            ₹
          </span>
        </motion.div>
        {/* orbiting dots */}
        {[0, 1, 2].map((i) => (
          <motion.div
            key={i}
            className="absolute h-2.5 w-2.5 rounded-full"
            style={{ background: ["#34d399", "#a78bfa", "#f472b6"][i], boxShadow: `0 0 12px ${["#34d399", "#a78bfa", "#f472b6"][i]}` }}
            animate={{ rotate: 360 }}
            transition={{ duration: 6 + i * 2, repeat: Infinity, ease: "linear" }}
          >
            <div className="absolute h-2.5 w-2.5 rounded-full" style={{ transform: `translateX(${72 + i * 6}px)` }} />
          </motion.div>
        ))}
      </div>

      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="mb-3 inline-flex items-center gap-2 rounded-full glass px-3 py-1 text-xs font-medium text-muted-foreground"
      >
        <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
        Welcome to the future of lending
      </motion.p>

      <motion.h1
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.15 }}
        className="text-balance text-4xl font-black leading-tight tracking-tight sm:text-6xl"
      >
        Your loan, <span className="text-aurora">reimagined</span>
        <br className="hidden sm:block" /> in glorious 3D.
      </motion.h1>

      <motion.p
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.25 }}
        className="mx-auto mt-4 max-w-md text-pretty text-base text-muted-foreground sm:text-lg"
      >
        A cinematic, animated journey from your details to a curated loan offer — built to feel as good as it looks.
      </motion.p>

      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.35 }}
        className="mx-auto mt-8 grid max-w-2xl gap-3 sm:grid-cols-3"
      >
        {features.map((f, i) => (
          <motion.div
            key={f.title}
            whileHover={{ y: -4, scale: 1.02 }}
            className="rounded-2xl glass p-4 text-left"
          >
            <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: "linear-gradient(135deg, rgba(52,211,153,0.2), rgba(167,139,250,0.2))" }}>
              <f.icon className="h-4.5 w-4.5 text-emerald-300" />
            </div>
            <p className="text-sm font-semibold">{f.title}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">{f.desc}</p>
          </motion.div>
        ))}
      </motion.div>

      <motion.button
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.45 }}
        whileHover={{ scale: 1.04 }}
        whileTap={{ scale: 0.96 }}
        onClick={goNext}
        className="group relative mt-8 inline-flex items-center gap-2 overflow-hidden rounded-2xl px-8 py-4 text-base font-bold text-[#04040a]"
        style={{
          background: "linear-gradient(120deg, #34d399 0%, #22d3ee 50%, #a78bfa 100%)",
          boxShadow: "0 10px 40px -8px rgba(52,211,153,0.6)",
        }}
      >
        <motion.span
          className="absolute inset-0"
          style={{ background: "linear-gradient(120deg, transparent, rgba(255,255,255,0.45), transparent)" }}
          animate={{ x: ["-100%", "200%"] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: "easeInOut", repeatDelay: 0.5 }}
        />
        <span className="relative">Begin your journey</span>
        <ArrowRight className="relative h-5 w-5 transition-transform group-hover:translate-x-1" />
      </motion.button>
    </div>
  );
}
