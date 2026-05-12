"use client";

import { useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { cn, formatCurrency } from "@/lib/utils";
import { ArrowUpRight, ArrowDownRight, Wallet, TrendingUp, CreditCard, Coffee, ShoppingBag, Car, Loader2, Shield, Clock, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";
import { 
  AreaChart, Area, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell, PieChart, Pie, ComposedChart, ReferenceLine, Legend
} from "recharts";
import { format, subMonths, addMonths, isSameMonth, getDaysInMonth } from "date-fns";
import { useState, useMemo } from "react";
import { aggregateComparisonData, buildPredictiveTimeline, aggregateCategoryData, Granularity, Transaction } from "@/lib/financial-aggregation";

export function StatsDashboard() {
  const { user: clerkUser } = useUser();
  const dbUser = useQuery(api.users.getUserByClerkId, clerkUser?.id ? { clerkId: clerkUser.id } : "skip");
  const finances = useQuery(api.finances.getFinances, dbUser ? { userId: dbUser._id } : "skip");
  const [monthContext, setMonthContext] = useState(new Date());
  const [granularity, setGranularity] = useState<Granularity>("daily");
  const [filter, setFilter] = useState("all");

  const txs = (finances as Transaction[]) || [];

  // --- CENTRALIZED AGGREGATION (Hooks must be before early returns) ---
  const comparisonData = useMemo(() => aggregateComparisonData(txs, granularity, monthContext), [txs, granularity, monthContext]);
  const predictiveTimelineData = useMemo(() => buildPredictiveTimeline(txs, monthContext), [txs, monthContext]);
  const categoryData = useMemo(() => aggregateCategoryData(txs, granularity, monthContext), [txs, granularity, monthContext]);

  if (!dbUser || !finances) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // --- FINANCIAL PROJECTION ENGINE ---
  const isCurrentMonth = isSameMonth(monthContext, new Date());
  const daysInMonth = getDaysInMonth(monthContext);
  const elapsedDays = isCurrentMonth ? new Date().getDate() : daysInMonth;
  const remainingDays = isCurrentMonth ? daysInMonth - elapsedDays : 0;

  // 1. Reality (Actuals) for the selected month
  const monthActuals = txs.filter(f => f.status === "actual" && isSameMonth(new Date(f.dateTime), monthContext));
  const actualIncome = monthActuals.filter(f => f.type === "income").reduce((acc, f) => acc + f.amount, 0);
  const actualExpense = monthActuals.filter(f => f.type === "expense").reduce((acc, f) => acc + f.amount, 0);
  const monthlyDelta = actualIncome - actualExpense; // Net for this month context

  // Total running balance (all time)
  const totalBalance = txs.filter(f => f.status === "actual" && new Date(f.dateTime) <= new Date()).reduce((acc, f) => acc + (f.type === "income" ? f.amount : -f.amount), 0);

  // 2. Projections (Planned) for the selected month
  const now = new Date();
  const plannedFinances = txs.filter(f => f.status === "planned" && isSameMonth(new Date(f.dateTime), monthContext) && new Date(f.dateTime) > now);
  const futurePlannedExpense = plannedFinances.reduce((acc, f) => acc + f.amount, 0);
  
  // 3. Intelligence Metrics
  const projectedBalance = totalBalance - futurePlannedExpense;
  const burnRate = elapsedDays > 0 ? actualExpense / elapsedDays : 0;
  const safeToSpendToday = remainingDays > 0 ? Math.max(0, (projectedBalance / remainingDays)) : projectedBalance;

  // Color mapping for categories
  const categoryColors: Record<string, string> = {
    food: "#3b82f6", transport: "#f59e0b", shopping: "#ec4899", 
    entertainment: "#8b5cf6", bills: "#ef4444", other: "#6b7280"
  };
  const coloredCategoryData = categoryData.map(c => ({ ...c, color: categoryColors[c.name.toLowerCase()] || categoryColors.other }));

  // Filtered transactions for the ledger
  const filteredTransactions = txs.filter(f => {
    // Only show transactions for selected month in ledger too
    if (!isSameMonth(new Date(f.dateTime), monthContext)) return false;

    if (filter === "all") return true;
    if (filter === "income") return f.type === "income";
    if (filter === "expense") return f.type === "expense" && f.status === "actual";
    if (filter === "planned") return f.status === "planned";
    if (filter === "pending") return f.status === "pending_confirmation";
    return true;
  });

  // --- AI INSIGHT GENERATOR ---
  const generateInsights = () => {
    const insights = [];
    if (!isCurrentMonth) {
      insights.push({ type: "neutral", text: `Melihat data historis untuk ${format(monthContext, "MMMM yyyy")}.` });
      return insights;
    }

    if (projectedBalance < 0) {
      insights.push({
        type: "danger",
        text: `Bahaya! Kalau semua rencana pengeluaran jalan terus, saldo akhir bulan bakal minus ${formatCurrency(Math.abs(projectedBalance))}. Kurangin nongkrong atau belanja dulu ya.`
      });
    } else if (projectedBalance < totalBalance * 0.2) {
      insights.push({
        type: "warning",
        text: `Saldo akhir bulan diproyeksi sisa dikit banget (${formatCurrency(projectedBalance)}). Hati-hati ada pengeluaran dadakan yang belum masuk hitungan.`
      });
    } else {
      insights.push({
        type: "success",
        text: `Kalau pengeluaran lo tetap kaya sekarang, saldo akhir bulan diperkirakan aman. Budget santai lo hari ini sekitar ${formatCurrency(safeToSpendToday)}.`
      });
    }

    if (burnRate > (actualIncome / daysInMonth)) {
      insights.push({
        type: "warning",
        text: `Pengeluaran harian lo (${formatCurrency(burnRate)}) lebih gede dari rata-rata pemasukan. Awas boncos!`
      });
    }

    return insights;
  };

  const insights = generateInsights();

  return (
    <div className="flex flex-col h-full w-full max-w-6xl mx-auto p-4 md:p-8 gap-8 pb-32">
      
      {/* 1. TOP SECTION — FINANCIAL PULSE */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sticky top-0 z-10 bg-background/90 backdrop-blur-xl pb-6 mb-2 border-b border-border/20">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-foreground">Financial Operating System</h1>
          <p className="text-muted-foreground mt-1.5 text-sm font-medium opacity-80">Predictive intelligence & cashflow analytics.</p>
        </div>
        <div className="flex items-center gap-2 bg-muted/20 p-1 rounded-2xl border border-border/40 shadow-sm">
          <button onClick={() => setMonthContext(subMonths(monthContext, 1))} className="p-2 hover:bg-background rounded-xl transition-all text-muted-foreground hover:text-foreground"><ChevronLeft className="w-4 h-4" /></button>
          <span className="w-32 text-center font-semibold tracking-wider text-sm">{format(monthContext, "MMMM yyyy")}</span>
          <button onClick={() => setMonthContext(addMonths(monthContext, 1))} className="p-2 hover:bg-background rounded-xl transition-all text-muted-foreground hover:text-foreground"><ChevronRight className="w-4 h-4" /></button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-2">
        {/* Card 1 — Balance Card (Primary) */}
        <div className="rounded-[1.5rem] bg-gradient-to-br from-background to-muted/20 border border-border/40 p-6 shadow-sm relative overflow-hidden">
          <div className="flex items-center gap-2 text-muted-foreground mb-3">
            <Wallet className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Total Balance</span>
          </div>
          <div className="text-3xl font-bold tracking-tight text-foreground">{formatCurrency(totalBalance)}</div>
          <div className="mt-4 flex items-center justify-between text-xs font-semibold tracking-wide">
            <span className={cn(monthlyDelta >= 0 ? "text-emerald-500" : "text-rose-500")}>
              {monthlyDelta >= 0 ? "+" : ""}{formatCurrency(monthlyDelta)} this month
            </span>
            <span className="text-muted-foreground/60">{remainingDays} Days Left</span>
          </div>
        </div>

        {/* Card 2 — In-Flow Card */}
        <div className="rounded-[1.5rem] bg-background border border-border/40 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-emerald-500/80 mb-3">
            <ArrowUpRight className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">In-Flow</span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-emerald-500">{formatCurrency(actualIncome)}</div>
          <p className="mt-4 text-[11px] text-muted-foreground font-medium tracking-wide">Confirmed income this month</p>
        </div>

        {/* Card 3 — Out-Flow Card */}
        <div className="rounded-[1.5rem] bg-background border border-border/40 p-6 shadow-sm">
          <div className="flex items-center gap-2 text-rose-500/80 mb-3">
            <ArrowDownRight className="w-4 h-4" />
            <span className="text-xs font-semibold uppercase tracking-wider">Out-Flow</span>
          </div>
          <div className="text-2xl font-bold tracking-tight text-rose-500">{formatCurrency(actualExpense)}</div>
          <p className="mt-4 text-[11px] text-muted-foreground font-medium tracking-wide">Confirmed expenses this month</p>
        </div>

        {/* Card 4 — Burn Rate Card */}
        <div className="rounded-[1.5rem] bg-background border border-border/40 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2 text-orange-500/80">
              <TrendingUp className="w-4 h-4" />
              <span className="text-xs font-semibold uppercase tracking-wider">Burn Rate</span>
            </div>
          </div>
          <div className="flex items-baseline gap-1">
            <span className="text-2xl font-bold tracking-tight text-foreground">{formatCurrency(burnRate).split(',')[0]}</span>
            <span className="text-xs font-medium text-muted-foreground">/ day</span>
          </div>
          <div className="w-full h-1 bg-muted/40 rounded-full mt-4 overflow-hidden">
            <div 
              className={cn("h-full rounded-full transition-all duration-1000", burnRate > (actualIncome / daysInMonth) ? "bg-rose-500" : "bg-orange-500")}
              style={{ width: `${Math.min(100, (burnRate / (actualIncome / daysInMonth || 1)) * 100)}%` }} 
            />
          </div>
        </div>
      </div>

      {/* 2 & 3. ROW 1 — CASH FLOW & LEAK DETECTOR (70 / 30) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7">
        
        {/* ROW 1 LEFT — CASH FLOW (70%) */}
        <div className="lg:col-span-2 rounded-[1.5rem] bg-background border border-border/40 p-7 shadow-sm flex flex-col h-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Cash Flow Analysis</h3>
              <p className="text-xs font-medium text-muted-foreground opacity-80 mt-1">Period comparison & net difference</p>
            </div>
            <div className="flex gap-1 p-1 bg-muted/20 rounded-xl border border-border/40 w-fit">
              {(["daily", "weekly", "monthly"] as Granularity[]).map((g) => (
                <button
                  key={g}
                  onClick={() => setGranularity(g)}
                  className={cn(
                    "px-4 py-1.5 rounded-lg text-xs font-medium tracking-wide transition-all capitalize",
                    granularity === g ? "bg-background text-foreground shadow-sm border border-border/20" : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  {g}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[320px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={comparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontWeight: '500' }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontWeight: '500' }} tickFormatter={(val) => `Rp${val/1000000}M`} />
                <Tooltip 
                  cursor={{ fill: 'hsl(var(--muted))', opacity: 0.2 }}
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: '600' }}
                  labelStyle={{ fontSize: '13px', fontWeight: '500', marginBottom: '8px', color: 'hsl(var(--muted-foreground))' }}
                  formatter={(value: any, name: any) => {
                    const strName = String(name);
                    if (strName === 'net') return [formatCurrency(Number(value)), 'Net Profit/Loss'];
                    return [formatCurrency(Number(value)), strName.charAt(0).toUpperCase() + strName.slice(1)];
                  }}
                />
                <Legend wrapperStyle={{ paddingTop: '20px', fontSize: '11px', fontWeight: '500' }} />
                <Bar dataKey="income" fill="#10b981" radius={[4, 4, 0, 0]} barSize={20} name="Income" />
                <Bar dataKey="expense" fill="#f43f5e" radius={[4, 4, 0, 0]} barSize={20} name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROW 1 RIGHT — LEAK DETECTOR (30%) */}
        <div className="rounded-[1.5rem] bg-background border border-border/40 p-7 shadow-sm flex flex-col h-full">
          <h3 className="text-lg font-semibold tracking-tight mb-1">Leak Detector</h3>
          <p className="text-xs font-medium text-muted-foreground opacity-80 mb-6">Where money goes ({granularity})</p>
          
          <div className="h-[200px] w-full relative mb-6 shrink-0">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={coloredCategoryData}
                  cx="50%"
                  cy="50%"
                  innerRadius={65}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                  stroke="none"
                >
                  {coloredCategoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: '600' }}
                  formatter={(value: any) => formatCurrency(Number(value))}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none flex-col">
              <span className="text-[10px] text-muted-foreground font-semibold uppercase tracking-widest">Total Out</span>
              <span className="text-xl font-bold tracking-tight text-foreground">
                {formatCurrency(coloredCategoryData.reduce((acc, curr) => acc + curr.value, 0)).split(',')[0]}
              </span>
            </div>
          </div>
          
          <div className="space-y-2 flex-1 overflow-y-auto pr-2 hide-scrollbar min-h-[120px]">
            {coloredCategoryData.length === 0 ? (
              <p className="text-center text-xs font-medium text-muted-foreground opacity-60 py-4">No spending recorded</p>
            ) : coloredCategoryData.map((item) => (
              <div key={item.name} className="flex items-center justify-between p-3 rounded-xl bg-muted/30 border border-border/40 hover:bg-muted/50 transition-colors cursor-pointer">
                <div className="flex items-center gap-3">
                  <div className="w-2.5 h-2.5 rounded-full shadow-sm" style={{ backgroundColor: item.color }} />
                  <span className="text-xs font-semibold capitalize">{item.name}</span>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold block">{formatCurrency(item.value)}</span>
                  <span className="text-[10px] font-medium text-muted-foreground">{item.percentage.toFixed(0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 4 & 5. ROW 2 — PREDICTIVE PATH & SMART INSIGHTS (70 / 30) */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 mt-2">
        
        {/* ROW 2 LEFT — PREDICTIVE PATH (70%) */}
        <div className="lg:col-span-2 rounded-[1.5rem] bg-background border border-border/40 p-7 shadow-sm flex flex-col h-full">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Financial Trajectory</h3>
              <p className="text-xs font-medium text-muted-foreground opacity-80 mt-1">Continuous balance progression</p>
            </div>
            <div className="hidden sm:flex items-center gap-4 text-xs font-medium text-muted-foreground">
              <div className="flex items-center gap-2"><div className="w-3 h-1 rounded-full bg-emerald-500" /> Income Growth</div>
              <div className="flex items-center gap-2"><div className="w-3 h-1 rounded-full bg-rose-500" /> Expense Drop</div>
              <div className="flex items-center gap-2"><div className="w-3 h-1 rounded-full bg-muted-foreground/40 border border-dashed border-muted-foreground" /> Future Ghost Zone</div>
            </div>
          </div>
          
          <div className="h-[320px] w-full mt-auto">
            <ResponsiveContainer width="100%" height="100%">
              <ComposedChart data={predictiveTimelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="4 4" vertical={false} stroke="hsl(var(--border))" opacity={0.4} />
                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontWeight: '500' }} dy={10} minTickGap={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 11, fill: 'hsl(var(--muted-foreground))', fontWeight: '500' }} tickFormatter={(val) => `Rp${val/1000000}M`} />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'hsl(var(--background))', borderRadius: '12px', border: '1px solid hsl(var(--border))', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                  itemStyle={{ fontSize: '12px', fontWeight: '600' }}
                  labelStyle={{ fontSize: '13px', fontWeight: '500', marginBottom: '8px' }}
                  formatter={(value: any, name: any) => {
                    const strName = String(name);
                    if (strName === 'balanceUp') return [formatCurrency(Number(value)), 'Balance (Up)'];
                    if (strName === 'balanceDown') return [formatCurrency(Number(value)), 'Balance (Down)'];
                    if (strName === 'projectedBalance') return [formatCurrency(Number(value)), 'Projected Future Balance'];
                    return [formatCurrency(Number(value)), strName];
                  }}
                  labelFormatter={(label) => `Day ${label}`}
                />
                
                {isCurrentMonth && (
                  <ReferenceLine x={new Date().getDate()} stroke="hsl(var(--muted-foreground))" strokeWidth={1} strokeDasharray="4 4" label={{ position: 'top', value: 'TODAY', fill: 'hsl(var(--muted-foreground))', fontSize: 10, fontWeight: '600', letterSpacing: '0.05em' }} />
                )}
                
                {/* ONE Continuous Line logic, segmented by Up/Down properly overlapping */}
                <Line type="monotone" dataKey="balanceUp" stroke="#10b981" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: "#10b981", strokeWidth: 0 }} connectNulls />
                <Line type="monotone" dataKey="balanceDown" stroke="#f43f5e" strokeWidth={3} dot={false} activeDot={{ r: 6, fill: "#f43f5e", strokeWidth: 0 }} connectNulls />
                
                {/* Projected Ghost Zone */}
                <Line type="monotone" dataKey="projectedBalance" stroke="hsl(var(--muted-foreground))" strokeWidth={2} strokeDasharray="6 4" dot={false} activeDot={{ r: 5, fill: "hsl(var(--background))", stroke: "hsl(var(--muted-foreground))", strokeWidth: 2 }} connectNulls />
                
              </ComposedChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* ROW 2 RIGHT — SMART INSIGHTS (30%) */}
        <div className="rounded-[1.5rem] bg-gradient-to-b from-primary/5 via-background to-background border border-primary/20 p-7 shadow-sm flex flex-col h-full">
          <div className="flex items-center gap-2 mb-6">
            <Shield className="w-5 h-5 text-primary" />
            <h3 className="text-lg font-semibold tracking-tight">AI Financial Logic</h3>
          </div>

          <div className="space-y-4 flex-1 overflow-y-auto pr-2 hide-scrollbar">
            {insights.length === 0 ? (
              <p className="text-sm font-medium text-muted-foreground opacity-60">Everything looks stable. No immediate alerts.</p>
            ) : insights.map((insight, i) => (
              <div key={i} className={cn(
                "p-5 rounded-2xl flex items-start gap-3 border transition-all",
                insight.type === "danger" ? "bg-rose-500/10 border-rose-500/20 text-rose-700" :
                insight.type === "warning" ? "bg-amber-500/10 border-amber-500/20 text-amber-700" :
                insight.type === "success" ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-700" :
                "bg-muted/40 border-border/40 text-foreground"
              )}>
                {insight.type === "danger" || insight.type === "warning" ? <AlertTriangle className="w-5 h-5 mt-0.5 flex-shrink-0" /> : <TrendingUp className="w-5 h-5 mt-0.5 flex-shrink-0" />}
                <p className="text-[13px] font-medium leading-relaxed">{insight.text}</p>
              </div>
            ))}
          </div>
          
          <div className="mt-6 pt-6 border-t border-border/40">
             <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-muted-foreground">Safe to spend today:</span>
                <span className="text-base font-bold text-foreground">{formatCurrency(safeToSpendToday)}</span>
             </div>
          </div>
        </div>
      </div>

        <div className="rounded-[1.5rem] bg-background border border-border/40 p-7 shadow-sm">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <div>
              <h3 className="text-lg font-semibold tracking-tight">Transaction Ledger</h3>
              <p className="text-xs font-medium text-muted-foreground opacity-80 mt-1">Past reality & Future obligations</p>
            </div>
            
            <div className="flex gap-1.5 p-1 bg-muted/20 rounded-xl border border-border/40 overflow-x-auto no-scrollbar">
              {["all", "income", "expense", "planned", "pending"].map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={cn(
                    "px-4 py-2 rounded-lg text-xs font-medium capitalize transition-all active:scale-95",
                    filter === t ? "bg-background text-foreground shadow-sm border border-border/20" : "text-muted-foreground hover:bg-muted/50"
                  )}
                >
                  {t}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {filteredTransactions.length === 0 ? (
              <div className="col-span-full py-16 text-center flex flex-col items-center justify-center opacity-40">
                <CreditCard className="w-12 h-12 mb-4 stroke-[1.5]" />
                <p className="text-sm font-medium">No transactions matched</p>
              </div>
            ) : filteredTransactions.slice(0, 10).map((tx) => {
              const isIncome = tx.type === "income";
              const isPlanned = tx.status === "planned";
              const isPending = tx.status === "pending_confirmation";
              
              return (
                <div key={tx._id} className={cn(
                  "flex items-center justify-between p-5 rounded-2xl border transition-all duration-300 hover:shadow-md",
                  isPlanned || isPending ? "bg-muted/10 border-dashed border-border/60" : "bg-background border-border/40 hover:border-primary/30"
                )}>
                  <div className="flex items-center gap-4">
                    <div className={cn(
                      "p-3 rounded-xl shadow-sm transition-transform",
                      isIncome ? "bg-emerald-500/10 text-emerald-600" : (isPlanned || isPending ? "bg-muted text-muted-foreground" : "bg-rose-500/10 text-rose-600")
                    )}>
                      {tx.category === "food" ? <Coffee className="w-5 h-5" /> : 
                      tx.category === "transport" ? <Car className="w-5 h-5" /> : 
                      tx.category === "shopping" ? <ShoppingBag className="w-5 h-5" /> : 
                      isIncome ? <TrendingUp className="w-5 h-5" /> : <CreditCard className="w-5 h-5" />}
                    </div>
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <p className="font-semibold text-sm tracking-tight line-clamp-1">{tx.description}</p>
                        {isPlanned && (
                          <span className="px-2 py-0.5 rounded-md bg-primary/10 text-primary text-[10px] font-semibold">Planned</span>
                        )}
                        {isPending && (
                          <span className="px-2 py-0.5 rounded-md bg-amber-500/10 text-amber-500 text-[10px] font-semibold">Pending</span>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground font-medium opacity-80">
                        {format(new Date(tx.dateTime), "MMM d, yyyy")} • <span className="capitalize">{tx.category}</span>
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "font-bold text-base tracking-tight",
                      isIncome ? "text-emerald-500" : (isPlanned || isPending ? "text-muted-foreground" : "text-foreground")
                    )}>
                      {isIncome ? "+" : "-"}{formatCurrency(tx.amount)}
                    </p>
                    <div className="flex items-center justify-end gap-1 mt-1">
                      {tx.relatedScheduleId && <Clock className="w-3 h-3 text-primary/50" />}
                      <p className="text-[10px] font-medium text-muted-foreground opacity-60 capitalize">
                        {tx.status.replace("_", " ")}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
      </div>
    </div>
  );
}
