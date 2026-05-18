import React from "react";
import { BottomNav } from "@/components/navigation/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background text-foreground relative selection:bg-primary/20">
      {/* 
        Cinematic Lighting System
        Provides soft ambient depth behind panels
      */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden bg-background">
        <div className="absolute top-[10%] left-[20%] w-[40vw] h-[40vh] rounded-full bg-blue-500/10 blur-[120px] dark:mix-blend-screen" />
        <div className="absolute bottom-[20%] right-[10%] w-[30vw] h-[50vh] rounded-full bg-purple-500/10 blur-[120px] dark:mix-blend-screen" />
        {/* Subtle noise overlay for texture */}
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03] bg-[url('https://grainy-gradients.vercel.app/noise.svg')]" />
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col min-w-0 relative z-10 h-full w-full max-w-7xl mx-auto pb-28 px-0 md:px-4 lg:px-0">
        {children}
      </main>

      {/* Floating Bottom Navigation */}
      <BottomNav />
    </div>
  );
}
