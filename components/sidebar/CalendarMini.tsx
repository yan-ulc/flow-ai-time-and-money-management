"use client";

import React from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { format, isToday, isTomorrow } from "date-fns";

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

  // Filter client-side: upcoming in the next 30 days (wide window to catch all AI-created events)
  const now = Date.now();
  const windowEnd = now + 30 * 24 * 60 * 60 * 1000;
  const schedules = allSchedules.filter(
    (s) => s.dateTime >= now && s.dateTime <= windowEnd && s.status === "upcoming"
  );

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
              <div key={schedule._id} className="group flex flex-col p-2.5 rounded-lg hover:bg-muted/50 transition-colors border border-transparent hover:border-border/50">
                <div className="flex justify-between items-start mb-1">
                  <span className="text-sm font-medium leading-none">{schedule.title}</span>
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
