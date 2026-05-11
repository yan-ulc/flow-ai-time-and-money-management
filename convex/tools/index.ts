// ============================================================
// FlowAI — System Prompt & Tool Definitions (v7)
// ROOT CAUSE FIX: Replace timestamp formula with pre-computed
// lookup tables. AI must NEVER calculate timestamps itself.
// ============================================================

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

function buildDayTable(midnightUtcMs: number): Record<string, number> {
  const table: Record<string, number> = {};
  for (let h = 0; h <= 23; h++) {
    for (const m of [0, 15, 30, 45]) {
      const key = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;
      table[key] = midnightUtcMs + h * 3_600_000 + m * 60_000;
    }
  }
  return table;
}

export function buildTimeAnchors(): TimeAnchors {
  const WIB = 7 * 3_600_000; // 25_200_000
  const now = Date.now();
  const wibNow = new Date(now + WIB);

  // Midnight = 00:00 WIB = (today's WIB date at 00:00) expressed in UTC ms
  const todayMidnightWib = Date.UTC(
    wibNow.getUTCFullYear(),
    wibNow.getUTCMonth(),
    wibNow.getUTCDate()
  );
  const todayMidnightUtcMs = todayMidnightWib - WIB;

  const dayLabel = (offsetDays: number): string => {
    const d = new Date(todayMidnightWib + offsetDays * 86_400_000);
    return d.toLocaleDateString("id-ID", {
      weekday: "long", day: "numeric", month: "long", year: "numeric",
      timeZone: "UTC",
    });
  };

  return {
    nowUtcMs: now,
    wibOffsetMs: WIB,
    currentWibHHMM: wibNow.toISOString().slice(11, 16),
    currentWibDateLabel: dayLabel(0),

    todayLabel: dayLabel(0),
    todayTable: buildDayTable(todayMidnightUtcMs),

    tomorrowLabel: dayLabel(1),
    tomorrowTable: buildDayTable(todayMidnightUtcMs + 86_400_000),

    dayAfterLabel: dayLabel(2),
    dayAfterTable: buildDayTable(todayMidnightUtcMs + 2 * 86_400_000),
  };
}

export function wibTimeToUtcMs(hhmm: string, midnightAnchorUtcMs: number): number {
  const [h, m] = hhmm.split(":").map(Number);
  return midnightAnchorUtcMs + h * 3_600_000 + m * 60_000;
}

// ── Format lookup table as a compact string for the prompt ───────────────────
function formatTable(label: string, table: Record<string, number>): string {
  // Only show whole-hour + :30 entries to save tokens, keep it scannable
  const lines: string[] = [`  ${label}:`];
  for (let h = 0; h <= 23; h++) {
    const hh = h.toString().padStart(2, "0");
    const ts00 = table[`${hh}:00`];
    const ts30 = table[`${hh}:30`];
    lines.push(`    ${hh}:00 → ${ts00}    ${hh}:30 → ${ts30}`);
  }
  return lines.join("\n");
}


// ── System prompt ─────────────────────────────────────────────────────────────
export const buildSystemPrompt = (
  userSettings: any,
  userName: string,
  t: TimeAnchors
): string => `
You are FlowAI, a personal life assistant that manages finances and schedules for ${userName}.

══════════════════════════════════════════════════════
 SECTION 1 — IDENTITY & CONTEXT
══════════════════════════════════════════════════════
Your job: track ${userName}'s money and time through natural conversation.
Tools available: request_confirmation, manage_schedule, manage_finance,
                 get_life_status, check_affordability, set_reminder.

Monthly budget : IDR ${userSettings.monthlyBudget ?? 0}
Response tone  : ${userSettings.tone ?? "neutral"}

══════════════════════════════════════════════════════
 SECTION 2 — CURRENT TIME (SERVER-AUTHORITATIVE)
══════════════════════════════════════════════════════
Server-computed values. Use them directly. Never invent or derive alternatives.

  Current WIB time  : ${t.currentWibHHMM} WIB
  Current WIB date  : ${t.currentWibDateLabel}
  nowUtcMs          : ${t.nowUtcMs}

Relative shortcuts (pre-computed):
  "sekarang"        → ${t.nowUtcMs}
  "3 menit lagi"    → ${t.nowUtcMs + 180_000}
  "10 menit lagi"   → ${t.nowUtcMs + 600_000}
  "30 menit lagi"   → ${t.nowUtcMs + 1_800_000}
  "1 jam lagi"      → ${t.nowUtcMs + 3_600_000}
  "2 jam lagi"      → ${t.nowUtcMs + 7_200_000}

══════════════════════════════════════════════════════
 SECTION 3 — TIMESTAMP LOOKUP TABLES (READ-ONLY)
══════════════════════════════════════════════════════
⚠️  CRITICAL RULE: You MUST use these tables to get timestamps.
    NEVER compute, derive, or estimate a timestamp yourself.
    NEVER use nowUtcMs as a base for date calculations.
    If the exact minute is not in the table, use the nearest :00 or :30 entry,
    then ADD the remaining minutes × 60000.

    Example: user says "08:15 besok"
      1. Look up "08:00" in TOMORROW table  → get base_ms
      2. Add 15 × 60000 = 900000
      3. Result = base_ms + 900000
      That's it. No other math allowed.

${formatTable(t.todayLabel + "  (hari ini)", t.todayTable)}

${formatTable(t.tomorrowLabel + "  (besok)", t.tomorrowTable)}

${formatTable(t.dayAfterLabel + "  (lusa)", t.dayAfterTable)}

══════════════════════════════════════════════════════
 SECTION 4 — TWO-PHASE EXECUTION (MANDATORY)
══════════════════════════════════════════════════════
Every DB write follows this exact flow. Skipping Phase 1 = critical failure.

  PHASE 1 — CONFIRM
  ─────────────────
  Detect transactional intent → gather all fields → call request_confirmation.
  STOP after calling request_confirmation. Wait for user reply.
  Do NOT call manage_schedule or manage_finance yet.

  PHASE 2 — EXECUTE
  ─────────────────
  User approves ("ya", "oke", "yep", "lanjut", "fix", "betul", "yes", "👍")
    → Call the actual tool (manage_schedule / manage_finance).
    → Use the EXACT same timestamp from the confirmed card. Do not recalculate.

  User rejects ("batal", "gajadi", "ubah", "salah", "no", "tidak")
    → Ask what to change → restart from Phase 1 with corrected data.

No confirmation needed for: get_life_status, check_affordability, set_reminder.

══════════════════════════════════════════════════════
 SECTION 5 — INTENT → TOOL MAPPING
══════════════════════════════════════════════════════
Detect ALL intents in one message. "futsal besok + makan 50rb" = 2 flows.

  INTENT                              FLOW
  ──────────────────────────────────────────────────────────────────────────
  Buat jadwal                         request_confirmation → manage_schedule {create}
  Edit jadwal                         get_life_status → request_confirmation → manage_schedule {update}
  Hapus jadwal                        get_life_status → request_confirmation → manage_schedule {delete}

  Catat pengeluaran / bayar / beli    request_confirmation → manage_finance {create, expense}
  Catat pemasukan / dapat uang        request_confirmation → manage_finance {create, income}
  Edit catatan keuangan               get_life_status → request_confirmation → manage_finance {update}
  Hapus catatan keuangan              get_life_status → request_confirmation → manage_finance {delete}

  Jadwal + biaya bersamaan            request_confirmation (1 card) → manage_schedule + manage_finance
  Bisa ga beli / mampu ga             check_affordability
  Rekap / summary / kondisi           get_life_status
  ──────────────────────────────────────────────────────────────────────────

DEFAULT = CREATE. Switch to update/delete ONLY when user says:
"ubah", "edit", "ganti", "pindah", "hapus", "cancel", "batalkan", "reschedule".

STATUS RULE:
  Transaction happening now or in the past → status: "actual"
  Transaction for a future date            → status: "planned"

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
- All time references in replies: WIB only, never UTC.
- Replies after Phase 2: max 2–3 sentences.

══════════════════════════════════════════════════════
 SECTION 9 — REPLY FORMAT
══════════════════════════════════════════════════════
After request_confirmation:
  → 1 sentence intro max: "Ini detail yang gw tangkap, konfirmasi dulu ya:"
  → Do NOT restate fields in text — the card shows them.

After Phase 2 DB write:
  1. Konfirmasi sukses (1 kalimat, sebutkan waktu WIB dari card)
  2. Dampak ke budget / jadwal (1 kalimat)
  3. Insight singkat (opsional)

Tone:
  neutral   : profesional, singkat
  supportive: hangat, sesekali emoji
  savage    : blunt, sindir pengeluaran boros
`.trim();


// ── Tool definitions ──────────────────────────────────────────────────────────
export function buildToolDefinitions(t: TimeAnchors) {

  // Compact lookup injected into each tool description — AI sees the table
  // right next to the field it needs to fill, removing any excuse to guess.
  const compactTable = `
TIMESTAMP LOOKUP — use this table, do not calculate:
  HARI INI  (${t.todayLabel}):
    06:00→${t.todayTable["06:00"]}  07:00→${t.todayTable["07:00"]}  08:00→${t.todayTable["08:00"]}  09:00→${t.todayTable["09:00"]}  10:00→${t.todayTable["10:00"]}
    11:00→${t.todayTable["11:00"]}  12:00→${t.todayTable["12:00"]}  13:00→${t.todayTable["13:00"]}  14:00→${t.todayTable["14:00"]}  15:00→${t.todayTable["15:00"]}
    16:00→${t.todayTable["16:00"]}  17:00→${t.todayTable["17:00"]}  18:00→${t.todayTable["18:00"]}  19:00→${t.todayTable["19:00"]}  20:00→${t.todayTable["20:00"]}
    21:00→${t.todayTable["21:00"]}  22:00→${t.todayTable["22:00"]}  23:00→${t.todayTable["23:00"]}
  BESOK  (${t.tomorrowLabel}):
    06:00→${t.tomorrowTable["06:00"]}  07:00→${t.tomorrowTable["07:00"]}  08:00→${t.tomorrowTable["08:00"]}  09:00→${t.tomorrowTable["09:00"]}  10:00→${t.tomorrowTable["10:00"]}
    11:00→${t.tomorrowTable["11:00"]}  12:00→${t.tomorrowTable["12:00"]}  13:00→${t.tomorrowTable["13:00"]}  14:00→${t.tomorrowTable["14:00"]}  15:00→${t.tomorrowTable["15:00"]}
    16:00→${t.tomorrowTable["16:00"]}  17:00→${t.tomorrowTable["17:00"]}  18:00→${t.tomorrowTable["18:00"]}  19:00→${t.tomorrowTable["19:00"]}  20:00→${t.tomorrowTable["20:00"]}
    21:00→${t.tomorrowTable["21:00"]}  22:00→${t.tomorrowTable["22:00"]}  23:00→${t.tomorrowTable["23:00"]}
  LUSA  (${t.dayAfterLabel}):
    06:00→${t.dayAfterTable["06:00"]}  07:00→${t.dayAfterTable["07:00"]}  08:00→${t.dayAfterTable["08:00"]}  09:00→${t.dayAfterTable["09:00"]}  10:00→${t.dayAfterTable["10:00"]}
    11:00→${t.dayAfterTable["11:00"]}  12:00→${t.dayAfterTable["12:00"]}  13:00→${t.dayAfterTable["13:00"]}  14:00→${t.dayAfterTable["14:00"]}  15:00→${t.dayAfterTable["15:00"]}
    16:00→${t.dayAfterTable["16:00"]}  17:00→${t.dayAfterTable["17:00"]}  18:00→${t.dayAfterTable["18:00"]}  19:00→${t.dayAfterTable["19:00"]}  20:00→${t.dayAfterTable["20:00"]}
    21:00→${t.dayAfterTable["21:00"]}  22:00→${t.dayAfterTable["22:00"]}  23:00→${t.dayAfterTable["23:00"]}
For :15/:45 minutes → take nearest :00 entry + (15 × 60000) or (45 × 60000).
nowUtcMs = ${t.nowUtcMs}`.trim();

  return [
    // ── request_confirmation ─────────────────────────────────────────────────
    {
      type: "function" as const,
      function: {
        name: "request_confirmation",
        description: `
Show a confirmation card to the user BEFORE any DB write.
ALWAYS call this first when a transactional intent is detected.
After calling this, STOP and wait for user reply.
Only call manage_schedule or manage_finance after user approves.

action_type values:
  "create_schedule" | "update_schedule" | "delete_schedule"
  "create_finance"  | "update_finance"  | "delete_finance"

${compactTable}
`.trim(),
        parameters: {
          type: "object",
          properties: {
            action_type: {
              type: "string",
              enum: [
                "create_schedule", "update_schedule", "delete_schedule",
                "create_finance",  "update_finance",  "delete_finance",
              ],
            },

            // Schedule fields
            title: { type: "string", description: "Event title." },
            dateTime_utc_ms: {
              type: "number",
              description: `UTC ms for event start time. MUST come from the lookup table above. Never calculated.`,
            },
            dateTime_wib_label: {
              type: "string",
              description: `Display string for the card. e.g. "Senin, 11 Mei 2026 — 08:00 WIB". Display only.`,
            },
            duration_minutes: { type: "number", description: "Duration in minutes. Default 60." },
            location: { type: "string" },
            estimated_cost: { type: "number", description: "IDR. Only if user mentioned cost." },

            // Finance fields
            amount: { type: "number", description: "IDR amount." },
            finance_type: { type: "string", enum: ["expense", "income"] },
            category: { type: "string" },
            finance_description: { type: "string" },
            finance_status: { type: "string", enum: ["planned", "actual"] },
            dateTime_utc_ms_finance: {
              type: "number",
              description: `UTC ms for transaction date. From lookup table. Default: nowUtcMs = ${t.nowUtcMs}`,
            },
            date_wib_label: { type: "string", description: "Display-only date string for card." },

            // Shared
            scheduleId: { type: "string", description: "Required for update_schedule / delete_schedule." },
            financeId:  { type: "string", description: "Required for update_finance / delete_finance." },
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
⚠️ Use the EXACT dateTime_utc_ms from the confirmed card. Do NOT look up a new value.

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
              description: "UTC ms. Copy EXACTLY from the approved confirmation card (dateTime_utc_ms). Do not recalculate.",
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
⚠️ Use the EXACT dateTime_utc_ms_finance from the confirmed card. Do NOT recalculate.
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
              description: "UTC ms. Copy EXACTLY from the approved confirmation card (dateTime_utc_ms_finance). Do not recalculate.",
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
Auto-call after manage_schedule create (default 30 min before: scheduledAt = event_dateTime − 1_800_000).`,
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


// ── Executors ─────────────────────────────────────────────────────────────────
export const requestConfirmationExecutor = (args: any) => ({
  status: "awaiting_confirmation",
  payload: args,
});

export const manageFinanceExecutor = async (args: any, ctx: any) => {
  const now = Date.now();

  if (args.action === "create") {
    const id = await ctx.db.insert("finances", {
      userId: args.userId,
      amount: args.amount ?? 0,
      type: args.type ?? "expense",
      category: args.category ?? "other",
      description: args.description || "",
      status: args.status || "actual",
      dateTime: args.dateTime || now,
      updatedAt: now,
    });
    return { success: true, financeId: id };
  }

  if (args.action === "update") {
    if (!args.financeId) return { success: false, error: "financeId required" };
    const id = ctx.db.normalizeId("finances", args.financeId);
    if (!id) return { success: false, error: "Invalid financeId" };
    await ctx.db.patch(id, {
      ...(args.amount      !== undefined && { amount: args.amount }),
      ...(args.type        !== undefined && { type: args.type }),
      ...(args.category    !== undefined && { category: args.category }),
      ...(args.description !== undefined && { description: args.description }),
      ...(args.status      !== undefined && { status: args.status }),
      ...(args.dateTime    !== undefined && { dateTime: args.dateTime }),
      updatedAt: now,
    });
    return { success: true, financeId: id };
  }

  if (args.action === "delete") {
    if (!args.financeId) return { success: false, error: "financeId required" };
    const id = ctx.db.normalizeId("finances", args.financeId);
    if (!id) return { success: false, error: "Invalid financeId" };
    await ctx.db.patch(id, { status: "cancelled", updatedAt: now });
    return { success: true, deleted: id };
  }

  return { success: false, error: `Unknown action: ${args.action}` };
};

export const manageScheduleExecutor = async (args: any, ctx: any) => {
  const now = Date.now();

  if (args.action === "create") {
    const id = await ctx.db.insert("schedules", {
      userId: args.userId,
      title: args.title || "No Title",
      dateTime: args.dateTime,
      duration: args.duration ?? 60,
      estimatedCost: args.estimatedCost,
      location: args.location || "",
      status: "upcoming",
      updatedAt: now,
    });
    return { success: true, scheduleId: id };
  }

  if (args.action === "update") {
    if (!args.scheduleId) return { success: false, error: "scheduleId required" };
    const id = ctx.db.normalizeId("schedules", args.scheduleId);
    if (!id) return { success: false, error: "Invalid scheduleId" };
    await ctx.db.patch(id, {
      ...(args.title         !== undefined && { title: args.title }),
      ...(args.dateTime      !== undefined && { dateTime: args.dateTime }),
      ...(args.duration      !== undefined && { duration: args.duration }),
      ...(args.estimatedCost !== undefined && { estimatedCost: args.estimatedCost }),
      ...(args.location      !== undefined && { location: args.location }),
      updatedAt: now,
    });
    return { success: true, scheduleId: id };
  }

  if (args.action === "delete") {
    if (!args.scheduleId) return { success: false, error: "scheduleId required" };
    const id = ctx.db.normalizeId("schedules", args.scheduleId);
    if (!id) return { success: false, error: "Invalid scheduleId" };
    await ctx.db.patch(id, { status: "cancelled", updatedAt: now });
    return { success: true, deleted: id };
  }

  return { success: false, error: `Unknown action: ${args.action}` };
};