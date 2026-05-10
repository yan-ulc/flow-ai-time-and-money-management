/**
 * FlowAI Time Utilities
 *
 * Problem: LLMs are stateless. When given only `nowMs`, they calculate
 * "tonight 20:00 WIB" by adding hours to the current *seconds*, producing
 * drift. The solution is to give the AI explicit midnight-anchored epoch
 * values it can add hours to, and to validate epochs on the server side.
 *
 * All epoch values are UTC milliseconds. Local time is WIB (UTC+7).
 * WIB offset = 7 * 3600 * 1000 = 25_200_000 ms
 */

const WIB_OFFSET_MS = 7 * 60 * 60 * 1000; // 25_200_000

/**
 * Build a rich, unambiguous time context block for the system prompt.
 * Returns an object with pre-computed anchors the AI can use directly.
 */
export function buildTimeContext(nowMs: number, timezone: string = "Asia/Jakarta") {
  // Midnight of today in WIB — the AI adds hours to this
  const nowWibMs = nowMs + WIB_OFFSET_MS;
  const todayWibDate = new Date(nowWibMs);

  // Zero out time components
  const todayMidnightWib = Date.UTC(
    todayWibDate.getUTCFullYear(),
    todayWibDate.getUTCMonth(),
    todayWibDate.getUTCDate(),
    0, 0, 0, 0
  ) - WIB_OFFSET_MS; // Convert back to UTC epoch

  const tomorrowMidnightUtc = todayMidnightWib + 24 * 60 * 60 * 1000;
  const dayAfterMidnightUtc = tomorrowMidnightUtc + 24 * 60 * 60 * 1000;

  // Format human-readable labels
  const fmt = (ms: number) =>
    new Date(ms).toLocaleString("id-ID", {
      timeZone: timezone,
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // Day-of-week for contextual hints
  const wibDayName = new Date(nowMs).toLocaleDateString("id-ID", {
    timeZone: timezone,
    weekday: "long",
  });
  const tomorrowDayName = new Date(tomorrowMidnightUtc).toLocaleDateString("id-ID", {
    timeZone: timezone,
    weekday: "long",
  });

  return {
    nowMs,
    wibOffsetMs: WIB_OFFSET_MS,
    todayMidnightUtc: todayMidnightWib,
    tomorrowMidnightUtc,
    dayAfterMidnightUtc,
    humanNow: fmt(nowMs),
    humanTodayMidnight: fmt(todayMidnightWib),
    humanTomorrowMidnight: fmt(tomorrowMidnightUtc),
    wibDayName,
    tomorrowDayName,

    /**
     * Build the prompt block string injected into the system prompt.
     * Gives the AI concrete, copy-paste-ready epoch anchors.
     */
    toPromptBlock(): string {
      return `
## TIME CONTEXT (Read carefully — use these values directly, do NOT guess)

- Current server time (UTC): ${new Date(nowMs).toISOString()}
- Current local time (WIB, UTC+7): ${this.humanNow}
- Current Unix epoch (ms): ${nowMs}
- WIB timezone offset: +25,200,000 ms (7 hours)
- Today is: ${wibDayName}
- Tomorrow is: ${tomorrowDayName}

### PRE-COMPUTED MIDNIGHT ANCHORS (UTC epoch ms)
These are exact midnight values in WIB time, already converted to UTC ms.
Use these as the BASE for calculating event times. Add hours in ms.
- Today midnight WIB   = ${this.todayMidnightUtc}   → ${this.humanTodayMidnight}
- Tomorrow midnight WIB = ${tomorrowMidnightUtc}     → ${this.humanTomorrowMidnight}

### HOW TO CALCULATE EVENT TIME (MANDATORY METHOD)
ALWAYS use the midnight anchor + hour offset. NEVER add hours to nowMs.

FORMULA: dateTime = [MIDNIGHT_ANCHOR] + [HOURS * 3_600_000] + [MINUTES * 60_000]

EXAMPLES (based on current time above):
- "tonight 20:00 WIB"   → ${this.todayMidnightUtc} + 20 * 3_600_000 = ${this.todayMidnightUtc + 20 * 3_600_000}
- "tonight 19:30 WIB"   → ${this.todayMidnightUtc} + 19 * 3_600_000 + 30 * 60_000 = ${this.todayMidnightUtc + 19 * 3_600_000 + 30 * 60_000}
- "tomorrow 08:00 WIB"  → ${tomorrowMidnightUtc} + 8 * 3_600_000 = ${tomorrowMidnightUtc + 8 * 3_600_000}
- "tomorrow 12:30 WIB"  → ${tomorrowMidnightUtc} + 12 * 3_600_000 + 30 * 60_000 = ${tomorrowMidnightUtc + 12 * 3_600_000 + 30 * 60_000}

### VALIDATION CHECK
After calculating, verify: new Date(yourResult).toISOString() should show the UTC time.
WIB = UTC + 7h. So "20:00 WIB" = "13:00 UTC". If your result's UTC hour doesn't match, recalculate.

### RULES
1. NEVER use nowMs as a base for scheduled events.
2. ALWAYS use the midnight anchor above.
3. For "today" events: use todayMidnightUtc + hours.
4. For "tomorrow" events: use tomorrowMidnightUtc + hours.
5. Minutes must be exact (e.g. "jam 8" = exactly 8:00:00, not 8:42:17).
`.trim();
    },
  };
}

/**
 * Server-side validator for dateTime values received FROM the AI.
 * Rejects obviously wrong values (past, too far future, wrong order of magnitude).
 */
export function validateAiDateTime(
  dateTime: number,
  nowMs: number,
  options: {
    allowPast?: boolean;       // Allow past times (for "actual" expenses). Default false
    maxFutureDays?: number;    // Max days ahead. Default 365
  } = {}
): { valid: boolean; error?: string; corrected?: number } {
  const { allowPast = false, maxFutureDays = 365 } = options;

  // Check magnitude — must be a reasonable Unix epoch in milliseconds
  // Valid range: 2020-01-01 to 2035-01-01
  const MIN_VALID = 1_577_836_800_000; // 2020-01-01
  const MAX_VALID = 2_051_222_400_000; // 2035-01-01

  if (dateTime < MIN_VALID || dateTime > MAX_VALID) {
    // Could be seconds instead of ms — try multiplying
    if (dateTime > MIN_VALID / 1000 && dateTime < MAX_VALID / 1000) {
      return {
        valid: false,
        error: `dateTime appears to be in SECONDS, not milliseconds. Got ${dateTime} → ${new Date(dateTime * 1000).toISOString()}. Multiply by 1000.`,
        corrected: dateTime * 1000,
      };
    }
    return {
      valid: false,
      error: `dateTime ${dateTime} is out of valid range. It resolves to ${new Date(dateTime).toISOString() || "invalid date"}.`,
    };
  }

  // Human-readable for error messages
  const humanDate = new Date(dateTime).toISOString();

  // Check: must not be before 6 months ago (catches 2025 dates when it's 2026)
  const sixMonthsAgo = nowMs - 180 * 24 * 60 * 60 * 1000;
  if (!allowPast && dateTime < sixMonthsAgo) {
    return {
      valid: false,
      error: `dateTime ${dateTime} resolves to ${humanDate} which is more than 6 months in the past. Current nowMs=${nowMs} (${new Date(nowMs).toISOString()}). You likely used a wrong year — check the midnight anchors in the TIME CONTEXT.`,
    };
  }

  // For schedules: allow anything from today's midnight onwards (to record things that happened earlier today)
  // But still block things more than 6 months ago to catch year/epoch hallucinations.
  const pastThresholdMs = allowPast ? sixMonthsAgo : nowMs - 24 * 60 * 60 * 1000; // Allow 24h grace
  if (dateTime < pastThresholdMs) {
    return {
      valid: false,
      error: `dateTime ${dateTime} (${humanDate}) is too far in the past. Current time: ${new Date(nowMs).toISOString()}. If this was for today, make sure you used the correct midnight anchor.`,
    };
  }

  // Check if too far in future
  const maxFutureMs = nowMs + maxFutureDays * 24 * 60 * 60 * 1000;
  if (dateTime > maxFutureMs) {
    return {
      valid: false,
      error: `dateTime ${dateTime} (${humanDate}) is more than ${maxFutureDays} days in the future from now (${new Date(nowMs).toISOString()}).`,
    };
  }

  return { valid: true };
}
