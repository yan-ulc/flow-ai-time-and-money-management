"use client";

import { cn } from "@/lib/utils";

export function InsightCard({
  type,
  text,
}: {
  type: "warning" | "success" | "neutral";
  text: string;
}) {
  return (
    <div
      className={cn(
        "p-4 rounded-[1rem] border text-sm font-medium leading-relaxed shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
        type === "warning"
          ? "bg-orange-500/5 border-orange-500/20 text-orange-700 dark:text-orange-300"
          : type === "success"
            ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-300"
            : "bg-muted/30 border-border/50 text-foreground",
      )}
    >
      {text}
    </div>
  );
}
