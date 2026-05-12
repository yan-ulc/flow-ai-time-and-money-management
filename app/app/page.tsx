import { ChatPanel } from "@/components/chat/ChatPanel";
import { HomeWidgets } from "@/components/widgets/HomeWidgets";

export const metadata = {
  title: "FlowAi - OS",
  description: "Your AI-powered personal operating system.",
};

export default function AppPage() {
  return (
    <div className="flex flex-col lg:flex-row w-full h-full relative max-w-7xl mx-auto pt-4 md:pt-8 lg:p-8 lg:gap-8">
      {/* Mobile Widgets (Top Horizontal Scroll) */}
      <div className="lg:hidden w-full mb-2">
        <HomeWidgets />
      </div>

      {/* Main Chat Area (70%) */}
      <div className="flex-1 flex flex-col min-w-0 h-full relative rounded-none lg:rounded-3xl lg:border lg:border-border/50 lg:bg-background/40 lg:backdrop-blur-xl lg:shadow-2xl lg:shadow-black/5 overflow-hidden">
        <ChatPanel />
      </div>

      {/* Desktop Sticky Widgets (30%) */}
      <div className="hidden lg:flex flex-col w-[340px] flex-shrink-0 relative">
        <div className="sticky top-8 w-full">
          <HomeWidgets />
        </div>
      </div>
    </div>
  );
}
