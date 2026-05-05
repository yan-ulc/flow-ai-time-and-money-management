"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { formatCurrency } from "@/lib/utils";
import { format, isToday, isTomorrow } from "date-fns";

export function PlannedExpensesCard() {
  const { user } = useUser();
  const dbUser = useQuery(api.users.getUserByClerkId, user?.id ? { clerkId: user.id } : "skip");
  
  // Fetch all finances without range — filter on client side to avoid broken query
  const finances = useQuery(api.finances.getFinances, dbUser ? { 
    userId: dbUser._id,
  } : "skip");

  if (finances === undefined) {
    return (
      <div className="animate-pulse space-y-3 mt-6">
        <div className="h-4 w-32 bg-muted rounded"></div>
        <div className="h-10 w-full bg-muted rounded"></div>
        <div className="h-10 w-full bg-muted rounded"></div>
      </div>
    );
  }

  const now = Date.now();
  const plannedExpenses = finances.filter(
    (f) => f.status === "planned" && f.type === "expense" && f.date >= now
  );

  if (plannedExpenses.length === 0) {
    return (
      <div className="space-y-3 mt-6">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Planned Expenses
        </h3>
        <div className="text-sm text-muted-foreground py-4 text-center border border-dashed rounded-lg">
          No upcoming planned expenses
        </div>
      </div>
    );
  }

  const totalPlanned = plannedExpenses.reduce((acc, curr) => acc + curr.amount, 0);

  return (
    <div className="space-y-3 mt-6">
      <div className="flex justify-between items-center">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Planned
        </h3>
        <span className="text-xs font-medium text-orange-600 bg-orange-100 px-2 py-0.5 rounded-full">
          {formatCurrency(totalPlanned)}
        </span>
      </div>
      
      <div className="space-y-1">
        {plannedExpenses.slice(0, 5).map((expense) => {
          const date = new Date(expense.date);
          let dayLabel = format(date, "MMM d");
          if (isToday(date)) dayLabel = "Today";
          else if (isTomorrow(date)) dayLabel = "Tomorrow";

          return (
            <div key={expense._id} className="flex justify-between items-center px-2 py-1.5 rounded-md hover:bg-muted/50 text-sm">
              <div className="flex flex-col">
                <span className="font-medium truncate max-w-[150px] text-sm leading-none">
                  {expense.description || expense.category}
                </span>
                <span className="text-xs text-muted-foreground mt-0.5">{dayLabel}</span>
              </div>
              <span className="font-medium text-orange-600 text-sm">{formatCurrency(expense.amount)}</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
