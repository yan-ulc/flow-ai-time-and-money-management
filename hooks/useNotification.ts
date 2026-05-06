"use client";

import { useEffect, useCallback, useState } from "react";
import { useMutation, useQuery } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser } from "@clerk/nextjs";
import { toast } from "sonner";

function urlBase64ToUint8Array(base64String: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const rawData = atob(base64);
  const buffer = new ArrayBuffer(rawData.length);
  const view = new Uint8Array(buffer);
  for (let i = 0; i < rawData.length; i++) {
    view[i] = rawData.charCodeAt(i);
  }
  return buffer;
}

export type NotificationPermission = "default" | "granted" | "denied";

export function useNotification() {
  const { user } = useUser();
  const dbUser = useQuery(
    api.users.getUserByClerkId,
    user?.id ? { clerkId: user.id } : "skip"
  );

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const upsertSubscription = useMutation((api as any).push_subscriptions.upsert);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const removeSubscription = useMutation((api as any).push_subscriptions.remove);

  const [permission, setPermission] = useState<NotificationPermission>("default");
  const [isSupported, setIsSupported] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);

  useEffect(() => {
    const supported =
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      "PushManager" in window &&
      "Notification" in window;

    setIsSupported(supported);

    if (supported) {
      setPermission(Notification.permission as NotificationPermission);
      // Register service worker immediately
      navigator.serviceWorker
        .register("/sw.js", { scope: "/" })
        .then(async (reg) => {
          const existing = await reg.pushManager.getSubscription();
          setIsSubscribed(!!existing);
        })
        .catch(console.error);
    }
  }, []);

  const subscribe = useCallback(async () => {
    if (!isSupported || !dbUser) return;

    try {
      const reg = await navigator.serviceWorker.ready;
      const perm = await Notification.requestPermission();
      setPermission(perm as NotificationPermission);

      if (perm !== "granted") {
        toast.error("Notification permission denied.");
        return;
      }

      const vapidPublicKey = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
      if (!vapidPublicKey) {
        console.error("Missing NEXT_PUBLIC_VAPID_PUBLIC_KEY");
        return;
      }

      const subscription = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(vapidPublicKey),
      });

      const json = subscription.toJSON();
      await upsertSubscription({
        userId: dbUser._id,
        endpoint: json.endpoint!,
        keys: {
          p256dh: json.keys!.p256dh,
          auth: json.keys!.auth,
        },
        deviceInfo: navigator.userAgent.substring(0, 100),
      });

      setIsSubscribed(true);
      toast.success("Notifications enabled! You'll get reminders for your schedules.");
    } catch (err: any) {
      console.error("Push subscription failed:", err);
      toast.error("Failed to enable notifications.");
    }
  }, [isSupported, dbUser, upsertSubscription]);

  const unsubscribe = useCallback(async () => {
    if (!isSupported) return;

    try {
      const reg = await navigator.serviceWorker.ready;
      const subscription = await reg.pushManager.getSubscription();
      if (subscription) {
        await removeSubscription({ endpoint: subscription.endpoint });
        await subscription.unsubscribe();
      }
      setIsSubscribed(false);
      toast.success("Notifications disabled.");
    } catch (err) {
      console.error("Unsubscribe failed:", err);
    }
  }, [isSupported, removeSubscription]);

  return { isSupported, isSubscribed, permission, subscribe, unsubscribe };
}
