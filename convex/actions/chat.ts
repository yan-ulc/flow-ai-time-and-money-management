"use node";
import { action } from "../_generated/server";
import { internal, api } from "../_generated/api";
import { v, ConvexError } from "convex/values";
import { callLLM } from "./llm";
import { buildSystemPrompt, buildToolDefinitions, buildTimeAnchors, requestConfirmationExecutor } from "../tools/index";

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
      (m: any) => m.role === "user" && (m._creationTime || 0) >= Date.now() - RATE_LIMIT.windowMs
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

    // Build context - Trim to last 10 messages to save tokens but keep tool history
    const CONTEXT_MAX = 10;
    const contextMessages: any[] = [];
    
    // Sort chronological: oldest first, newest last
    const sortedRecent = recentMessages.slice(0, CONTEXT_MAX).reverse();
    for (const m of sortedRecent) {
      if (m.role === "assistant" && m.toolCalls) {
        contextMessages.push({ 
          role: "assistant", 
          content: m.content || "",
          tool_calls: m.toolCalls
        });
      } else if (m.role === "tool") {
        contextMessages.push({
          role: "tool",
          tool_call_id: m.toolCallId,
          name: m.name,
          content: m.content || ""
        });
      } else {
        contextMessages.push({ 
          role: m.role, 
          content: m.content || "" 
        });
      }
    }
    
    contextMessages.push({ role: "user", content: cleanMessage });

    // Fetch Current State (Balance & Upcoming) to inject into System Prompt
    const currentState = await ctx.runQuery(internal.tools.financeTools.getLifeStatusData, {
      userId: user._id,
      rangeDays: 7
    });

    const timeZone = args.deviceTimezone || user.settings.timezone || "Asia/Jakarta";
    
    // Build AUTHORITATIVE time anchors (v6 logic)
    const timeAnchors = buildTimeAnchors();
    const toolDefinitions = buildToolDefinitions(timeAnchors);

    const stateBlock = `
## CURRENT USER STATE (PRE-FETCHED)
- Total Spent (Actual): IDR ${currentState.totalSpent.toLocaleString()}
- Total Income (Actual): IDR ${currentState.totalIncome.toLocaleString()}
- Upcoming/Planned Costs: IDR ${currentState.upcomingCosts.toLocaleString()}
- Upcoming Schedules Count: ${currentState.upcomingSchedulesCount}
- Net Balance (Actual): IDR ${(currentState.totalIncome - currentState.totalSpent).toLocaleString()}
`.trim();

    const systemPrompt = [
      buildSystemPrompt(user.settings, user.name, timeAnchors),
      stateBlock,
    ].join("\n\n");

    // Call LLM
    let response;
    try {
      response = await callLLM({
        messages: contextMessages,
        tools: toolDefinitions,
        systemPrompt,
      });
    } catch (e: any) {
      throw new ConvexError({ code: "AI_ERROR", message: "Failed to call AI", details: e.message });
    }

    let choice = response.choices[0];
    let toolCalls = choice.message.tool_calls || [];
    
    // STRICT MODE VALIDATION
    // If LLM says "Done" or acknowledges intent but calls NO tools, and the message looks transactional
    const transactionalKeywords = [
      "makan", "beli", "bayar", "income", "pengeluaran", "jadwal", "futsal", "besok", "jam", "pukul", "rp", "idr", "gaji", "income", "spent", "spending", "budget", "reminder", "ingetin",
      "hapus", "delete", "cancel", "batal", "ubah", "ganti", "edit", "update", "set", "baru", "bikin", "buat", "record", "catat", "tambah"
    ];
    const hasTransactionalIntent = transactionalKeywords.some(k => cleanMessage.toLowerCase().includes(k));
    
    if (hasTransactionalIntent && toolCalls.length === 0) {
      // Retry logic or Force error to prevent hallucination
      console.warn("LLM missed tool call for transactional intent. Retrying with harder prompt...");
      response = await callLLM({
        messages: [
          ...contextMessages,
          { role: "assistant", content: choice.message.content || "I am processing your request." },
          { role: "user", content: "CRITICAL: You failed to call a tool. If the user wants to record, change, or delete something, you MUST call a tool (manage_finance, manage_schedule, or request_confirmation). Do NOT respond with text only." }
        ],
        tools: toolDefinitions,
        systemPrompt: systemPrompt + "\n\nCRITICAL: TOOL CALL REQUIRED. DO NOT REPLY WITH TEXT. Use the pre-computed timestamps from the tables."
      });
      const retryChoice = response.choices[0];
      if (!retryChoice.message.tool_calls || retryChoice.message.tool_calls.length === 0) {
        throw new ConvexError({ code: "TOOL_CALL_FAILED", message: "AI failed to trigger tool. Please try again with clearer details." });
      }
      // Update choice to the retry result
      choice = retryChoice;
    }

    const updatedToolCalls = choice.message.tool_calls || [];
    const createdScheduleIds: string[] = [];
    
    const { results, toolsUsed: collectedToolsUsed } = await (async () => {
      const resultMap: Record<number, any> = {};
      const usedTools: string[] = [];
      const numericFields = ["amount", "dateTime", "rangeDays", "duration", "estimatedCost", "scheduledAt", "dateTime_utc_ms", "dateTime_utc_ms_finance", "date_utc_ms"];
      
      // PHASE 1 CHECK: If request_confirmation is called, it MUST be the only tool execution that matters this turn.
      const confirmationCallIndex = updatedToolCalls.findIndex((tc: any) => tc.function.name === "request_confirmation");
      
      if (confirmationCallIndex !== -1) {
        const tc = updatedToolCalls[confirmationCallIndex];
        const rawArgsConf = JSON.parse(tc.function.arguments);
        const fnArgsConf = { ...rawArgsConf } as Record<string, any>;
        for (const field of numericFields) {
          if (fnArgsConf[field] !== undefined && fnArgsConf[field] !== null) {
            fnArgsConf[field] = Number(fnArgsConf[field]);
          }
        }
        
        resultMap[confirmationCallIndex] = requestConfirmationExecutor(fnArgsConf);
        usedTools.push(tc.function.name);
        
        // Return only this result (Section 4: "STOP. Do NOT call any other tool.")
        return {
          results: updatedToolCalls.map((_: any, i: number) => i === confirmationCallIndex ? resultMap[i] : { status: "skipped" }),
          toolsUsed: usedTools
        };
      }

      // PHASE 2 / READ-ONLY: Execute tools
      // Pass 1: run manage_schedule first to get IDs for chaining if needed
      for (let i = 0; i < updatedToolCalls.length; i++) {
        const tc = updatedToolCalls[i];
        if (tc.function.name !== "manage_schedule") continue;
        
        const rawArgsSched = JSON.parse(tc.function.arguments);
        const fnArgsSched = { ...rawArgsSched } as Record<string, any>;
        for (const field of numericFields) {
          if (fnArgsSched[field] !== undefined && fnArgsSched[field] !== null) {
            fnArgsSched[field] = Number(fnArgsSched[field]);
          }
        }

        try {
          const result = await ctx.runMutation(internal.tools.scheduleTools.manageSchedule, {
            userId: user._id, ...fnArgsSched
          } as any);
          resultMap[i] = result;
          if (fnArgsSched.action === "create") {
            const id = result?.scheduleId;
            if (id) createdScheduleIds.push(id);
          }
        } catch (err: any) {
          resultMap[i] = { error: err.message };
        }
        usedTools.push(tc.function.name);
      }
      
      // Pass 2: run all other tools
      for (let i = 0; i < updatedToolCalls.length; i++) {
        if (resultMap[i] !== undefined) continue;
        const tc = updatedToolCalls[i];
        const rawArgsOther = JSON.parse(tc.function.arguments);
        const fnArgsOther = { ...rawArgsOther } as Record<string, any>;
        for (const field of numericFields) {
          if (fnArgsOther[field] !== undefined && fnArgsOther[field] !== null) {
            fnArgsOther[field] = Number(fnArgsOther[field]);
          }
        }
        
        try {
          switch (tc.function.name) {
            case "manage_finance": {
              const linkedId = createdScheduleIds[0];
              resultMap[i] = await ctx.runMutation(internal.tools.financeTools.manageFinance, {
                userId: user._id,
                ...fnArgsOther,
                ...(linkedId ? { relatedScheduleId: linkedId as any } : {}),
              } as any);
              break;
            }
            case "check_affordability":
              resultMap[i] = await ctx.runQuery(internal.tools.financeTools.checkAffordabilityData, {
                userId: user._id, ...fnArgsOther
              } as any);
              break;
            case "get_life_status":
              resultMap[i] = await ctx.runQuery(internal.tools.financeTools.getLifeStatusData, {
                userId: user._id, ...fnArgsOther
              } as any);
              break;
            case "set_reminder": {
              const linkedScheduleId = createdScheduleIds[0];
              resultMap[i] = await ctx.runMutation(internal.tools.scheduleTools.setReminder, {
                userId: user._id,
                ...fnArgsOther,
                ...(linkedScheduleId ? { relatedScheduleId: linkedScheduleId as any } : {}),
              } as any);
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
        results: updatedToolCalls.map((_: any, i: number) => resultMap[i]),
        toolsUsed: usedTools,
      };
    })();

    // SAVE ASSISTANT MESSAGE WITH TOOL CALLS (Only if it has content)
    if (choice.message.content) {
      await ctx.runMutation(api.messages.insertMessage, {
        userId: user._id,
        role: "assistant",
        content: choice.message.content,
        toolCalls: updatedToolCalls,
        toolsUsed: collectedToolsUsed,
      });
    }

    // SAVE TOOL RESULTS AS INDIVIDUAL MESSAGES (Hidden from UI, used for LLM context)
    for (let i = 0; i < updatedToolCalls.length; i++) {
      await ctx.runMutation(api.messages.insertMessage, {
        userId: user._id,
        role: "tool",
        content: JSON.stringify(results[i]),
        toolCallId: updatedToolCalls[i].id,
        name: updatedToolCalls[i].function.name,
      });
    }

    // 2nd LLM call with tool results
    if (updatedToolCalls.length > 0) {
      contextMessages.push({
        role: "assistant",
        content: choice.message.content || "",
        tool_calls: updatedToolCalls,
      } as any);

      updatedToolCalls.forEach((tc: any, idx: number) => {
        contextMessages.push({
          role: "tool",
          tool_call_id: tc.id,
          name: tc.function.name,
          content: JSON.stringify(results[idx]),
        } as any);
      });

      const finalResponse = await callLLM({
        messages: contextMessages,
        tools: toolDefinitions,
        systemPrompt: systemPrompt + "\n\nCRITICAL: Check the tool results carefully. If the tool result contains an error or does NOT return an ID (e.g., scheduleId, financeId), you MUST reply with 'Gagal menyimpan ke database' and explain why. NEVER say 'Tersimpan' or 'Done' if it failed. Respond using natural language. Never output raw JSON.",
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
    return { reply, toolsUsed: collectedToolsUsed };
  },
});
