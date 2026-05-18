"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { formatCurrency } from "@/lib/utils";
import { Wallet, Calendar, ArrowUpRight, ArrowDownRight, Loader2 } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";

export function HomeWidgets() {
  const { user: clerkUser } = useUser();
  const dbUser = useQuery(api.users.getUserByClerkId, clerkUser?.id ? { clerkId: clerkUser.id } : "skip");
  
  const finances = useQuery(api.finances.getFinances, dbUser ? { userId: dbUser._id } : "skip");
  const schedules = useQuery(api.schedules.getSchedules, dbUser ? { userId: dbUser._id } : "skip");

  if (!dbUser || !finances || !schedules) {
    return (
      <div className="flex flex-row lg:flex-col gap-4 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 hide-scrollbar w-full px-4 lg:px-0">
        {[1, 2, 3].map((i) => (
          <div key={i} className="flex-shrink-0 w-[85vw] sm:w-[280px] lg:w-full h-32 rounded-3xl bg-muted/20 animate-pulse border border-border/50 flex items-center justify-center">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground/30" />
          </div>
        ))}
      </div>
    );
  }

  // Calculate balance based only on ACTUAL transactions
  const actualFinances = finances.filter(f => f.status === "actual");
  
  const totalBalance = actualFinances.reduce((acc, f) => {
    return f.type === "income" ? acc + f.amount : acc - f.amount;
  }, 0);

  const totalIncome = actualFinances.filter(f => f.type === "income").reduce((acc, f) => acc + f.amount, 0);
  const totalExpense = actualFinances.filter(f => f.type === "expense").reduce((acc, f) => acc + f.amount, 0);

  // Filter upcoming
  const now = Date.now();
  const upcomingPayments = finances
    .filter(f => f.type === "expense" && f.status === "planned" && f.dateTime > now)
    .slice(0, 2);

  const nextSchedules = schedules
    .filter(s => s.status === "upcoming" && s.dateTime > now)
    .slice(0, 2);

  return (
    <div className="flex flex-row lg:flex-col gap-4 overflow-x-auto lg:overflow-visible pb-4 lg:pb-0 hide-scrollbar w-full px-4 lg:px-0 snap-x snap-mandatory">
      
      {/* Balance Widget */}
      <div className="group relative flex-shrink-0 w-[85vw] sm:w-[280px] lg:w-full rounded-3xl bg-card border border-border p-5 backdrop-blur-2xl shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden snap-center hover:border-foreground/20 transition-colors duration-300">
        <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.15] to-transparent pointer-events-none opacity-0 dark:opacity-100" />
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-blue-500/5 opacity-50 pointer-events-none" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-muted-foreground">
              <Wallet className="w-4 h-4" />
              <span className="text-xs font-medium uppercase tracking-wider">Total Balance</span>
            </div>
            <ThemeToggle variant="icon" buttonSize={32} />
          </div>
          <div className="text-3xl font-bold tracking-tight mb-4">
            {formatCurrency(totalBalance)}
          </div>
          <div className="flex gap-4">
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-full">
              <ArrowUpRight className="w-3 h-3" /> {formatCurrency(totalIncome).split(',')[0]}
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-rose-500 bg-rose-500/10 px-2 py-1 rounded-full">
              <ArrowDownRight className="w-3 h-3" /> {formatCurrency(totalExpense).split(',')[0]}
            </div>
          </div>
        </div>
      </div>

      {/* Upcoming Payments Widget */}
      <div className="group relative flex-shrink-0 w-[85vw] sm:w-[280px] lg:w-full rounded-3xl bg-card border border-border p-5 backdrop-blur-2xl shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden snap-center hover:border-foreground/20 transition-colors duration-300">
        <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent pointer-events-none opacity-0 dark:opacity-100" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold">Upcoming Payments</span>
            <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full border border-border">2 items</span>
          </div>
          <div className="flex flex-col gap-3">
            {upcomingPayments.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No planned expenses</p>
            ) : upcomingPayments.map((item) => (
              <div key={item._id} className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-sm font-medium line-clamp-1">{item.description}</span>
                  <span className="text-xs text-muted-foreground">{new Date(item.dateTime).toLocaleDateString()}</span>
                </div>
                <span className="text-sm font-semibold text-rose-500">-{formatCurrency(item.amount)}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Next Schedule Widget */}
      <div className="group relative flex-shrink-0 w-[85vw] sm:w-[280px] lg:w-full rounded-3xl bg-card border border-border p-5 backdrop-blur-2xl shadow-lg dark:shadow-[0_8px_32px_rgba(0,0,0,0.5)] overflow-hidden snap-center hover:border-foreground/20 transition-colors duration-300">
        <div className="absolute inset-x-4 top-0 h-px bg-gradient-to-r from-transparent via-white/[0.1] to-transparent pointer-events-none opacity-0 dark:opacity-100" />
        
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm font-semibold">Next Schedule</span>
            <Calendar className="w-4 h-4 text-muted-foreground" />
          </div>
          <div className="flex flex-col gap-3">
            {nextSchedules.length === 0 ? (
              <p className="text-xs text-muted-foreground italic">No upcoming events</p>
            ) : nextSchedules.map((item) => (
              <div key={item._id} className="flex items-start gap-3">
                <div className="flex flex-col items-center justify-center bg-primary/10 text-primary rounded-xl p-2 min-w-[50px] border border-primary/10">
                  <span className="text-xs font-bold leading-none">{new Date(item.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                </div>
                <div className="flex flex-col py-1">
                  <span className="text-sm font-medium leading-tight line-clamp-1">{item.title}</span>
                  <span className="text-xs text-muted-foreground line-clamp-1">{item.location || "No location"}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

    </div>
  );
}
