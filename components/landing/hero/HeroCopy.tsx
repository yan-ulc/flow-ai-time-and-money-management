"use client";

import { cubicBezier, motion } from "framer-motion";
import { ShieldCheck } from "lucide-react";
import { HeroActions } from "./HeroActions";

const COPY_VARIANTS = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: cubicBezier(0.16, 1, 0.3, 1) },
  },
};

export function HeroCopy() {
  return (
    <motion.div
      className="flex flex-col items-center text-center gap-7"
      variants={{
        hidden: {},
        visible: { transition: { staggerChildren: 0.12 } },
      }}
      initial="hidden"
      animate="visible"
    >
      <motion.p
        variants={COPY_VARIANTS}
        className="text-xs uppercase tracking-[0.4em] text-cyan-200/80"
      >
        FlowAI Operating System
      </motion.p>
      <motion.h1
        variants={COPY_VARIANTS}
        className="text-4xl sm:text-5xl lg:text-6xl font-semibold leading-[1.08] tracking-tight"
      >
        Your Financial Life.
        <span className="block text-transparent bg-clip-text bg-gradient-to-r from-cyan-200 via-emerald-200 to-amber-200">
          Finally Under Control.
        </span>
      </motion.h1>
      <motion.p
        variants={COPY_VARIANTS}
        className="text-base sm:text-lg text-slate-300/80 max-w-xl"
      >
        FlowAI orchestrates money, schedules, and predictions into one living
        system that reacts in real time.
      </motion.p>
      <motion.div variants={COPY_VARIANTS}>
        <HeroActions />
      </motion.div>
      <motion.div
        variants={COPY_VARIANTS}
        className="flex items-center gap-3 text-xs text-slate-300/70"
      >
        <ShieldCheck className="h-4 w-4 text-emerald-200/70" />
        Trusted to keep your finances calm, private, and continuously monitored.
      </motion.div>
    </motion.div>
  );
}
