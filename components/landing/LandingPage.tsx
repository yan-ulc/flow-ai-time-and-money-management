"use client";

import { AICompanionSection } from "./ai-companion";
import { FinalCTASection } from "./cta";
import { HeroSection } from "./hero";
import { PredictiveIntelligenceSection } from "./predictive";
import { ProblemSection } from "./problem";
import { AmbientBackground, LenisProvider } from "./shared";
import { SystemShowcaseSection } from "./system-showcase";
import { UnifiedSystemSection } from "./unified";

export function LandingPage() {
  return (
    <LenisProvider>
      <div className="relative min-h-screen bg-[#07090d] text-slate-100">
        <AmbientBackground />
        <main className="relative">
          <HeroSection />
          <ProblemSection />
          <SystemShowcaseSection />
          <PredictiveIntelligenceSection />
          <AICompanionSection />
          <UnifiedSystemSection />
          <FinalCTASection />
        </main>
      </div>
    </LenisProvider>
  );
}
