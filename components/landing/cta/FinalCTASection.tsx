"use client";

import { motion } from "framer-motion";
import { ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";

const COPY_VARIANTS = {
  hidden: { opacity: 0, y: 16 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: "easeOut" } },
};

export function FinalCTASection() {
  return (
    <section className="relative overflow-hidden px-6 py-32 md:px-12 lg:px-20">
      <div className="absolute inset-0">
        <motion.div
          className="absolute left-[10%] top-[15%] h-80 w-80 rounded-full bg-emerald-400/15 blur-3xl"
          animate={{ y: [0, -16, 0], opacity: [0.2, 0.6, 0.2] }}
          transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute right-[6%] bottom-[18%] h-96 w-96 rounded-full bg-cyan-300/12 blur-3xl"
          animate={{ y: [0, 16, 0], opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        />
        <motion.div
          className="absolute inset-0 opacity-30"
          style={{
            backgroundImage:
              "radial-gradient(circle at 50% 55%, rgba(148,163,184,0.08), transparent 55%)",
          }}
          animate={{ opacity: [0.2, 0.5, 0.2] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
        />
      </div>

      <div className="relative mx-auto flex max-w-5xl flex-col items-center text-center">
        <motion.div
          className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs text-slate-200/70"
          initial={{ opacity: 0, y: 10 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, ease: "easeOut" }}
          viewport={{ once: true, amount: 0.6 }}
        >
          <Sparkles className="h-4 w-4 text-emerald-200" />
          FlowAI Launch Sequence
        </motion.div>

        <motion.h2
          variants={COPY_VARIANTS}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="mt-6 text-3xl sm:text-4xl lg:text-5xl font-semibold tracking-tight"
        >
          Take control before your finances take control of you.
        </motion.h2>

        <motion.p
          variants={COPY_VARIANTS}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="mt-5 text-base text-slate-300/80 max-w-2xl"
        >
          Start the FlowAI operating system and let the AI orchestrate your
          money, time, and future trajectory in one unified command center.
        </motion.p>

        <motion.div
          variants={COPY_VARIANTS}
          initial="hidden"
          whileInView="visible"
          viewport={{ once: true, amount: 0.5 }}
          className="mt-9 flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/sign-in"
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-slate-950 px-6 py-3 text-sm font-semibold shadow-[0_20px_60px_-30px_rgba(226,232,240,0.9)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_25px_70px_-30px_rgba(148,163,184,0.9)]"
          >
            Start Free
            <ArrowRight className="h-4 w-4" />
          </Link>
          <Link
            href="/sign-up"
            className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:border-white/40 hover:bg-white/10"
          >
            Create Account
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
