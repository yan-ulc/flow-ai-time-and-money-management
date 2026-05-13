"use client";

import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";
import { Check } from "lucide-react";

export function PersonalityCard({
  title,
  desc,
  active,
  onClick,
}: {
  title: string;
  desc: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-300",
        active
          ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20 shadow-sm transform -translate-y-0.5"
          : "bg-muted/10 border-border/40 hover:bg-muted/30 hover:-translate-y-0.5 hover:shadow-sm",
      )}
    >
      <div className="flex items-center justify-between w-full mb-2">
        <span
          className={cn(
            "font-semibold text-sm",
            active ? "text-primary" : "text-foreground",
          )}
        >
          {title}
        </span>
        <AnimatePresence mode="popLayout">
          {active && (
            <motion.div
              key="check-icon"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0 }}
            >
              <Check className="w-4 h-4 text-primary" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </button>
  );
}
