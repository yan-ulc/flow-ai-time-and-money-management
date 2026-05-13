"use client";

import { cn, formatCurrency } from "@/lib/utils";
import { motion } from "framer-motion";
import { BrainCircuit, PieChart } from "lucide-react";
import { itemVariants } from "../motionVariants";
import type { ProfileAggregation } from "../profileTypes";

export function FinancialIdentitySection({ agg }: { agg: ProfileAggregation }) {
  return (
    <motion.div variants={itemVariants} className="flex flex-col gap-5">
      <div className="flex items-center gap-2 px-1">
        <PieChart className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold tracking-tight">
          Financial Identity
        </h2>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div className="rounded-[1.5rem] bg-background border border-border/40 p-6 shadow-sm flex flex-col gap-4 group hover:shadow-md hover:border-border/60 transition-all duration-300">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
              Snapshot
            </span>
            <span
              className={cn(
                "px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border",
                agg.healthStatus === "Healthy"
                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
                  : agg.healthStatus === "Stable"
                    ? "bg-blue-500/10 text-blue-600 border-blue-500/20"
                    : agg.healthStatus === "Warning"
                      ? "bg-orange-500/10 text-orange-600 border-orange-500/20"
                      : "bg-rose-500/10 text-rose-600 border-rose-500/20",
              )}
            >
              {agg.healthStatus}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-y-4 gap-x-4 mt-2">
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Income
              </p>
              <p className="text-sm font-semibold text-emerald-500">
                {formatCurrency(agg.monthlyIncome)}
              </p>
            </div>
            <div className="flex flex-col gap-1">
              <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                Expense
              </p>
              <p className="text-sm font-semibold text-rose-500">
                {formatCurrency(agg.monthlyExpense)}
              </p>
            </div>
          </div>

          <div className="mt-auto pt-4">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider mb-2">
              <span className="text-muted-foreground">Savings Rate</span>
              <span
                className={
                  agg.savingsRate > 0 ? "text-emerald-500" : "text-rose-500"
                }
              >
                {agg.savingsRate.toFixed(1)}%
              </span>
            </div>
            <div className="w-full h-2 bg-muted/40 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{
                  width: `${Math.max(0, Math.min(100, agg.savingsRate))}%`,
                }}
                transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                className={cn(
                  "h-full rounded-full",
                  agg.savingsRate > 20
                    ? "bg-emerald-500"
                    : agg.savingsRate > 0
                      ? "bg-blue-500"
                      : "bg-rose-500",
                )}
              />
            </div>
          </div>
        </div>

        <div className="rounded-[1.5rem] bg-gradient-to-br from-primary/5 to-transparent border border-border/40 p-6 shadow-sm flex flex-col relative overflow-hidden group hover:shadow-md hover:border-primary/20 transition-all duration-300">
          <BrainCircuit className="absolute top-6 right-6 w-32 h-32 text-primary/[0.03] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700" />
          <span className="text-xs font-bold uppercase tracking-wider text-primary mb-4 relative z-10">
            Spending Personality
          </span>
          <p className="text-base font-medium leading-relaxed relative z-10 text-foreground/90">
            {agg.spendingPersonality}
          </p>
        </div>
      </div>
    </motion.div>
  );
}
