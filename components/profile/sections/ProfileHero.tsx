"use client";

import { formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { BrainCircuit, Mail, Shield, User, Zap } from "lucide-react";
import { itemVariants } from "../motionVariants";
import type { ProfileAggregation, UserTone } from "../profileTypes";
import { QuickStat } from "../ui/QuickStat";

type ClerkUser =
  | {
      imageUrl?: string | null;
      fullName?: string | null;
      primaryEmailAddress?: { emailAddress?: string | null } | null;
    }
  | null
  | undefined;

export function ProfileHero({
  clerkUser,
  userTone,
  agg,
}: {
  clerkUser: ClerkUser;
  userTone: UserTone;
  agg: ProfileAggregation;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="flex flex-col lg:flex-row gap-10 rounded-[2.5rem] bg-gradient-to-br from-background to-muted/30 border border-border/50 p-8 md:p-10 shadow-sm relative overflow-hidden group min-h-[280px]"
    >
      <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] rounded-full transition-opacity duration-1000 opacity-40 group-hover:opacity-80" />
      <div className="absolute bottom-0 left-10 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full" />

      <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-start lg:items-start gap-8 relative z-10 flex-shrink-0 text-center sm:text-left lg:w-[35%]">
        <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-start gap-6 w-full">
          <motion.div
            whileHover={{ scale: 1.05 }}
            className="w-28 h-28 rounded-[2rem] bg-secondary border-4 border-background shadow-xl flex items-center justify-center overflow-hidden shrink-0 transition-all duration-500 hover:shadow-primary/20"
          >
            {clerkUser?.imageUrl ? (
              <img
                src={clerkUser.imageUrl}
                alt="Profile"
                className="w-full h-full object-cover"
              />
            ) : (
              <User className="w-14 h-14 text-muted-foreground" />
            )}
          </motion.div>

          <div className="flex flex-col justify-center gap-1.5 flex-1">
            <h1 className="text-4xl font-bold tracking-tight text-foreground/95">
              {clerkUser?.fullName || "Flow User"}
            </h1>
            <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground font-medium">
              <Mail className="w-4 h-4 opacity-70" />
              <span>
                {clerkUser?.primaryEmailAddress?.emailAddress ||
                  "no-email@example.com"}
              </span>
            </div>
            <div className="inline-flex items-center justify-center sm:justify-start gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[11px] font-bold uppercase tracking-wider mt-3 w-fit mx-auto sm:mx-0 border border-emerald-500/20">
              <Shield className="w-3.5 h-3.5" />
              Free Plan
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-full h-px bg-border/50 my-2" />

        <div className="flex flex-row flex-wrap items-center justify-center sm:justify-start gap-4 w-full">
          <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-xl border border-border/40 backdrop-blur-sm">
            <BrainCircuit className="w-4 h-4 text-primary" />
            <span className="text-foreground font-semibold">AI:</span>
            {userTone.charAt(0).toUpperCase() + userTone.slice(1)} Mode
          </p>
          <div className="flex items-center gap-1.5 text-xs font-bold text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-500/20 backdrop-blur-sm">
            <Zap className="w-4 h-4" fill="currentColor" />5 Day Streak
          </div>
        </div>
      </div>

      <div className="hidden lg:block w-px bg-border/50 relative z-10 self-stretch my-4" />
      <div className="block lg:hidden w-full h-px bg-border/50 relative z-10" />

      <div className="flex-1 w-full relative z-10 flex flex-col justify-center h-full">
        <div className="grid grid-cols-2 gap-4 lg:gap-5 h-full">
          <QuickStat
            title="Total Balance"
            value={formatCurrency(agg.totalBalance)}
          />
          <QuickStat
            title="Monthly Spend"
            value={formatCurrency(agg.monthlyExpense)}
          />
          <QuickStat title="Schedules Done" value={agg.schedulesCompleted} />
          <QuickStat title="Insights Used" value={agg.aiInsightsUsed} />
        </div>
      </div>
    </motion.div>
  );
}
