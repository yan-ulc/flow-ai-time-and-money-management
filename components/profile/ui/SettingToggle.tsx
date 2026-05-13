"use client";

import React from "react";
import { ToggleSwitch } from "./ToggleSwitch";

export function SettingToggle({
  title,
  desc,
  defaultOn,
}: {
  title: string;
  desc: string;
  defaultOn: boolean;
}) {
  const [on, setOn] = React.useState(defaultOn);

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col pr-4">
        <span className="font-semibold text-sm">{title}</span>
        <span className="text-xs text-muted-foreground mt-0.5">{desc}</span>
      </div>
      <ToggleSwitch isOn={on} onToggle={() => setOn(!on)} />
    </div>
  );
}
