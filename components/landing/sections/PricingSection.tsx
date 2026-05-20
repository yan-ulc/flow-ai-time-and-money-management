
"use client";

import React from "react";
import Link from "next/link";
import { motion, Transition } from "framer-motion";
import { cn } from "@/lib/utils";
import { CheckCircleIcon, StarIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SignUpButton } from "@clerk/nextjs";

// ─── Types ───────────────────────────────────────────────────────────────────

type FREQUENCY = "monthly" | "yearly";
const frequencies: FREQUENCY[] = ["monthly", "yearly"];

interface Plan {
  name: string;
  info: string;
  price: { monthly: number; yearly: number };
  features: { text: string; tooltip?: string }[];
  btn: { text: string; href: string };
  highlighted?: boolean;
  isBeta?: boolean; // Special CTA handled by Clerk SignUpButton
}

// ─── Border Trail ─────────────────────────────────────────────────────────────

type BorderTrailProps = {
  className?: string;
  size?: number;
  transition?: Transition;
  delay?: number;
  onAnimationComplete?: () => void;
  style?: React.CSSProperties;
};

function BorderTrail({ className, size = 60, transition, delay, onAnimationComplete, style }: BorderTrailProps) {
  const BASE: Transition = { repeat: Infinity, duration: 5, ease: "linear" };
  return (
    <div className="pointer-events-none absolute inset-0 rounded-[inherit] border border-transparent [mask-clip:padding-box,border-box] [mask-composite:intersect] [mask-image:linear-gradient(transparent,transparent),linear-gradient(#000,#000)]">
      <motion.div
        className={cn("absolute aspect-square bg-white/40", className)}
        style={{ width: size, offsetPath: `rect(0 auto auto 0 round ${size}px)`, ...style }}
        animate={{ offsetDistance: ["0%", "100%"] }}
        transition={{ ...(transition ?? BASE), delay }}
        onAnimationComplete={onAnimationComplete}
      />
    </div>
  );
}

// ─── Frequency Toggle ─────────────────────────────────────────────────────────

function FrequencyToggle({
  frequency,
  setFrequency,
}: {
  frequency: FREQUENCY;
  setFrequency: React.Dispatch<React.SetStateAction<FREQUENCY>>;
}) {
  return (
    <div className="mx-auto flex w-fit rounded-full border border-zinc-800 bg-zinc-900/60 p-1">
      {frequencies.map((freq) => (
        <button
          key={freq}
          onClick={() => setFrequency(freq)}
          className="relative px-5 py-1.5 text-sm capitalize font-medium text-zinc-400"
        >
          <span className="relative z-10 transition-colors duration-200" style={{ color: frequency === freq ? "#09090b" : undefined }}>
            {freq}
          </span>
          {frequency === freq && (
            <motion.span
              layoutId="freq-pill"
              transition={{ type: "spring", duration: 0.45 }}
              className="absolute inset-0 z-0 rounded-full bg-zinc-100"
            />
          )}
        </button>
      ))}
    </div>
  );
}

// ─── Pricing Card ─────────────────────────────────────────────────────────────

function PricingCard({ plan, frequency }: { plan: Plan; frequency: FREQUENCY }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-8%" }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={cn(
        "relative flex w-full flex-col rounded-2xl border overflow-hidden",
        plan.highlighted
          ? "border-zinc-600 bg-zinc-800/70 shadow-[0_0_80px_-20px_rgba(255,255,255,0.1)]"
          : "border-zinc-800 bg-zinc-900/60"
      )}
    >
      {plan.highlighted && (
        <BorderTrail
          size={80}
          style={{
            boxShadow: "0px 0px 40px 15px rgba(255,255,255,0.15), 0 0 80px 40px rgba(0,0,0,0.4)",
          }}
        />
      )}

      {/* Header */}
      <div className={cn("border-b p-6 relative", plan.highlighted ? "border-zinc-700" : "border-zinc-800")}>
        {/* Badges */}
        <div className="absolute top-3 right-3 z-10 flex items-center gap-2">
          {plan.highlighted && (
            <span className="flex items-center gap-1 rounded-full border border-zinc-600 bg-zinc-800 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-zinc-200">
              <StarIcon className="h-3 w-3 fill-current" />
              Popular
            </span>
          )}
          {frequency === "yearly" && plan.price.monthly > 0 && (
            <span className="flex items-center rounded-full bg-zinc-100 px-2.5 py-0.5 text-[11px] font-bold tracking-wide text-zinc-900">
              {Math.round(((plan.price.monthly * 12 - plan.price.yearly) / (plan.price.monthly * 12)) * 100)}% off
            </span>
          )}
          {plan.isBeta && (
            <span className="flex items-center gap-1 rounded-full border border-zinc-700 bg-zinc-900 px-2.5 py-0.5 text-[11px] font-semibold tracking-wide text-zinc-400">
              <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              Beta
            </span>
          )}
        </div>

        <div className="text-sm font-semibold tracking-[0.12em] uppercase text-zinc-400 mb-2">{plan.name}</div>
        <p className="text-zinc-500 text-xs leading-relaxed mb-4">{plan.info}</p>

        {/* Price */}
        <div className="flex items-end gap-1.5">
          {plan.price[frequency] === 0 ? (
            <span className="text-4xl font-semibold tracking-tight text-slate-100">Free</span>
          ) : (
            <>
              <span className="text-4xl font-semibold tracking-tight text-slate-100">${plan.price[frequency]}</span>
              <span className="text-zinc-500 text-sm mb-1">/{frequency === "monthly" ? "mo" : "yr"}</span>
            </>
          )}
        </div>
      </div>

      {/* Features */}
      <div className="flex flex-col gap-3.5 px-6 py-6 text-sm text-zinc-400 flex-1">
        {plan.features.map((feature, i) => (
          <div key={i} className="flex items-start gap-2.5">
            <CheckCircleIcon className="h-4 w-4 text-zinc-300 mt-[1px] shrink-0" />
            <p
              title={feature.tooltip}
              className={cn("leading-snug text-zinc-400", feature.tooltip && "cursor-help border-b border-dashed border-zinc-700")}
            >
              {feature.text}
            </p>
          </div>
        ))}
      </div>

      {/* CTA */}
      <div className={cn("border-t p-4", plan.highlighted ? "border-zinc-700" : "border-zinc-800")}>
        {plan.isBeta ? (
          <SignUpButton mode="modal">
            <button className="w-full rounded-xl bg-white text-zinc-950 py-3 text-sm font-bold tracking-wide shadow-[0_8px_24px_-8px_rgba(255,255,255,0.25)] transition-all duration-300 hover:-translate-y-0.5 hover:shadow-[0_12px_32px_-8px_rgba(255,255,255,0.35)]">
              {plan.btn.text}
            </button>
          </SignUpButton>
        ) : plan.highlighted ? (
          <Button className="w-full rounded-xl py-3 text-sm font-semibold" asChild>
            <Link href={plan.btn.href}>{plan.btn.text}</Link>
          </Button>
        ) : (
          <Button variant="outline" className="w-full rounded-xl py-3 text-sm font-semibold border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100" asChild>
            <Link href={plan.btn.href}>{plan.btn.text}</Link>
          </Button>
        )}
      </div>
    </motion.div>
  );
}

// ─── Section ─────────────────────────────────────────────────────────────────

const PLANS: Plan[] = [
  {
    name: "Starter",
    info: "For individuals getting started with personal finance tracking.",
    price: { monthly: 0, yearly: 0 },
    isBeta: true,
    features: [
      { text: "AI chat interface — finance & schedule" },
      { text: "Unlimited prompts during beta" },
      { text: "Basic expense tracking" },
      { text: "Daily & weekly summaries" },
    ],
    btn: { text: "Start Free", href: "#" },
  },
  {
    name: "Pro",
    info: "Advanced insights and automation for power users.",
    price: { monthly: 12, yearly: 99 },
    highlighted: true,
    features: [
      { text: "Everything in Starter" },
      { text: "Budget forecasting & predictions", tooltip: "AI predicts your end-of-month balance based on spending patterns." },
      { text: "Recurring expense automation" },
      { text: "Priority AI response speed" },
      { text: "Export reports (CSV / PDF)" },
    ],
    btn: { text: "Get Pro", href: "#" },
  },
  {
    name: "Team",
    info: "Shared workspace for couples, families, or small teams.",
    price: { monthly: 24, yearly: 199 },
    features: [
      { text: "Everything in Pro" },
      { text: "Up to 5 members" },
      { text: "Shared budget dashboard" },
      { text: "Role-based access control", tooltip: "Assign Admin, Viewer, or Editor roles to each member." },
      { text: "Dedicated support" },
    ],
    btn: { text: "Get Team", href: "#" },
  },
];

export function PricingSection() {
  const [frequency, setFrequency] = React.useState<FREQUENCY>("monthly");

  return (
    <section className="relative py-24 md:py-32 bg-background border-t border-white/[0.06] overflow-hidden">
      {/* Background atmosphere */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.012] to-transparent pointer-events-none" />

      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-10%" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 text-center"
        >
          <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/70 mb-6">
            System Component // PRICING
          </p>
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.08] tracking-tight text-slate-100 mb-6 drop-shadow-sm">
            Simple Pricing.
          </h2>
          <p className="text-base md:text-lg text-slate-300/75 leading-relaxed font-light max-w-xl mx-auto">
            Start free during beta. Upgrade when you need more power.
          </p>
        </motion.div>

        {/* Frequency toggle */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="flex justify-center mb-10"
        >
          <FrequencyToggle frequency={frequency} setFrequency={setFrequency} />
        </motion.div>

        {/* Cards grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {PLANS.map((plan, i) => (
            <motion.div
              key={plan.name}
              initial={{ opacity: 0, y: 28 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-8%" }}
              transition={{ duration: 0.6, delay: 0.1 + i * 0.08, ease: [0.22, 1, 0.36, 1] }}
            >
              <PricingCard plan={plan} frequency={frequency} />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
