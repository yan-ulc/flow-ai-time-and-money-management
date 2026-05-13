"use client";

import { motion } from "framer-motion";

const ORBS = [
  {
    className: "-top-10 left-[5%]",
    size: "h-72 w-72",
    color: "bg-cyan-400/20",
    duration: 24,
    delay: 0,
  },
  {
    className: "top-[20%] right-[8%]",
    size: "h-80 w-80",
    color: "bg-emerald-400/15",
    duration: 28,
    delay: 2,
  },
  {
    className: "bottom-[8%] left-[18%]",
    size: "h-64 w-64",
    color: "bg-sky-300/15",
    duration: 26,
    delay: 4,
  },
  {
    className: "bottom-[-12%] right-[15%]",
    size: "h-72 w-72",
    color: "bg-amber-200/12",
    duration: 30,
    delay: 1,
  },
];

export function AmbientBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <motion.div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(56,189,248,0.12), transparent 55%), radial-gradient(circle at 80% 15%, rgba(16,185,129,0.12), transparent 50%), radial-gradient(circle at 50% 85%, rgba(251,191,36,0.08), transparent 55%)",
        }}
        animate={{
          backgroundPosition: ["0% 0%", "100% 100%", "0% 0%"],
        }}
        transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
      />

      <motion.div
        className="absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(148,163,184,0.08), transparent 40%), linear-gradient(300deg, rgba(94,234,212,0.06), transparent 45%)",
        }}
        animate={{ opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="absolute inset-0 opacity-30"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
        }}
        animate={{ backgroundPosition: ["0px 0px", "120px 120px", "0px 0px"] }}
        transition={{ duration: 80, repeat: Infinity, ease: "linear" }}
      />

      {ORBS.map((orb, index) => (
        <motion.div
          key={index}
          className={`absolute ${orb.className} ${orb.size} ${orb.color} rounded-full blur-3xl`}
          animate={{
            y: [0, -16, 0],
            x: [0, 8, 0],
            opacity: [0.4, 0.65, 0.4],
          }}
          transition={{
            duration: orb.duration,
            repeat: Infinity,
            delay: orb.delay,
            ease: "easeInOut",
          }}
        />
      ))}

      <motion.div
        className="absolute inset-0 opacity-15 mix-blend-soft-light"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22%3E%3Cfilter id=%22n%22 x=%220%22 y=%220%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%221%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%2260%22 height=%2260%22 filter=%22url(%23n)%22 opacity=%220.4%22/%3E%3C/svg%3E')",
        }}
        animate={{ opacity: [0.08, 0.18, 0.08] }}
        transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950" />
    </div>
  );
}
