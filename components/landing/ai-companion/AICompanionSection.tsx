"use client";

import { cubicBezier, motion } from "framer-motion";
import { Bot, HeartHandshake, Shield, Zap } from "lucide-react";
import { useState } from "react";

const COPY_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: cubicBezier(0.16, 1, 0.3, 1) },
  },
};

type Persona = {
  id: "neutral" | "supportive" | "savage";
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  summary: string;
  tone: string[];
  accent: string;
  glow: string;
};

const PERSONAS: Persona[] = [
  {
    id: "neutral",
    title: "Neutral",
    icon: Shield,
    summary: "Clear. Precise. Calm under pressure.",
    tone: [
      "Balance stable. Next expense window in 3 days.",
      "No anomalies detected. Maintaining cadence.",
    ],
    accent: "from-cyan-300/80 to-emerald-200/80",
    glow: "bg-cyan-400/20",
  },
  {
    id: "supportive",
    title: "Supportive",
    icon: HeartHandshake,
    summary: "Warm guidance with gentle confidence.",
    tone: [
      "You are ahead of schedule. Keep this flow.",
      "Small wins add up. Proud of this trajectory.",
    ],
    accent: "from-emerald-300/80 to-amber-200/80",
    glow: "bg-emerald-400/20",
  },
  {
    id: "savage",
    title: "Savage",
    icon: Zap,
    summary: "Direct. Unfiltered. Action required.",
    tone: [
      "Cut the noise. Subscription creep detected.",
      "Balance drop incoming. Fix it now.",
    ],
    accent: "from-rose-400/80 to-amber-200/80",
    glow: "bg-rose-400/20",
  },
];

export function AICompanionSection() {
  const [activePersona, setActivePersona] = useState<Persona>(PERSONAS[0]);

  return (
    <section className="relative overflow-hidden px-6 py-28 md:px-12 lg:px-20">
      <div className="absolute inset-0">
        <motion.div
          className="absolute left-[10%] top-[18%] h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl"
          animate={{ y: [0, -18, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[6%] bottom-[16%] h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl"
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
            className="text-xs uppercase tracking-[0.4em] text-emerald-200/70"
          >
            AI Companion
          </motion.p>
          <motion.h2
            variants={COPY_VARIANTS}
            className="mt-4 text-3xl sm:text-4xl font-semibold tracking-tight"
          >
            Pick the voice that moves you.
          </motion.h2>
          <motion.p
            variants={COPY_VARIANTS}
            className="mt-5 text-base text-slate-300/80"
          >
            FlowAI adapts to your personality and delivers guidance in the tone
            that keeps you in control.
          </motion.p>
        </motion.div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="grid gap-4 md:grid-cols-3">
            {PERSONAS.map((persona) => {
              const isActive = persona.id === activePersona.id;
              const Icon = persona.icon;
              return (
                <motion.button
                  key={persona.id}
                  type="button"
                  onMouseEnter={() => setActivePersona(persona)}
                  onFocus={() => setActivePersona(persona)}
                  className={`relative overflow-hidden rounded-2xl border px-4 py-5 text-left transition duration-300 ${
                    isActive
                      ? "border-emerald-300/40 bg-white/10"
                      : "border-white/10 bg-white/5 hover:border-white/30"
                  }`}
                  whileHover={{ y: -4 }}
                >
                  <motion.div
                    className={`absolute inset-0 ${persona.glow} opacity-0`}
                    animate={{ opacity: isActive ? 0.4 : 0 }}
                    transition={{
                      duration: 0.6,
                      ease: cubicBezier(0.16, 1, 0.3, 1),
                    }}
                  />
                  <div className="relative">
                    <div className="flex items-center justify-between">
                      <Icon className="h-5 w-5 text-slate-100" />
                      {isActive && <Bot className="h-4 w-4 text-emerald-200" />}
                    </div>
                    <div className="mt-4 text-sm font-semibold text-white">
                      {persona.title}
                    </div>
                    <p className="mt-2 text-xs text-slate-300/70">
                      {persona.summary}
                    </p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <motion.div
            className="relative rounded-[28px] border border-white/10 bg-white/5 p-6"
            animate={{ y: [0, -4, 0] }}
            transition={{ duration: 7, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className="flex items-center justify-between text-xs text-slate-200/70">
              <div className="flex items-center gap-2">
                <Bot className="h-4 w-4 text-emerald-200" /> Companion Preview
              </div>
              <span className="text-emerald-200/70">Live</span>
            </div>

            <div className="mt-6 space-y-4">
              <motion.div
                key={activePersona.id}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-100"
              >
                {activePersona.tone[0]}
              </motion.div>
              <motion.div
                key={`${activePersona.id}-secondary`}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.45, delay: 0.05 }}
                className="rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm text-slate-100"
              >
                {activePersona.tone[1]}
              </motion.div>
            </div>

            <div className="mt-6 text-xs text-slate-300/70">
              Suggested tone:{" "}
              <span className="text-white">{activePersona.title}</span>
            </div>

            <motion.div
              className={`mt-5 h-1.5 w-full rounded-full bg-gradient-to-r ${activePersona.accent}`}
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
