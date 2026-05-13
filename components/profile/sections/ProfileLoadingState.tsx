"use client";

import { motion } from "framer-motion";
import { CircleDashed } from "lucide-react";

export function ProfileLoadingState() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-[50vh]">
      <motion.div
        animate={{ rotate: 360 }}
        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
      >
        <CircleDashed className="w-8 h-8 text-primary/40" />
      </motion.div>
    </div>
  );
}
