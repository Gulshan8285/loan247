"use client";

import { motion } from "framer-motion";
import { CalendarIcon, User } from "lucide-react";
import { useLoanStore } from "@/lib/loan-store";
import { Field3D, TiltCard } from "../field-3d";
import { StepHeader } from "./step-header";

export function BasicInfoStep() {
  const data = useLoanStore((s) => s.data);
  const update = useLoanStore((s) => s.update);

  // Format DOB for display: iso -> DD-MM-YYYY
  const dobDisplay = data.dob
    ? (() => {
        const d = new Date(data.dob);
        if (isNaN(d.getTime())) return "";
        const dd = String(d.getDate()).padStart(2, "0");
        const mm = String(d.getMonth() + 1).padStart(2, "0");
        return `${dd}-${mm}-${d.getFullYear()}`;
      })()
    : "";

  return (
    <TiltCard className="p-6 sm:p-9" intensity={5}>
      <StepHeader
        title="Basic information"
        subtitle="To help us curate the best loan options for you"
      />

      <div className="mt-7 grid gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}>
            <Field3D
              label="First Name"
              hint="(As per PAN)"
              required
              placeholder="Enter your first name"
              icon={<User className="h-4 w-4" />}
              value={data.firstName}
              onChange={(e) => update({ firstName: e.target.value })}
              autoComplete="given-name"
            />
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
            <Field3D
              label="Last Name"
              hint="(As per PAN)"
              required
              placeholder="Enter your last name"
              value={data.lastName}
              onChange={(e) => update({ lastName: e.target.value })}
              autoComplete="family-name"
            />
          </motion.div>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
          <DOBField value={data.dob} display={dobDisplay} onChange={(iso) => update({ dob: iso })} />
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
          <Field3D
            label="Pin code"
            required
            placeholder="Enter your pincode"
            inputMode="numeric"
            maxLength={6}
            value={data.pincode}
            onChange={(e) => update({ pincode: e.target.value.replace(/\D/g, "").slice(0, 6) })}
          />
        </motion.div>
      </div>
    </TiltCard>
  );
}

function DOBField({
  value,
  display,
  onChange,
}: {
  value: string;
  display: string;
  onChange: (iso: string) => void;
}) {
  return (
    <div className="w-full">
      <label htmlFor="dob" className="mb-2 flex items-center gap-1 text-sm font-medium text-foreground/90">
        Date of birth <span className="text-rose-400">*</span>
      </label>
      <div className="group relative">
        <div
          className="relative flex items-center rounded-2xl transition-all duration-300"
          style={{
            background: "linear-gradient(135deg, rgba(255,255,255,0.05), rgba(255,255,255,0.02))",
            border: "1px solid rgba(255,255,255,0.1)",
            boxShadow: "inset 0 1px 0 rgba(255,255,255,0.06), 0 6px 20px -8px rgba(0,0,0,0.5)",
          }}
        >
          <div
            className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-focus-within:opacity-100"
            style={{ boxShadow: "0 0 0 1.5px rgba(52,211,153,0.6), 0 0 22px -2px rgba(34,211,238,0.45)" }}
          />
          <CalendarIcon className="ml-3.5 h-4 w-4 text-muted-foreground" />
          <input
            id="dob"
            type="text"
            readOnly
            placeholder="DD-MM-YYYY"
            value={display}
            className="w-full cursor-pointer bg-transparent px-3 py-3.5 text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none"
          />
          {/* Native date input overlaid for picker */}
          <input
            type="date"
            value={value}
            max={new Date().toISOString().split("T")[0]}
            min="1940-01-01"
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
            aria-label="Select date of birth"
          />
          <CalendarIcon className="mr-3.5 h-4 w-4 text-aurora" />
        </div>
      </div>
    </div>
  );
}
