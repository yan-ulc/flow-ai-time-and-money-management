"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import {
  AlertTriangle,
  ArrowDownRight,
  BrainCircuit,
  Sparkles,
} from "lucide-react";
import { useRef } from "react";

const COPY_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

export function PredictiveIntelligenceSection() {
  const sectionRef = useRef<HTMLDivElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const lineProgress = useTransform(scrollYProgress, [0.08, 0.78], [0, 1]);
  const glowOpacity = useTransform(
    scrollYProgress,
    [0, 0.4, 1],
    [0.2, 0.8, 0.3],
  );
  const warningOpacity = useTransform(
    scrollYProgress,
    [0.25, 0.62, 0.9],
    [0, 1, 0],
  );

  return (
    <section
      ref={sectionRef}
      className="relative overflow-hidden px-6 py-30 md:px-12 lg:px-20"
    >
      <div className="absolute inset-0">
        <motion.div
          className="absolute left-[10%] top-[20%] h-80 w-80 rounded-full bg-emerald-400/10 blur-3xl"
          style={{ opacity: glowOpacity }}
        />
        <motion.div
          className="absolute right-[8%] bottom-[18%] h-96 w-96 rounded-full bg-rose-500/12 blur-3xl"
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 60%, rgba(148,163,184,0.08), transparent 55%)",
          }}
          animate={{ opacity: [0.2, 0.45, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
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
            className="text-xs uppercase tracking-[0.4em] text-emerald-200/70"
          >
            Predictive Intelligence
          </motion.p>
          <motion.h2
            variants={COPY_VARIANTS}
            className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight"
          >
            See the future curve before it hits.
          </motion.h2>
          <motion.p
            variants={COPY_VARIANTS}
            className="mt-5 text-base text-slate-300/80"
          >
            FlowAI forecasts your balance trajectory and exposes dips while you
            still have time to act.
          </motion.p>
        </motion.div>

        <div className="relative rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_35px_140px_-80px_rgba(15,23,42,0.95)]">
          <div className="flex items-center justify-between text-xs text-slate-200/70">
            <div className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-emerald-200" /> Forecast Engine
            </div>
            <span className="text-emerald-200/70">Next 30 days</span>
          </div>

          <div className="relative mt-8 h-64 overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-slate-950/70 via-slate-900/60 to-slate-950/90">
            <motion.div
              className="absolute left-6 top-6 flex items-center gap-2 rounded-full border border-rose-500/30 bg-rose-500/10 px-3 py-1 text-[11px] text-rose-100"
              style={{ opacity: warningOpacity }}
            >
              <AlertTriangle className="h-3.5 w-3.5" />
              Cash dip in 8 days
            </motion.div>

            <motion.div
              className="absolute right-6 top-6 flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-[11px] text-emerald-100"
              animate={{ opacity: [0.4, 0.8, 0.4] }}
              transition={{
                duration: 4.6,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <BrainCircuit className="h-3.5 w-3.5" />
              Projection stable
            </motion.div>

            <div className="absolute inset-0 flex items-center justify-center">
              <svg
                viewBox="0 0 600 240"
                className="h-full w-full"
                aria-hidden="true"
              >
                <motion.path
                  d="M20,180 C80,120 120,140 170,110 C220,80 260,130 310,120 C360,110 400,70 450,90 C500,110 540,80 580,70"
                  fill="none"
                  stroke="rgba(110,231,183,0.8)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="1"
                  style={{ pathLength: lineProgress }}
                />
                <motion.path
                  d="M450,90 C500,110 540,80 580,70"
                  fill="none"
                  stroke="rgba(248,113,113,0.7)"
                  strokeWidth="4"
                  strokeLinecap="round"
                  strokeDasharray="1"
                  style={{ pathLength: lineProgress }}
                />
              </svg>
            </div>

            <motion.div
              className="absolute bottom-6 left-6 flex items-center gap-2 text-xs text-slate-300/70"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{
                duration: 4.2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <ArrowDownRight className="h-4 w-4 text-rose-200" />
              Predicted dip: -$3,200
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
