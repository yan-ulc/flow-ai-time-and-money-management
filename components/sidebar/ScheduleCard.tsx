"use client";

import React, { useEffect, useState } from "react";
import { format, isToday, isTomorrow } from "date-fns";
import { cn } from "@/lib/utils";
import { Check, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";

interface ScheduleCardProps {
  schedule: any;
  dayLabel: string;
}

export function ScheduleCard({ schedule, dayLabel }: ScheduleCardProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [finalAmount, setFinalAmount] = useState<number>(schedule.estimatedCost || 0);
  const confirmEventExecution = useMutation(api.schedules.confirmEventExecution);
  const date = new Date(schedule.dateTime);

  useEffect(() => {
    if (schedule.status === "done") return;

    const calculateTimeLeft = () => {
      const diff = schedule.dateTime - Date.now();
      setTimeLeft(diff);
    };

    calculateTimeLeft();
    const interval = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(interval);
  }, [schedule.dateTime, schedule.status]);

  const handleConfirm = async () => {
    try {
      await confirmEventExecution({ 
        scheduleId: schedule._id,
        optionalFinalAmount: finalAmount > 0 ? finalAmount : undefined
      });
    } catch (e) {
      console.error("Failed to confirm event:", e);
    }
  };

  const formatTimeLeft = (ms: number) => {
    if (ms <= 0) return "Sekarang";
    
    const seconds = Math.floor((ms / 1000) % 60);
    const minutes = Math.floor((ms / 1000 / 60) % 60);
    const hours = Math.floor((ms / (1000 * 60 * 60)) % 24);
    const days = Math.floor(ms / (1000 * 60 * 60 * 24));

    if (days > 0) return `${days}d ${hours}h`;
    if (hours > 0) return `${hours}h ${minutes}m`;
    return `${minutes}m ${seconds}s`;
  };

  const isExpired = timeLeft !== null && timeLeft <= 0;

  return (
    <div className={cn(
      "group flex flex-col p-3 rounded-lg transition-colors border border-transparent hover:border-border/50 bg-muted/20",
      schedule.status === "done" && "opacity-60 bg-muted/30 hover:bg-muted/30"
    )}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 overflow-hidden">
          {schedule.status === "done" && <Check className="h-4 w-4 text-emerald-600 shrink-0" />}
          <span className={cn(
            "text-sm font-semibold leading-none truncate",
            schedule.status === "done" && "line-through decoration-muted-foreground/50 text-muted-foreground"
          )}>
            {schedule.title}
          </span>
        </div>
        <span className="text-xs font-medium text-foreground whitespace-nowrap ml-2 bg-background px-1.5 py-0.5 rounded shadow-sm border">
          {format(date, "HH:mm")}
        </span>
      </div>
      
      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>{dayLabel}</span>
        {schedule.location && <span className="truncate max-w-[100px]">📍 {schedule.location}</span>}
        {schedule.estimatedCost && (
          <span className="text-orange-500 font-medium">Rp{schedule.estimatedCost.toLocaleString()}</span>
        )}
      </div>

      {schedule.status === "upcoming" && (
        <div className="mt-2 pt-2 border-t flex flex-col gap-2">
          {!isExpired ? (
            <div className="flex items-center gap-1.5 text-xs text-primary font-medium bg-primary/10 px-2 py-1 rounded-md w-fit">
              <Clock className="h-3 w-3" />
              <span>Mulai dalam: {formatTimeLeft(timeLeft ?? 0)}</span>
            </div>
          ) : (
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-1.5 text-xs text-orange-600 font-medium mb-1">
                <Clock className="h-3 w-3" />
                <span>Waktu sudah lewat, konfirmasi pengeluaran aktual:</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground font-medium w-6">Rp</span>
                <Input
                  type="number"
                  value={finalAmount || ""}
                  onChange={(e) => setFinalAmount(parseInt(e.target.value) || 0)}
                  className="h-8 text-xs font-medium"
                  placeholder="0"
                />
              </div>
              <Button 
                onClick={handleConfirm} 
                size="sm" 
                className="w-full text-xs font-bold bg-primary hover:bg-primary/90 text-primary-foreground h-8 mt-1"
              >
                KONFIRMASI SEKARANG
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
