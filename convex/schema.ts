import { defineSchema, defineTable } from "convex/server";
import { v } from "convex/values";

export default defineSchema({

  // ─── USERS ───────────────────────────────────────────────
  users: defineTable({
    clerkId: v.string(),             // Unique Clerk user ID
    name: v.string(),
    email: v.string(),
    settings: v.object({
      monthlyBudget: v.optional(v.number()),   // In IDR (rupiah)
      currency: v.string(),          // Default "IDR"
      tone: v.union(
        v.literal("neutral"),
        v.literal("supportive"),
        v.literal("savage")
      ),
      timezone: v.string(),          // e.g. "Asia/Jakarta"
      reminderMinutesBefore: v.number(), // Default 30
    }),
  })
  .index("by_clerkId", ["clerkId"])
  .index("by_email", ["email"]),

  // ─── MESSAGES ────────────────────────────────────────────
    messages: defineTable({
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("tool")),
    content: v.string(),
    toolCalls: v.optional(v.array(v.any())),     // Raw tool call objects from LLM
    toolCallId: v.optional(v.string()),         // For role: "tool" messages
    name: v.optional(v.string()),               // For role: "tool" messages
    toolsUsed: v.optional(v.array(v.string())),  // ["manage_finance", "manage_schedule"]
    toolResults: v.optional(v.array(v.any())),   // parallel results array
    metadata: v.optional(v.object({
      tokensUsed: v.optional(v.number()),
      model: v.optional(v.string()),
      latencyMs: v.optional(v.number()),
    })),
  })
  .index("by_userId", ["userId"]),

  // ─── FINANCES ────────────────────────────────────────────
  finances: defineTable({
    userId: v.id("users"),
    amount: v.number(),              // Always positive; type field determines direction
    type: v.union(v.literal("expense"), v.literal("income")),
    category: v.string(),            // "food", "transport", "entertainment", etc.
    description: v.string(),
    status: v.union(
      v.literal("planned"),          // Future, belum terjadi
      v.literal("actual"),           // Sudah terjadi
      v.literal("cancelled")         // Soft-delete
    ),
    relatedScheduleId: v.optional(v.id("schedules")),  // Link ke schedule
    dateTime: v.number(),            // Target date (Unix ms) — renamed for consistency
    updatedAt: v.number(),
  })
  .index("by_userId", ["userId"])
  .index("by_userId_dateTime", ["userId", "dateTime"])
  .index("by_userId_status", ["userId", "status"])
  .index("by_userId_category", ["userId", "category"]),

  // ─── SCHEDULES ───────────────────────────────────────────
  schedules: defineTable({
    userId: v.id("users"),
    title: v.string(),
    dateTime: v.number(),            // Unix ms, start time
    duration: v.number(),            // Duration in minutes, default 60
    estimatedCost: v.optional(v.number()),
    location: v.optional(v.string()),
    status: v.union(
      v.literal("upcoming"),
      v.literal("done"),
      v.literal("cancelled")
    ),
    updatedAt: v.number(),
  })
  .index("by_userId", ["userId"])
  .index("by_userId_dateTime", ["userId", "dateTime"])
  .index("by_userId_status", ["userId", "status"]),

  // ─── NOTIFICATIONS ───────────────────────────────────────
  notifications: defineTable({
    userId: v.id("users"),
    relatedScheduleId: v.optional(v.id("schedules")),
    title: v.string(),
    body: v.string(),
    scheduledAt: v.number(),         // When to send (Unix ms)
    sentAt: v.optional(v.number()), // Null until sent
    sent: v.boolean(),
  })
  .index("by_userId", ["userId"])
  .index("by_sent_scheduledAt", ["sent", "scheduledAt"]),

  // ─── PUSH SUBSCRIPTIONS ──────────────────────────────────
  push_subscriptions: defineTable({
    userId: v.id("users"),
    endpoint: v.string(),
    keys: v.object({
      p256dh: v.string(),
      auth: v.string(),
    }),
    deviceInfo: v.optional(v.string()),  // Browser/OS info
  })
  .index("by_userId", ["userId"])
  .index("by_endpoint", ["endpoint"]),

});
