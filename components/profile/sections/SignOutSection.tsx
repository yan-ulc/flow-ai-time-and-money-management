"use client";

import { SignOutButton } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { itemVariants } from "../motionVariants";

export function SignOutSection() {
  return (
    <motion.div
      variants={itemVariants}
      className="mt-auto pt-6 border-t border-border/40"
    >
      <SignOutButton>
        <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20 border border-transparent transition-all duration-300 w-full font-semibold bg-rose-500/5 group">
          <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />{" "}
          Sign Out
        </button>
      </SignOutButton>
    </motion.div>
  );
}
