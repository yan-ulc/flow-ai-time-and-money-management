"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { api } from "@/convex/_generated/api";
import { cn } from "@/lib/utils";
import { useMutation } from "convex/react";
import { format } from "date-fns";
import { Check, Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";

interface ScheduleCardProps {
  schedule: any;
  dayLabel: string;
}

export function ScheduleCard({ schedule, dayLabel }: ScheduleCardProps) {
  const [timeLeft, setTimeLeft] = useState<number | null>(null);
  const [isConfirming, setIsConfirming] = useState(false);
  const [finalAmount, setFinalAmount] = useState<number>(
    schedule.estimatedCost || 0,
  );
  const confirmSpending = useMutation(api.schedules.confirmSpending);
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
    if (isConfirming) {
      toast.info("Jadwal ini sudah dikonfirmasi. Mohon tunggu proses selesai.");
      return;
    }
    setIsConfirming(true);
    try {
      await confirmSpending({
        scheduleId: schedule._id,
        actualAmount: finalAmount > 0 ? finalAmount : 0,
      });
      toast.success("Pengeluaran berhasil dicatat!");
      // Do not reset isConfirming on success so the button remains disabled
      // until the parent component updates the schedule status.
    } catch (e) {
      console.error("Failed to confirm event:", e);
      toast.error("Gagal mengonfirmasi pengeluaran.");
      setIsConfirming(false);
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
    <div
      className={cn(
        "group flex flex-col p-3 rounded-lg transition-colors border border-transparent hover:border-border/50 bg-muted/20",
        schedule.status === "done" &&
          "opacity-60 bg-muted/30 hover:bg-muted/30",
      )}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2 overflow-hidden">
          {schedule.status === "done" && (
            <Check className="h-4 w-4 text-emerald-600 shrink-0" />
          )}
          <span
            className={cn(
              "text-sm font-semibold leading-none truncate",
              schedule.status === "done" &&
                "line-through decoration-muted-foreground/50 text-muted-foreground",
            )}
          >
            {schedule.title}
          </span>
        </div>
        <span className="text-xs font-medium text-foreground whitespace-nowrap ml-2 bg-background px-1.5 py-0.5 rounded shadow-sm border">
          {format(date, "HH:mm")}
        </span>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground mb-2">
        <span>{dayLabel}</span>
        {schedule.location && (
          <span className="truncate max-w-[100px]">📍 {schedule.location}</span>
        )}
        {schedule.estimatedCost && (
          <span className="text-orange-500 font-medium">
            Rp{schedule.estimatedCost.toLocaleString()}
          </span>
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
                <span className="text-xs text-muted-foreground font-medium w-6">
                  Rp
                </span>
                <Input
                  type="number"
                  value={finalAmount || ""}
                  onChange={(e) =>
                    setFinalAmount(parseInt(e.target.value) || 0)
                  }
                  disabled={isConfirming}
                  className="h-8 text-xs font-medium disabled:opacity-50"
                  placeholder="0"
                />
              </div>
              <Button
                onClick={handleConfirm}
                size="sm"
                className={cn(
                  "w-full text-xs font-bold h-8 mt-1",
                  isConfirming 
                    ? "bg-muted text-muted-foreground hover:bg-muted cursor-not-allowed" 
                    : "bg-primary hover:bg-primary/90 text-primary-foreground"
                )}
              >
                {isConfirming ? "MEMPROSES..." : "KONFIRMASI SEKARANG"}
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
