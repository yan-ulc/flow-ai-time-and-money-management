import { CalendarDashboard } from "@/components/calendar/CalendarDashboard";

export const metadata = {
  title: "FlowAi - Calendar",
  description: "Schedule and upcoming events.",
};

export default function CalendarPage() {
  return (
    <div className="flex-1 h-full overflow-y-auto">
      <CalendarDashboard />
    </div>
  );
}
