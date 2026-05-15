  "use client";

import { HeroSection } from "./hero";
import { SpotlightSection } from "./sections/SpotlightSection";
import { AmbientBackground, LenisProvider } from "./shared";

export function LandingPage() {
  return (
    <LenisProvider>
      <div className="relative min-h-screen bg-[#07090d] text-slate-100">
        <AmbientBackground />
        
        <main className="relative">
          <HeroSection />

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
              accentColor: "#38bdf8"
            }}
            config={{
              angleDeg: 0,
              coneAngle: 22,
              intensity: 1
            }}
            contentOffset={150}
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
              accentColor: "#10b981"
            }}
            config={{
              angleDeg: 0,
              coneAngle: 24,
              intensity: 1.2
            }}
            contentOffset={-100}
          />

          {/* Section 3: Growth / Future */}
          <SpotlightSection 
            id="growth"
            gifPath="/landing/GIF/growth.gif"
            headline="Grow Without The Chaos."
            subheadline="FlowAI transforms routines, finances, and long-term goals into one continuously evolving system that grows with you."
            layout="center"
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
            lightOffset={-350}
          />
        </main>
      </div>
    </LenisProvider>
  );
}
