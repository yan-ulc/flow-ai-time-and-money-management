"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { formatCurrency } from "@/lib/utils";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Wallet, TrendingDown, TrendingUp } from "lucide-react";

export function BalanceCard() {
  const { user } = useUser();
  const dbUser = useQuery(api.users.getUserByClerkId, user?.id ? { clerkId: user.id } : "skip");
  
  // Fetch ALL finances — no date filter so nothing is ever missed
  const finances = useQuery(api.finances.getFinances, dbUser ? { 
    userId: dbUser._id,
  } : "skip");

  if (finances === undefined || !dbUser) {
    return (
      <Card className="animate-pulse border-none">
        <CardHeader className="h-12"></CardHeader>
        <CardContent className="h-16"></CardContent>
      </Card>
    );
  }

  let totalIncome = 0;
  let totalSpent = 0;
  let totalPlanned = 0;

  for (const f of finances) {
    if (f.status === "actual") {
      if (f.type === "income") totalIncome += f.amount;
      if (f.type === "expense") totalSpent += f.amount;
    } else if (f.status === "planned" && f.type === "expense") {
      totalPlanned += f.amount;
    }
  }

  const balance = totalIncome - totalSpent;
  const budget = dbUser.settings.monthlyBudget || 0;

  return (
    <Card className="border-none shadow-sm bg-gradient-to-br from-primary/10 to-transparent">
      <CardHeader className="pb-1 flex flex-row items-center justify-between pt-4 px-4">
        <CardTitle className="text-xs font-medium text-muted-foreground flex items-center gap-1.5">
          <Wallet className="h-3.5 w-3.5" /> Net Balance
        </CardTitle>
      </CardHeader>
      <CardContent className="px-4 pb-4">
        <div className={`text-3xl font-bold tracking-tight ${balance < 0 ? "text-destructive" : ""}`}>
          {formatCurrency(balance)}
        </div>

        <div className="mt-3 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><TrendingUp className="h-3 w-3 text-emerald-500" /> Income</span>
            <span className="text-emerald-600 font-medium">{formatCurrency(totalIncome)}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><TrendingDown className="h-3 w-3 text-red-400" /> Spent</span>
            <span className="text-red-500 font-medium">{formatCurrency(totalSpent)}</span>
          </div>
          {totalPlanned > 0 && (
            <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t">
              <span>Planned expenses</span>
              <span className="text-orange-500 font-medium">{formatCurrency(totalPlanned)}</span>
            </div>
          )}
          {budget > 0 && (
            <div className="flex justify-between text-xs text-muted-foreground pt-1 border-t">
              <span>Monthly budget</span>
              <span className="font-medium">{formatCurrency(budget)}</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
