import { internalMutation } from "../_generated/server";
import { v } from "convex/values";
import { validateAiDateTime } from "../lib/timeUtils";

// Tool Executors - manageSchedule
export const manageSchedule = internalMutation({
  args: {
    userId: v.id("users"),
    action: v.string(),
    scheduleId: v.optional(v.string()),
    title: v.optional(v.string()),
    dateTime: v.optional(v.number()),
    duration: v.optional(v.number()),
    estimatedCost: v.optional(v.number()),
    location: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const now = Date.now();
    const scheduleId = args.scheduleId ? (ctx.db.normalizeId("schedules", args.scheduleId) ?? undefined) : undefined;

    if (args.action === "create") {
      if (!args.dateTime) throw new Error("Missing dateTime for create schedule");
      
      // Validate dateTime coming from AI to catch temporal drift
      const validation = validateAiDateTime(args.dateTime, now, { allowPast: false, maxFutureDays: 365 });
      if (!validation.valid) {
        throw new Error(`Invalid schedule dateTime: ${validation.error}${validation.corrected ? ` Did you mean ${validation.corrected}?` : ""}`);
      }
      
      const title = args.title || "No Title";
      const dateTime = args.dateTime;

      // Deduplication check: title and time within 30 minutes window, IGNORE CANCELLED
      const windowMs = 30 * 60 * 1000;
      const existing = await ctx.db
        .query("schedules")
        .withIndex("by_userId_dateTime", (q) => 
          q.eq("userId", args.userId)
           .gte("dateTime", dateTime - windowMs)
           .lte("dateTime", dateTime + windowMs)
        )
        .filter((q) => q.neq(q.field("status"), "cancelled"))
        .collect();
      
      const duplicate = existing.find(s => s.title.toLowerCase() === title.toLowerCase());
      
      if (duplicate) {
        return { 
          success: false,
          status: "duplicate_found", 
          message: `Jadwal "${duplicate.title}" sudah ada di waktu yang sama (selisih < 30 menit).`,
          existingSchedule: duplicate
        };
      }

      const id = await ctx.db.insert("schedules", {
        userId: args.userId,
        title: title,
        dateTime: dateTime,
        duration: args.duration || 60,
        estimatedCost: args.estimatedCost,
        location: args.location || "",
        status: dateTime < now ? "done" : "upcoming",
        updatedAt: now,
      });
      return { success: true, scheduleId: id };
    } 
    
    if (args.action === "update") {
      if (!scheduleId) throw new Error("scheduleId is required for update");
      await ctx.db.patch(scheduleId, {
        ...(args.title !== undefined && { title: args.title }),
        ...(args.dateTime !== undefined && { dateTime: args.dateTime }),
        ...(args.duration !== undefined && { duration: args.duration }),
        ...(args.estimatedCost !== undefined && { estimatedCost: args.estimatedCost }),
        ...(args.location !== undefined && { location: args.location }),
        updatedAt: now,
      });
      return { success: true, scheduleId: scheduleId };
    }
    
    if (args.action === "delete") {
      if (!scheduleId) throw new Error("scheduleId is required for delete");
      // SOFT-DELETE
      await ctx.db.patch(scheduleId, {
        status: "cancelled",
        updatedAt: now,
      });
      return { success: true, deleted: scheduleId };
    }

    return { success: false, error: "Unknown action" };
  },
});

export const setReminder = internalMutation({
  args: {
    userId: v.id("users"),
    title: v.string(),
    body: v.optional(v.string()),
    scheduledAt: v.number(),
    relatedScheduleId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const relatedScheduleId = args.relatedScheduleId ? (ctx.db.normalizeId("schedules", args.relatedScheduleId) ?? undefined) : undefined;
    const id = await ctx.db.insert("notifications", {
      userId: args.userId,
      title: args.title,
      body: args.body || "",
      scheduledAt: args.scheduledAt,
      relatedScheduleId: relatedScheduleId,
      sent: false,
    });
    return { success: true, notificationId: id };
  },
});
