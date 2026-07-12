"use client";

import { motion } from "framer-motion";
import {
  Briefcase,
  Car,
  CreditCard,
  GraduationCap,
  Heart,
  Home,
  Plane,
  Stethoscope,
} from "lucide-react";
import { type LoanPurpose, useLoanStore } from "@/lib/loan-store";
import { TiltCard } from "../field-3d";
import { StepHeader } from "./step-header";

const PURPOSES: { key: LoanPurpose; label: string; icon: React.ElementType; hue: string }[] = [
  { key: "Home", label: "Home", icon: Home, hue: "rgba(52,211,153,0.9)" },
  { key: "Vehicle", label: "Vehicle", icon: Car, hue: "rgba(34,211,238,0.9)" },
  { key: "Education", label: "Education", icon: GraduationCap, hue: "rgba(167,139,250,0.9)" },
  { key: "Business", label: "Business", icon: Briefcase, hue: "rgba(244,114,182,0.9)" },
  { key: "Medical", label: "Medical", icon: Stethoscope, hue: "rgba(251,191,36,0.9)" },
  { key: "Travel", label: "Travel", icon: Plane, hue: "rgba(94,234,212,0.9)" },
  { key: "Wedding", label: "Wedding", icon: Heart, hue: "rgba(248,113,113,0.9)" },
  { key: "Debt consolidation", label: "Debt consolidation", icon: CreditCard, hue: "rgba(168,247,196,0.9)" },
];

export function LoanPurposeStep() {
  const purpose = useLoanStore((s) => s.data.purpose);
  const update = useLoanStore((s) => s.update);

  return (
    <TiltCard className="p-6 sm:p-9" intensity={4}>
      <StepHeader
        title="What's the loan for?"
        subtitle="Pick a purpose — we'll tailor the terms accordingly."
        badge="Step 4 · Purpose"
      />

      <div className="mt-7 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {PURPOSES.map((p, i) => {
          const active = purpose === p.key;
          return (
            <motion.button
              key={p.key}
              initial={{ opacity: 0, y: 16, rotateX: -10 }}
              animate={{ opacity: 1, y: 0, rotateX: 0 }}
              transition={{ delay: i * 0.04, type: "spring", stiffness: 200, damping: 18 }}
              whileHover={{ y: -6, scale: 1.04, rotateY: 4 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => update({ purpose: p.key })}
              className="group relative flex flex-col items-center gap-3 overflow-hidden rounded-2xl p-4 text-center"
              style={{
                background: active
                  ? `linear-gradient(135deg, ${p.hue.replace("0.9", "0.22")}, rgba(255,255,255,0.04))`
                  : "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                border: active ? `1px solid ${p.hue}` : "1px solid rgba(255,255,255,0.1)",
                boxShadow: active
                  ? `0 10px 30px -8px ${p.hue.replace("0.9", "0.4")}, inset 0 1px 0 rgba(255,255,255,0.1)`
                  : "inset 0 1px 0 rgba(255,255,255,0.05)",
                transformStyle: "preserve-3d",
              }}
            >
              {/* glow halo on active */}
              {active && (
                <motion.span
                  layoutId="purpose-glow"
                  className="absolute -inset-2 -z-10 rounded-3xl opacity-60"
                  style={{ background: p.hue, filter: "blur(24px)" }}
                />
              )}
              <div
                className="flex h-12 w-12 items-center justify-center rounded-xl transition-transform group-hover:scale-110"
                style={{
                  background: `linear-gradient(135deg, ${p.hue}, ${p.hue.replace("0.9", "0.5")})`,
                  boxShadow: `0 6px 18px -4px ${p.hue.replace("0.9", "0.5")}`,
                }}
              >
                <p.icon className="h-6 w-6 text-[#04040a]" strokeWidth={2.2} />
              </div>
              <span className="text-xs font-semibold leading-tight sm:text-sm">{p.label}</span>
              {active && (
                <motion.span
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute right-2 top-2 h-2 w-2 rounded-full"
                  style={{ background: p.hue, boxShadow: `0 0 8px ${p.hue}` }}
                />
              )}
            </motion.button>
          );
        })}
      </div>

      {purpose && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-6 flex items-center gap-2 rounded-xl glass px-4 py-3 text-sm text-muted-foreground"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
          Selected: <span className="font-semibold text-foreground">{purpose}</span>
        </motion.div>
      )}
    </TiltCard>
  );
}
