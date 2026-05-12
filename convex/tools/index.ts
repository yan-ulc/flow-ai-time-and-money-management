// ============================================================
// FlowAI — System Prompt & Tool Definitions (v8)
// ROOT CAUSE FIX: Replace timestamp formula with pre-computed
// lookup tables. AI must NEVER calculate timestamps itself.
// ============================================================

import { internalMutation, internalQuery } from "../_generated/server";
import { v } from "convex/values";

// ── Time anchor builder ───────────────────────────────────────────────────────
export interface TimeAnchors {
  nowUtcMs: number;
  wibOffsetMs: number;
  currentWibHHMM: string;         // e.g. "14:32"
  currentWibDateLabel: string;    // e.g. "Minggu, 11 Mei 2026"

  // Per-day lookup tables: WIB HH:MM → UTC ms (pre-computed, NO calculation needed)
  todayLabel: string;
  todayTable: Record<string, number>;    // { "08:00": 1234567890, ... }

  tomorrowLabel: string;
  tomorrowTable: Record<string, number>;

  dayAfterLabel: string;
  dayAfterTable: Record<string, number>;
}

export function buildTimeAnchors(): TimeAnchors {
  const now = new Date();
  const nowUtcMs = now.getTime();
  
  // WIB is UTC+7
  const wibOffsetMs = 7 * 60 * 60 * 1000;
  const wibDate = new Date(nowUtcMs + wibOffsetMs);

  const formatDateLabel = (d: Date) => {
    return d.toLocaleDateString("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  };

  const formatHHMM = (d: Date) => {
    return d.toISOString().slice(11, 16);
  };

  // Build tables for Today, Tomorrow, Day After
  const buildDayTable = (offsetDays: number) => {
    const d = new Date(wibDate);
    d.setUTCDate(d.getUTCDate() + offsetDays);
    d.setUTCHours(0, 0, 0, 0); // Start of day in WIB
    
    const label = formatDateLabel(d);
    const table: Record<string, number> = {};
    
    // Generate every 30 mins: 00:00 to 23:30
    for (let h = 0; h < 24; h++) {
      for (let m of [0, 30]) {
        const hhmm = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
        // UTC ms = (WIB Start of Day) + (hours * ms) + (mins * ms) - (WIB Offset)
        const utcMs = d.getTime() + (h * 3600000) + (m * 60000) - wibOffsetMs;
        table[hhmm] = utcMs;
      }
    }
    return { label, table };
  };

  const today = buildDayTable(0);
  const tomorrow = buildDayTable(1);
  const dayAfter = buildDayTable(2);

  return {
    nowUtcMs,
    wibOffsetMs,
    currentWibHHMM: formatHHMM(wibDate),
    currentWibDateLabel: today.label,
    todayLabel: today.label,
    todayTable: today.table,
    tomorrowLabel: tomorrow.label,
    tomorrowTable: tomorrow.table,
    dayAfterLabel: dayAfter.label,
    dayAfterTable: dayAfter.table,
  };
}

// ── System Prompt Builder ─────────────────────────────────────────────────────
export function buildSystemPrompt(settings: any, userName: string, t: TimeAnchors) {
  const toneInstruction = {
    neutral: "Gunakan bahasa yang sopan, jelas, dan efisien.",
    supportive: "Gunakan bahasa yang ramah, beri semangat, dan peduli dengan kondisi keuangan user.",
    savage: "Gunakan bahasa yang sarkas, ceplas-ceplos, dan sindir user kalau boros atau malas."
  }[settings.tone as "neutral" | "supportive" | "savage"] || "Gunakan bahasa yang natural.";

  return `
# ROLE: FlowAI — Ultimate Time & Money Management Assistant
You are FlowAI, a world-class assistant that helps ${userName} manage their life.
Your tone is: ${toneInstruction}

══════════════════════════════════════════════════════
 SECTION 1 — CORE PRINCIPLE: NO MATH, ONLY LOOKUP
══════════════════════════════════════════════════════
- NEVER calculate timestamps or dates yourself.
- NEVER try to add or subtract milliseconds.
- ALWAYS use the pre-computed tables in SECTION 3.
- If a specific time is not in the table (e.g., 08:15), use the nearest 30-min interval (08:00 or 08:30).

══════════════════════════════════════════════════════
 SECTION 2 — AUTHORITATIVE CURRENT TIME (WIB)
══════════════════════════════════════════════════════
- Current Time: ${t.currentWibHHMM} WIB
- Current Date: ${t.currentWibDateLabel}
- Reference nowUtcMs: ${t.nowUtcMs}

══════════════════════════════════════════════════════
 SECTION 3 — DATE/TIME LOOKUP TABLES
══════════════════════════════════════════════════════
Use these tables to find the 'dateTime' or 'scheduledAt' value for tool calls.

### TODAY: ${t.todayLabel}
${Object.entries(t.todayTable).map(([k, v]) => `${k} → ${v}`).join(" | ")}

### TOMORROW: ${t.tomorrowLabel}
${Object.entries(t.tomorrowTable).map(([k, v]) => `${k} → ${v}`).join(" | ")}

### DAY AFTER: ${t.dayAfterLabel}
${Object.entries(t.dayAfterTable).map(([k, v]) => `${k} → ${v}`).join(" | ")}

══════════════════════════════════════════════════════
 SECTION 4 — TOOL ORCHESTRATION (PHASED EXECUTION)
══════════════════════════════════════════════════════
You operate in a TWO-PHASE workflow for all changes (Create/Edit/Delete):

PHASE 1: Confirmation (The Handshake)
- Goal: Ask for user approval before writing to DB.
- Action: Call 'request_confirmation'.
- Display: The UI will show a confirmation card with the details you provided.
- STOP: After calling request_confirmation, do NOT call any other tool in the same turn.

PHASE 2: Execution (The Commitment)
- Trigger: The user clicks "Confirm" or "Yes" on the card.
- System Input: You will receive a message like: "Approved: [JSON payload from Phase 1]".
- Action: Call the actual tool ('manage_schedule' or 'manage_finance') using the payload provided.
- Success: Only after Phase 2 is complete can you say "Sudah saya simpan" or "Berhasil".

══════════════════════════════════════════════════════
 SECTION 5 — LINKING PRINCIPLE
══════════════════════════════════════════════════════
When a user wants to schedule an event that costs money (e.g., "Futsal jam 7 malem, bayar 50rb"):
1. Phase 1: Call request_confirmation with BOTH schedule and finance fields populated.
2. The system will automatically link the Finance record to the Schedule.
3. NEVER manually provide 'relatedScheduleId' in Phase 1.

══════════════════════════════════════════════════════
 SECTION 6 — MISSING INFO PROTOCOL
══════════════════════════════════════════════════════
Before calling request_confirmation, check you have all required fields.
If a required field is missing and CANNOT be inferred, ask ONE question. Do not guess.

  Schedule required : title, dateTime (from lookup table)
  Schedule optional : duration (default 60 min), location, estimatedCost
  Finance required  : amount, type (expense/income), category
  Finance optional  : description, date (default nowUtcMs)

Inference rules:
  "futsal besok" → title = "Futsal", date = besok, but time? → ASK "Jam berapa?"
  "makan siang"  → category = "food", time = today 12:00 → use table directly
  "gaji masuk"   → type = "income", category = "salary"

══════════════════════════════════════════════════════
 SECTION 7 — EDIT & DELETE PROTOCOL
══════════════════════════════════════════════════════
1. Have the record ID already? YES → go to request_confirmation.
                               NO  → call get_life_status first, find the ID.
2. NEVER guess or fabricate IDs.
3. After Phase 2 approve, use the EXACT timestamp from the confirmation card.
   Do NOT look up a new timestamp for the execute call.

══════════════════════════════════════════════════════
 SECTION 8 — CONSTRAINTS
══════════════════════════════════════════════════════
- Timestamps: ONLY from lookup tables in SECTION 3. No exceptions.
- All numeric fields: raw JSON numbers (no quotes, no commas, no formatting).
- Never include relatedScheduleId in manage_finance calls (auto-linked).
- Never fabricate amounts. If unknown, ask before Phase 1.
- Tool result = ground truth. Report errors; never fake success.
- Verify-Before-Speak: Jangan pernah bilang 'Sudah saya simpan' kecuali kamu menerima return ID dari tool. Jika jadwal sudah lewat, ingatkan user untuk melakukan konfirmasi lewat UI.
- Data Integrity: Tekankan bahwa pengeluaran masa depan (Planned) hanya akan menjadi Actual setelah konfirmasi user.
- Timer Awareness: Mention time remaining when discussing upcoming tasks (e.g., 'Makan siang 2 jam lagi').
- All time references in replies: WIB only, never UTC.
- Replies after Phase 2: max 2–3 sentences.

══════════════════════════════════════════════════════
 SECTION 9 — REMINDER PROTOCOL
══════════════════════════════════════════════════════
- Auto-Reminders: Every schedule created via manage_schedule automatically 
  triggers a push notification (default: 30 mins before).
- Manual Reminders: If the user asks for a specific alert like "Ingetin gw..." 
  or "Nanti kabarin...", call set_reminder directly.
- Confirmation: No request_confirmation needed for set_reminder.
- Context: When possible, link manual reminders to a schedule by providing 
  the relatedScheduleId (if you just created it in the same turn).

══════════════════════════════════════════════════════
 SECTION 10 — TOOL-FIRST MANDATE
══════════════════════════════════════════════════════
- For any transactional intent (create/edit/delete), your primary response 
  MUST be a tool call.
- NEVER reply with just text if a tool call is required by the workflow.
- Text responses are only for Phase 1 confirmation introductions or 
  read-only queries (get_life_status, check_affordability).

══════════════════════════════════════════════════════
 SECTION 11 — REPLY FORMAT
══════════════════════════════════════════════════════
After request_confirmation:
  → 1 sentence intro max: "Ini detail yang gw tangkap, konfirmasi dulu ya:"
  → UI will show the card automatically.

After Phase 2 / Read-only:
  → Natural, concise response in Indonesian (unless user uses English).
  → Use emojis relevant to the tone.
`.trim();
}

// ── Tool Definitions ──────────────────────────────────────────────────────────
export function buildToolDefinitions(t: TimeAnchors) {
  const compactTable = `Ref tables: Today (${t.todayLabel}), Tomorrow (${t.tomorrowLabel}), DayAfter (${t.dayAfterLabel}).`;

  return [
    // ── request_confirmation ──────────────────────────────────────────────────
    {
      type: "function" as const,
      function: {
        name: "request_confirmation",
        description: `
PHASE 1: Call this to show a confirmation card to the user. 
Mandatory for any database write (create/update/delete).
Do NOT call any other tool in the same turn.

${compactTable}
`.trim(),
        parameters: {
          type: "object",
          properties: {
            action_type: { 
              type: "string", 
              enum: ["create_schedule", "create_finance", "create_linked", "update_schedule", "update_finance", "delete_schedule", "delete_finance"],
              description: "Use 'create_linked' if user provides both schedule and cost info."
            },
            
            // Schedule fields
            title: { type: "string", description: "Event title." },
            dateTime: {
              type: "number",
              description: `UTC ms for event start time. MUST come from the lookup table above. Never calculated.`,
            },
            dateTime_wib_label: {
              type: "string",
              description: "Human label (e.g. 'Hari ini 14:00')."
            },
            duration: { type: "number", description: "Minutes. Default 60." },
            location: { type: "string" },
            estimatedCost: { type: "number", description: "Expense amount linked to this schedule." },
            
            // Finance fields (if separate or linked)
            amount: { type: "number" },
            type: { type: "string", enum: ["expense", "income"] },
            category: { type: "string", description: "food, transport, transport, transport, bill, personal, salary, etc." },
            description: { type: "string" },
            
            // IDs for update/delete
            scheduleId: { type: "string" },
            financeId: { type: "string" },

            warning: {
              type: "string",
              description: "Shown in red on card. Use for deletes: 'Jadwal ini akan dihapus permanen.'",
            },
          },
          required: ["action_type"],
        },
      },
    },

    // ── manage_schedule ──────────────────────────────────────────────────────
    {
      type: "function" as const,
      function: {
        name: "manage_schedule",
        description: `
Write a schedule to the database.
⚠️ ONLY call AFTER user approved a request_confirmation card.
⚠️ Use the EXACT dateTime from the confirmed card. Do NOT look up a new value.

${compactTable}
`.trim(),
        parameters: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["create", "update", "delete"] },
            scheduleId: { type: "string", description: "Required for update/delete." },
            title: { type: "string" },
            dateTime: {
              type: "number",
              description: "UTC ms. Copy EXACTLY from the approved confirmation card (dateTime). Do not recalculate.",
            },
            duration: { type: "number", description: "Minutes. Default 60." },
            estimatedCost: { type: "number" },
            location: { type: "string" },
          },
          required: ["action"],
        },
      },
    },

    // ── manage_finance ───────────────────────────────────────────────────────
    {
      type: "function" as const,
      function: {
        name: "manage_finance",
        description: `
Write a financial record to the database.
⚠️ ONLY call AFTER user approved a request_confirmation card.
⚠️ Use the EXACT dateTime from the confirmed card. Do NOT recalculate.
Do NOT include relatedScheduleId (auto-linked by system).

${compactTable}
`.trim(),
        parameters: {
          type: "object",
          properties: {
            action: { type: "string", enum: ["create", "update", "delete"] },
            financeId: { type: "string", description: "Required for update/delete." },
            amount: { type: "number" },
            type: { type: "string", enum: ["expense", "income"] },
            category: { type: "string" },
            description: { type: "string" },
            status: { type: "string", enum: ["planned", "actual"] },
            dateTime: {
              type: "number",
              description: "UTC ms. Copy EXACTLY from the approved confirmation card (dateTime). Do not recalculate.",
            },
          },
          required: ["action"],
        },
      },
    },

    // ── check_affordability ──────────────────────────────────────────────────
    {
      type: "function" as const,
      function: {
        name: "check_affordability",
        description: `Read-only. No confirmation needed.
Call when user says: "bisa ga beli", "mampu ga", "cukup ga", "worth it ga", "sanggup ga".`,
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

    // ── get_life_status ──────────────────────────────────────────────────────
    {
      type: "function" as const,
      function: {
        name: "get_life_status",
        description: `Read-only. No confirmation needed.
Call when:
  1. User asks for recap/summary/overview.
  2. You need a scheduleId or financeId before an update/delete flow.
Returns: schedules (scheduleId, title, dateTime), finances (financeId, amount, dateTime), budget summary.`,
        parameters: {
          type: "object",
          properties: {
            rangeDays: { type: "number", description: "Days back+forward. Default 7, use 30 for monthly." },
          },
          required: [],
        },
      },
    },

    // ── set_reminder ─────────────────────────────────────────────────────────
    {
      type: "function" as const,
      function: {
        name: "set_reminder",
        description: `Schedule a push notification. No confirmation needed.
Auto-reminders are handled by the system, but use this for manual requests.`,
        parameters: {
          type: "object",
          properties: {
            title: { type: "string" },
            body: { type: "string" },
            scheduledAt: {
              type: "number",
              description: `UTC ms when notification fires. nowUtcMs = ${t.nowUtcMs}`,
            },
            relatedScheduleId: { type: "string" },
          },
          required: ["title", "scheduledAt"],
        },
      },
    },
  ];
}


export const requestConfirmationExecutor = (args: any) => ({
  status: "awaiting_confirmation",
  payload: args,
});