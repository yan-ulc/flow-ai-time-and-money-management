"use node";
import { internalAction } from "../_generated/server";
import { internal, api } from "../_generated/api";
import { v } from "convex/values";
import webpush from "web-push";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyApi = api as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const anyInternal = internal as any;

// Configure VAPID — must happen once per module load
function getWebPush() {
  const publicKey = process.env.VAPID_PUBLIC_KEY;
  const privateKey = process.env.VAPID_PRIVATE_KEY;
  const subject = process.env.VAPID_SUBJECT || "mailto:admin@flowai.app";

  if (!publicKey || !privateKey) {
    throw new Error("Missing VAPID_PUBLIC_KEY or VAPID_PRIVATE_KEY env vars");
  }

  webpush.setVapidDetails(subject, publicKey, privateKey);
  return webpush;
}

// Called by the Convex cron job every minute
export const checkAndSend = internalAction({
  args: {},
  handler: async (ctx) => {
    const now = Date.now();
    const BUFFER_MS = 60_000; // 1-minute lookahead

    // Get all unsent notifications due within the next minute
    const dueNotifications = await ctx.runQuery(anyApi.notifications.getDue, {
      before: now + BUFFER_MS,
    });

    if (dueNotifications.length === 0) return;

    const wp = getWebPush();

    for (const notif of dueNotifications) {
      // Get user's push subscriptions
      const subscriptions = await ctx.runQuery(anyApi.push_subscriptions.getByUserId, {
        userId: notif.userId,
      });

      const payload = JSON.stringify({
        title: notif.title,
        body: notif.body,
        url: "/app",
        tag: `flowai-${notif._id}`,
      });

      // Send to all devices
      await Promise.allSettled(
      subscriptions.map(async (sub: { endpoint: string; keys: { p256dh: string; auth: string } }) => {
          try {
            await wp.sendNotification(
              {
                endpoint: sub.endpoint,
                keys: {
                  p256dh: sub.keys.p256dh,
                  auth: sub.keys.auth,
                },
              },
              payload
            );
          } catch (err: any) {
            // 410 Gone = subscription expired/removed → clean up
            if (err.statusCode === 410) {
              await ctx.runMutation(anyApi.push_subscriptions.remove, {
                endpoint: sub.endpoint,
              });
            }
            console.error(`Push failed for ${sub.endpoint.substring(0, 30)}:`, err.message);
          }
        })
      );

      // Mark notification as sent
      await ctx.runMutation(anyInternal.notifications.markSent, {
        notificationId: notif._id,
      });
    }
  },
});
