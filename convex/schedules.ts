import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getSchedules = query({
  args: { 
    userId: v.id("users"),
    rangeStart: v.optional(v.number()),
    rangeEnd: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const rangeStart = args.rangeStart ?? 0;
    const rangeEnd = args.rangeEnd ?? 9999999999999;

    const schedules = await ctx.db
      .query("schedules")
      .withIndex("by_userId_dateTime", (q) =>
        q.eq("userId", args.userId).gte("dateTime", rangeStart).lte("dateTime", rangeEnd)
      )
      .order("asc")
      .collect();

    return schedules;
  },
});

export const insertSchedule = mutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    dateTime: v.number(),
    duration: v.number(),
    estimatedCost: v.optional(v.number()),
    location: v.optional(v.string()),
    status: v.union(v.literal("upcoming"), v.literal("done"), v.literal("cancelled")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("schedules", {
      userId: args.userId,
      title: args.title,
      dateTime: args.dateTime,
      duration: args.duration,
      estimatedCost: args.estimatedCost,
      location: args.location,
      status: args.status,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  },
});

export const updateSchedule = mutation({
  args: {
    scheduleId: v.id("schedules"),
    updates: v.object({
      title: v.optional(v.string()),
      dateTime: v.optional(v.number()),
      duration: v.optional(v.number()),
      estimatedCost: v.optional(v.number()),
      location: v.optional(v.string()),
      status: v.optional(v.union(v.literal("upcoming"), v.literal("done"), v.literal("cancelled"))),
    }),
  },
  handler: async (ctx, args) => {
    return await ctx.db.patch(args.scheduleId, {
      ...args.updates,
      updatedAt: Date.now(),
    });
  },
});

export const deleteSchedule = mutation({
  args: { scheduleId: v.id("schedules") },
  handler: async (ctx, args) => {
    await ctx.db.delete(args.scheduleId);
  },
});
