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
      <div className="flex-1 flex flex-col min-w-0 h-full relative rounded-none lg:rounded-3xl lg:border lg:border-border lg:bg-card/90 lg:backdrop-blur-3xl shadow-xl dark:shadow-[0_20px_60px_-15px_rgba(0,0,0,0.7)] overflow-hidden">
        {/* Inner top highlight for physical edge */}
        <div className="hidden lg:block absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.15] to-transparent pointer-events-none opacity-0 dark:opacity-100" />
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
