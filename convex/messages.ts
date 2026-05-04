import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getMessages = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // Basic query for chat history UI (can be paginated later)
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", args.userId))
      .order("asc")
      .collect();
    
    return messages;
  },
});

export const getRecentMessages = query({
  args: { userId: v.id("users"), limit: v.number() },
  handler: async (ctx, args) => {
    // Sliding window for LLM context
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_userId_createdAt", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit);
      
    return messages;
  },
});

export const insertMessage = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant")),
    content: v.string(),
    toolsUsed: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      userId: args.userId,
      role: args.role,
      content: args.content,
      toolsUsed: args.toolsUsed,
      createdAt: Date.now(),
    });
  },
});
