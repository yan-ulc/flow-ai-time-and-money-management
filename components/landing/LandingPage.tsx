  "use client";

import { HeroSection } from "./hero";
import { SpotlightSection } from "./sections/SpotlightSection";
import { HowItWorksSection } from "./sections/HowItWorksSection";
import { FeaturesGridSection } from "./sections/FeaturesGridSection";
import { ComparisonSection } from "./sections/ComparisonSection";
import { PricingSection } from "./sections/PricingSection";
import { FAQSection } from "./sections/FAQSection";
import { CTAAndFooterSection } from "./sections/CTAAndFooterSection";
import { AmbientBackground, LenisProvider } from "./shared";

export function LandingPage() {
  return (
    <LenisProvider>
      <div className="dark relative min-h-screen bg-background text-foreground">
        <AmbientBackground />
        
        <main className="relative">
          <HeroSection />

          <div className="relative bg-background">
            {/* Global Continuous Environmental Depth for all spotlight sections */}
            <div className="absolute inset-0 z-0 bg-gradient-to-b from-background via-transparent to-background pointer-events-none" />

            {/* Section 1: Scheduling */}
            <SpotlightSection 
              id="scheduling"
              gifPath="/landing/GIF/schedule.gif"
              headline="Your Day. Finally Structured."
              subheadline="FlowAI continuously organizes tasks, schedules, and priorities into a living system that adapts in real time."
              layout="left"
              profile={{
                beamColor: "rgb(245, 238, 220)",
                hazeColor: "rgb(255, 248, 232)",
                fringeColor: "rgb(255, 204, 128)",
                poolColor: "rgb(245, 232, 192)",
                accentColor: "#fde047"
              }}
              config={{
                angleDeg: 0,
                coneAngle: 32,
                intensity: 1.3,
                reachR: 0.9
              }}
            />

            {/* Section 2: Financial Control */}
            <SpotlightSection 
              id="finance"
              gifPath="/landing/GIF/finance.gif"
              headline="See Your Money Clearly."
              subheadline="Track movement, predict outcomes, and understand your financial behavior before problems appear."
              layout="right"
              profile={{
                beamColor: "rgb(220, 245, 240)",
                hazeColor: "rgb(230, 255, 250)",
                fringeColor: "rgb(180, 245, 230)",
                poolColor: "rgb(200, 245, 235)",
                accentColor: "#5eead4"
              }}
              config={{
                angleDeg: 0,
                coneAngle: 32,
                intensity: 1.3,
                reachR: 0.9
              }}
            />

            {/* Section 3: Growth / Future */}
            <SpotlightSection 
              id="growth"
              gifPath="/landing/GIF/growth.gif"
              headline="Grow Without The Chaos."
              subheadline="FlowAI transforms routines, finances, and long-term goals into one continuously evolving system that grows with you."
              layout="left"
              profile={{
                beamColor: "rgb(230, 210, 255)",
                hazeColor: "rgb(240, 220, 255)",
                fringeColor: "rgb(210, 180, 255)",
                poolColor: "rgb(210, 180, 255)",
                accentColor: "#a855f7"
              }}
              config={{
                angleDeg: 0,
                coneAngle: 32,
                intensity: 1.3,
                reachR: 0.9
              }}
            />
          </div>

          {/* New Sections */}
          <HowItWorksSection />
          <FeaturesGridSection />
          <ComparisonSection />
          <PricingSection />
          <FAQSection />
          <CTAAndFooterSection />
        </main>
      </div>
    </LenisProvider>
  );
}
