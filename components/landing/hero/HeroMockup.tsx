"use client";

import { motion } from "framer-motion";
import {
  Activity,
  ArrowUpRight,
  Bot,
  Calendar,
  LineChart,
  Sparkles,
} from "lucide-react";

const CHART_POINTS = [60, 68, 62, 78, 74, 86, 80, 92];

export function HeroMockup() {
  return (
    <motion.div
      id="demo"
      className="relative"
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, delay: 0.2 }}
    >
      <motion.div
        className="absolute -inset-6 rounded-[36px] bg-gradient-to-r from-cyan-500/20 via-emerald-400/10 to-amber-300/10 blur-2xl"
        animate={{ opacity: [0.35, 0.65, 0.35] }}
        transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
      />

      <motion.div
        className="relative rounded-[32px] border border-white/10 bg-gradient-to-b from-white/10 via-slate-900/70 to-slate-950/90 p-6 shadow-[0_30px_120px_-60px_rgba(15,23,42,0.9)]"
        animate={{ y: [0, -6, 0] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
      >

        <div className="mt-5 grid grid-cols-12 gap-4">
          <div className="col-span-12 md:col-span-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-xs text-slate-300/70">
              <span className="flex items-center gap-2">
                <LineChart className="h-4 w-4" /> Balance Pulse
              </span>
              <ArrowUpRight className="h-4 w-4 text-emerald-300" />
            </div>
            <div className="mt-3 text-2xl font-semibold text-white">
              $24,830
            </div>
            <div className="mt-3 flex items-end gap-1.5">
              {CHART_POINTS.map((value, index) => (
                <motion.div
                  key={index}
                  className="w-3 rounded-full bg-gradient-to-t from-emerald-400/40 to-cyan-200/80"
                  style={{ height: `${value}px` }}
                  animate={{ opacity: [0.6, 1, 0.6] }}
                  transition={{
                    duration: 3.6,
                    repeat: Infinity,
                    delay: index * 0.25,
                  }}
                />
              ))}
            </div>
          </div>

          <div className="col-span-12 md:col-span-6 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center gap-2 text-xs text-slate-300/70">
              <Calendar className="h-4 w-4" /> Today's Flow
            </div>
            <div className="mt-3 space-y-3 text-sm text-slate-200">
              {["Cash sync", "AI forecast", "Expense shield"].map(
                (item, index) => (
                  <motion.div
                    key={item}
                    className="flex items-center justify-between rounded-xl border border-white/5 bg-white/5 px-3 py-2"
                    animate={{ x: [0, 4, 0] }}
                    transition={{
                      duration: 7,
                      repeat: Infinity,
                      delay: index * 0.55,
                    }}
                  >
                    <span>{item}</span>
                    <span className="text-xs text-emerald-200">Live</span>
                  </motion.div>
                ),
              )}
            </div>
          </div>

          <div className="col-span-12 rounded-2xl border border-white/10 bg-white/5 p-4">
            <div className="flex items-center justify-between text-xs text-slate-300/70">
              <span className="flex items-center gap-2">
                <Bot className="h-4 w-4" /> AI Guidance
              </span>
              <Activity className="h-4 w-4 text-cyan-200" />
            </div>
            <div className="mt-3 flex flex-col gap-3 text-sm text-slate-100">
              {[
                "Projected surplus rising 8% by Friday.",
                "Subscriptions optimized, saved $142 this month.",
              ].map((insight, index) => (
                <motion.div
                  key={insight}
                  className="rounded-xl border border-white/5 bg-white/10 px-3 py-2"
                  animate={{ opacity: [0.7, 1, 0.7] }}
                  transition={{
                    duration: 4.6,
                    repeat: Infinity,
                    delay: index * 0.65,
                  }}
                >
                  {insight}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}
