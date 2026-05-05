"use node";
import { action } from "../_generated/server";
import { internal, api } from "../_generated/api";
import { v, ConvexError } from "convex/values";
import { callLLM } from "./llm";
import { buildSystemPrompt, TOOL_DEFINITIONS } from "../tools/index";

const RATE_LIMIT = {
  windowMs: 60_000,
  maxRequests: 20,
};

function sanitizeInput(input: string): string {
  return input
    .replace(/[<>]/g, '')
    .substring(0, 1000)
    .trim();
}

export const processChat = action({
  args: {
    message: v.string(),
    deviceTimezone: v.optional(v.string()),
    clerkId: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let identity = await ctx.auth.getUserIdentity();
    const subject = identity?.subject || args.clerkId;
    
    if (!subject) {
      throw new ConvexError({ code: "UNAUTHORIZED", message: "Not authenticated" });
    }

    const user = await ctx.runQuery(api.users.getUserByClerkId, {
      clerkId: subject,
    });
    if (!user) {
      throw new ConvexError({ code: "UNAUTHORIZED", message: "User not found in db" });
    }

    // Rate Limiting
    const recentMessages = await ctx.runQuery(api.messages.getRecentMessages, {
      userId: user._id,
      limit: 50, // Get last 50 to filter by time
    });
    const recentCount = recentMessages.filter(
      (m: any) => m.role === "user" && m.createdAt >= Date.now() - RATE_LIMIT.windowMs
    ).length;

    if (recentCount >= RATE_LIMIT.maxRequests) {
      throw new ConvexError({ code: "RATE_LIMIT", message: "Santai dulu 1 menit ya" });
    }

    const cleanMessage = sanitizeInput(args.message);
    
    // Store user message immediately via mutation
    await ctx.runMutation(api.messages.insertMessage, {
      userId: user._id,
      role: "user",
      content: cleanMessage,
    });

    // Build context
    const CONTEXT_MAX = 20;
    const contextMessages = recentMessages.slice(0, CONTEXT_MAX).reverse().map((m: any) => ({
      role: m.role,
      content: m.content,
    }));
    contextMessages.push({ role: "user", content: cleanMessage });

    const currentDateTime = new Date().toLocaleString("en-US", {
      timeZone: args.deviceTimezone || user.settings.timezone || "Asia/Jakarta",
    });
    const systemPrompt = buildSystemPrompt(user.settings, currentDateTime, user.name);

    // Call LLM
    let response;
    try {
      response = await callLLM({
        messages: contextMessages,
        tools: TOOL_DEFINITIONS,
        systemPrompt,
      });
    } catch (e: any) {
      throw new ConvexError({ code: "AI_ERROR", message: "Failed to call AI", details: e.message });
    }

    const choice = response.choices[0];
    const toolCalls = choice.message.tool_calls || [];
    let toolsUsed: string[] = [];

    // Execute tools sequentially: manage_schedule first to get real IDs, then the rest
    const createdScheduleIds: string[] = [];
    
    const { results, toolsUsed: collectedToolsUsed } = await (async () => {
      const resultMap: Record<number, any> = {};
      const usedTools: string[] = [];
      
      // Pass 1: run manage_schedule first to get real Convex IDs
      for (let i = 0; i < toolCalls.length; i++) {
        const tc = toolCalls[i];
        if (tc.function.name !== "manage_schedule") continue;
        
        const fnArgs = JSON.parse(tc.function.arguments);
        try {
          const result = await ctx.runMutation(internal.tools.scheduleTools.manageSchedule, {
            userId: user._id, ...fnArgs
          });
          resultMap[i] = result;
          if (fnArgs.action === "create" && typeof result === "string") {
            createdScheduleIds.push(result);
          }
        } catch (err: any) {
          resultMap[i] = { error: err.message };
        }
        usedTools.push(tc.function.name);
      }
      
      // Pass 2: run all other tools
      for (let i = 0; i < toolCalls.length; i++) {
        if (resultMap[i] !== undefined) continue;
        const tc = toolCalls[i];
        const fnArgs = JSON.parse(tc.function.arguments);
        
        try {
          switch (tc.function.name) {
            case "manage_finance": {
              const { relatedScheduleId: _ignored, ...safeArgs } = fnArgs;
              const linkedId = createdScheduleIds[0];
              resultMap[i] = await ctx.runMutation(internal.tools.financeTools.manageFinance, {
                userId: user._id,
                ...safeArgs,
                ...(linkedId ? { relatedScheduleId: linkedId as any } : {}),
              });
              break;
            }
            case "check_affordability":
              resultMap[i] = await ctx.runQuery(internal.tools.financeTools.checkAffordabilityData, {
                userId: user._id, ...fnArgs
              });
              break;
            case "get_life_status":
              resultMap[i] = await ctx.runQuery(internal.tools.financeTools.getLifeStatusData, {
                userId: user._id, ...fnArgs
              });
              break;
            case "set_reminder": {
              const { relatedScheduleId: _ignored2, ...reminderArgs } = fnArgs;
              const linkedScheduleId = createdScheduleIds[0];
              resultMap[i] = await ctx.runMutation(internal.tools.scheduleTools.setReminder, {
                userId: user._id,
                ...reminderArgs,
                ...(linkedScheduleId ? { relatedScheduleId: linkedScheduleId as any } : {}),
              });
              break;
            }
            default:
              resultMap[i] = { error: "Unknown tool" };
          }
        } catch (err: any) {
          resultMap[i] = { error: err.message };
        }
        usedTools.push(tc.function.name);
      }
      
      return {
        results: toolCalls.map((_: any, i: number) => resultMap[i]),
        toolsUsed: usedTools,
      };
    })();

    // 2nd LLM call with tool results (only if tools were actually called)
    if (toolCalls.length > 0) {
      contextMessages.push({
        role: "assistant",
        content: choice.message.content || "",
        tool_calls: toolCalls,
      } as any);

      toolCalls.forEach((tc: any, idx: number) => {
        contextMessages.push({
          role: "tool",
          tool_call_id: tc.id,
          name: tc.function.name,
          content: JSON.stringify(results[idx]),
        } as any);
      });

      const finalResponse = await callLLM({
        messages: contextMessages,
        tools: TOOL_DEFINITIONS,
        systemPrompt,
      });

      const reply = finalResponse.choices[0].message.content || "";
      
      await ctx.runMutation(api.messages.insertMessage, {
        userId: user._id,
        role: "assistant",
        content: reply,
        toolsUsed: collectedToolsUsed,
        toolResults: results,
      });

      return { reply, toolsUsed: collectedToolsUsed };
    }

    const reply = choice.message.content || "";
    await ctx.runMutation(api.messages.insertMessage, {
      userId: user._id,
      role: "assistant",
      content: reply,
      toolsUsed: collectedToolsUsed,
    });

    return { reply, toolsUsed: collectedToolsUsed };
  },
});
