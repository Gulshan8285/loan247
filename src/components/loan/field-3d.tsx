"use client";

import { motion, useMotionValue, useSpring, useTransform } from "framer-motion";
import { useRef, type ReactNode, type InputHTMLAttributes } from "react";

/**
 * TiltCard
 * A glassmorphic card that tilts in 3D toward the pointer (desktop) and
 * provides depth via layered gradients + soft shadow. Falls back gracefully
 * (no tilt) on touch devices where pointer move isn't fired.
 */
export function TiltCard({
  children,
  className = "",
  intensity = 8,
  glow = "emerald",
}: {
  children: ReactNode;
  className?: string;
  intensity?: number;
  glow?: "emerald" | "violet" | "none";
}) {
  const ref = useRef<HTMLDivElement>(null);
  const mx = useMotionValue(0.5);
  const my = useMotionValue(0.5);
  const rx = useSpring(useTransform(my, [0, 1], [intensity, -intensity]), { stiffness: 150, damping: 15 });
  const ry = useSpring(useTransform(mx, [0, 1], [-intensity, intensity]), { stiffness: 150, damping: 15 });

  function handleMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set((e.clientX - rect.left) / rect.width);
    my.set((e.clientY - rect.top) / rect.height);
  }
  function handleLeave() {
    mx.set(0.5);
    my.set(0.5);
  }

  const glowClass = glow === "emerald" ? "glow-emerald" : glow === "violet" ? "glow-violet" : "";

  return (
    <motion.div
      ref={ref}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{ transformStyle: "preserve-3d", rotateX: rx, rotateY: ry }}
      className={`relative rounded-3xl glass-strong glow-soft ${glowClass} ${className}`}
    >
      {/* glossy highlight that follows pointer */}
      <motion.div
        className="pointer-events-none absolute inset-0 rounded-3xl"
        style={{
          background: useTransform(
            [mx, my],
            ([x, y]) =>
              `radial-gradient(220px circle at ${x * 100}% ${y * 100}%, rgba(255,255,255,0.14), transparent 60%)`,
          ),
        }}
      />
      <div style={{ transform: "translateZ(40px)", transformStyle: "preserve-3d" }}>{children}</div>
    </motion.div>
  );
}

interface Field3DProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label: string;
  hint?: string;
  required?: boolean;
  prefix?: string;
  icon?: ReactNode;
}

/**
 * Field3D
 * A floating-label style 3D input with a glowing focus state and depth.
 */
export function Field3D({
  label,
  hint,
  required,
  prefix,
  icon,
  className = "",
  id,
  ...props
}: Field3DProps) {
  const inputId = id || label.replace(/\s+/g, "-").toLowerCase();
  return (
    <div className="w-full">
      <label
        htmlFor={inputId}
        className="mb-2 flex items-center gap-1 text-sm font-medium text-foreground/90"
      >
        {label}
        {required && <span className="text-rose-400">*</span>}
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
          {/* focus glow ring */}
          <div className="pointer-events-none absolute inset-0 rounded-2xl opacity-0 transition-opacity duration-300 group-focus-within:opacity-100" style={{ boxShadow: "0 0 0 1.5px rgba(52,211,153,0.6), 0 0 22px -2px rgba(34,211,238,0.45)" }} />
          {prefix && (
            <span className="pl-4 text-lg font-semibold text-aurora">{prefix}</span>
          )}
          {icon && <span className="pl-3.5 text-muted-foreground">{icon}</span>}
          <input
            id={inputId}
            className={`peer w-full bg-transparent px-4 py-3.5 text-base text-foreground placeholder:text-muted-foreground/50 focus:outline-none ${prefix ? "pl-2" : ""} ${icon && !prefix ? "pl-2" : ""} ${className}`}
            {...props}
          />
        </div>
      </div>
      {hint && <p className="mt-1.5 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
