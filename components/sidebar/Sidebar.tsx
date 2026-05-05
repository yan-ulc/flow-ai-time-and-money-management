"use client";

import React from "react";
import { UserButton, useUser } from "@clerk/nextjs";
import { CalendarMini } from "./CalendarMini";
import { Zap } from "lucide-react";

export function Sidebar() {
  const { user } = useUser();

  return (
    <div className="flex flex-col h-full p-4 gap-6">
      <div className="flex items-center gap-2 font-bold text-xl tracking-tight px-2 py-1">
        <Zap className="h-6 w-6 text-primary fill-primary" />
        <span>FlowAi</span>
      </div>

      <div className="flex-1 overflow-y-auto">
        <CalendarMini />
      </div>

      <div className="mt-auto border-t pt-4">
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
