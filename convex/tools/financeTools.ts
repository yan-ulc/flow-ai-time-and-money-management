import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";
import { validateAiDateTime } from "../lib/timeUtils";

// Tool Executors - manageFinance
export const manageFinance = internalMutation({
  args: {
    userId: v.id("users"),
    action: v.string(),
    financeId: v.optional(v.string()),
    amount: v.optional(v.number()),
    type: v.optional(v.union(v.literal("expense"), v.literal("income"))),
    category: v.optional(v.string()),
    description: v.optional(v.string()),
    status: v.optional(v.union(v.literal("planned"), v.literal("actual"), v.literal("cancelled"))),
    dateTime: v.optional(v.number()),
    relatedScheduleId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const identity = await ctx.auth.getUserIdentity();
    let resolvedUserId = args.userId;

    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
        .unique();
      if (!user) throw new Error("User not found");
      resolvedUserId = user._id;
    }

    if (!resolvedUserId) throw new Error("Unauthenticated");

    const now = Date.now();
    const financeId = args.financeId ? (ctx.db.normalizeId("finances", args.financeId) ?? undefined) : undefined;
    const relatedScheduleId = args.relatedScheduleId ? (ctx.db.normalizeId("schedules", args.relatedScheduleId) ?? undefined) : undefined;

    if (args.action === "create") {
      if (!args.dateTime) throw new Error("Missing dateTime for create finance");
      
      // Validate dateTime coming from AI to catch temporal drift
      const validation = validateAiDateTime(args.dateTime, now, { allowPast: true, maxFutureDays: 730 });
      if (!validation.valid) {
        throw new Error(`Invalid dateTime: ${validation.error}${validation.corrected ? ` (did you mean ${validation.corrected}?)` : ""}`);
      }
      
      const id = await ctx.db.insert("finances", {
        userId: resolvedUserId,
        amount: args.amount ?? 0,
        type: args.type ?? "expense",
        category: args.category ?? "other",
        description: args.description || "",
        status: args.status || (args.dateTime > now ? "planned" : "actual"),
        dateTime: args.dateTime, // NO DEFAULT
        relatedScheduleId: relatedScheduleId,
        updatedAt: now,
      });
      return { success: true, financeId: id };
    }

    if (args.action === "update") {
      if (!financeId) throw new Error("financeId is required for update or provided ID is invalid");
      const existing = await ctx.db.get(financeId);
      if (!existing || existing.userId !== resolvedUserId) throw new Error("Unauthorized or not found");
      
      await ctx.db.patch(financeId, {
        ...(args.amount !== undefined && { amount: args.amount }),
        ...(args.type !== undefined && { type: args.type }),
        ...(args.category !== undefined && { category: args.category }),
        ...(args.description !== undefined && { description: args.description }),
        ...(args.status !== undefined && { status: args.status }),
        ...(args.dateTime !== undefined && { dateTime: args.dateTime }),
        ...(relatedScheduleId !== undefined && { relatedScheduleId }),
        updatedAt: now,
      });
      return { success: true, financeId: financeId };
    }

    if (args.action === "delete") {
      if (!financeId) throw new Error("financeId is required for delete or provided ID is invalid");
      const existing = await ctx.db.get(financeId);
      if (!existing || existing.userId !== resolvedUserId) throw new Error("Unauthorized or not found");
      
      // SOFT-DELETE
      await ctx.db.patch(financeId, {
        status: "cancelled",
        updatedAt: now,
      });
      return { success: true, deleted: financeId };
    }

    return { success: false, error: "Unknown action" };
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

    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const finances = await ctx.db
      .query("finances")
      .withIndex("by_userId_dateTime", (q: any) => q.eq("userId", args.userId).gte("dateTime", startOfMonth.getTime()))
      .filter((q: any) => q.neq(q.field("status"), "cancelled"))
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
    rangeDays: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const rangeDays = args.rangeDays ?? 7;
    const now = Date.now();
    const startRange = now - rangeDays * 24 * 60 * 60 * 1000;

    const finances = await ctx.db
      .query("finances")
      .withIndex("by_userId_dateTime", (q: any) => q.eq("userId", args.userId).gte("dateTime", startRange))
      .filter((q: any) => q.neq(q.field("status"), "cancelled"))
      .collect();

    const schedules = await ctx.db
      .query("schedules")
      .withIndex("by_userId_dateTime", (q: any) => q.eq("userId", args.userId).gte("dateTime", startRange))
      .filter((q: any) => q.neq(q.field("status"), "cancelled"))
      .collect();

    let totalSpent = 0;
    let totalIncome = 0;
    let upcomingCosts = 0;
    let upcomingSchedules = 0;

    for (const f of finances) {
      if (f.status === "actual") {
        if (f.type === "expense") totalSpent += f.amount;
        if (f.type === "income") totalIncome += f.amount;
      } else if (f.status === "planned") {
        if (f.type === "expense") upcomingCosts += f.amount;
      }
    }

    for (const s of schedules) {
      if (s.dateTime > now && s.status === "upcoming") upcomingSchedules++;
    }

    const user = await ctx.db.get(args.userId);
    const timeZone = user?.settings?.timezone || "Asia/Jakarta";

    const formatDateTime = (ms: number) => new Date(ms).toLocaleString("id-ID", { 
      weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', 
      hour: '2-digit', minute: '2-digit', timeZoneName: 'short',
      timeZone
    });

    return {
      totalSpent,
      totalIncome,
      upcomingCosts,
      upcomingSchedulesCount: upcomingSchedules,
      recentSchedules: schedules.sort((a, b) => b.dateTime - a.dateTime).slice(0, 10).map(s => ({
        ...s,
        readableDateTime: formatDateTime(s.dateTime)
      })),
      recentFinances: finances.sort((a, b) => b.dateTime - a.dateTime).slice(0, 10).map(f => ({
        ...f,
        readableDate: formatDateTime(f.dateTime)
      }))
    };
  },
});
