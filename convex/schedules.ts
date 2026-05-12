import { query, mutation, internalMutation } from "./_generated/server";
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
      .filter((q) => q.neq(q.field("status"), "cancelled")) // exclude soft-deleted
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
    status: v.union(v.literal("upcoming"), v.literal("pending_confirmation"), v.literal("completed"), v.literal("missed"), v.literal("cancelled")),
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
      status: v.optional(v.union(v.literal("upcoming"), v.literal("pending_confirmation"), v.literal("completed"), v.literal("missed"), v.literal("cancelled"))),
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

export const confirmSpending = mutation({
  args: {
    scheduleId: v.id("schedules"),
    actualAmount: v.float64(),
  },
  handler: async (ctx, args) => {
    const schedule = await ctx.db.get(args.scheduleId);
    if (!schedule) throw new Error("Schedule not found");

    // 1. Update schedule status and actual amount
    await ctx.db.patch(args.scheduleId, {
      status: "completed",
      actualCost: args.actualAmount,
      updatedAt: Date.now(),
    });

    // 2. Find linked finance record or create a new one
    const linkedFinances = await ctx.db
      .query("finances")
      .withIndex("by_userId", (q: any) => q.eq("userId", schedule.userId))
      .filter((q: any) => q.eq(q.field("relatedScheduleId"), args.scheduleId))
      .collect();

    if (linkedFinances.length > 0) {
      // Update existing planned transaction to actual
      for (const finance of linkedFinances) {
        await ctx.db.patch(finance._id, {
          status: "actual",
          amount: args.actualAmount,
          updatedAt: Date.now(),
        });
      }
    } else {
      // Create new expense transaction if none existed
      await ctx.db.insert("finances", {
        userId: schedule.userId,
        amount: args.actualAmount,
        type: "expense",
        category: "other", // Default category
        description: `Confirmed spending for ${schedule.title}`,
        status: "actual",
        relatedScheduleId: schedule._id,
        dateTime: Date.now(),
        updatedAt: Date.now(),
      });
    }

    return { success: true };
  },
});

export const checkUnconfirmedEvents = internalMutation({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const oneHourAgo = now - 60 * 60 * 1000;
    const twoHoursAgo = now - 2 * 60 * 60 * 1000;
    
    const expiredSchedules = await ctx.db
      .query("schedules")
      .withIndex("by_status_dateTime", (q) => 
        q.eq("status", "upcoming").gt("dateTime", twoHoursAgo).lte("dateTime", oneHourAgo)
      )
      .collect();

    for (const schedule of expiredSchedules) {
      await ctx.db.insert("notifications", {
        userId: schedule.userId,
        relatedScheduleId: schedule._id,
        title: "Konfirmasi Jadwal",
        body: `Jadwal "${schedule.title}" sudah lewat. Jangan lupa konfirmasi pengeluaran agar budget tetap akurat!`,
        scheduledAt: Date.now(),
        sent: false,
      });
    }
  },
});
export const migrateDoneToCompleted = mutation({
  args: {},
  handler: async (ctx) => {
    const schedules = await ctx.db.query("schedules").collect();
    let count = 0;
    for (const schedule of schedules) {
      if ((schedule as any).status === "done") {
        await ctx.db.patch(schedule._id, {
          status: "completed",
          updatedAt: Date.now(),
        });
        count++;
      }
    }
    return { updated: count };
  },
});
