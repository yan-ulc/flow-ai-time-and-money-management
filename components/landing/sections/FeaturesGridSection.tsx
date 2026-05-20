"use client";

import {
    motion,
    useMotionValue,
    useSpring,
    useTransform,
} from "framer-motion";
import { CalendarClock, ShieldCheck, Wallet } from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";

// ─── Features data ────────────────────────────────────────────────────────────

const FEATURES = [
  {
    index: "01",
    title: "AI Financial Tracker",
    description:
      "Automated expense recording, real-time cash flow calculations, and month-end balance predictions — all from a single conversation.",
    icon: Wallet,
    label: "Finance",
  },
  {
    index: "02",
    title: "Smart Scheduler",
    description:
      "Adaptive reminders that integrate directly with your daily task management, keeping your schedule aligned with your priorities.",
    icon: CalendarClock,
    label: "Schedule",
  },
  {
    index: "03",
    title: "Privacy First",
    description:
      "Your financial data is end-to-end encrypted, never sold, never shared. You own your data — full stop.",
    icon: ShieldCheck,
    label: "Security",
  },
];

// ─── Feature Card ─────────────────────────────────────────────────────────────

function FeatureCard({
  feature,
  index: cardIndex,
}: {
  feature: (typeof FEATURES)[number];
  index: number;
}) {
  const wrapperRef  = useRef<HTMLDivElement>(null);
  const cardRef     = useRef<HTMLDivElement>(null);
  const rafRef      = useRef<number | null>(null);
  const isMobile    = useRef(false);
  const [hovered, setHovered] = useState(false);
  const Icon = feature.icon;

  // ── Cursor position in % (for inner glass light) ──
  const cursorX = useMotionValue(50);
  const cursorY = useMotionValue(50);
  const springCursorX = useSpring(cursorX, { stiffness: 160, damping: 22 });
  const springCursorY = useSpring(cursorY, { stiffness: 160, damping: 22 });

  const glowBackground = useTransform(
    [springCursorX, springCursorY],
    ([cx, cy]: number[]) =>
      `radial-gradient(260px circle at ${cx}% ${cy}%, rgba(255,255,255,0.046) 0%, transparent 70%)`
  );

  // ── Magnet: card body translates toward cursor ──
  const magnetX = useMotionValue(0);
  const magnetY = useMotionValue(0);
  const springMagX = useSpring(magnetX, { stiffness: 200, damping: 22, mass: 0.5 });
  const springMagY = useSpring(magnetY, { stiffness: 200, damping: 22, mass: 0.5 });

  // ── Behind-panel ambient light follows cursor too (slower) ──
  const lightX = useMotionValue(50);
  const lightY = useMotionValue(50);
  const springLightX = useSpring(lightX, { stiffness: 60, damping: 18 });
  const springLightY = useSpring(lightY, { stiffness: 60, damping: 18 });

  const ambientLight = useTransform(
    [springLightX, springLightY],
    ([lx, ly]: number[]) =>
      `radial-gradient(340px circle at ${lx}% ${ly}%, rgba(255,255,255,0.065) 0%, transparent 65%)`
  );

  useEffect(() => {
    isMobile.current = window.matchMedia("(max-width: 768px)").matches;
  }, []);

  const onMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (isMobile.current) return;
      const card = cardRef.current;
      if (!card) return;

      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(() => {
        const r = card.getBoundingClientRect();

        // Cursor % inside card
        const relX = (e.clientX - r.left) / r.width;
        const relY = (e.clientY - r.top) / r.height;

        // Glass light
        cursorX.set(relX * 100);
        cursorY.set(relY * 100);

        // Ambient glow behind
        lightX.set(relX * 100);
        lightY.set(relY * 100);

        // Magnet: shift card up to ±8px toward cursor from center
        magnetX.set((relX - 0.5) * 14);
        magnetY.set((relY - 0.5) * 10);
      });
    },
    [cursorX, cursorY, lightX, lightY, magnetX, magnetY]
  );

  const onMouseEnter = useCallback(() => setHovered(true), []);

  const onMouseLeave = useCallback(() => {
    setHovered(false);
    cursorX.set(50);
    cursorY.set(50);
    lightX.set(50);
    lightY.set(50);
    magnetX.set(0);
    magnetY.set(0);
  }, [cursorX, cursorY, lightX, lightY, magnetX, magnetY]);

  useEffect(
    () => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); },
    []
  );

  return (
    // Entrance wrapper (scroll reveal only, no extra transforms)
    <motion.div
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-6%" }}
      transition={{ duration: 0.7, delay: cardIndex * 0.1, ease: [0.22, 1, 0.36, 1] }}
      className="relative"
    >
      {/* ── Behind-panel ambient light ─────────────────────────────────── */}
      <motion.div
        className="absolute -inset-6 rounded-[36px] pointer-events-none"
        style={{ opacity: hovered ? 1 : 0 }}
        transition={{ duration: 0.4 }}
        aria-hidden
      >
        {/* Static soft glow behind card */}
        <div
          className="absolute inset-0 rounded-[36px]"
          style={{
            background: "radial-gradient(60% 80% at 50% 50%, rgba(255,255,255,0.06) 0%, transparent 100%)",
            filter: "blur(24px)",
          }}
        />
        {/* Cursor-reactive light bloom */}
        <motion.div
          className="absolute inset-0 rounded-[36px]"
          style={{
            background: ambientLight,
            filter: "blur(20px)",
          }}
        />
      </motion.div>

      {/* ── Magnet card wrapper ────────────────────────────────────────── */}
      <motion.div
        ref={wrapperRef}
        style={{ x: springMagX, y: springMagY, willChange: "transform" }}
        className="relative h-full"
      >
        {/* ── Card body ─────────────────────────────────────────────── */}
        <motion.div
          ref={cardRef}
          onMouseMove={onMouseMove}
          onMouseEnter={onMouseEnter}
          onMouseLeave={onMouseLeave}
          className="group relative flex flex-col gap-7 rounded-[24px] p-8 md:p-10 overflow-hidden cursor-default h-full"
          style={{ willChange: "transform" }}
        >
          {/* Card surface */}
          <div
            className="absolute inset-0 rounded-[24px]"
            style={{
              background: "linear-gradient(145deg, #1c1c1f 0%, #141416 60%, #111113 100%)",
              boxShadow: [
                "0 1px 0 0 rgba(255,255,255,0.055) inset",
                "0 0 0 0.5px rgba(255,255,255,0.065)",
                hovered
                  ? "0 24px 56px -12px rgba(0,0,0,0.85), 0 4px 16px -4px rgba(0,0,0,0.6)"
                  : "0 8px 24px -8px rgba(0,0,0,0.6), 0 2px 6px -2px rgba(0,0,0,0.4)",
              ].join(", "),
              transition: "box-shadow 0.35s ease",
            }}
          />

          {/* Top shimmer */}
          <div
            className="absolute top-0 inset-x-0 h-px pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.12) 35%, rgba(255,255,255,0.17) 50%, rgba(255,255,255,0.12) 65%, transparent)",
            }}
            aria-hidden
          />

          {/* Cursor glass light */}
          <motion.div
            className="absolute inset-0 pointer-events-none rounded-[24px]"
            style={{ background: glowBackground }}
            aria-hidden
          />

          {/* ── Content ── */}
          <div className="relative z-10 flex flex-col gap-7 h-full">
            {/* Index / label row */}
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold tracking-[0.35em] uppercase text-zinc-600 group-hover:text-zinc-500 transition-colors duration-300">
                {feature.label}
              </span>
              <span className="text-[11px] font-mono text-zinc-700">{feature.index}</span>
            </div>

            {/* Icon */}
            <div className="relative w-12 h-12 shrink-0">
              <div
                className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
                style={{
                  background: "rgba(255,255,255,0.04)",
                  boxShadow: "0 0 24px 6px rgba(255,255,255,0.06)",
                }}
                aria-hidden
              />
              <div
                className="relative w-12 h-12 flex items-center justify-center rounded-xl border border-white/[0.07] group-hover:border-white/[0.13] transition-all duration-300"
                style={{
                  background: "linear-gradient(145deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.02) 100%)",
                  boxShadow: "0 1px 0 0 rgba(255,255,255,0.07) inset, 0 4px 12px -4px rgba(0,0,0,0.5)",
                }}
              >
                <Icon className="w-5 h-5 text-zinc-300 group-hover:text-zinc-100 transition-colors duration-300" />
              </div>
            </div>

            {/* Text */}
            <div className="flex flex-col gap-3 flex-1">
              <h3 className="text-lg font-semibold tracking-tight text-slate-100 leading-snug">
                {feature.title}
              </h3>
              <p className="text-sm text-zinc-500 leading-relaxed font-light group-hover:text-zinc-400 transition-colors duration-300">
                {feature.description}
              </p>
            </div>

            {/* Bottom accent line */}
            <div className="h-px w-8 bg-zinc-800 group-hover:w-12 group-hover:bg-zinc-600 transition-all duration-500" />
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

export function FeaturesGridSection() {
  return (
    <section className="relative py-24 md:py-32 bg-background border-t border-white/[0.06] overflow-x-hidden">

      {/* Section background atmosphere */}
      <div
        className="absolute inset-0 pointer-events-none"
        aria-hidden
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 100%, rgba(255,255,255,0.016) 0%, transparent 70%)",
        }}
      />


      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70 mb-6">
            System Component // FEATURES
          </p>
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.08] tracking-tight text-slate-100 drop-shadow-sm">
              Built for how<br />you actually live.
            </h2>
            <p className="text-base text-slate-300/65 leading-relaxed font-light max-w-xs md:text-right">
              Three pillars. One coherent system.
            </p>
          </div>
          {/* ── Line + glow: co-located so they always match ── */}
          <div className="relative mt-10" style={{ zIndex: 0 }}>
            {/* The visible 1px line */}
            <div
              style={{
                height: "1px",
                background:
                  "linear-gradient(90deg, transparent 0%, rgba(255,255,255,0.05) 5%, rgba(255,255,255,0.95) 30%, rgba(255,255,255,1) 50%, rgba(255,255,255,0.95) 70%, rgba(255,255,255,0.05) 95%, transparent 100%)",
              }}
            />

            {/*
              Glow mounted here — same DOM position as the line.
              Uses left:50% translateX(-50%) width:100vw so it spans
              the full viewport regardless of max-w-6xl container.
              Overflows downward freely (section is overflow-x-hidden only).
            */}
            <div
              className="pointer-events-none"
              aria-hidden
              style={{
                position: "absolute",
                top: 0,
                left: "50%",
                transform: "translateX(-50%)",
                width: "100vw",
              }}
            >
              {/* Layer 1 — tight cone */}
              <div style={{ height: "80px",  background: "radial-gradient(40% 100% at 50% 0%, rgba(255,255,255,0.34) 0%, transparent 100%)" }} />
              {/* Layer 2 — mid bloom */}
              <div style={{ position:"absolute", inset:0, height:"240px",  background: "radial-gradient(55% 100% at 50% 0%, rgba(255,255,255,0.14) 0%, transparent 100%)" }} />
              {/* Layer 3 — wide atmospheric */}
              <div style={{ position:"absolute", inset:0, height:"440px",  background: "radial-gradient(72% 100% at 50% 0%, rgba(255,255,255,0.060) 0%, transparent 100%)" }} />
              {/* Layer 4 — far fall-off into cards */}
              <div style={{ position:"absolute", inset:0, height:"680px",  background: "radial-gradient(85% 100% at 50% 0%, rgba(255,255,255,0.024) 0%, transparent 100%)" }} />
            </div>
          </div>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-5">
          {FEATURES.map((feature, i) => (
            <FeatureCard key={i} feature={feature} index={i} />
          ))}
        </div>
      </div>
    </section>
  );
}
