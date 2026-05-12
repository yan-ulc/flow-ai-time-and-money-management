import { format, startOfMonth, endOfMonth, eachDayOfInterval, eachWeekOfInterval, eachMonthOfInterval, isSameDay, isSameWeek, isSameMonth, getDaysInMonth } from "date-fns";

export type Granularity = "daily" | "weekly" | "monthly";

export interface Transaction {
  _id: string;
  amount: number;
  type: "income" | "expense";
  status: "planned" | "actual" | "cancelled" | "pending_confirmation";
  category: string;
  dateTime: number;
  description?: string;
  relatedScheduleId?: string;
}

export function aggregateComparisonData(transactions: Transaction[], granularity: Granularity, monthContext: Date) {
  const actuals = transactions.filter(t => t.status === "actual");
  const start = startOfMonth(monthContext);
  const end = endOfMonth(monthContext);

  let intervals: Date[] = [];
  if (granularity === "daily") intervals = eachDayOfInterval({ start, end });
  else if (granularity === "weekly") intervals = eachWeekOfInterval({ start, end });
  else {
    const startOfYear = new Date(monthContext.getFullYear(), 0, 1);
    intervals = eachMonthOfInterval({ start: startOfYear, end: endOfMonth(monthContext) });
  }

  return intervals.map(date => {
    let income = 0, expense = 0;
    actuals.forEach(t => {
      const tDate = new Date(t.dateTime);
      const match = (granularity === "daily" && isSameDay(tDate, date))
        || (granularity === "weekly" && isSameWeek(tDate, date))
        || (granularity === "monthly" && isSameMonth(tDate, date));
      if (match) {
        if (t.type === "income") income += t.amount;
        if (t.type === "expense") expense += t.amount;
      }
    });
    const label = granularity === "daily" ? format(date, "d") : granularity === "weekly" ? `W${format(date, "w")}` : format(date, "MMM");
    return { name: label, income, expense, net: income - expense };
  });
}

export function buildPredictiveTimeline(transactions: Transaction[], monthContext: Date) {
  const start = startOfMonth(monthContext);
  const daysInMonth = getDaysInMonth(monthContext);
  const today = new Date();

  // Starting balance = all actuals before this month
  let runningBalance = 0;
  transactions
    .filter(t => t.status === "actual" && new Date(t.dateTime) < start)
    .forEach(t => { runningBalance += t.type === "income" ? t.amount : -t.amount; });

  const sorted = [...transactions].sort((a, b) => a.dateTime - b.dateTime);
  const dataset: any[] = [];

  for (let i = 1; i <= daysInMonth; i++) {
    const currentDate = new Date(monthContext.getFullYear(), monthContext.getMonth(), i);
    const isFuture = currentDate > today && !isSameDay(currentDate, today);
    const dayTxs = sorted.filter(t => isSameDay(new Date(t.dateTime), currentDate));

    let dailyIncome = 0, dailyExpense = 0, dailyPlanned = 0;
    dayTxs.forEach(t => {
      if (t.type === "income" && t.status === "actual") dailyIncome += t.amount;
      if (t.type === "expense" && t.status === "actual") dailyExpense += t.amount;
      if (t.type === "expense" && t.status === "planned") dailyPlanned += t.amount;
    });

    const net = dailyIncome - dailyExpense;
    const isUp = net >= 0;
    
    const prevBalance = runningBalance;
    if (!isFuture) {
      runningBalance += net;
    }

    dataset.push({
      day: i,
      name: format(currentDate, "MMM d"),
      balance: isFuture ? null : runningBalance,
      isUp,
      projectedBalance: null as number | null,
      isFuture,
      dailyIncome,
      dailyExpense,
      dailyPlanned,
      net,
    });
  }

  // Second pass: Create overlapping segments for Recharts seamless connection
  dataset.forEach((d, index) => {
    if (d.isFuture) {
      d.balanceUp = null;
      d.balanceDown = null;
      return;
    }

    // Determine if the trajectory leading *into* this point was up or down
    // (We consider it "up" if net >= 0)
    d.balanceUp = d.isUp ? d.balance : null;
    d.balanceDown = !d.isUp ? d.balance : null;

    // To connect seamlessly to the PREVIOUS point, the previous point must also exist in the same line!
    if (index > 0 && !dataset[index - 1].isFuture) {
      if (d.isUp) {
        dataset[index - 1].balanceUp = dataset[index - 1].balance;
      } else {
        dataset[index - 1].balanceDown = dataset[index - 1].balance;
      }
    }
  });

  // Ghost Zone: start from today's balance, subtract planned expenses forward
  const todayBalance = runningBalance;
  let ghost = todayBalance;
  dataset.forEach(d => {
    if (d.isFuture) {
      ghost -= d.dailyPlanned;
      d.projectedBalance = ghost;
    } else if (isSameDay(new Date(monthContext.getFullYear(), monthContext.getMonth(), d.day), today)) {
      d.projectedBalance = d.balance;
    }
  });

  return dataset;
}

export function aggregateCategoryData(transactions: Transaction[], granularity: Granularity, monthContext: Date) {
  const start = startOfMonth(monthContext);
  const end = endOfMonth(monthContext);
  const filtered = transactions.filter(t =>
    t.status === "actual" && t.type === "expense" &&
    new Date(t.dateTime) >= start && new Date(t.dateTime) <= end
  );

  const totals: Record<string, number> = {};
  filtered.forEach(t => { totals[t.category] = (totals[t.category] || 0) + t.amount; });
  const total = Object.values(totals).reduce((a, b) => a + b, 0);

  return Object.entries(totals)
    .map(([name, value]) => ({ name, value, percentage: total > 0 ? (value / total) * 100 : 0 }))
    .sort((a, b) => b.value - a.value);
}
