import { cronJobs } from "convex/server";
import { internal } from "./_generated/api";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyInternal = internal as any;

const crons = cronJobs();

// Check and send due notifications every minute
crons.interval(
  "check-and-send-notifications",
  { minutes: 1 },
  anyInternal.actions.notifications.checkAndSend
);

// Check for unconfirmed events every hour
crons.hourly(
  "check-unconfirmed-events",
  { minuteUTC: 0 },
  anyInternal.schedules.checkUnconfirmedEvents
);

export default crons;
