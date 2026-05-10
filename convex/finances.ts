import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getFinances = query({
  args: { 
    userId: v.id("users"),
    rangeStart: v.optional(v.number()),
    rangeEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const rangeStart = args.rangeStart ?? 0;
    const rangeEnd = args.rangeEnd ?? 9999999999999;

    const finances = await ctx.db
      .query("finances")
      .withIndex("by_userId_dateTime", (q) =>
        q.eq("userId", args.userId).gte("dateTime", rangeStart).lte("dateTime", rangeEnd)
      )
      .filter((q) => q.neq(q.field("status"), "cancelled")) // exclude soft-deleted
      .order("desc")
      .collect();

    return finances;
  },
});

export const insertFinance = mutation({
  args: {
    userId: v.id("users"),
    amount: v.number(),
    type: v.union(v.literal("expense"), v.literal("income")),
    category: v.string(),
    description: v.string(),
    status: v.union(v.literal("planned"), v.literal("actual"), v.literal("cancelled")),
    relatedScheduleId: v.optional(v.id("schedules")),
    dateTime: v.number(),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("finances", {
      userId: args.userId,
      amount: args.amount,
      type: args.type,
      category: args.category,
      description: args.description,
      status: args.status,
      relatedScheduleId: args.relatedScheduleId,
      dateTime: args.dateTime,
      updatedAt: Date.now(),
    });
  },
});

export const updateFinance = mutation({
  args: {
    financeId: v.id("finances"),
    updates: v.object({
      amount: v.optional(v.number()),
      type: v.optional(v.union(v.literal("expense"), v.literal("income"))),
      category: v.optional(v.string()),
      description: v.optional(v.string()),
      status: v.optional(v.union(v.literal("planned"), v.literal("actual"), v.literal("cancelled"))),
      dateTime: v.optional(v.number()),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.financeId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteFinance = mutation({
  args: { financeId: v.id("finances") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.financeId);
  },
});
