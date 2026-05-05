import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";

// Tool Executors - manageFinance
export const manageFinance = internalMutation({
  args: {
    userId: v.id("users"),
    action: v.string(),
    financeId: v.optional(v.id("finances")),
    amount: v.optional(v.number()),
    type: v.optional(v.union(v.literal("expense"), v.literal("income"))),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal("planned"), v.literal("actual"))),
    date: v.optional(v.number()),
    relatedScheduleId: v.optional(v.id("schedules")),
  },
  handler: async (ctx, args) => {
    if (args.action === "create") {
      const amount = args.amount ?? 0;
      const type = args.type ?? "expense";
      const category = args.category ?? "other";
      return await ctx.db.insert("finances", {
        userId: args.userId,
        amount,
        type,
        category,
        description: args.description || "",
        status: args.status || "actual",
        date: args.date || Date.now(),
        relatedScheduleId: args.relatedScheduleId,
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } else if (args.action === "update") {
      if (!args.financeId) throw new Error("Missing financeId for update");
      const updates: any = {};
      if (args.amount !== undefined) updates.amount = args.amount;
      if (args.type !== undefined) updates.type = args.type;
      if (args.category !== undefined) updates.category = args.category;
      if (args.description !== undefined) updates.description = args.description;
      if (args.status !== undefined) updates.status = args.status;
      if (args.date !== undefined) updates.date = args.date;
      if (args.relatedScheduleId !== undefined) updates.relatedScheduleId = args.relatedScheduleId;
      updates.updatedAt = Date.now();
      await ctx.db.patch(args.financeId, updates);
      return args.financeId;
    } else if (args.action === "delete") {
      if (!args.financeId) throw new Error("Missing financeId for delete");
      await ctx.db.delete(args.financeId);
      return "deleted";
    }
  },
});

export const checkAffordabilityData = internalQuery({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    item: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");

    // simplified: check total actual income - total actual expense - total planned expense
    // this month for example
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const finances = await ctx.db
      .query("finances")
      .withIndex("by_userId_date", (q) => q.eq("userId", args.userId).gte("date", startOfMonth.getTime()))
      .collect();

    let balance = 0;
    let plannedExpenses = 0;

    for (const f of finances) {
      if (f.status === "actual") {
        if (f.type === "income") balance += f.amount;
        if (f.type === "expense") balance -= f.amount;
      } else if (f.status === "planned" && f.type === "expense") {
        plannedExpenses += f.amount;
      }
    }

    const availableBudget = balance - plannedExpenses;
    const canAfford = availableBudget >= args.amount;
    const remainingAfter = availableBudget - args.amount;
    const isRisky = remainingAfter < (user.settings.monthlyBudget || 0) * 0.1;

    return {
      canAfford,
      isRisky,
      balance,
      plannedExpenses,
      availableBudget,
      remainingAfter
    };
  },
});

export const getLifeStatusData = internalQuery({
  args: {
    userId: v.id("users"),
    rangeDays: v.number(),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const startRange = now - args.rangeDays * 24 * 60 * 60 * 1000;
    const endRange = now + args.rangeDays * 24 * 60 * 60 * 1000;

    const finances = await ctx.db
      .query("finances")
      .withIndex("by_userId_date", (q) => q.eq("userId", args.userId).gte("date", startRange))
      .collect();

    const schedules = await ctx.db
      .query("schedules")
      .withIndex("by_userId_dateTime", (q) => q.eq("userId", args.userId).gte("dateTime", startRange))
      .collect();

    let totalSpent = 0;
    let totalIncome = 0;
    let upcomingCosts = 0;
    let upcomingSchedules = 0;

    for (const f of finances) {
      if (f.date <= now) {
        if (f.type === "expense") totalSpent += f.amount;
        if (f.type === "income") totalIncome += f.amount;
      } else {
        if (f.type === "expense") upcomingCosts += f.amount;
      }
    }

    for (const s of schedules) {
      if (s.dateTime > now) upcomingSchedules++;
    }

    return {
      totalSpent,
      totalIncome,
      upcomingCosts,
      upcomingSchedulesCount: upcomingSchedules,
      recentSchedules: schedules.filter(s => s.dateTime > now).slice(0, 5) // top 5 upcoming
    };
  },
});
