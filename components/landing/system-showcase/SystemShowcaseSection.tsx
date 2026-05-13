"use client";

import { cubicBezier, motion } from "framer-motion";
import {
  BrainCircuit,
  CalendarClock,
  CheckCircle2,
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

const CARD_VARIANTS = {
  hidden: { opacity: 0, y: 18, scale: 0.96 },
  visible: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.8, ease: cubicBezier(0.16, 1, 0.3, 1) },
  },
};

export function SystemShowcaseSection() {
  return (
    <section className="relative overflow-hidden px-6 py-28 md:px-12 lg:px-20">
      <div className="absolute inset-0">
        <motion.div
          className="absolute left-[12%] top-[15%] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl"
          animate={{ y: [0, -16, 0], opacity: [0.25, 0.6, 0.25] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[8%] bottom-[12%] h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl"
          animate={{ y: [0, 14, 0], opacity: [0.2, 0.5, 0.2] }}
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
            System Showcase
          </motion.p>
          <motion.h2
            variants={COPY_VARIANTS}
            className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight"
          >
            The operating system assembles itself as you scroll.
          </motion.h2>
          <motion.p
            variants={COPY_VARIANTS}
            className="mt-5 text-base text-slate-300/80"
          >
            FlowAI syncs cash, schedules, insights, and predictions into a
            unified cockpit. Every layer updates in real time.
          </motion.p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <motion.div
            variants={CARD_VARIANTS}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            className="relative rounded-[32px] border border-white/10 bg-white/5 p-6 shadow-[0_35px_120px_-70px_rgba(15,23,42,0.9)]"
          >
            <div className="flex items-center justify-between text-xs text-slate-200/70">
              <div className="flex items-center gap-2">
                <Sparkles className="h-4 w-4 text-cyan-200" /> Live Dashboard
              </div>
              <span className="text-emerald-200/70">Synthesizing</span>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <motion.div
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
                animate={{ y: [0, -4, 0] }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="flex items-center justify-between text-xs text-slate-300/70">
                  <span className="flex items-center gap-2">
                    <Wallet className="h-4 w-4" /> Liquidity
                  </span>
                  <span className="text-emerald-200">+12%</span>
                </div>
                <div className="mt-3 text-2xl font-semibold text-white">
                  $42,180
                </div>
                <div className="mt-3 h-2 rounded-full bg-white/10">
                  <motion.div
                    className="h-2 rounded-full bg-gradient-to-r from-cyan-300/80 to-emerald-300/80"
                    animate={{ width: ["55%", "72%", "60%"] }}
                    transition={{
                      duration: 5,
                      repeat: Infinity,
                      ease: "easeInOut",
                    }}
                  />
                </div>
              </motion.div>

              <motion.div
                className="rounded-2xl border border-white/10 bg-white/5 p-4"
                animate={{ y: [0, 4, 0] }}
                transition={{
                  duration: 7,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: 0.4,
                }}
              >
                <div className="flex items-center justify-between text-xs text-slate-300/70">
                  <span className="flex items-center gap-2">
                    <CalendarClock className="h-4 w-4" /> Schedules
                  </span>
                  <span className="text-cyan-200">4 synced</span>
                </div>
                <div className="mt-3 flex flex-col gap-2 text-xs text-slate-200">
                  {[
                    "Payroll aligned",
                    "Invoices staged",
                    "Subscriptions trimmed",
                  ].map((item, index) => (
                    <motion.div
                      key={item}
                      className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2"
                      animate={{ x: [0, 4, 0] }}
                      transition={{
                        duration: 5.6,
                        repeat: Infinity,
                        delay: index * 0.4,
                      }}
                    >
                      <span>{item}</span>
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-200" />
                    </motion.div>
                  ))}
                </div>
              </motion.div>
            </div>

            <motion.div
              className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4"
              animate={{ opacity: [0.7, 1, 0.7] }}
              transition={{
                duration: 4.8,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <div className="flex items-center justify-between text-xs text-slate-300/70">
                <span className="flex items-center gap-2">
                  <LineChart className="h-4 w-4" /> Predictive Flow
                </span>
                <span className="text-cyan-200/80">Live</span>
              </div>
              <div className="mt-4 flex items-end gap-2">
                {[18, 30, 24, 44, 36, 52, 46].map((value, index) => (
                  <motion.div
                    key={`bar-${value}-${index}`}
                    className="w-4 rounded-full bg-gradient-to-t from-cyan-400/30 to-emerald-300/90"
                    style={{ height: `${value}px` }}
                    animate={{ opacity: [0.6, 1, 0.6] }}
                    transition={{
                      duration: 3.6,
                      repeat: Infinity,
                      delay: index * 0.22,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>

          <motion.div
            variants={CARD_VARIANTS}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, amount: 0.35 }}
            className="rounded-[32px] border border-white/10 bg-white/5 p-6"
          >
            <div className="flex items-center gap-2 text-xs uppercase tracking-[0.3em] text-slate-300/60">
              AI Monitor
            </div>
            <div className="mt-4 flex items-center gap-3 text-sm text-slate-200">
              <BrainCircuit className="h-5 w-5 text-cyan-200" />
              FlowAI is assembling every surface in real time.
            </div>
            <div className="mt-6 space-y-4">
              {[
                "Balance trajectory aligned",
                "Schedule collisions resolved",
                "Spending outliers flagged",
                "Forecast locked for next 14 days",
              ].map((item, index) => (
                <motion.div
                  key={item}
                  className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-xs text-slate-200"
                  animate={{ y: [0, 6, 0] }}
                  transition={{
                    duration: 6.6,
                    repeat: Infinity,
                    delay: index * 0.4,
                  }}
                >
                  {item}
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
