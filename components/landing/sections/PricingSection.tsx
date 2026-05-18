import { Check } from "lucide-react";
import { SignUpButton } from "@clerk/nextjs";

export function PricingSection() {
  return (
    <section className="py-24 md:py-32 relative bg-background border-t border-white/5">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-5xl font-bold tracking-tight text-foreground mb-4">
          Simple Pricing.
        </h2>
        <p className="text-muted-foreground text-lg mb-16">
          Join early and get unrestricted access during our beta phase.
        </p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 md:p-12 max-w-lg mx-auto flex flex-col items-center relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-zinc-800 text-zinc-300 text-xs font-semibold tracking-wide uppercase mb-6">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Active
          </div>

          <h3 className="text-2xl font-bold text-foreground mb-2">Beta Tier</h3>
          <div className="flex items-baseline gap-2 mb-8">
            <span className="text-5xl font-extrabold tracking-tight text-foreground">Free</span>
            <span className="text-zinc-500 font-medium">/ Gratis</span>
          </div>

          <div className="w-full h-px bg-zinc-800 mb-8" />

          <ul className="flex flex-col gap-4 text-left w-full mb-10">
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-zinc-100 shrink-0" />
              <span className="text-zinc-300 text-sm md:text-base">Akses penuh ke chat interface keuangan & jadwal.</span>
            </li>
            <li className="flex items-start gap-3">
              <Check className="w-5 h-5 text-zinc-100 shrink-0" />
              <span className="text-zinc-300 text-sm md:text-base">Unlimited prompts selama masa pengembangan awal.</span>
            </li>
          </ul>

          <SignUpButton mode="modal">
            <button className="w-full rounded-2xl bg-white text-zinc-950 px-8 py-4 text-sm font-bold shadow-[0_20px_60px_-30px_rgba(255,255,255,0.3)] transition-transform duration-300 hover:-translate-y-0.5">
              Start Using FlowAI
            </button>
          </SignUpButton>
        </div>
      </div>
    </section>
  );
}
