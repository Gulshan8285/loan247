"use client";

import { Briefcase, Check, ChevronDown, GraduationCap, Store, UserCheck } from "lucide-react";
import { useState } from "react";
import { type OccupationType, useLoanStore } from "@/lib/loan-store";
import { StepHeader } from "./step-header";

const OPTIONS: { key: OccupationType; label: string; desc: string; icon: React.ElementType; color: string }[] = [
  { key: "Salaried", label: "Salaried", desc: "Employed by a company", icon: UserCheck, color: "#10b981" },
  { key: "Self-employed", label: "Self-employed", desc: "Freelancer / professional", icon: Briefcase, color: "#3b82f6" },
  { key: "Student", label: "Student", desc: "Currently studying", icon: GraduationCap, color: "#8b5cf6" },
  { key: "Business owner", label: "Business owner", desc: "Run your own business", icon: Store, color: "#ec4899" },
];

export function OccupationStep() {
  const occupation = useLoanStore((s) => s.data.occupation);
  const update = useLoanStore((s) => s.update);
  const [open, setOpen] = useState(false);

  const selected = OPTIONS.find((o) => o.key === occupation);

  return (
    <div className="w-full rounded-3xl border border-gray-100 bg-white p-6 shadow-sm sm:p-9">
      <StepHeader
        title="Occupation"
        subtitle="To help us curate the best loan options for you"
        badge="Step 6 · Occupation"
      />

      <div className="mt-7">
        <label className="mb-1.5 flex items-center gap-1 text-sm font-medium text-gray-800">
          Occupation type <span className="text-red-500">*</span>
        </label>

        {/* Dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpen((v) => !v)}
            className={`flex w-full items-center justify-between rounded-xl border bg-white px-4 py-3.5 text-left transition-colors ${
              open ? "border-emerald-400 ring-2 ring-emerald-400/20" : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <span className="flex items-center gap-3">
              {selected ? (
                <>
                  <span
                    className="flex h-8 w-8 items-center justify-center rounded-lg"
                    style={{ background: `${selected.color}1a` }}
                  >
                    <selected.icon className="h-4 w-4" style={{ color: selected.color }} />
                  </span>
                  <span className="text-base font-medium text-gray-900">{selected.label}</span>
                </>
              ) : (
                <span className="text-base text-gray-400">Select occupation</span>
              )}
            </span>
            <ChevronDown className={`h-5 w-5 text-gray-400 transition-transform ${open ? "rotate-180" : ""}`} />
          </button>

          {open && (
            <div className="absolute z-20 mt-2 w-full overflow-hidden rounded-xl border border-gray-100 bg-white p-1.5 shadow-lg">
              {OPTIONS.map((o) => {
                const active = occupation === o.key;
                return (
                  <button
                    key={o.key}
                    onClick={() => {
                      update({ occupation: o.key });
                      setOpen(false);
                    }}
                    className={`flex w-full items-center gap-3 rounded-lg px-3 py-3 text-left transition-colors hover:bg-gray-50 ${
                      active ? "bg-gray-50" : ""
                    }`}
                  >
                    <span
                      className="flex h-9 w-9 items-center justify-center rounded-lg"
                      style={{ background: `${o.color}1a` }}
                    >
                      <o.icon className="h-4.5 w-4.5" style={{ color: o.color }} />
                    </span>
                    <span className="flex-1">
                      <span className="block text-sm font-medium text-gray-900">{o.label}</span>
                      <span className="block text-xs text-gray-500">{o.desc}</span>
                    </span>
                    <span
                      className={`flex h-5 w-5 items-center justify-center rounded-full border-2 transition-colors ${
                        active ? "border-transparent" : "border-gray-300"
                      }`}
                      style={active ? { background: o.color } : {}}
                    >
                      {active && <Check className="h-3 w-3 text-white" strokeWidth={3} />}
                    </span>
                  </button>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Info strip */}
      <div className="mt-6 grid grid-cols-3 gap-3">
        {[
          { label: "Avg. approval", value: "2 min" },
          { label: "Docs needed", value: "0–2" },
          { label: "Disbursal", value: "24 hrs" },
        ].map((s) => (
          <div key={s.label} className="rounded-xl border border-gray-100 bg-gray-50/60 p-3 text-center">
            <p className="text-lg font-bold text-emerald-600">{s.value}</p>
            <p className="text-[10px] uppercase tracking-wide text-gray-400">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
