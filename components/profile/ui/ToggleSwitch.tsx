"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function ToggleSwitch({
  isOn,
  onToggle,
}: {
  isOn: boolean;
  onToggle: () => void;
}) {
  return (
    <button
      onClick={onToggle}
      className={cn(
        "w-11 h-6 rounded-full relative transition-colors duration-300 shrink-0",
        isOn ? "bg-primary" : "bg-muted-foreground/30",
      )}
    >
      <motion.div
        animate={{ x: isOn ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm"
      />
    </button>
  );
}
