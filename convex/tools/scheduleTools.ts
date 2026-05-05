import { internalMutation } from "../_generated/server";
import { v } from "convex/values";

// Tool Executors - manageSchedule
export const manageSchedule = internalMutation({
  args: {
    userId: v.id("users"),
    action: v.string(),
    scheduleId: v.optional(v.id("schedules")),
    title: v.optional(v.string()),
    dateTime: v.optional(v.number()),
    duration: v.optional(v.number()),
    estimatedCost: v.optional(v.number()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    if (args.action === "create") {
      if (args.title === undefined || args.dateTime === undefined) {
        throw new Error("Missing required fields for create schedule");
      }
      return await ctx.db.insert("schedules", {
        userId: args.userId,
        title: args.title,
        dateTime: args.dateTime,
        duration: args.duration || 60,
        estimatedCost: args.estimatedCost,
        location: args.location || "",
        status: "upcoming",
        createdAt: Date.now(),
        updatedAt: Date.now(),
      });
    } else if (args.action === "update") {
      if (!args.scheduleId) throw new Error("Missing scheduleId for update");
      const updates: any = {};
      if (args.title !== undefined) updates.title = args.title;
      if (args.dateTime !== undefined) updates.dateTime = args.dateTime;
      if (args.duration !== undefined) updates.duration = args.duration;
      if (args.estimatedCost !== undefined) updates.estimatedCost = args.estimatedCost;
      if (args.location !== undefined) updates.location = args.location;
      updates.updatedAt = Date.now();
      await ctx.db.patch(args.scheduleId, updates);
      return args.scheduleId;
    } else if (args.action === "delete") {
      if (!args.scheduleId) throw new Error("Missing scheduleId for delete");
      await ctx.db.delete(args.scheduleId);
      return "deleted";
    }
  },
});

export const setReminder = internalMutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    body: v.optional(v.string()),
    scheduledAt: v.number(),
    relatedScheduleId: v.optional(v.id("schedules")),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("notifications", {
      userId: args.userId,
      title: args.title,
      body: args.body || "",
      scheduledAt: args.scheduledAt,
      relatedScheduleId: args.relatedScheduleId,
      sent: false,
      createdAt: Date.now(),
    });
  },
});
