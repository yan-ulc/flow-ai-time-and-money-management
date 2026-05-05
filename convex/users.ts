import { query, internalMutation, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getUserByClerkId = query({
  args: { clerkId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();
  },
});

export const createUser = internalMutation({
  args: {
    clerkId: v.string(),
    name: v.string(),
    email: v.string(),
  },
  handler: async (ctx, args) => {
    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", args.clerkId))
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: args.clerkId,
      name: args.name,
      email: args.email,
      createdAt: Date.now(),
      settings: {
        currency: "IDR",
        tone: "neutral",
        timezone: "Asia/Jakarta",
        reminderMinutesBefore: 30,
      },
    });
  },
});

export const syncUser = mutation({
  args: {
    clerkId: v.optional(v.string()),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let identity = await ctx.auth.getUserIdentity();
    
    const subject = identity?.subject || args.clerkId;
    if (!subject) {
      throw new Error("Called syncUser without authentication or clerkId present");
    }

    const existing = await ctx.db
      .query("users")
      .withIndex("by_clerkId", (q) => q.eq("clerkId", subject))
      .unique();

    if (existing) {
      return existing._id;
    }

    return await ctx.db.insert("users", {
      clerkId: subject,
      name: identity?.name || args.name || "User",
      email: identity?.email || args.email || "",
      createdAt: Date.now(),
      settings: {
        currency: "IDR",
        tone: "neutral",
        timezone: "Asia/Jakarta",
        reminderMinutesBefore: 30,
      },
    });
  },
});

export const getUserSettings = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    const user = await ctx.db.get(args.userId);
    if (!user) throw new Error("User not found");
    return user.settings;
  },
});
