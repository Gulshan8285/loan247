"use client";

import { motion } from "framer-motion";
import { useMemo } from "react";

/**
 * AuroraBackground
 * A fixed, full-viewport animated background featuring:
 *  - deep radial gradient mesh (emerald / cyan / violet / pink)
 *  - floating blurred orbs with parallax drift
 *  - a subtle perspective grid floor (3D depth cue)
 *  - drifting aurora ribbon
 *
 * Purely decorative, pointer-events disabled, sits behind all content.
 */
export function AuroraBackground() {
  const orbs = useMemo(
    () => [
      { color: "rgba(16,185,129,0.55)", size: 420, top: "-8%", left: "-10%", delay: 0, duration: 18 },
      { color: "rgba(34,211,238,0.42)", size: 360, top: "30%", left: "70%", delay: 2, duration: 22 },
      { color: "rgba(167,139,250,0.40)", size: 460, top: "65%", left: "5%", delay: 4, duration: 20 },
      { color: "rgba(244,114,182,0.32)", size: 300, top: "80%", left: "75%", delay: 1, duration: 16 },
      { color: "rgba(251,191,36,0.22)", size: 240, top: "12%", left: "55%", delay: 3, duration: 24 },
    ],
    [],
  );

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 -z-10 overflow-hidden"
      style={{ background: "radial-gradient(120% 120% at 50% 0%, #0b0b1a 0%, #06060d 55%, #04040a 100%)" }}
    >
      {orbs.map((o, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full"
          style={{
            width: o.size,
            height: o.size,
            top: o.top,
            left: o.left,
            background: `radial-gradient(circle at 30% 30%, ${o.color}, transparent 65%)`,
            filter: "blur(60px)",
          }}
          animate={{
            x: [0, 40, -30, 0],
            y: [0, -50, 30, 0],
            scale: [1, 1.12, 0.95, 1],
          }}
          transition={{
            duration: o.duration,
            delay: o.delay,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}

      {/* 3D perspective grid floor */}
      <div
        className="absolute inset-x-0 bottom-0 h-[55%] opacity-[0.18]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(52,211,153,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(52,211,153,0.5) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
          transform: "perspective(600px) rotateX(62deg) translateY(8%) scale(1.6)",
          transformOrigin: "bottom center",
          maskImage: "linear-gradient(to top, black 10%, transparent 80%)",
          WebkitMaskImage: "linear-gradient(to top, black 10%, transparent 80%)",
        }}
      />

      {/* Top glow vignette */}
      <div
        className="absolute inset-x-0 top-0 h-[40%]"
        style={{
          background:
            "radial-gradient(80% 100% at 50% 0%, rgba(52,211,153,0.18), transparent 70%)",
        }}
      />

      {/* Slow rotating conic aurora ribbon */}
      <motion.div
        className="absolute left-1/2 top-1/2 h-[140vmax] w-[140vmax] -translate-x-1/2 -translate-y-1/2 opacity-[0.07]"
        style={{
          background:
            "conic-gradient(from 0deg, #34d399, #22d3ee, #a78bfa, #f472b6, #fbbf24, #34d399)",
          filter: "blur(80px)",
        }}
        animate={{ rotate: 360 }}
        transition={{ duration: 90, repeat: Infinity, ease: "linear" }}
      />

      {/* Fine star dots */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "radial-gradient(1px 1px at 20% 30%, rgba(255,255,255,0.5), transparent), radial-gradient(1px 1px at 70% 60%, rgba(255,255,255,0.35), transparent), radial-gradient(1px 1px at 40% 80%, rgba(255,255,255,0.4), transparent), radial-gradient(1px 1px at 85% 20%, rgba(255,255,255,0.3), transparent), radial-gradient(1px 1px at 10% 70%, rgba(255,255,255,0.35), transparent)",
          backgroundSize: "600px 600px",
        }}
      />
    </div>
  );
}
