"use client";

import React from "react";
import { BalanceCard } from "./BalanceCard";
import { PlannedExpensesCard } from "./PlannedExpensesCard";
import { TrendingUp } from "lucide-react";

export function InsightPanel() {
  return (
    <div className="flex flex-col h-full p-4 gap-6">
      <div className="flex items-center gap-2 font-semibold tracking-tight px-1 py-1">
        <TrendingUp className="h-5 w-5 text-primary" />
        <span>Insights</span>
      </div>

      <div className="flex-1 overflow-y-auto pr-1">
        <BalanceCard />
        <PlannedExpensesCard />
      </div>
    </div>
  );
}
