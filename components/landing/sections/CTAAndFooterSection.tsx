"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from "framer-motion";
import { useClerk, useAuth, SignUp } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

// ─── SVG Assets & Effects ─────────────────────────────────────────────────────

function RealisticFire({ phase }: { phase: "idle" | "ignition" | "launching" | "auth" }) {
  // Fire animation states based on phase
  const isIdle = phase === "idle";
  const isIgnition = phase === "ignition";
  const isLaunching = phase === "launching";

  return (
    <div className="absolute top-[93%] left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-none" style={{ zIndex: -1 }}>
      {/* Outer Glow (Orange/Red) */}
      <motion.div
        className="absolute origin-top"
        style={{
          width: 80,
          background: "linear-gradient(to bottom, rgba(255, 100, 0, 0.8), transparent)",
          filter: "blur(12px)",
          borderRadius: "50% 50% 100% 100%",
        }}
        animate={{
          height: isIdle ? 60 : isIgnition ? 180 : isLaunching ? 800 : 0,
          opacity: isIdle ? 0.3 : isIgnition ? 0.8 : isLaunching ? 1 : 0,
          scaleX: isIdle ? 0.8 : isIgnition ? 1.2 : 0.6,
        }}
        transition={{
          height: { duration: isLaunching ? 0.4 : 1.5, ease: isLaunching ? "easeIn" : "easeInOut" },
          opacity: { duration: 0.3 },
          scaleX: { duration: 0.2, repeat: isIgnition ? Infinity : 0, repeatType: "reverse" }
        }}
      />
      {/* Mid Flame (Yellow) */}
      <motion.div
        className="absolute origin-top"
        style={{
          width: 50,
          background: "linear-gradient(to bottom, rgba(255, 200, 0, 0.9), transparent)",
          filter: "blur(6px)",
          borderRadius: "40% 40% 100% 100%",
        }}
        animate={{
          height: isIdle ? 40 : isIgnition ? 140 : isLaunching ? 600 : 0,
          opacity: isIdle ? 0.5 : isIgnition ? 1 : isLaunching ? 1 : 0,
          scaleX: isIdle ? [0.9, 1.1, 0.9] : isIgnition ? [0.9, 1.3, 0.9] : 0.5,
        }}
        transition={{
          height: { duration: isLaunching ? 0.4 : 1.5, ease: isLaunching ? "easeIn" : "easeInOut" },
          scaleX: { duration: isIdle ? 0.15 : 0.08, repeat: Infinity, ease: "linear" }
        }}
      />
      {/* Inner Core (White/Blue) */}
      <motion.div
        className="absolute origin-top"
        style={{
          width: 24,
          background: "linear-gradient(to bottom, #ffffff, rgba(200, 230, 255, 0.9), transparent)",
          filter: "blur(2px)",
          borderRadius: "30% 30% 100% 100%",
        }}
        animate={{
          height: isIdle ? 20 : isIgnition ? 80 : isLaunching ? 400 : 0,
          opacity: isIdle ? 0.8 : 1,
          scaleX: isIdle ? [0.95, 1.05, 0.95] : isIgnition ? [0.8, 1.2, 0.8] : 0.4,
        }}
        transition={{
          height: { duration: isLaunching ? 0.4 : 1.5, ease: isLaunching ? "easeIn" : "easeInOut" },
          scaleX: { duration: isIdle ? 0.1 : 0.05, repeat: Infinity, ease: "linear" }
        }}
      />
    </div>
  );
}

function RocketSVG({ phase }: { phase: "idle" | "ignition" | "launching" | "auth" }) {
  const engineGlow = phase === "idle" ? 0.3 : phase === "ignition" ? 1 : phase === "launching" ? 1 : 0;

  return (
    <div className="relative w-full h-full">
      <svg viewBox="0 0 240 420" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full relative z-10 overflow-visible">
        <defs>
          {/* Pixar-style gradients */}
          <linearGradient id="bodyGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="25%" stopColor="#fdfbf7" />
            <stop offset="75%" stopColor="#e3ded5" />
            <stop offset="100%" stopColor="#c5beb3" />
          </linearGradient>
          
          <linearGradient id="redGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ff7676" />
            <stop offset="25%" stopColor="#ff4b4b" />
            <stop offset="75%" stopColor="#d82020" />
            <stop offset="100%" stopColor="#9a0808" />
          </linearGradient>

          <linearGradient id="finLeft" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff7676" />
            <stop offset="100%" stopColor="#ba1515" />
          </linearGradient>
          
          <linearGradient id="finRight" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ff4b4b" />
            <stop offset="100%" stopColor="#8a0505" />
          </linearGradient>

          <linearGradient id="finCenter" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#ba1515" />
            <stop offset="50%" stopColor="#ff4b4b" />
            <stop offset="100%" stopColor="#8a0505" />
          </linearGradient>

          <linearGradient id="silverGrad" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="50%" stopColor="#9ca3af" />
            <stop offset="100%" stopColor="#4b5563" />
          </linearGradient>

          <linearGradient id="glassGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#a5f3fc" />
            <stop offset="50%" stopColor="#0ea5e9" />
            <stop offset="100%" stopColor="#0369a1" />
          </linearGradient>

          <linearGradient id="nozzleGrad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#6b7280" />
            <stop offset="25%" stopColor="#4b5563" />
            <stop offset="75%" stopColor="#1f2937" />
            <stop offset="100%" stopColor="#111827" />
          </linearGradient>

          <radialGradient id="eng" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity={engineGlow} />
            <stop offset="40%" stopColor="#fef08a" stopOpacity={engineGlow * 0.8} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
          
          <radialGradient id="engOuter" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#fb923c" stopOpacity={engineGlow * 0.6} />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>

          <filter id="glow">
            <feGaussianBlur stdDeviation="8" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <clipPath id="bodyClip">
            <path d="M 120 20 C 180 80, 200 200, 175 320 C 160 340, 140 345, 120 345 C 100 345, 80 340, 65 320 C 40 200, 60 80, 120 20 Z" />
          </clipPath>
        </defs>

        {/* Back Thruster Glow */}
        <motion.ellipse 
          cx="120" cy="390" rx="70" ry="30" 
          fill="url(#engOuter)" filter="url(#glow)"
          animate={{ opacity: phase === 'idle' ? [0.5, 1, 0.5] : 1 }}
          transition={{ duration: 0.6, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Left Fin */}
        <path d="M 65 240 C 10 250, -15 320, 10 375 C 30 395, 50 380, 75 330 Z" fill="url(#finLeft)" />
        {/* Right Fin */}
        <path d="M 175 240 C 230 250, 255 320, 230 375 C 210 395, 190 380, 165 330 Z" fill="url(#finRight)" />

        {/* Nozzle */}
        <path d="M 85 330 C 75 365, 65 385, 60 390 L 180 390 C 175 385, 165 365, 155 330 Z" fill="url(#nozzleGrad)" />
        <ellipse cx="120" cy="390" rx="60" ry="14" fill="#030712" />

        {/* Main Body */}
        <path d="M 120 20 C 180 80, 200 200, 175 320 C 160 340, 140 345, 120 345 C 100 345, 80 340, 65 320 C 40 200, 60 80, 120 20 Z" fill="url(#bodyGrad)" />

        {/* Body Details (Clipped) */}
        <g clipPath="url(#bodyClip)">
          {/* Red Nose */}
          <path d="M 0 0 L 240 0 L 240 100 Q 120 140 0 100 Z" fill="url(#redGrad)" />
          {/* Red Bottom Stripe */}
          <path d="M 0 280 Q 120 310 240 280 L 240 400 L 0 400 Z" fill="url(#redGrad)" />
          
          {/* 3D Core Highlight */}
          <path d="M 120 25 C 80 80, 60 180, 65 285 C 70 320, 90 340, 120 340 C 90 330, 80 280, 75 180 C 70 100, 90 50, 120 25 Z" fill="#ffffff" opacity="0.6" />
          {/* 3D Core Shadow */}
          <path d="M 120 25 C 160 80, 180 180, 175 285 C 170 320, 150 340, 120 340 C 150 330, 160 280, 165 180 C 170 100, 150 50, 120 25 Z" fill="#000000" opacity="0.15" />
        </g>

        {/* Front Center Fin */}
        <path d="M 120 250 C 128 280, 135 360, 120 395 C 105 360, 112 280, 120 250 Z" fill="url(#finCenter)" />
        {/* Front Fin Highlight */}
        <path d="M 120 250 C 117 280, 112 360, 120 395 C 114 360, 117 280, 120 250 Z" fill="#ffffff" opacity="0.2" />

        {/* Window */}
        <circle cx="120" cy="170" r="42" fill="url(#silverGrad)" />
        <circle cx="120" cy="170" r="34" fill="#1f2937" />
        <circle cx="120" cy="170" r="30" fill="url(#glassGrad)" />
        
        {/* Glass Reflections */}
        <path d="M 95 152 Q 120 135 145 152 Q 120 145 95 152 Z" fill="#ffffff" opacity="0.9" />
        <path d="M 100 188 Q 120 200 135 188 Q 120 193 100 188 Z" fill="#ffffff" opacity="0.3" />

        {/* Rivets */}
        <circle cx="120" cy="135" r="2" fill="#374151" />
        <circle cx="120" cy="205" r="2" fill="#374151" />
        <circle cx="85" cy="170" r="2" fill="#374151" />
        <circle cx="155" cy="170" r="2" fill="#374151" />

        {/* Inner Engine Flame Core */}
        <motion.ellipse 
          cx="120" cy="390" rx="40" ry="12" 
          fill="url(#eng)" filter="url(#glow)"
          animate={{ opacity: phase === 'idle' ? [0.7, 1, 0.7] : 1, scale: phase === 'idle' ? [0.9, 1.1, 0.9] : 1.2 }}
          transition={{ duration: 0.4, repeat: Infinity, ease: "easeInOut" }}
        />
      </svg>
      <RealisticFire phase={phase} />
    </div>
  );
}

// Heavy Cinematic Smoke Particles
const SMOKE_CONFIG = Array.from({ length: 18 }).map((_, i) => {
  const isCenter = i < 6;
  return {
    id: i,
    x: isCenter ? 50 + (Math.random() * 20 - 10) : 50 + (Math.random() * 120 - 60),
    delay: isCenter ? Math.random() * 0.1 : 0.1 + Math.random() * 0.3,
    size: 150 + Math.random() * 250,
    duration: 3 + Math.random() * 2,
    color: Math.random() > 0.5 ? "rgba(160, 165, 180, 0.4)" : "rgba(120, 125, 140, 0.35)",
  };
});

function HeavySmoke({ phase }: { phase: "idle" | "ignition" | "launching" | "auth" }) {
  if (phase === "idle") return null;

  return (
    <div className="absolute bottom-[-100px] left-1/2 -translate-x-1/2 w-[800px] h-[400px] pointer-events-none z-20">
      {SMOKE_CONFIG.map((s) => (
        <motion.div
          key={s.id}
          className="absolute rounded-full"
          style={{
            bottom: "20%",
            left: `${s.x}%`,
            width: s.size,
            height: s.size,
            background: `radial-gradient(circle, ${s.color} 0%, transparent 60%)`,
            filter: "blur(24px)",
            translateX: "-50%",
            translateY: "50%",
          }}
          initial={{ opacity: 0, scale: 0.1, y: 0, x: 0 }}
          animate={{
            opacity: phase === "auth" ? 0 : [0, 1, 0.8, 0],
            scale: [0.1, 1.5, 2.5, 3.5],
            y: [0, -20, -50, -80],
            x: [(s.x - 50) * 0.5, (s.x - 50) * 3, (s.x - 50) * 5],
          }}
          transition={{
            duration: phase === "auth" ? 2 : s.duration,
            delay: s.delay,
            ease: "easeOut",
          }}
        />
      ))}
    </div>
  );
}

// ─── Footer link ──────────────────────────────────────────────────────────────

function FooterLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link href={href} className="group relative text-zinc-600 hover:text-zinc-300 transition-colors duration-300 text-sm">
      {children}
      <span className="absolute -bottom-px left-0 w-0 h-px bg-zinc-400 group-hover:w-full transition-all duration-300" />
    </Link>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

type Phase = "idle" | "ignition" | "launching" | "auth";

export function CTAAndFooterSection() {
  const [phase, setPhase]         = useState<Phase>("idle");
  const { isSignedIn, isLoaded }  = useAuth();
  const router                    = useRouter();
  const sectionRef                = useRef<HTMLElement>(null);
  const timerRef                  = useRef<ReturnType<typeof setTimeout>[]>([]);

  const after = (ms: number, fn: () => void) => {
    const t = setTimeout(fn, ms);
    timerRef.current.push(t);
  };

  useEffect(() => () => { timerRef.current.forEach(clearTimeout); }, []);

  const handleLaunchClick = useCallback(() => {
    if (!isLoaded) return;
    if (isSignedIn) { router.push("/dashboard"); return; }
    if (phase !== "idle") return;

    // Trigger Ignition
    setPhase("ignition");
    
    // Trigger Launch after thrust builds up
    after(1500, () => {
      setPhase("launching");
    });

    // Reveal Auth Panel after rocket has exited
    after(2800, () => {
      setPhase("auth");
    });
  }, [isSignedIn, isLoaded, phase, router]);

  // Cursor reactive background light
  const cx = useMotionValue(50);
  const cy = useMotionValue(50);
  const springX = useSpring(cx, { stiffness: 40, damping: 25 });
  const springY = useSpring(cy, { stiffness: 40, damping: 25 });
  
  const cursorBg = useTransform(
    [springX, springY],
    ([lx, ly]: number[]) =>
      `radial-gradient(800px circle at ${lx}% ${ly}%, rgba(255,255,255,0.03) 0%, transparent 60%)`
  );

  const onMouseMove = useCallback((e: React.MouseEvent<HTMLElement>) => {
    const r = sectionRef.current?.getBoundingClientRect();
    if (!r) return;
    cx.set(((e.clientX - r.left) / r.width) * 100);
    cy.set(((e.clientY - r.top) / r.height) * 100);
  }, [cx, cy]);

  return (
    <>
      <motion.section
        ref={sectionRef}
        onMouseMove={onMouseMove}
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true, margin: "-5%" }}
        transition={{ duration: 1.2 }}
        className="relative bg-[#050506] border-t border-white/[0.06] overflow-hidden min-h-screen flex items-center"
      >
        {/* Environment reaction to launch */}
        <motion.div 
          className="absolute inset-0 pointer-events-none z-30 mix-blend-screen"
          animate={{
            backgroundColor: phase === "launching" ? "rgba(200, 230, 255, 0.15)" : "rgba(0,0,0,0)"
          }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />

        {/* Subtle camera shake wrapper */}
        <motion.div
          className="absolute inset-0 pointer-events-none"
          animate={{
            x: phase === "ignition" ? [-1, 1, -2, 2, -1, 1] : phase === "launching" ? [-4, 4, -4, 4, 0] : 0,
            y: phase === "ignition" ? [-1, 2, -1, 1, -2, 1] : phase === "launching" ? [-4, 4, -4, 4, 0] : 0,
          }}
          transition={{
            duration: phase === "ignition" ? 0.1 : 0.05,
            repeat: phase === "ignition" || phase === "launching" ? Infinity : 0,
          }}
        >
          <div style={{ background: "radial-gradient(ellipse 90% 70% at 30% 50%, rgba(255,255,255,0.015) 0%, transparent 65%)" }} className="absolute inset-0"/>
          <motion.div className="absolute inset-0" style={{ background: cursorBg }} />
        </motion.div>

        {/* Top border beam */}
        <div className="absolute top-0 inset-x-0 pointer-events-none" aria-hidden>
          <div className="h-px" style={{ background: "linear-gradient(90deg, transparent 5%, rgba(255,255,255,0.08) 30%, rgba(255,255,255,0.25) 50%, rgba(255,255,255,0.08) 70%, transparent 95%)" }}/>
          <div className="h-40" style={{ background: "radial-gradient(45% 100% at 50% 0%, rgba(255,255,255,0.05) 0%, transparent 100%)" }}/>
        </div>

        <div className="relative z-10 w-full max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-32 md:py-40">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 lg:gap-8 items-center">

            {/* ── LEFT: Copy + Button ── */}
            <motion.div
              initial={{ opacity: 0, filter: "blur(10px)", x: -20 }}
              whileInView={{ opacity: 1, filter: "blur(0px)", x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1] }}
              className="flex flex-col gap-8 relative z-20"
            >
              <motion.p 
                className="text-xs uppercase tracking-[0.45em] text-cyan-200/60"
                animate={{ opacity: phase === "idle" ? 1 : 0.5 }}
              >
                Begin your operating system
              </motion.p>

              <motion.h2
                animate={{ opacity: phase === "idle" ? 1 : 0.8 }}
                className="text-5xl md:text-6xl lg:text-7xl font-semibold leading-[1.04] tracking-tight"
                style={{
                  background: "linear-gradient(160deg, #ffffff 0%, rgba(255,255,255,0.85) 50%, rgba(255,255,255,0.4) 100%)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Your life,<br />finally<br />in order.
              </motion.h2>

              <motion.p 
                animate={{ opacity: phase === "idle" ? 1 : 0.6 }}
                className="text-base text-zinc-400 leading-relaxed font-light max-w-sm"
              >
                One conversation. Finances tracked.<br />Schedule structured. Goals moving.
              </motion.p>

              {/* ── THE "BEG TO BE CLICKED" BUTTON ── */}
              <div className="relative mt-4">
                {/* Outer breathing aura */}
                <motion.div
                  animate={{ 
                    opacity: phase === "idle" ? [0.4, 0.7, 0.4] : 0, 
                    scale: phase === "idle" ? [1, 1.08, 1] : 0.9 
                  }}
                  transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -inset-4 rounded-full pointer-events-none mix-blend-screen"
                  style={{ background: "radial-gradient(ellipse, rgba(200, 230, 255, 0.15) 0%, transparent 60%)", filter: "blur(16px)" }}
                />

                <motion.button
                  onClick={handleLaunchClick}
                  disabled={phase !== "idle"}
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.95, y: 2, boxShadow: "0 0 0 0 rgba(255,255,255,0)" }}
                  // Subtle autonomous vibration/pulse when idle
                  animate={phase === "idle" ? {
                    x: [0, 0, -3, 3, -2, 2, -1, 1, 0, 0],
                    boxShadow: [
                      "0 8px 30px -8px rgba(200,230,255,0.3)",
                      "0 8px 30px -8px rgba(200,230,255,0.3)",
                      "0 12px 40px -8px rgba(200,230,255,0.6)",
                      "0 8px 30px -8px rgba(200,230,255,0.3)",
                      "0 8px 30px -8px rgba(200,230,255,0.3)"
                    ]
                  } : phase === "ignition" ? {
                    scale: 0.98,
                    y: 2,
                    boxShadow: "0 0 20px rgba(255,100,0,0.6), 0 0 40px rgba(255,200,0,0.4)",
                    background: "rgba(255,240,230,1)",
                    color: "#000"
                  } : {
                    opacity: 0,
                    y: 10,
                  }}
                  transition={{ 
                    x: { duration: 4, repeat: Infinity, times: [0, 0.85, 0.87, 0.89, 0.91, 0.93, 0.95, 0.97, 0.98, 1], ease: "linear" },
                    boxShadow: { duration: 4, repeat: Infinity, times: [0, 0.85, 0.92, 0.98, 1], ease: "linear" }
                  }}
                  className="relative overflow-hidden rounded-full w-full sm:w-auto px-12 py-5 bg-white text-zinc-950 text-lg font-bold tracking-wide border border-white/10"
                >
                  <div className="relative z-10 flex items-center justify-center gap-3">
                    {phase === "idle" ? (
                      <>Get Started <ArrowRight className="w-5 h-5 opacity-70" /></>
                    ) : phase === "ignition" ? (
                      <span className="animate-pulse text-orange-700">Igniting Engines...</span>
                    ) : (
                      "Launching..."
                    )}
                  </div>
                  
                  {/* Glass highlight */}
                  <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-white/40 to-transparent pointer-events-none" />
                </motion.button>
              </div>

              <motion.p animate={{ opacity: phase === "idle" ? 1 : 0 }} className="text-xs text-zinc-600 tracking-wide mt-2">
                Free during beta · No credit card required
              </motion.p>
            </motion.div>

            {/* ── RIGHT: Rocket & Auth Panel ── */}
            <div className="relative flex justify-center items-end" style={{ height: "600px" }}>
              
              {/* Rocket Sequence */}
              <AnimatePresence>
                {phase !== "auth" && (
                  <motion.div
                    className="absolute bottom-0 w-36 md:w-48 z-10"
                    style={{ height: "480px" }}
                    initial={{ y: 50, opacity: 0 }}
                    whileInView={{ y: 0, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    exit={{ opacity: 0, transition: { duration: 0.5 } }}
                  >
                    <motion.div
                      className="w-full h-full"
                      animate={
                        phase === "idle" ? {
                          y: [0, -15, 0],
                          rotate: [0, 0.5, -0.5, 0],
                          transition: { duration: 6, repeat: Infinity, ease: "easeInOut" }
                        } : phase === "ignition" ? {
                          y: [0, 2, -2, 3, -1, 0],
                          x: [-1, 2, -2, 1, -1, 0],
                          transition: { duration: 0.1, repeat: Infinity }
                        } : phase === "launching" ? {
                          y: -1200,
                          opacity: [1, 1, 0],
                          transition: { duration: 1.2, ease: [0.6, -0.05, 1, 0.5] } // Aggressive acceleration curve
                        } : {}
                      }
                    >
                      <RocketSVG phase={phase} />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>

              {/* Heavy Smoke Base */}
              <HeavySmoke phase={phase} />

              {/* Launch Pad Glow */}
              <motion.div
                className="absolute bottom-0 left-1/2 -translate-x-1/2 w-96 h-16 pointer-events-none"
                animate={{
                  background: phase === "idle" 
                    ? "radial-gradient(ellipse, rgba(200,230,255,0.05) 0%, transparent 60%)"
                    : phase === "ignition"
                    ? "radial-gradient(ellipse, rgba(255,150,50,0.3) 0%, transparent 70%)"
                    : phase === "launching"
                    ? "radial-gradient(ellipse, rgba(255,200,100,0.6) 0%, transparent 80%)"
                    : "radial-gradient(ellipse, rgba(200,230,255,0.02) 0%, transparent 60%)"
                }}
                style={{ filter: "blur(20px)" }}
              />

              {/* ── Auth Panel (Fades in after launch) ── */}
              <AnimatePresence>
                {phase === "auth" && (
                  <motion.div
                    initial={{ opacity: 0, y: 40 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 1.2, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
                    className="relative z-30 w-full max-w-md mx-auto will-change-transform"
                    style={{ willChange: 'transform, opacity' }}
                  >
                    {/* Atmospheric glass wrapper for Clerk */}
                    <div className="relative rounded-2xl overflow-hidden p-[1px] bg-gradient-to-b from-white/10 to-white/0 shadow-[0_0_80px_-20px_rgba(255,255,255,0.15)]">
                      <div className="absolute inset-0 bg-background/40 backdrop-blur-xl z-0" />
                      <div className="relative z-10 flex justify-center p-4 bg-zinc-950/50 rounded-2xl">
                         <SignUp routing="hash" signInUrl="/sign-in" forceRedirectUrl="/dashboard" />
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

            </div>
          </div>
        </div>

        {/* Bottom fade into footer */}
        <div className="absolute bottom-0 inset-x-0 h-40 pointer-events-none z-40" style={{ background: "linear-gradient(to bottom, transparent, rgba(5,5,6,0.9))" }} aria-hidden />
      </motion.section>

      {/* ── Premium Footer ── */}
      <footer className="relative bg-[#040405] border-t border-white/[0.04] overflow-hidden z-40">
        <div className="absolute top-0 inset-x-0 h-px" style={{ background: "linear-gradient(90deg, transparent 10%, rgba(255,255,255,0.06) 40%, rgba(255,255,255,0.1) 50%, rgba(255,255,255,0.06) 60%, transparent 90%)" }} aria-hidden />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-16 flex flex-col md:flex-row items-start md:items-center justify-between gap-12">
            
            <div className="flex flex-col gap-4">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-md flex items-center justify-center" style={{ background: "linear-gradient(145deg, rgba(255,255,255,0.15), rgba(255,255,255,0.02))", boxShadow: "0 0 0 0.5px rgba(255,255,255,0.1)" }}>
                  <span className="text-[7px] font-black tracking-wider text-white">AI</span>
                </div>
                <span className="text-sm font-semibold tracking-wide text-zinc-200">FlowAI</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed max-w-[200px]">The personal operating system.<br />Powered by artificial intelligence.</p>
            </div>

            <div className="flex flex-wrap gap-14">
              <div className="flex flex-col gap-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-700 mb-1">Product</p>
                <FooterLink href="#">Features</FooterLink>
                <FooterLink href="#">Pricing</FooterLink>
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-700 mb-1">Legal</p>
                <FooterLink href="#">Privacy</FooterLink>
                <FooterLink href="#">Terms</FooterLink>
              </div>
              <div className="flex flex-col gap-4">
                <p className="text-[10px] uppercase tracking-[0.3em] text-zinc-700 mb-1">Connect</p>
                <FooterLink href="#">GitHub</FooterLink>
                <FooterLink href="#">Twitter</FooterLink>
              </div>
            </div>
          </div>

          <div className="h-px w-full" style={{ background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.04) 30%, rgba(255,255,255,0.04) 70%, transparent)" }} />

          <div className="py-8 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-zinc-600 tracking-wide">© {new Date().getFullYear()} FlowAI. All rights reserved.</p>
            <p className="text-[10px] text-zinc-800 tracking-[0.4em] uppercase">Built with intent</p>
          </div>
        </div>
      </footer>
    </>
  );
}
