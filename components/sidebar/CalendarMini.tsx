"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { format, isToday, isTomorrow, startOfDay } from "date-fns";
import { cn } from "@/lib/utils";
import { Check } from "lucide-react";

export function CalendarMini() {
  const { user } = useUser();
  const dbUser = useQuery(api.users.getUserByClerkId, user?.id ? { clerkId: user.id } : "skip");
  
  // Fetch ALL schedules for this user — filter client-side to avoid frozen timestamp issues
  const allSchedules = useQuery(
    api.schedules.getSchedules,
    dbUser ? { userId: dbUser._id } : "skip"
  );

  if (allSchedules === undefined) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-4 w-24 bg-muted rounded"></div>
        <div className="h-12 w-full bg-muted rounded"></div>
        <div className="h-12 w-full bg-muted rounded"></div>
      </div>
    );
  }

  // Filter client-side: items from today midnight onwards (wide window)
  const now = Date.now();
  const todayStart = startOfDay(now).getTime();
  const windowEnd = now + 30 * 24 * 60 * 60 * 1000;
  
  const schedules = allSchedules.filter((s) => {
    const isVisibleStatus = s.status === "upcoming" || (s.status === "done" && isToday(s.dateTime));
    return s.dateTime >= todayStart && s.dateTime <= windowEnd && isVisibleStatus;
  });

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider px-2">
        Upcoming
      </h3>
      
      {schedules.length === 0 ? (
        <div className="text-sm text-muted-foreground px-2 py-4 text-center border border-dashed rounded-lg">
          No upcoming events
        </div>
      ) : (
        <div className="space-y-2">
          {schedules.slice(0, 10).map((schedule) => {
            const date = new Date(schedule.dateTime);
            let dayLabel = format(date, "EEE, MMM d");
            if (isToday(date)) dayLabel = "Today";
            else if (isTomorrow(date)) dayLabel = "Tomorrow";

            return (
              <div key={schedule._id} className={cn(
                "group flex flex-col p-2.5 rounded-lg transition-colors border border-transparent hover:border-border/50",
                schedule.status === "done" ? "opacity-60 bg-muted/30" : "hover:bg-muted/50"
              )}>
                <div className="flex justify-between items-start mb-1">
                  <div className="flex items-center gap-2 overflow-hidden">
                    {schedule.status === "done" && <Check className="h-3 w-3 text-emerald-600 shrink-0" />}
                    <span className={cn(
                      "text-sm font-medium leading-none truncate",
                      schedule.status === "done" && "line-through decoration-muted-foreground/50"
                    )}>
                      {schedule.title}
                    </span>
                  </div>
                  <span className="text-xs text-muted-foreground whitespace-nowrap ml-2">
                    {format(date, "HH:mm")}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>{dayLabel}</span>
                  {schedule.location && <span className="truncate max-w-[100px]">📍 {schedule.location}</span>}
                  {schedule.estimatedCost && (
                    <span className="text-orange-500">~Rp{schedule.estimatedCost.toLocaleString()}</span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
