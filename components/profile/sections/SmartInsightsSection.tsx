"use client";

import { AnimatePresence, motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { itemVariants } from "../motionVariants";
import type { ProfileAggregation } from "../profileTypes";
import { InsightCard } from "../ui/InsightCard";

export function SmartInsightsSection({ agg }: { agg: ProfileAggregation }) {
  const insights = [
    agg.healthStatus === "Warning" && {
      id: "insight-warning",
      type: "warning" as const,
      text: "Your expenses have exceeded your income this month. Be careful.",
      delay: 0.1,
    },
    agg.topCategory !== "general" && {
      id: "insight-top-cat",
      type: "neutral" as const,
      text: `We noticed ${agg.topCategory} is your biggest expense right now. Consider reviewing those schedules.`,
      delay: 0.2,
    },
    agg.savingsRate > 10 && {
      id: "insight-savings",
      type: "success" as const,
      text: "Great job! Your savings rate is very healthy. Keep up the momentum.",
      delay: 0.3,
    },
    agg.healthStatus === "Stable" &&
      agg.savingsRate <= 10 && {
        id: "insight-stable",
        type: "neutral" as const,
        text: "Your cash flow is stable, but there is room to improve your savings rate.",
        delay: 0.4,
      },
  ].filter(Boolean) as Array<{
    id: string;
    type: "warning" | "success" | "neutral";
    text: string;
    delay: number;
  }>;

  return (
    <motion.div variants={itemVariants} className="flex flex-col gap-5">
      <div className="flex items-center gap-2 px-1">
        <Sparkles className="w-5 h-5 text-primary" />
        <h2 className="text-xl font-semibold tracking-tight">Smart Insights</h2>
      </div>
      <div className="flex flex-col gap-3">
        <AnimatePresence mode="popLayout">
          {insights.map((insight) => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ delay: insight.delay }}
            >
              <InsightCard type={insight.type} text={insight.text} />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}
