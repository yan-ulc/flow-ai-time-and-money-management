"use client";

import { useAuth } from "@clerk/nextjs";
import { ConvexReactClient } from "convex/react";
import { ConvexProviderWithClerk } from "convex/react-clerk";
import { ReactNode } from "react";

// Instantiate once at module level as a singleton — avoids re-creating
// the client on every render, and keeps it stable across hot reloads.
// Guard against missing env var so prerender / static export doesn't crash.
const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
const convex = convexUrl ? new ConvexReactClient(convexUrl) : null;

export default function ConvexClientProvider({
  children,
}: {
  children: ReactNode;
}) {
  if (!convex) {
    // NEXT_PUBLIC_CONVEX_URL not set (e.g. during static prerender).
    // Render children so the page shell still works without Convex.
    return <>{children}</>;
  }

  return (
    <ConvexProviderWithClerk client={convex} useAuth={useAuth}>
      {children}
    </ConvexProviderWithClerk>
  );
}
