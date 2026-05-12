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
    
    // Always fetch user settings to get reminder preferences
    const user = await ctx.db.get(resolvedUserId);
    if (!user) throw new Error("User record missing");
    const reminderMinutesBefore = user.settings.reminderMinutesBefore ?? 30;

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
        .withIndex("by_userId_dateTime", (q: any) => 
          q.eq("userId", resolvedUserId)
           .gte("dateTime", dateTime - windowMs)
           .lte("dateTime", dateTime + windowMs)
        )
        .filter((q: any) => q.neq(q.field("status"), "cancelled"))
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
        userId: resolvedUserId,
        title: title,
        dateTime: dateTime,
        duration: args.duration || 60,
        estimatedCost: args.estimatedCost,
        location: args.location || "",
        status: dateTime < now ? "completed" : "upcoming",
        updatedAt: now,
      });

      // AUTO-NOTIFICATIONS: Schedule reminders and start alerts
      if (dateTime > now) {
        // 1. Reminder (30 mins before)
        const reminderTime = dateTime - (reminderMinutesBefore * 60 * 1000);
        await ctx.db.insert("notifications", {
          userId: resolvedUserId,
          relatedScheduleId: id,
          title: `Reminder: ${title}`,
          body: `Acara "${title}" akan mulai dalam ${reminderMinutesBefore} menit.`,
          scheduledAt: Math.max(now, reminderTime),
          sent: false,
        });

        // 2. Start Notification (exact time)
        await ctx.db.insert("notifications", {
          userId: resolvedUserId,
          relatedScheduleId: id,
          title: `Sekarang: ${title}`,
          body: `Waktunya "${title}"!${args.location ? ` Lokasi: ${args.location}` : ""}`,
          scheduledAt: dateTime,
          sent: false,
        });
      }

      return { success: true, scheduleId: id };
    } 
    
    if (args.action === "update") {
      if (!scheduleId) throw new Error("scheduleId is required for update");
      const existing = await ctx.db.get(scheduleId);
      if (!existing || existing.userId !== resolvedUserId) throw new Error("Unauthorized or not found");
      
      const newDateTime = args.dateTime !== undefined ? args.dateTime : existing.dateTime;
      const newTitle = args.title !== undefined ? args.title : existing.title;

      await ctx.db.patch(scheduleId, {
        ...(args.title !== undefined && { title: args.title }),
        ...(args.dateTime !== undefined && { dateTime: args.dateTime }),
        ...(args.duration !== undefined && { duration: args.duration }),
        ...(args.estimatedCost !== undefined && { estimatedCost: args.estimatedCost }),
        ...(args.location !== undefined && { location: args.location }),
        updatedAt: now,
      });

      // Sync notifications if time or title changed
      if (args.dateTime !== undefined || args.title !== undefined) {
        // Remove old unsent notifications
        const pending = await ctx.db
          .query("notifications")
          .withIndex("by_userId", (q: any) => q.eq("userId", resolvedUserId))
          .filter((q: any) => q.and(
            q.eq(q.field("relatedScheduleId"), scheduleId),
            q.eq(q.field("sent"), false)
          ))
          .collect();
        
        for (const p of pending) {
          await ctx.db.delete(p._id);
        }

        // Recreate notifications if new time is in the future
        if (newDateTime > now) {
          const reminderTime = newDateTime - (reminderMinutesBefore * 60 * 1000);
          await ctx.db.insert("notifications", {
            userId: resolvedUserId,
            relatedScheduleId: scheduleId,
            title: `Reminder: ${newTitle}`,
            body: `Acara "${newTitle}" akan mulai dalam ${reminderMinutesBefore} menit.`,
            scheduledAt: Math.max(now, reminderTime),
            sent: false,
          });

          await ctx.db.insert("notifications", {
            userId: resolvedUserId,
            relatedScheduleId: scheduleId,
            title: `Sekarang: ${newTitle}`,
            body: `Waktunya "${newTitle}"!`,
            scheduledAt: newDateTime,
            sent: false,
          });
        }
      }

      return { success: true, scheduleId: scheduleId };
    }
    
    if (args.action === "delete") {
      if (!scheduleId) throw new Error("scheduleId is required for delete");
      const existing = await ctx.db.get(scheduleId);
      if (!existing || existing.userId !== resolvedUserId) throw new Error("Unauthorized or not found");
      
      // SOFT-DELETE
      await ctx.db.patch(scheduleId, {
        status: "cancelled",
        updatedAt: now,
      });

      // Cancel pending notifications
      const pending = await ctx.db
        .query("notifications")
        .withIndex("by_userId", (q: any) => q.eq("userId", resolvedUserId))
        .filter((q: any) => q.and(
          q.eq(q.field("relatedScheduleId"), scheduleId),
          q.eq(q.field("sent"), false)
        ))
        .collect();
      
      for (const p of pending) {
        await ctx.db.delete(p._id);
      }

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
    const identity = await ctx.auth.getUserIdentity();
    let userId = args.userId;

    if (identity) {
      const user = await ctx.db
        .query("users")
        .withIndex("by_clerkId", (q: any) => q.eq("clerkId", identity.subject))
        .unique();
      if (!user) throw new Error("User not found");
      userId = user._id;
    }

    if (!userId) throw new Error("Unauthenticated");

    const relatedScheduleId = args.relatedScheduleId ? (ctx.db.normalizeId("schedules", args.relatedScheduleId) ?? undefined) : undefined;
    
    // Verify ownership of the related schedule if provided
    if (relatedScheduleId) {
      const schedule = await ctx.db.get(relatedScheduleId);
      if (!schedule || schedule.userId !== userId) throw new Error("Unauthorized related schedule");
    }

    const id = await ctx.db.insert("notifications", {
      userId: userId,
      title: args.title,
      body: args.body || "",
      scheduledAt: args.scheduledAt,
      relatedScheduleId: relatedScheduleId,
      sent: false,
    });
    return { success: true, notificationId: id };
  },
});
