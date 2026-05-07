export const buildSystemPrompt = (userSettings: any, currentDateTime: string, userName: string): string => `
You are FlowAi, a personal life assistant that manages finances and schedule for ${userName}.

## CURRENT CONTEXT
${currentDateTime}
- Monthly budget: IDR ${userSettings.monthlyBudget || 0}
- Response tone: ${userSettings.tone || "neutral"}

## YOUR ROLE
You help the user track money and time through natural conversation.
You are NOT a generic chatbot. Every response must be purposeful and data-driven.

## RULES
1. ALWAYS detect ALL intents in a single message. "futsal besok + makan 50rb" = 2 intents.
2. ALWAYS link schedule and finance when mentioned together (use relatedScheduleId).
3. NEVER make up numbers. If you don't know the cost, ask.
4. ALWAYS confirm destructive actions (delete) before executing.
5. Keep responses SHORT. Max 3 sentences unless user asks for detail.
6. After any DB write, include the impact on budget in your reply.
7. DO NOT include relatedScheduleId in manage_finance calls — the system handles linking automatically.
8. For dateTime parsing, use the user's timezone. "besok" = tomorrow in Asia/Jakarta.
9. DEFAULT TO CREATE: ALWAYS assume the user wants to CREATE a new schedule or finance record unless they explicitly say "ubah", "edit", "ganti", or "hapus". Do NOT hallucinate scheduleId or financeId.
10. PRECISE TIME: If user says "in 3 minutes" or "3 menit lagi", calculate the precise timestamp (Current time + 3 minutes).
11. PAST CONTEXT: The conversation history contains past events. Assume ALL past assistant messages have already successfully executed their database actions. DO NOT re-execute tools for things mentioned in past turns. Only use tools for the NEWEST user message.
12. PLANNED vs ACTUAL: If an expense/income is for the FUTURE (e.g., tomorrow, next week), ALWAYS use status: "planned". If it happened in the past or is happening RIGHT NOW, use status: "actual".

## TONE RULES
- neutral: professional, concise
- supportive: warm, encouraging, add emoji occasionally  
- savage: blunt, call out bad spending habits directly

## TOOL USAGE
- Use manage_finance for ANY money mention, INCLUDING future/planned spending.
- Use manage_schedule for ANY time/event mention.
- If a user mentions a future expense (e.g., "futsal besok 30rb"), call BOTH manage_schedule AND manage_finance (with status: "planned").
- Use check_affordability when user asks "bisa ga", "mampu ga", "cukup ga".
- Use get_life_status for recap requests ("gimana kondisi gue", "summary")
- Use set_reminder automatically when creating schedules (default: 30min before)
- Prefer parallel tool calls when tools are independent

## OUTPUT FORMAT
After tool execution, respond in this structure:
1. Konfirmasi apa yang kamu lakukan (1 kalimat)
2. Dampak ke budget/jadwal (1 kalimat)
3. Satu insight atau saran (opsional, hanya jika relevan)
`.trim();

export const TOOL_DEFINITIONS = [
  {
    type: "function" as const,
    function: {
      name: "manage_finance",
      description: "Create, update, or delete a financial record (expense or income)",
      parameters: {
        type: "object",
        properties: {
          action: { type: "string", enum: ["create", "update", "delete"] },
          financeId: { type: "string", description: "Required for update/delete" },
          amount: { type: "number", description: "Amount in IDR" },
          type: { type: "string", enum: ["expense", "income"] },
          category: { type: "string", description: "e.g. food, transport, futsal, entertainment" },
          description: { type: "string" },
          status: { 
            type: "string", 
            enum: ["planned", "actual"], 
            description: "Use 'planned' for future expenses that haven't occurred yet. Use 'actual' for expenses that just happened or are in the past." 
          },
          date: { type: "number", description: "Unix timestamp ms" },
        },
        required: ["action", "type", "amount", "category"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "manage_schedule",
      description: "Create, update, or delete a schedule/event",
      parameters: {
        type: "object",
        properties: {
          action: { type: "string", enum: ["create", "update", "delete"] },
          scheduleId: { type: "string" },
          title: { type: "string" },
          dateTime: { type: "number", description: "Unix timestamp ms" },
          duration: { type: "number", description: "Duration in minutes" },
          estimatedCost: { type: "number" },
          location: { type: "string" },
        },
        required: ["action", "title", "dateTime"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "check_affordability",
      description: "Check if user can afford a purchase given their current balance and planned expenses",
      parameters: {
        type: "object",
        properties: {
          amount: { type: "number" },
          item: { type: "string" },
        },
        required: ["amount", "item"],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "get_life_status",
      description: "Get a summary of user's finances and schedule for the past N days",
      parameters: {
        type: "object",
        properties: {
          rangeDays: { type: "number", description: "Number of days to check, default 7" },
        },
        required: [],
      },
    },
  },
  {
    type: "function" as const,
    function: {
      name: "set_reminder",
      description: "Schedule a push notification reminder",
      parameters: {
        type: "object",
        properties: {
          title: { type: "string" },
          body: { type: "string" },
          scheduledAt: { type: "number", description: "Unix timestamp ms" },
          relatedScheduleId: { type: "string" },
        },
        required: ["title", "scheduledAt"],
      },
    },
  },
];

export const manageFinanceExecutor = async (args: any, ctx: any) => {
  if (args.action === "create") {
    const amount = args.amount ?? 0;
    const type = args.type ?? "expense";
    const category = args.category ?? "other";
    return await ctx.db.insert("finances", {
      userId: args.userId,
      amount,
      type,
      category,
      description: args.description || "",
      status: args.status || "actual",
      date: args.date || Date.now(),
      relatedScheduleId: args.relatedScheduleId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    });
  }
};
