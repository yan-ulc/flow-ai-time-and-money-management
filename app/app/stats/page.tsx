import { StatsDashboard } from "@/components/stats/StatsDashboard";

export const metadata = {
  title: "FlowAi - Stats",
  description: "Financial overview and statistics.",
};

export default function StatsPage() {
  return (
    <div className="flex-1 h-full overflow-y-auto hide-scrollbar">
      <StatsDashboard />
    </div>
  );
}
