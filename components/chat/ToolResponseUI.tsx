import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { Wallet, CalendarClock, Activity, Bell } from "lucide-react";

interface ToolResponseUIProps {
  toolName: string;
  toolResult?: any;
}

export function ToolResponseUI({ toolName, toolResult }: ToolResponseUIProps) {
  // If we don't have the actual result yet (during optimistic update), just show a loading/action chip
  if (!toolResult) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
        <span className="animate-pulse">●</span> Executing {toolName.replace("_", " ")}...
      </div>
    );
  }

  // Handle errors
  if (toolResult.error) {
    return (
      <div className="inline-flex items-center gap-1.5 rounded-full bg-destructive/10 px-3 py-1 text-xs font-medium text-destructive">
        Error: {toolResult.error}
      </div>
    );
  }

  // Visual cards based on tool type
  switch (toolName) {
    case "manage_finance":
      return (
        <Card className="w-full max-w-sm border-primary/20 bg-primary/5 shadow-none">
          <CardHeader className="p-3 pb-0 flex flex-row items-center gap-2 space-y-0">
            <div className="rounded-full bg-primary/20 p-1.5">
              <Wallet className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-sm font-medium">Finance Updated</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-2">
            <p className="text-xs text-muted-foreground line-clamp-2">
              Action successful. Data has been synced to your dashboard.
            </p>
          </CardContent>
        </Card>
      );
      
    case "manage_schedule":
      return (
        <Card className="w-full max-w-sm border-blue-500/20 bg-blue-500/5 shadow-none">
          <CardHeader className="p-3 pb-0 flex flex-row items-center gap-2 space-y-0">
            <div className="rounded-full bg-blue-500/20 p-1.5">
              <CalendarClock className="h-4 w-4 text-blue-500" />
            </div>
            <CardTitle className="text-sm font-medium">Schedule Updated</CardTitle>
          </CardHeader>
        </Card>
      );

    case "check_affordability":
      const isRisky = toolResult.isRisky;
      return (
        <Card className="w-full max-w-sm border-orange-500/20 bg-orange-500/5 shadow-none">
          <CardHeader className="p-3 pb-0 flex flex-row items-center gap-2 space-y-0">
            <div className="rounded-full bg-orange-500/20 p-1.5">
              <Activity className="h-4 w-4 text-orange-500" />
            </div>
            <CardTitle className="text-sm font-medium">Affordability Check</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-2">
            <div className="flex flex-col gap-1 text-sm">
              <span className="flex justify-between">
                <span>Available:</span> 
                <span className="font-semibold">{formatCurrency(toolResult.availableBudget)}</span>
              </span>
              <span className="flex justify-between text-muted-foreground">
                <span>Remaining After:</span> 
                <span>{formatCurrency(toolResult.remainingAfter)}</span>
              </span>
              {isRisky && (
                <span className="mt-1 text-xs text-orange-600 font-medium bg-orange-100 p-1.5 rounded">
                  Warning: This leaves you with less than 10% of your budget.
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      );

    case "get_life_status":
      return (
        <Card className="w-full max-w-sm border-purple-500/20 bg-purple-500/5 shadow-none">
          <CardHeader className="p-3 pb-0 flex flex-row items-center gap-2 space-y-0">
            <div className="rounded-full bg-purple-500/20 p-1.5">
              <Activity className="h-4 w-4 text-purple-500" />
            </div>
            <CardTitle className="text-sm font-medium">Life Status Recap</CardTitle>
          </CardHeader>
          <CardContent className="p-3 pt-2 grid grid-cols-2 gap-2 text-sm">
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Spent</span>
              <span className="font-medium">{formatCurrency(toolResult.totalSpent)}</span>
            </div>
            <div className="flex flex-col">
              <span className="text-xs text-muted-foreground">Income</span>
              <span className="font-medium text-emerald-600">{formatCurrency(toolResult.totalIncome)}</span>
            </div>
          </CardContent>
        </Card>
      );

    case "set_reminder":
      return (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-600">
          <Bell className="h-3 w-3" /> Reminder set
        </div>
      );

    default:
      return (
        <div className="inline-flex items-center gap-1.5 rounded-full bg-secondary px-3 py-1 text-xs font-medium text-secondary-foreground">
          ✓ {toolName.replace("_", " ")}
        </div>
      );
  }
}
