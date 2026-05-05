import React from "react";
import { Sidebar } from "@/components/sidebar/Sidebar";
import { InsightPanel } from "@/components/insight/InsightPanel";
import { MobileHeader } from "@/components/MobileHeader";

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-background text-foreground flex-col md:flex-row">
      <MobileHeader />
      
      {/* Left Sidebar (Desktop) */}
      <aside className="hidden md:flex w-64 flex-col border-r bg-muted/20">
        <Sidebar />
      </aside>

      {/* Main Chat Area */}
      <main className="flex-1 flex flex-col min-w-0 relative h-full">
        {children}
      </main>

      {/* Right Insight Panel (Desktop/Tablet) */}
      <aside className="hidden lg:flex w-80 flex-col border-l bg-muted/10 h-full overflow-y-auto">
        <InsightPanel />
      </aside>
    </div>
  );
}
