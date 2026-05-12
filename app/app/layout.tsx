import React from "react";
import { BottomNav } from "@/components/navigation/BottomNav";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-background text-foreground relative selection:bg-primary/20">
      {/* 
        Layered Background Elements 
        Provides a premium, soft depth to the app
      */}
      <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden">
        <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] rounded-full bg-primary/5 blur-[120px]" />
        <div className="absolute top-[60%] -right-[10%] w-[40%] h-[60%] rounded-full bg-blue-500/5 blur-[120px]" />
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
