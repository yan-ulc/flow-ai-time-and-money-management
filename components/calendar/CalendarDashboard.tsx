"use client";

import React, { useState } from "react";
import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { format, addMonths, subMonths, startOfWeek, endOfWeek, eachDayOfInterval, isSameMonth, isSameDay, startOfMonth, endOfMonth, isToday, isPast, addDays } from "date-fns";
import { ChevronLeft, ChevronRight, Clock, MapPin, Tag, Loader2, Calendar as CalendarIcon, CheckCircle2, XCircle, AlertCircle, Info } from "lucide-react";
import { cn, formatCurrency } from "@/lib/utils";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useMutation } from "convex/react";
import { toast } from "sonner";

export function CalendarDashboard() {
  const { user: clerkUser } = useUser();
  const dbUser = useQuery(api.users.getUserByClerkId, clerkUser?.id ? { clerkId: clerkUser.id } : "skip");
  const schedules = useQuery(api.schedules.getSchedules, dbUser ? { userId: dbUser._id } : "skip");
  const confirmExpense = useMutation(api.schedules.confirmSpending);

  const [currentDate, setCurrentDate] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [selectedSchedule, setSelectedSchedule] = useState<any>(null);
  const [confirmingSchedule, setConfirmingSchedule] = useState<any>(null);

  if (!dbUser || !schedules) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const nextMonth = () => setCurrentDate(addMonths(currentDate, 1));
  const prevMonth = () => setCurrentDate(subMonths(currentDate, 1));

  // Calendar Grid Logic
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(monthStart);
  const startDate = startOfWeek(monthStart);
  const endDate = endOfWeek(monthEnd);

  const calendarDays = eachDayOfInterval({
    start: startDate,
    end: endDate,
  });

  const now = Date.now();
  
  const schedulesForDate = schedules.filter(s => isSameDay(new Date(s.dateTime), selectedDate));
  const schedulesForTomorrow = schedules.filter(s => isSameDay(new Date(s.dateTime), addDays(new Date(), 1)));

  const isPendingConfirmation = (s: any) => {
    return s.dateTime < now && s.estimatedCost && s.status !== "completed" && s.status !== "cancelled";
  };

  const getStatusIcon = (status: string, dateTime: number, s?: any) => {
    if (s && isPendingConfirmation(s)) return <AlertCircle className="w-3.5 h-3.5 text-amber-500 animate-pulse" />;
    if (status === "completed") return <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />;
    if (status === "cancelled") return <XCircle className="w-3.5 h-3.5 text-rose-500" />;
    if (dateTime < now && status === "upcoming") return <AlertCircle className="w-3.5 h-3.5 text-amber-500" />;
    return <Clock className="w-3.5 h-3.5 text-blue-500" />;
  };

  const getStatusLabel = (status: string, dateTime: number, s?: any) => {
    if (s && isPendingConfirmation(s)) return "Confirm Spending";
    if (dateTime < now && status === "upcoming") return "Missed";
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <div className="flex flex-col h-full w-full max-w-5xl mx-auto p-4 md:p-8 gap-6 pb-32">
      
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Schedule</h1>
          <p className="text-muted-foreground mt-1">Manage your time and upcoming activities.</p>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Calendar Grid (Takes up 2/3 on desktop) */}
        <div className="lg:col-span-2 rounded-3xl bg-background/40 border border-border/50 p-6 backdrop-blur-xl flex flex-col">
          {/* Calendar Header Controls */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold">{format(currentDate, "MMMM yyyy")}</h2>
            <div className="flex gap-2">
              <button 
                onClick={prevMonth}
                className="p-2 rounded-full hover:bg-muted/50 transition-colors"
              >
                <ChevronLeft className="w-5 h-5" />
              </button>
              <button 
                onClick={nextMonth}
                className="p-2 rounded-full hover:bg-muted/50 transition-colors"
              >
                <ChevronRight className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Days of Week */}
          <div className="grid grid-cols-7 mb-2">
            {["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"].map((day) => (
              <div key={day} className="text-center text-xs font-semibold text-muted-foreground py-2">
                {day}
              </div>
            ))}
          </div>

          {/* Calendar Cells */}
          <div className="grid grid-cols-7 gap-1 md:gap-2 flex-1">
            {calendarDays.map((day, idx) => {
              const isCurrentMonth = isSameMonth(day, monthStart);
              const isSelected = isSameDay(day, new Date()); 
              
              const hasEvent = schedules.some(s => isSameDay(new Date(s.dateTime), day));

              return (
                <div 
                  key={day.toISOString()} 
                  onClick={() => setSelectedDate(day)}
                  className={cn(
                    "relative aspect-square flex flex-col items-center justify-center p-1 rounded-2xl text-sm transition-all cursor-pointer",
                    !isCurrentMonth && "text-muted-foreground/30",
                    isCurrentMonth && !isSameDay(day, selectedDate) && "hover:bg-muted/50 text-foreground",
                    isSameDay(day, selectedDate) && "bg-primary text-primary-foreground font-bold shadow-lg shadow-primary/25 hover:shadow-primary/40",
                    isToday(day) && !isSameDay(day, selectedDate) && "ring-2 ring-primary/20"
                  )}
                >
                  <span>{format(day, "d")}</span>
                  
                  {/* Event Indicator */}
                  {hasEvent && (
                    <div className={cn(
                      "absolute bottom-2 w-1 h-1 rounded-full",
                      isSameDay(day, selectedDate) ? "bg-primary-foreground" : 
                      (day.getTime() < startOfMonth(new Date()).getTime() || (isPast(day) && !isToday(day)) ? "bg-muted-foreground/40" : "bg-blue-500")
                    )} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Schedule Panel */}
        <div className="flex flex-col gap-4 overflow-hidden">
          <div className="px-2">
            <h3 className="text-lg font-bold">
              {isToday(selectedDate) ? "Today" : 
               isSameDay(selectedDate, addDays(new Date(), 1)) ? "Tomorrow" :
               format(selectedDate, "MMM d, yyyy")}
            </h3>
            <p className="text-xs text-muted-foreground">
              {isPast(selectedDate) && !isToday(selectedDate) ? "Historical View" : "Planned Activities"}
            </p>
          </div>
          
          <div className="flex flex-row lg:flex-col gap-3 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 hide-scrollbar w-full px-2 lg:px-0 snap-x snap-mandatory">
            {schedulesForDate.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 rounded-3xl bg-background/20 border border-dashed border-border/50 w-full">
                <CalendarIcon className="w-8 h-8 text-muted-foreground/30 mb-2" />
                <p className="text-sm text-muted-foreground text-center">Empty day</p>
              </div>
            ) : schedulesForDate.sort((a, b) => a.dateTime - b.dateTime).map((event) => (
              <div 
                key={event._id} 
                onClick={() => isPendingConfirmation(event) ? setConfirmingSchedule(event) : setSelectedSchedule(event)}
                className={cn(
                  "flex-shrink-0 w-[280px] lg:w-full group p-5 rounded-3xl bg-background/40 border border-border/50 backdrop-blur-xl hover:border-primary/30 transition-all cursor-pointer relative overflow-hidden snap-center",
                  isPendingConfirmation(event) && "ring-2 ring-amber-500/50 bg-amber-500/5 border-amber-500/20"
                )}
              >
                <div className="flex justify-between items-start mb-3 relative z-10">
                  <h4 className="font-semibold text-base line-clamp-1">{event.title}</h4>
                  <div className={cn(
                    "flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider",
                    isPendingConfirmation(event) ? "bg-amber-500 text-white" : "bg-muted text-muted-foreground"
                  )}>
                    {getStatusIcon(event.status, event.dateTime, event)}
                    {getStatusLabel(event.status, event.dateTime, event)}
                  </div>
                </div>
                
                <div className="grid gap-2 relative z-10">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{format(new Date(event.dateTime), "hh:mm a")}</span>
                  </div>
                  {event.location && (
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <MapPin className="w-3.5 h-3.5" />
                      <span className="line-clamp-1">{event.location}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* If Today, show Tomorrow preview at the bottom */}
            {isToday(selectedDate) && schedulesForTomorrow.length > 0 && (
              <div className="mt-4 hidden lg:block">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-muted-foreground mb-3 px-2">Tomorrow</h4>
                <div className="space-y-2 opacity-60 grayscale-[0.5]">
                  {schedulesForTomorrow.slice(0, 2).map(s => (
                    <div key={s._id} className="p-3 rounded-2xl bg-muted/20 border border-border/30 text-xs flex justify-between">
                      <span className="font-medium line-clamp-1">{s.title}</span>
                      <span className="text-muted-foreground shrink-0">{format(new Date(s.dateTime), "h:mm a")}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Schedule Detail Modal */}
      <Dialog open={!!selectedSchedule} onOpenChange={(open) => !open && setSelectedSchedule(null)}>
        <DialogContent className="max-w-md rounded-[2.5rem] bg-background/80 backdrop-blur-3xl border-border/40 p-0 overflow-hidden">
          {selectedSchedule && (
            <div className="p-8">
              <DialogHeader className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <div className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest flex items-center gap-1.5",
                    selectedSchedule.dateTime < now ? "bg-muted text-muted-foreground" : "bg-primary/10 text-primary"
                  )}>
                    {getStatusIcon(selectedSchedule.status, selectedSchedule.dateTime)}
                    {getStatusLabel(selectedSchedule.status, selectedSchedule.dateTime)}
                  </div>
                  <span className="text-xs text-muted-foreground font-medium">
                    {format(new Date(selectedSchedule.dateTime), "EEEE, MMM d")}
                  </span>
                </div>
                <DialogTitle className="text-3xl font-bold tracking-tight">{selectedSchedule.title}</DialogTitle>
              </DialogHeader>

              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-3xl bg-muted/30 border border-border/40">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Time</p>
                    <p className="text-sm font-semibold flex items-center gap-2">
                      <Clock className="w-4 h-4 text-primary" />
                      {format(new Date(selectedSchedule.dateTime), "hh:mm a")}
                    </p>
                  </div>
                  <div className="p-4 rounded-3xl bg-muted/30 border border-border/40">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Duration</p>
                    <p className="text-sm font-semibold">{selectedSchedule.duration} Minutes</p>
                  </div>
                </div>

                {selectedSchedule.description && (
                  <div className="p-5 rounded-3xl bg-muted/30 border border-border/40">
                    <p className="text-[10px] font-bold uppercase text-muted-foreground mb-2 flex items-center gap-1.5">
                      <Info className="w-3 h-3" /> Description
                    </p>
                    <p className="text-sm text-foreground/80 leading-relaxed">{selectedSchedule.description}</p>
                  </div>
                )}

                <div className="space-y-3">
                  {selectedSchedule.location && (
                    <div className="flex items-center gap-3 px-2">
                      <div className="p-2 rounded-xl bg-blue-500/10 text-blue-500">
                        <MapPin className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Location</p>
                        <p className="text-sm font-medium">{selectedSchedule.location}</p>
                      </div>
                    </div>
                  )}

                  {selectedSchedule.estimatedCost && (
                    <div className="flex items-center gap-3 px-2">
                      <div className="p-2 rounded-xl bg-orange-500/10 text-orange-500">
                        <Tag className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-[10px] font-bold uppercase text-muted-foreground">Estimated Cost</p>
                        <p className="text-sm font-bold text-orange-500">{formatCurrency(selectedSchedule.estimatedCost)}</p>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                {isPendingConfirmation(selectedSchedule) && (
                  <button 
                    onClick={() => {
                      setConfirmingSchedule(selectedSchedule);
                      setSelectedSchedule(null);
                    }}
                    className="flex-1 py-4 rounded-2xl bg-amber-500 text-white font-bold shadow-xl shadow-amber-500/20 hover:shadow-amber-500/30 transition-all active:scale-[0.98]"
                  >
                    Confirm Spending
                  </button>
                )}
                <button 
                  onClick={() => setSelectedSchedule(null)}
                  className={cn(
                    "py-4 rounded-2xl font-bold transition-all active:scale-[0.98]",
                    isPendingConfirmation(selectedSchedule) ? "px-6 bg-muted text-muted-foreground" : "w-full bg-primary text-primary-foreground shadow-xl shadow-primary/20"
                  )}
                >
                  {isPendingConfirmation(selectedSchedule) ? "Close" : "Got it"}
                </button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Expense Confirmation Modal */}
      <ConfirmExpenseModal 
        schedule={confirmingSchedule} 
        open={!!confirmingSchedule} 
        onOpenChange={(open) => !open && setConfirmingSchedule(null)}
        onConfirm={async (amount) => {
          try {
            await confirmExpense({
              scheduleId: confirmingSchedule._id,
              actualAmount: amount
            });
            toast.success("Expense confirmed and recorded!");
            setConfirmingSchedule(null);
          } catch (error) {
            toast.error("Failed to confirm expense.");
          }
        }}
      />
    </div>
  );
}

function ConfirmExpenseModal({ schedule, open, onOpenChange, onConfirm }: any) {
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  React.useEffect(() => {
    if (schedule?.estimatedCost) {
      setAmount(schedule.estimatedCost.toString());
    }
  }, [schedule]);

  const handleConfirm = async () => {
    setIsSubmitting(true);
    await onConfirm(parseFloat(amount) || 0);
    setIsSubmitting(false);
  };

  if (!schedule) return null;

  const diff = (parseFloat(amount) || 0) - (schedule.estimatedCost || 0);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md rounded-[2.5rem] bg-background/80 backdrop-blur-3xl border-border/40 p-0 overflow-hidden">
        <div className="p-8">
          <DialogHeader className="mb-8">
            <div className="flex items-center gap-2 text-amber-500 mb-2">
              <AlertCircle className="w-5 h-5" />
              <span className="text-xs font-bold uppercase tracking-widest">Financial Confirmation</span>
            </div>
            <DialogTitle className="text-2xl font-bold tracking-tight">Confirm Spending</DialogTitle>
            <DialogDescription className="text-muted-foreground">
              How much did you actually spend for "{schedule.title}"?
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="p-4 rounded-3xl bg-muted/20 border border-border/30">
                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Estimated</p>
                <p className="text-sm font-semibold">{formatCurrency(schedule.estimatedCost || 0)}</p>
              </div>
              <div className={cn(
                "p-4 rounded-3xl border transition-colors",
                diff > 0 ? "bg-rose-500/5 border-rose-500/20" : "bg-emerald-500/5 border-emerald-500/20"
              )}>
                <p className="text-[10px] font-bold uppercase text-muted-foreground mb-1">Difference</p>
                <p className={cn("text-sm font-bold", diff > 0 ? "text-rose-500" : "text-emerald-500")}>
                  {diff > 0 ? "+" : ""}{formatCurrency(diff)}
                </p>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-bold uppercase text-muted-foreground px-1">Actual Amount Spent</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground font-bold text-lg">Rp</span>
                <input 
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full h-16 bg-muted/30 border-none rounded-3xl pl-12 pr-6 text-xl font-bold focus:ring-2 focus:ring-primary/20 transition-all outline-none"
                  placeholder="0"
                  autoFocus
                />
              </div>
            </div>
          </div>

          <div className="mt-10 flex gap-3">
            <button 
              onClick={() => onOpenChange(false)}
              className="flex-1 py-4 rounded-2xl bg-muted text-muted-foreground font-bold transition-all hover:bg-muted/50"
            >
              Cancel
            </button>
            <button 
              onClick={handleConfirm}
              disabled={isSubmitting}
              className="flex-[2] py-4 rounded-2xl bg-primary text-primary-foreground font-bold shadow-xl shadow-primary/20 hover:shadow-primary/30 transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin mx-auto" /> : "Confirm & Save"}
            </button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
