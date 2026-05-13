"use client";

import { cubicBezier, motion } from "framer-motion";
import {
  BrainCircuit,
  Calendar,
  LineChart,
  Sparkles,
  Wallet,
} from "lucide-react";

const COPY_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: cubicBezier(0.16, 1, 0.3, 1) },
  },
};

const NODES = [
  {
    id: "cash",
    title: "Cash",
    icon: Wallet,
    position: "left-6 top-8",
    tone: "bg-cyan-400/10 border-cyan-400/30 text-cyan-100",
  },
  {
    id: "schedule",
    title: "Schedule",
    icon: Calendar,
    position: "right-8 top-14",
    tone: "bg-emerald-400/10 border-emerald-400/30 text-emerald-100",
  },
  {
    id: "prediction",
    title: "Prediction",
    icon: LineChart,
    position: "left-10 bottom-10",
    tone: "bg-indigo-400/10 border-indigo-400/30 text-indigo-100",
  },
  {
    id: "ai",
    title: "FlowAI",
    icon: BrainCircuit,
    position: "right-10 bottom-8",
    tone: "bg-amber-300/10 border-amber-300/30 text-amber-100",
  },
];

export function UnifiedSystemSection() {
  return (
    <section className="relative overflow-hidden px-6 py-28 md:px-12 lg:px-20">
      <div className="absolute inset-0">
        <motion.div
          className="absolute left-[8%] top-[10%] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl"
          animate={{ y: [0, -16, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[10%] bottom-[10%] h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl"
          animate={{ y: [0, 14, 0], opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-12">
        <motion.div
          className="max-w-2xl"
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <motion.p
            variants={COPY_VARIANTS}
            className="text-xs uppercase tracking-[0.4em] text-cyan-200/70"
          >
            Unified System
          </motion.p>
          <motion.h2
            variants={COPY_VARIANTS}
            className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight"
          >
            Every signal moves together.
          </motion.h2>
          <motion.p
            variants={COPY_VARIANTS}
            className="mt-5 text-base text-slate-300/80"
          >
            Finance, schedules, predictions, and AI sync into one living
            ecosystem. FlowAI keeps every surface aligned.
          </motion.p>
        </motion.div>

        <motion.div
          className="relative rounded-4xl border border-white/10 bg-white/5 p-6 shadow-[0_35px_140px_-80px_rgba(15,23,42,0.95)]"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: cubicBezier(0.16, 1, 0.3, 1) }}
          viewport={{ once: true, amount: 0.4 }}
        >
          <div className="flex items-center justify-between text-xs text-slate-200/70">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-cyan-200" /> Unified Sync
            </div>
            <span className="text-emerald-200/70">All systems live</span>
          </div>

          <div className="relative mt-8 h-80 overflow-hidden rounded-2xl border border-white/10 bg-linear-to-b from-slate-950/70 via-slate-900/60 to-slate-950/90">
            <motion.div
              className="absolute inset-0"
              animate={{ opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
            >
              <div className="absolute left-8 top-8 h-10 w-28 rounded-full bg-cyan-400/20 blur-xl" />
              <div className="absolute right-10 bottom-10 h-12 w-32 rounded-full bg-emerald-400/20 blur-xl" />
            </motion.div>

            <svg
              viewBox="0 0 600 320"
              className="absolute inset-0 h-full w-full"
              aria-hidden="true"
            >
              <motion.path
                d="M120,120 C220,80 280,80 380,120"
                fill="none"
                stroke="rgba(148,163,184,0.4)"
                strokeWidth="2"
                strokeDasharray="6 10"
                animate={{ pathLength: [0.6, 1, 0.6] }}
                transition={{
                  duration: 6,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.path
                d="M120,120 C220,200 320,220 420,200"
                fill="none"
                stroke="rgba(148,163,184,0.35)"
                strokeWidth="2"
                strokeDasharray="6 10"
                animate={{ pathLength: [0.4, 1, 0.4] }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </svg>

            {NODES.map((node, index) => {
              const Icon = node.icon;
              return (
                <motion.div
                  key={node.id}
                  className={`absolute ${node.position} rounded-2xl border px-4 py-3 text-xs backdrop-blur ${node.tone}`}
                  animate={{ y: [0, index % 2 === 0 ? -6 : 6, 0] }}
                  transition={{
                    duration: 7,
                    repeat: Infinity,
                    ease: "easeInOut",
                  }}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="h-4 w-4" />
                    <span className="font-semibold">{node.title}</span>
                  </div>
                  <div className="mt-2 text-[11px] text-slate-200/70">
                    Synced live
                  </div>
                </motion.div>
              );
            })}

            <motion.div
              className="absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-2 text-xs text-white"
              animate={{ scale: [1, 1.04, 1], opacity: [0.7, 1, 0.7] }}
              transition={{
                duration: 4.4,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <BrainCircuit className="h-4 w-4 text-emerald-200" />
              Orchestrating
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
