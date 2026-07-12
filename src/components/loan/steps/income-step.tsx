"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Banknote, Check, ChevronDown, CreditCard, Landmark, Wallet } from "lucide-react";
import { useState } from "react";
import { type SalaryMode, useLoanStore } from "@/lib/loan-store";
import { Field3D, TiltCard } from "../field-3d";
import { StepHeader } from "./step-header";

const SALARY_MODES: { key: SalaryMode; label: string; icon: React.ElementType; hue: string }[] = [
  { key: "Bank transfer", label: "Bank transfer", icon: Landmark, hue: "#34d399" },
  { key: "Cash", label: "Cash", icon: Banknote, hue: "#fbbf24" },
  { key: "Cheque", label: "Cheque", icon: CreditCard, hue: "#a78bfa" },
];

export function IncomeStep() {
  const data = useLoanStore((s) => s.data);
  const update = useLoanStore((s) => s.update);
  const [open, setOpen] = useState(false);

  const selected = SALARY_MODES.find((o) => o.key === data.salaryMode);

  return (
    <TiltCard className="p-6 sm:p-9" intensity={4}>
      <StepHeader
        title="Income & salary"
        subtitle="A few details about how you earn."
        badge="Step 6 · Income"
      />

      <div className="mt-7 grid gap-5">
        {/* Monthly income */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
          <Field3D
            label="Your monthly income"
            required
            placeholder="Enter the amount"
            prefix="₹"
            inputMode="numeric"
            value={data.monthlyIncome}
            onChange={(e) => update({ monthlyIncome: e.target.value.replace(/[^\d]/g, "") })}
          />
          {data.monthlyIncome && Number(data.monthlyIncome) > 0 && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="mt-1.5 text-xs text-muted-foreground"
            >
              That's <span className="font-semibold text-emerald-300">₹{new Intl.NumberFormat("en-IN").format(Number(data.monthlyIncome))}</span> / month
            </motion.p>
          )}
        </motion.div>

        {/* Salary mode */}
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }}>
          <label className="mb-2 flex items-center gap-1 text-sm font-medium text-foreground/90">
            How do you receive your salary? <span className="text-rose-400">*</span>
          </label>

          {/* Option cards (primary interaction) */}
          <div className="grid grid-cols-3 gap-2.5">
            {SALARY_MODES.map((o, i) => {
              const active = data.salaryMode === o.key;
              return (
                <motion.button
                  key={o.key}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 + i * 0.05 }}
                  whileHover={{ y: -3, scale: 1.02 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => update({ salaryMode: o.key })}
                  className="relative flex flex-col items-center gap-2 rounded-2xl p-3 text-center"
                  style={{
                    background: active
                      ? `linear-gradient(135deg, ${o.hue}26, rgba(255,255,255,0.02))`
                      : "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
                    border: active ? `1px solid ${o.hue}` : "1px solid rgba(255,255,255,0.1)",
                    boxShadow: active ? `0 8px 24px -6px ${o.hue}55` : "none",
                  }}
                >
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: `${o.hue}33` }}>
                    <o.icon className="h-5 w-5" style={{ color: o.hue }} />
                  </span>
                  <span className="text-[11px] font-semibold leading-tight sm:text-xs">{o.label}</span>
                  {active && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full"
                      style={{ background: o.hue }}
                    >
                      <Check className="h-3 w-3 text-[#04040a]" strokeWidth={3} />
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </div>
        </motion.div>

        {/* Optional quick calculator card */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.16 }}
          className="mt-1 overflow-hidden rounded-2xl"
          style={{
            background: "linear-gradient(135deg, rgba(52,211,153,0.1), rgba(167,139,250,0.1))",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <div className="flex items-center gap-3 p-4">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "linear-gradient(135deg, #34d399, #22d3ee)" }}>
              <Wallet className="h-5 w-5 text-[#04040a]" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-semibold">Eligibility snapshot</p>
              <p className="text-xs text-muted-foreground">Based on your inputs so far</p>
            </div>
          </div>
        </motion.div>
      </div>
    </TiltCard>
  );
}
