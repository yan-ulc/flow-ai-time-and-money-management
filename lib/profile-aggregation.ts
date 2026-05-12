import { Transaction } from "./financial-aggregation";
import { format, isSameMonth, subMonths, isSameDay } from "date-fns";

export interface Schedule {
  _id: string;
  userId: string;
  title: string;
  dateTime: number;
  duration: number;
  estimatedCost?: number;
  actualCost?: number;
  status: "upcoming" | "pending_confirmation" | "completed" | "done" | "missed" | "cancelled";
}

export function buildProfileAggregation(txs: Transaction[], schedules: Schedule[]) {
  const now = new Date();
  const currentMonth = now;
  const lastMonth = subMonths(now, 1);

  // 1. Snapshot Metrics
  const currentMonthTxs = txs.filter(t => isSameMonth(new Date(t.dateTime), currentMonth) && t.status === "actual");
  const lastMonthTxs = txs.filter(t => isSameMonth(new Date(t.dateTime), lastMonth) && t.status === "actual");

  const monthlyIncome = currentMonthTxs.filter(t => t.type === "income").reduce((acc, t) => acc + t.amount, 0);
  const monthlyExpense = currentMonthTxs.filter(t => t.type === "expense").reduce((acc, t) => acc + t.amount, 0);
  const totalBalance = txs.filter(t => t.status === "actual" && t.dateTime <= now.getTime()).reduce((acc, t) => acc + (t.type === "income" ? t.amount : -t.amount), 0);

  const savingsRate = monthlyIncome > 0 ? ((monthlyIncome - monthlyExpense) / monthlyIncome) * 100 : 0;

  // 2. Spending Personality
  const categoryTotals = currentMonthTxs
    .filter(t => t.type === "expense")
    .reduce((acc, t) => {
      acc[t.category] = (acc[t.category] || 0) + t.amount;
      return acc;
    }, {} as Record<string, number>);

  const sortedCategories = Object.entries(categoryTotals)
    .sort((a, b) => b[1] - a[1]);
    
  // Filter out meaningless categories to find the true dominant spending
  const meaningfulCategories = sortedCategories.filter(([cat]) => !['other', 'uncategorized', 'general', 'unknown'].includes(cat.toLowerCase()));
  const topCategory = meaningfulCategories.length > 0 ? meaningfulCategories[0][0] : "general";

  let spendingPersonality = `Your spending behavior is stable.`;
  
  if (meaningfulCategories.length > 0) {
    const dominantName = topCategory.charAt(0).toUpperCase() + topCategory.slice(1);
    spendingPersonality = `Most of your spending goes into ${dominantName}.`;
  } else if (sortedCategories.length > 0) {
    spendingPersonality = `Many of your transactions are still uncategorized. Categorizing them will improve AI insights.`;
  }
  
  const weekendSpending = currentMonthTxs.filter(t => {
    const day = new Date(t.dateTime).getDay();
    return t.type === "expense" && (day === 0 || day === 6);
  }).reduce((acc, t) => acc + t.amount, 0);
  
  if (weekendSpending > monthlyExpense * 0.4) {
    spendingPersonality += ` You tend to spend more aggressively on weekends.`;
  }

  // 3. Financial Health
  let healthStatus: "Healthy" | "Stable" | "Warning" | "Critical" = "Stable";
  if (totalBalance < 0) healthStatus = "Critical";
  else if (savingsRate > 20) healthStatus = "Healthy";
  else if (monthlyExpense > monthlyIncome && monthlyIncome > 0) healthStatus = "Warning";

  // 4. Quick Stats
  const schedulesCompleted = schedules.filter(s => s.status === "completed" || s.status === "done").length;
  const aiInsightsUsed = 24; // Mock for now until we track it

  // 5. Activity Feed
  const recentTxs = txs.filter(t => t.status === "actual").sort((a, b) => b.dateTime - a.dateTime).slice(0, 5);
  const recentSchedules = schedules.filter(s => s.status === "completed" || s.status === "done").sort((a, b) => b.dateTime - a.dateTime).slice(0, 5);
  
  const activityFeed = [...recentTxs.map(t => {
    const isIncome = t.type === "income";
    return {
      id: t._id,
      type: "transaction" as const,
      semanticType: isIncome ? "positive" : "expense",
      title: isIncome ? `Received Income` : `Added Expense`,
      description: t.description || t.category,
      amount: t.amount,
      dateTime: t.dateTime,
      dateObj: new Date(t.dateTime)
    };
  }), ...recentSchedules.map(s => ({
    id: s._id,
    type: "schedule" as const,
    semanticType: "positive",
    title: `Completed Schedule`,
    description: s.title,
    dateTime: s.dateTime,
    dateObj: new Date(s.dateTime)
  }))].sort((a, b) => b.dateTime - a.dateTime).slice(0, 8);

  return {
    totalBalance,
    monthlyIncome,
    monthlyExpense,
    savingsRate,
    spendingPersonality,
    healthStatus,
    schedulesCompleted,
    aiInsightsUsed,
    activityFeed,
    topCategory
  };
}
