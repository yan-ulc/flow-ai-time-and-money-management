"use client";

import { cn } from "@/lib/utils";
import React from "react";

export function SettingRow({
  icon: Icon,
  title,
  desc,
  action,
  destructive,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  desc: string;
  action: React.ReactNode;
  destructive?: boolean;
}) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer group">
      <div className="flex items-center gap-4">
        <div
          className={cn(
            "p-2.5 rounded-lg transition-colors",
            destructive
              ? "bg-rose-500/10 text-rose-500 group-hover:bg-rose-500/20"
              : "bg-muted text-foreground group-hover:bg-primary/10 group-hover:text-primary",
          )}
        >
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span
            className={cn(
              "font-semibold text-sm",
              destructive && "text-rose-500",
            )}
          >
            {title}
          </span>
          <span className="text-xs text-muted-foreground">{desc}</span>
        </div>
      </div>
      <div
        className={cn(
          "transition-transform duration-300",
          "group-hover:translate-x-1",
        )}
      >
        {action}
      </div>
    </div>
  );
}
