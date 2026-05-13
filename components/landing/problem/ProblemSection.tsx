"use client";

import { motion } from "framer-motion";
import {
  AlertTriangle,
  Bell,
  Calendar,
  CreditCard,
  TrendingDown,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const COPY_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

type ChaosItem = {
  id: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  chaos: { x: number; y: number; rotate: number };
  order: { x: number; y: number; rotate: number };
  tone: "danger" | "muted";
};

const CHAOS_ITEMS: ChaosItem[] = [
  {
    id: "alerts",
    label: "Overdraft risk",
    icon: AlertTriangle,
    chaos: { x: -60, y: -40, rotate: -8 },
    order: { x: -40, y: -10, rotate: 0 },
    tone: "danger",
  },
  {
    id: "card",
    label: "Card freeze",
    icon: CreditCard,
    chaos: { x: 90, y: -20, rotate: 6 },
    order: { x: 30, y: -30, rotate: 0 },
    tone: "danger",
  },
  {
    id: "calendar",
    label: "Missed schedule",
    icon: Calendar,
    chaos: { x: -30, y: 80, rotate: 10 },
    order: { x: -10, y: 30, rotate: 0 },
    tone: "danger",
  },
  {
    id: "signals",
    label: "Stacked alerts",
    icon: Bell,
    chaos: { x: 70, y: 70, rotate: -6 },
    order: { x: 40, y: 40, rotate: 0 },
    tone: "muted",
  },
  {
    id: "trend",
    label: "Balance drop",
    icon: TrendingDown,
    chaos: { x: 10, y: -90, rotate: 12 },
    order: { x: 0, y: -50, rotate: 0 },
    tone: "danger",
  },
];

export function ProblemSection() {
  const [isReordering, setIsReordering] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setIsReordering((prev) => !prev);
    }, 4800);

    return () => clearInterval(interval);
  }, []);

  const items = useMemo(() => CHAOS_ITEMS, []);

  return (
    <section className="relative overflow-hidden px-6 py-28 md:px-12 lg:px-20">
      <div className="absolute inset-0">
        <motion.div
          className="absolute left-[10%] top-[25%] h-64 w-64 rounded-full bg-rose-500/10 blur-3xl"
          animate={{ y: [0, -18, 0], opacity: [0.3, 0.6, 0.3] }}
          transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[8%] bottom-[20%] h-72 w-72 rounded-full bg-amber-300/10 blur-3xl"
          animate={{ y: [0, 12, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 lg:flex-row lg:items-center lg:gap-16">
        <motion.div
          className="flex-1"
          variants={{ visible: { transition: { staggerChildren: 0.12 } } }}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.4 }}
        >
          <motion.p
            variants={COPY_VARIANTS}
            className="text-xs uppercase tracking-[0.4em] text-rose-200/70"
          >
            Financial Chaos
          </motion.p>
          <motion.h2
            variants={COPY_VARIANTS}
            className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight"
          >
            Tools collide. Alerts stack. Balance drops without warning.
          </motion.h2>
          <motion.p
            variants={COPY_VARIANTS}
            className="mt-5 text-base text-slate-300/80 max-w-xl"
          >
            Fragmented finance systems create noise, missed schedules, and late
            reactions. FlowAI reorganizes the chaos into a single intelligent
            stream.
          </motion.p>
        </motion.div>

        <div className="flex-1">
          <div className="relative rounded-[28px] border border-white/10 bg-white/5 p-6 shadow-[0_30px_120px_-70px_rgba(15,23,42,0.9)]">
            <div className="flex items-center justify-between text-xs text-slate-200/60">
              <span>Fragmented Signals</span>
              <span className="text-rose-200/70">Live Chaos</span>
            </div>

            <div className="relative mt-6 h-72 overflow-hidden rounded-2xl border border-white/5 bg-gradient-to-b from-slate-900/70 to-slate-950/80">
              <motion.div
                className="absolute inset-0"
                animate={{ opacity: [0.4, 0.7, 0.4] }}
                transition={{
                  duration: 5,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              >
                <div className="absolute left-4 top-4 h-10 w-28 rounded-full bg-rose-500/20 blur-xl" />
                <div className="absolute right-6 bottom-10 h-12 w-32 rounded-full bg-amber-300/20 blur-xl" />
              </motion.div>

              {items.map((item, index) => {
                const Icon = item.icon;
                return (
                  <motion.div
                    key={item.id}
                    className={`absolute left-1/2 top-1/2 w-44 -translate-x-1/2 -translate-y-1/2 rounded-2xl border px-4 py-3 text-xs shadow-lg backdrop-blur ${
                      item.tone === "danger"
                        ? "border-rose-500/30 bg-rose-500/10 text-rose-100"
                        : "border-white/10 bg-white/5 text-slate-200"
                    }`}
                    animate={
                      isReordering
                        ? item.order
                        : {
                            ...item.chaos,
                            x: item.chaos.x + (index % 2 === 0 ? -12 : 10),
                          }
                    }
                    transition={{
                      duration: 1.8,
                      ease: "easeInOut",
                      delay: index * 0.06,
                    }}
                  >
                    <div className="flex items-center gap-2">
                      <Icon className="h-4 w-4" />
                      <span className="font-semibold">{item.label}</span>
                    </div>
                    <div className="mt-2 text-[11px] text-slate-200/70">
                      {isReordering
                        ? "FlowAI reorganizing"
                        : "Conflicting input"}
                    </div>
                  </motion.div>
                );
              })}

              <motion.div
                className="absolute inset-x-6 bottom-6 h-2 rounded-full bg-gradient-to-r from-rose-500/40 via-amber-300/30 to-transparent"
                animate={{ opacity: [0.4, 0.8, 0.4], scaleX: [0.85, 1, 0.85] }}
                transition={{
                  duration: 2.8,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute left-10 top-14 h-24 w-px bg-rose-400/40"
                animate={{ opacity: [0.3, 0.7, 0.3], scaleY: [0.8, 1.1, 0.8] }}
                transition={{
                  duration: 2.4,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
              <motion.div
                className="absolute right-12 top-10 h-16 w-px bg-rose-400/30"
                animate={{ opacity: [0.2, 0.6, 0.2], scaleY: [0.7, 1, 0.7] }}
                transition={{
                  duration: 2.1,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
              />
            </div>

            <div className="mt-6 grid grid-cols-2 gap-4 text-xs text-slate-300/70">
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                12 alerts in 24 hours
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-3 py-2">
                Balance down 6.8%
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
