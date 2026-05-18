"use client";

import { ArrowRight, Play } from "lucide-react";
import { SignUpButton, useAuth } from "@clerk/nextjs";
import Link from "next/link";

export function HeroActions() {
  const { isSignedIn, isLoaded } = useAuth();

  const handleDemoClick = () => {
    const target = document.getElementById("demo");
    if (target) target.scrollIntoView({ behavior: "smooth", block: "center" });
  };

  return (
    <div className="flex flex-col sm:flex-row gap-4 pt-6">
      {!isSignedIn ? (
        <SignUpButton mode="modal">
          <button
            className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-slate-950 px-6 py-3 text-sm font-semibold shadow-[0_20px_60px_-30px_rgba(226,232,240,0.9)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_25px_70px_-30px_rgba(148,163,184,0.9)]"
          >
            Start Free
            <ArrowRight className="h-4 w-4" />
          </button>
        </SignUpButton>
      ) : (
        <Link
          href="/app"
          className="inline-flex items-center justify-center gap-2 rounded-full bg-white text-slate-950 px-6 py-3 text-sm font-semibold shadow-[0_20px_60px_-30px_rgba(226,232,240,0.9)] transition-transform duration-300 hover:-translate-y-0.5 hover:shadow-[0_25px_70px_-30px_rgba(148,163,184,0.9)]"
        >
          Open App
          <ArrowRight className="h-4 w-4" />
        </Link>
      )}

      <button
        type="button"
        onClick={handleDemoClick}
        className="inline-flex items-center justify-center gap-2 rounded-full border border-white/20 bg-white/5 px-6 py-3 text-sm font-semibold text-white transition duration-300 hover:border-white/40 hover:bg-white/10"
      >
        Watch System Demo
        <Play className="h-4 w-4" />
      </button>

    </div>
  );
}
