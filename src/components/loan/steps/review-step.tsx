"use client";

import { motion } from "framer-motion";
import { Briefcase, Calendar, CreditCard, IndianRupee, MapPin, Target, User } from "lucide-react";
import { formatINR, useLoanStore } from "@/lib/loan-store";
import { TiltCard } from "../field-3d";
import { StepHeader } from "./step-header";

export function ReviewStep() {
  const data = useLoanStore((s) => s.data);

  const rows = [
    { icon: User, label: "Name", value: [data.firstName, data.lastName].filter(Boolean).join(" ") || "—" },
    { icon: Calendar, label: "Date of birth", value: data.dob ? new Date(data.dob).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "—" },
    { icon: MapPin, label: "Pin code", value: data.pincode || "—" },
    { icon: CreditCard, label: "PAN number", value: data.panCard || "—" },
    { icon: IndianRupee, label: "Loan amount", value: `₹${formatINR(data.loanAmount)}`, highlight: true },
    { icon: Target, label: "Purpose", value: data.purpose || "—" },
    { icon: Briefcase, label: "Occupation", value: data.occupation || "—" },
    { icon: IndianRupee, label: "Monthly income", value: data.monthlyIncome ? `₹${formatINR(Number(data.monthlyIncome))}` : "—" },
    { icon: Briefcase, label: "Salary mode", value: data.salaryMode || "—" },
  ];

  const estEMI = Math.round((data.loanAmount * 0.009));

  return (
    <TiltCard className="p-6 sm:p-9" intensity={3}>
      <StepHeader
        title="Review your application"
        subtitle="Everything look right? Hit finish to see your offer."
        badge="Step 7 · Review"
      />

      {/* Highlight hero card */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className="mt-7 overflow-hidden rounded-3xl"
        style={{
          background: "linear-gradient(135deg, rgba(52,211,153,0.18), rgba(167,139,250,0.18))",
          border: "1px solid rgba(255,255,255,0.14)",
        }}
      >
        <div className="relative p-6">
          <p className="text-xs uppercase tracking-widest text-muted-foreground">You're borrowing</p>
          <p className="mt-1 text-4xl font-black text-aurora sm:text-5xl">₹{formatINR(data.loanAmount)}</p>
          <div className="mt-4 flex flex-wrap gap-4 text-sm">
            <div>
              <p className="text-muted-foreground">Est. EMI</p>
              <p className="font-semibold">₹{formatINR(estEMI)}/mo</p>
            </div>
            <div>
              <p className="text-muted-foreground">Tenure</p>
              <p className="font-semibold">60 months</p>
            </div>
            <div>
              <p className="text-muted-foreground">Rate</p>
              <p className="font-semibold">10.8% p.a.</p>
            </div>
          </div>
          <motion.div
            className="absolute -right-10 -top-10 h-40 w-40 rounded-full opacity-40"
            style={{ background: "linear-gradient(135deg, #34d399, #a78bfa)", filter: "blur(40px)" }}
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity }}
          />
        </div>
      </motion.div>

      {/* Detail rows */}
      <div className="mt-5 grid gap-2.5 sm:grid-cols-2">
        {rows.map((r, i) => (
          <motion.div
            key={r.label}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.05 }}
            className="flex items-center gap-3 rounded-2xl glass px-4 py-3"
          >
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg" style={{ background: "rgba(52,211,153,0.15)" }}>
              <r.icon className="h-4 w-4 text-emerald-300" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{r.label}</p>
              <p className={`truncate text-sm font-medium ${r.highlight ? "text-aurora" : ""}`}>{r.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </TiltCard>
  );
}
