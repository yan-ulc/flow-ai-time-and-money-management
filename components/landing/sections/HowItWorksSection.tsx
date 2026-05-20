"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import {
  motion,
  AnimatePresence,
  useInView,
  useMotionValue,
  useSpring,
  useTransform,
} from "framer-motion";
import { ArrowUp } from "lucide-react";

// ─── Avatar ───────────────────────────────────────────────────────────────────

const AiAvatar = () => (
  <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-zinc-950 border border-zinc-700 shadow-sm">
    <span className="text-[10px] font-bold tracking-widest text-zinc-300">AI</span>
  </div>
);

// ─── Conversation script ───────────────────────────────────────────────────────

const STEPS = [
  { delay: 1000, role: "user", text: "I have a meeting with the design team tomorrow at 2 PM." },
  { delay: 1600, role: "ai",   text: "Scheduled — 'Design Team Meeting', tomorrow 2:00 PM. I'll remind you 15 minutes before." },
  { delay: 2200, role: "user", text: "How much have I spent this week?" },
  { delay: 1800, role: "ai",   text: "You've spent $350 this week. 40% of your budget remains — you're on track." },
] as const;

const INPUT_PLACEHOLDERS = [
  "I have a meeting with the design team tomorrow at 2 PM.",
  "",
  "How much have I spent this week?",
  "",
];

// ─── Typing dots ──────────────────────────────────────────────────────────────

const TypingDots = () => (
  <motion.div
    layout
    key="typing"
    initial={{ opacity: 0, y: 12, scale: 0.85 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.15 } }}
    transition={{ type: "spring", stiffness: 300, damping: 28 }}
    className="flex justify-start items-end gap-2.5"
  >
    <AiAvatar />
    <div className="bg-white text-zinc-900 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5">
      {[0, 0.18, 0.36].map((delay, i) => (
        <motion.span
          key={i}
          animate={{ y: [0, -4, 0], opacity: [0.4, 1, 0.4] }}
          transition={{ duration: 0.9, repeat: Infinity, delay, ease: "easeInOut" }}
          className="w-1.5 h-1.5 bg-zinc-400 rounded-full"
        />
      ))}
    </div>
  </motion.div>
);

// ─── Chat bubble ──────────────────────────────────────────────────────────────

const ChatBubble = ({ role, text }: { role: string; text: string }) => (
  <motion.div
    layout
    initial={{ opacity: 0, y: 16, scale: 0.88 }}
    animate={{ opacity: 1, y: 0, scale: 1 }}
    exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.15 } }}
    transition={{ type: "spring", stiffness: 340, damping: 30 }}
    className={`flex ${role === "user" ? "justify-end" : "justify-start items-end gap-2.5"}`}
  >
    {role === "ai" && <AiAvatar />}
    <div
      className={`px-4 py-3 max-w-[88%] text-left text-sm leading-relaxed shadow-sm ${
        role === "user"
          ? "bg-zinc-800 text-zinc-100 rounded-2xl rounded-tr-sm font-normal"
          : "bg-white text-zinc-900 rounded-2xl rounded-tl-sm font-medium"
      }`}
    >
      {text}
    </div>
  </motion.div>
);

// ─── 3D Premium Panel ────────────────────────────────────────────────────────

function PremiumChatPanel({
  messages,
  isTyping,
  inputText,
}: {
  messages: typeof STEPS[number][];
  isTyping: boolean;
  inputText: string;
}) {
  const cardRef  = useRef<HTMLDivElement>(null);
  const rafRef   = useRef<number | null>(null);
  const isMobile = useRef(false);

  // Raw normalised mouse position (-0.5 → +0.5)
  const rawX = useMotionValue(0);
  const rawY = useMotionValue(0);

  // Cursor % position for the glass reflection
  const cursorX = useMotionValue(50);
  const cursorY = useMotionValue(50);

  // Heavy, slow spring — premium inertia feel
  const springCfg = { stiffness: 110, damping: 22, mass: 0.7 };
  const springX   = useSpring(rawX, springCfg);
  const springY   = useSpring(rawY, springCfg);

  // Max ±7° tilt
  const rotateY = useTransform(springX, [-0.5, 0.5], [-7, 7]);
  const rotateX = useTransform(springY, [-0.5, 0.5], [6, -6]);

  // Parallax for the ambient glow blob (slowest layer)
  const glowX = useTransform(springX, [-0.5, 0.5], [-14, 14]);
  const glowY = useTransform(springY, [-0.5, 0.5], [-14, 14]);

  // Glass radial gradient following cursor
  const glassBackground = useTransform(
    [cursorX, cursorY],
    ([cx, cy]: number[]) =>
      `radial-gradient(360px circle at ${cx}% ${cy}%, rgba(255,255,255,0.052) 0%, transparent 65%)`
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
        const rect = card.getBoundingClientRect();
        rawX.set((e.clientX - rect.left) / rect.width - 0.5);
        rawY.set((e.clientY - rect.top) / rect.height - 0.5);
        cursorX.set(((e.clientX - rect.left) / rect.width) * 100);
        cursorY.set(((e.clientY - rect.top) / rect.height) * 100);
      });
    },
    [rawX, rawY, cursorX, cursorY]
  );

  const onMouseLeave = useCallback(() => {
    rawX.set(0);
    rawY.set(0);
    cursorX.set(50);
    cursorY.set(50);
  }, [rawX, rawY, cursorX, cursorY]);

  useEffect(
    () => () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); },
    []
  );

  return (
    // Perspective container — establishes 3D space
    <div style={{ perspective: "1100px", perspectiveOrigin: "50% 40%" }} className="relative">

      {/* ── Ambient glow blob (parallax, slowest layer) ── */}
      <motion.div
        style={{ x: glowX, y: glowY }}
        className="absolute -inset-12 pointer-events-none"
        aria-hidden
      >
        <div className="w-full h-full rounded-full bg-white/[0.035] blur-[90px]" />
      </motion.div>

      {/* ── Contact shadow below card ── */}
      <div
        className="absolute inset-x-8 -bottom-5 h-12 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at 50% 0%, rgba(0,0,0,0.6) 0%, transparent 70%)",
          filter: "blur(16px)",
        }}
        aria-hidden
      />

      {/* ── The 3D card ── */}
      <motion.div
        ref={cardRef}
        style={{
          rotateX,
          rotateY,
          transformStyle: "preserve-3d",
          willChange: "transform",
        }}
        onMouseMove={onMouseMove}
        onMouseLeave={onMouseLeave}
        className="relative"
      >
        {/* Card surface */}
        <div
          className="relative rounded-[28px] overflow-hidden"
          style={{
            background: "linear-gradient(160deg, #1d1d20 0%, #141416 55%, #111113 100%)",
            boxShadow: [
              // Top inner edge — simulates studio key light from above
              "0 1px 0 0 rgba(255,255,255,0.06) inset",
              // Ultra-thin perimeter border
              "0 0 0 0.5px rgba(255,255,255,0.07)",
              // Soft large ambient shadow
              "0 32px 64px -16px rgba(0,0,0,0.75)",
              // Tighter contact shadow
              "0 8px 20px -6px rgba(0,0,0,0.55)",
            ].join(", "),
          }}
        >
          {/* ── Cursor-reactive glass reflection ── */}
          <motion.div
            className="absolute inset-0 z-10 pointer-events-none rounded-[28px]"
            style={{ background: glassBackground }}
            aria-hidden
          />

          {/* ── Top-edge shimmer (static) ── */}
          <div
            className="absolute top-0 inset-x-0 h-px z-10 pointer-events-none"
            style={{
              background:
                "linear-gradient(90deg, transparent, rgba(255,255,255,0.18) 35%, rgba(255,255,255,0.22) 50%, rgba(255,255,255,0.18) 65%, transparent)",
            }}
            aria-hidden
          />

          {/* ── Chrome title bar ── */}
          <div className="flex items-center gap-2.5 px-5 py-4 border-b border-white/[0.045]">
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/60" />
            <div className="w-2.5 h-2.5 rounded-full bg-zinc-700/60" />
            <div className="flex-1 flex justify-center">
              <div className="flex items-center gap-2 bg-zinc-800/55 border border-white/[0.04] rounded-full px-3 py-1">
                <div className="w-4 h-4 rounded-full bg-zinc-700 flex items-center justify-center">
                  <span className="text-[7px] font-bold tracking-wide text-zinc-300">AI</span>
                </div>
                <span className="text-xs font-medium text-zinc-400">FlowAI</span>
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 shadow-[0_0_5px_rgba(34,197,94,0.7)]" />
              </div>
            </div>
          </div>

          {/* ── Message area ── */}
          <div className="flex flex-col gap-3.5 p-5 min-h-[340px] justify-end">
            <AnimatePresence initial={false}>
              {messages.map((msg, i) => (
                <ChatBubble key={i} role={msg.role} text={msg.text} />
              ))}
              {isTyping && <TypingDots key="dots" />}
            </AnimatePresence>
          </div>

          {/* ── Input bar ── */}
          <div className="px-4 pb-5">
            <div
              className="flex items-center gap-2 rounded-full p-1.5 pr-2 border border-white/[0.055]"
              style={{ background: "rgba(9,9,11,0.88)" }}
            >
              <div className="flex-1 px-3 py-1.5 text-sm truncate text-left min-h-[28px] flex items-center">
                {inputText
                  ? <span className="text-zinc-400">{inputText}</span>
                  : <span className="text-zinc-600">Message FlowAI…</span>
                }
              </div>
              <button className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0">
                <ArrowUp className="w-4 h-4 text-zinc-900" strokeWidth={2.5} />
              </button>
            </div>
          </div>

          {/* ── Bottom vignette — creates depth inside card ── */}
          <div
            className="absolute bottom-0 inset-x-0 h-20 pointer-events-none rounded-b-[28px]"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.22), transparent)" }}
            aria-hidden
          />
        </div>

        {/* ── Outer edge glow ring ── */}
        <div
          className="absolute -inset-[1px] rounded-[29px] pointer-events-none"
          style={{
            background:
              "linear-gradient(160deg, rgba(255,255,255,0.065) 0%, rgba(255,255,255,0.01) 45%, transparent 100%)",
          }}
          aria-hidden
        />
      </motion.div>
    </div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

export function HowItWorksSection() {
  const [messages, setMessages]   = useState<typeof STEPS[number][]>([]);
  const [isTyping, setIsTyping]   = useState(false);
  const [inputText, setInputText] = useState("");
  const sectionRef                = useRef<HTMLElement>(null);
  const isInView                  = useInView(sectionRef, { once: false, margin: "-15%" });
  const timerRef                  = useRef<NodeJS.Timeout | null>(null);
  const isRunningRef              = useRef(false);

  useEffect(() => {
    if (!isInView) {
      if (timerRef.current) clearTimeout(timerRef.current);
      isRunningRef.current = false;
      setMessages([]);
      setIsTyping(false);
      setInputText("");
      return;
    }
    if (isRunningRef.current) return;
    isRunningRef.current = true;

    let cancelled = false;
    const sleep = (ms: number) =>
      new Promise<void>((res) => {
        timerRef.current = setTimeout(() => { if (!cancelled) res(); }, ms);
      });

    const run = async () => {
      while (!cancelled) {
        setMessages([]);
        setIsTyping(false);
        setInputText("");

        for (let i = 0; i < STEPS.length; i++) {
          const step = STEPS[i];
          await sleep(step.delay);
          if (cancelled) return;

          if (step.role === "user") {
            setInputText(INPUT_PLACEHOLDERS[i]);
            await sleep(900);
            if (cancelled) return;
            setInputText("");
            setMessages((prev) => [...prev, step]);
          } else {
            setIsTyping(true);
            await sleep(1400);
            if (cancelled) return;
            setIsTyping(false);
            setMessages((prev) => [...prev, step]);
          }
        }

        await sleep(5000);
      }
    };

    run();

    return () => {
      cancelled = true;
      isRunningRef.current = false;
      if (timerRef.current) clearTimeout(timerRef.current);
    };
  }, [isInView]);

  return (
    <section
      ref={sectionRef}
      className="relative py-24 md:py-36 bg-background border-t border-white/[0.06] overflow-hidden"
    >
      {/* Background atmosphere */}
      <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[640px] h-[640px] rounded-full bg-slate-400/[0.018] blur-[180px] pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* ── Left: 3D chat panel ── */}
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
          >
            <PremiumChatPanel
              messages={messages}
              isTyping={isTyping}
              inputText={inputText}
            />
          </motion.div>

          {/* ── Right: Copy ── */}
          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-10%" }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col justify-center"
          >
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70 mb-6">
              System Component // INTERFACE
            </p>

            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.08] tracking-tight text-slate-100 mb-8 drop-shadow-sm">
              Just Chat.<br />We Do The Rest.
            </h2>

            <p className="text-base md:text-lg text-slate-300/75 leading-relaxed font-light mb-10">
              No complex menus or confusing dashboards. Tell FlowAI what you need — it instantly organizes your finances and schedule.
            </p>

            <div className="flex flex-col gap-4">
              {[
                "Natural language — no commands to memorize",
                "Finances & schedule managed in one thread",
                "Responds in seconds, always in context",
              ].map((item, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, x: 16 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 + i * 0.1, ease: "easeOut" }}
                  className="flex items-start gap-3"
                >
                  <div className="mt-[5px] w-1 h-1 rounded-full bg-slate-400 shrink-0" />
                  <span className="text-sm text-slate-400 font-light leading-relaxed">{item}</span>
                </motion.div>
              ))}
            </div>

            <div className="h-px w-12 bg-slate-600 mt-10" />
          </motion.div>

        </div>
      </div>
    </section>
  );
}
