import { ChatPanel } from "@/components/chat/ChatPanel";

export const metadata = {
  title: "FlowAi - Dashboard",
  description: "Track your money and time via chat.",
};

export default function AppPage() {
  return (
    <div className="flex-1 h-full relative">
      <ChatPanel />
    </div>
  );
}
