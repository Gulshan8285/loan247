"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Briefcase, Check, ChevronDown, GraduationCap, Store, UserCheck } from "lucide-react";
import { useState } from "react";
import { type OccupationType, useLoanStore } from "@/lib/loan-store";
import { TiltCard } from "../field-3d";
import { StepHeader } from "./step-header";

const OPTIONS: { key: OccupationType; label: string; desc: string; icon: React.ElementType; hue: string }[] = [
  { key: "Salaried", label: "Salaried", desc: "Employed by a company", icon: UserCheck, hue: "#34d399" },
  { key: "Self-employed", label: "Self-employed", desc: "Freelancer / professional", icon: Briefcase, hue: "#22d3ee" },
  { key: "Student", label: "Student", desc: "Currently studying", icon: GraduationCap, hue: "#a78bfa" },
  { key: "Business owner", label: "Business owner", desc: "Run your own business", icon: Store, hue: "#f472b6" },
];

export function OccupationStep() {
  const occupation = useLoanStore((s) => s.data.occupation);
  const update = useLoanStore((s) => s.update);
  const [open, setOpen] = useState(false);

  const selected = OPTIONS.find((o) => o.key === occupation);

  return (
    <TiltCard className="p-6 sm:p-9" intensity={4}>
      <StepHeader
        title="Occupation"
        subtitle="To help us curate the best loan options for you"
        badge="Step 5 · Occupation"
      />

      <div className="mt-7">
        <label className="mb-2 flex items-center gap-1 text-sm font-medium text-foreground/90">
          Occupation type <span className="text-rose-400">*</span>
        </label>

        {/* Custom 3D dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className="group relative flex w-full items-center justify-between rounded-2xl px-4 py-3.5 text-left transition-all"
            style={{
              background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
              border: open ? "1px solid rgba(52,211,153,0.6)" : "1px solid rgba(255,255,255,0.1)",
              boxShadow: open ? "0 0 22px -2px rgba(34,211,238,0.4)" : "inset 0 1px 0 rgba(255,255,255,0.05)",
            }}
          >
            <span className="flex items-center gap-3">
              {selected ? (
                <>
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg" style={{ background: `${selected.hue}33` }}>
                    <selected.icon className="h-4 w-4" style={{ color: selected.hue }} />
                  </span>
                  <span className="text-base font-medium">{selected.label}</span>
                </>
              ) : (
                <span className="text-base text-muted-foreground/60">Select occupation</span>
              )}
            </span>
            <motion.span animate={{ rotate: open ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown className="h-5 w-5 text-muted-foreground" />
            </motion.span>
          </button>

          <AnimatePresence>
            {open && (
              <motion.div
                initial={{ opacity: 0, y: -8, scale: 0.97, rotateX: -8 }}
                animate={{ opacity: 1, y: 0, scale: 1, rotateX: 0 }}
                exit={{ opacity: 0, y: -8, scale: 0.97, rotateX: -8 }}
                transition={{ type: "spring", stiffness: 300, damping: 24 }}
                style={{ transformOrigin: "top", transformStyle: "preserve-3d" }}
                className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl glass-strong p-1.5"
              >
                {OPTIONS.map((o, i) => {
                  const active = occupation === o.key;
                  return (
                    <motion.button
                      key={o.key}
                      initial={{ opacity: 0, x: -8 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                      onClick={() => {
                        update({ occupation: o.key });
                        setOpen(false);
                      }}
                      className="flex w-full items-center gap-3 rounded-xl px-3 py-3 text-left transition-colors hover:bg-white/5"
                      style={active ? { background: `${o.hue}1a` } : {}}
                    >
                      <span className="flex h-9 w-9 items-center justify-center rounded-lg" style={{ background: `${o.hue}26` }}>
                        <o.icon className="h-4.5 w-4.5" style={{ color: o.hue }} />
                      </span>
                      <span className="flex-1">
                        <span className="block text-sm font-medium">{o.label}</span>
                        <span className="block text-xs text-muted-foreground">{o.desc}</span>
                      </span>
                      <span
                        className="flex h-5 w-5 items-center justify-center rounded-full border-2 transition-all"
                        style={{
                          borderColor: active ? o.hue : "rgba(255,255,255,0.2)",
                          background: active ? o.hue : "transparent",
                        }}
                      >
                        {active && <Check className="h-3 w-3 text-[#04040a]" strokeWidth={3} />}
                      </span>
                    </motion.button>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Info strip */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { label: "Avg. approval", value: "2 min" },
          { label: "Docs needed", value: "0–2" },
          { label: "Disbursal", value: "24 hrs" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 + i * 0.05 }}
            className="rounded-xl glass p-3 text-center"
          >
            <p className="text-lg font-bold text-aurora">{s.value}</p>
            <p className="text-[10px] uppercase tracking-wide text-muted-foreground">{s.label}</p>
          </motion.div>
        ))}
      </div>
    </TiltCard>
  );
}
