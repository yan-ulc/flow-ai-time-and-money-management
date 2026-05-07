"use client";

import React from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { CalendarMini } from "./CalendarMini";
import { Zap, Bell, BellOff } from "lucide-react";
import { useNotification } from "@/hooks/useNotification";
import { Button } from "@/components/ui/button";

export function Sidebar() {
  const { user } = useUser();
  const { isSupported, isSubscribed, permission, subscribe, unsubscribe } = useNotification();

  return (
    <div className="flex flex-col h-full p-4 gap-6">
      <div className="flex items-center gap-2 font-bold text-xl tracking-tight px-2 py-1">
        <Zap className="h-6 w-6 text-primary fill-primary" />
        <span>FlowAi</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <CalendarMini />
      </div>

      <div className="mt-auto border-t pt-4 space-y-3">
        {isSupported && (
          <Button
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            onClick={isSubscribed ? unsubscribe : subscribe}
          >
            {isSubscribed ? (
              <>
                <Bell className="h-4 w-4 text-primary" />
                <span className="text-xs">Notifications On</span>
              </>
            ) : (
              <>
                <BellOff className="h-4 w-4" />
                <span className="text-xs">
                  {permission === "denied" ? "Notifications Blocked" : "Enable Notifications"}
                </span>
              </>
            )}
          </Button>
        )}

        <div className="flex items-center gap-3 px-2">
          <UserButton />
          <div className="flex flex-col">
            <span className="text-sm font-medium">{user?.firstName || "User"}</span>
            <span className="text-xs text-muted-foreground truncate w-32">
              {user?.primaryEmailAddress?.emailAddress}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
