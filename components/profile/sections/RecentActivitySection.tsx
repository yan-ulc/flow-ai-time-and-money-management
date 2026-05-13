"use client";

import { cn } from "@/lib/utils";
import { format, isToday, isYesterday } from "date-fns";
import { motion } from "framer-motion";
import { Activity, CheckCircle2, CreditCard, Wallet } from "lucide-react";
import { itemVariants } from "../motionVariants";
import type { ProfileAggregation } from "../profileTypes";

export function RecentActivitySection({
  activityFeed,
}: {
  activityFeed: ProfileAggregation["activityFeed"];
}) {
  return (
    <motion.div variants={itemVariants} className="flex flex-col gap-5 h-full">
      <div className="flex items-center gap-2 px-1">
        <Activity className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold tracking-tight">
          Recent Activity
        </h2>
      </div>

      <div className="rounded-[1.5rem] bg-background border border-border/40 p-6 shadow-sm flex-1">
        <div className="flex flex-col relative before:absolute before:inset-y-2 before:left-3.5 before:w-px before:bg-border/60 gap-8">
          {activityFeed.length === 0 ? (
            <p className="text-sm text-muted-foreground pl-12">
              No recent activity.
            </p>
          ) : (
            activityFeed.map((item, i) => {
              const isPositive = item.semanticType === "positive";
              return (
                <motion.div
                  key={`${item.id}-${i}`}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * i }}
                  className="relative pl-12 group cursor-default"
                >
                  <div
                    className={cn(
                      "absolute left-0 top-0.5 w-7 h-7 rounded-full border-2 border-background flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm",
                      isPositive
                        ? "bg-emerald-500/10 text-emerald-600 border-emerald-50"
                        : "bg-rose-500/10 text-rose-600 border-rose-50",
                    )}
                  >
                    {item.type === "schedule" ? (
                      <CheckCircle2 className="w-3.5 h-3.5" />
                    ) : isPositive ? (
                      <Wallet className="w-3.5 h-3.5" />
                    ) : (
                      <CreditCard className="w-3.5 h-3.5" />
                    )}
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm font-semibold">{item.title}</span>
                    <span className="text-xs text-muted-foreground mt-0.5 line-clamp-1">
                      {item.description}
                    </span>
                    <span className="text-[10px] text-muted-foreground/60 mt-1.5 font-bold uppercase tracking-wider">
                      {isToday(item.dateObj)
                        ? "Today"
                        : isYesterday(item.dateObj)
                          ? "Yesterday"
                          : format(item.dateObj, "MMM d")}{" "}
                      • {format(item.dateObj, "HH:mm")}
                    </span>
                  </div>
                </motion.div>
              );
            })
          )}
        </div>
      </div>
    </motion.div>
  );
}
