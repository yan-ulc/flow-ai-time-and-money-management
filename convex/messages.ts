import { query, mutation } from "./_generated/server";
import { v } from "convex/values";

export const getMessages = query({
  args: { userId: v.id("users") },
  handler: async (ctx, args) => {
    // UI only needs user and assistant messages
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("asc")
      .collect();
    
    return messages.filter(m => m.role !== "tool");
  },
});

export const getRecentMessages = query({
  args: { userId: v.id("users"), limit: v.number() },
  handler: async (ctx, args) => {
    // Sliding window for LLM context
    const messages = await ctx.db
      .query("messages")
      .withIndex("by_userId", (q) => q.eq("userId", args.userId))
      .order("desc")
      .take(args.limit);
      
    return messages;
  },
});

export const insertMessage = mutation({
  args: {
    userId: v.id("users"),
    role: v.union(v.literal("user"), v.literal("assistant"), v.literal("tool")),
    content: v.string(),
    toolCalls: v.optional(v.array(v.any())),
    toolCallId: v.optional(v.string()),
    name: v.optional(v.string()),
    toolsUsed: v.optional(v.array(v.string())),
    toolResults: v.optional(v.array(v.any())),
  },
  handler: async (ctx, args) => {
    return await ctx.db.insert("messages", {
      userId: args.userId,
      role: args.role,
      content: args.content,
      toolCalls: args.toolCalls,
      toolCallId: args.toolCallId,
      name: args.name,
      toolsUsed: args.toolsUsed,
      toolResults: args.toolResults,
    });
  },
});
