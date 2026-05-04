import { httpRouter } from "convex/server";
import { httpAction } from "./_generated/server";
import { internal } from "./_generated/api";
import { Webhook } from "svix";

const http = httpRouter();

export const clerkWebhook = httpAction(async (ctx, request) => {
  const payloadString = await request.text();
  const headerPayload = request.headers;

  const svixId = headerPayload.get("svix-id");
  const svixTimestamp = headerPayload.get("svix-timestamp");
  const svixSignature = headerPayload.get("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    return new Response("Missing svix headers", { status: 400 });
  }

  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;
  if (!webhookSecret) {
    throw new Error("Missing CLERK_WEBHOOK_SECRET");
  }

  const wh = new Webhook(webhookSecret);
  let evt: any;
  try {
    evt = wh.verify(payloadString, {
      "svix-id": svixId,
      "svix-timestamp": svixTimestamp,
      "svix-signature": svixSignature,
    });
  } catch (err) {
    return new Response("Error verifying webhook", { status: 400 });
  }

  const eventType = evt.type;
  if (eventType === "user.created") {
    const { id, email_addresses, first_name, last_name } = evt.data;
    const email = email_addresses?.[0]?.email_address || "";
    const name = [first_name, last_name].filter(Boolean).join(" ") || "Unknown User";

    await ctx.runMutation(internal.users.createUser, {
      clerkId: id,
      name,
      email,
    });
  }

  return new Response("Webhook processed", { status: 200 });
});

http.route({
  path: "/api/webhooks/clerk",
  method: "POST",
  handler: clerkWebhook,
});

export default http;
