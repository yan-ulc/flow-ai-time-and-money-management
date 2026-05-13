"use client";

import React from "react";
import { ToggleSwitch } from "./ToggleSwitch";

export function SettingToggle({
  title,
  desc,
  defaultOn = false,
  value,
  onChange,
}: {
  title: string;
  desc: string;
  defaultOn?: boolean;
  value?: boolean;
  onChange?: (newVal: boolean) => void;
}) {
  const [internalOn, setInternalOn] = React.useState(defaultOn);
  const isControlled = value !== undefined;
  const isOn = isControlled ? value : internalOn;

  const handleToggle = () => {
    const nextValue = !isOn;
    if (!isControlled) {
      setInternalOn(nextValue);
    }
    onChange?.(nextValue);
  };

  return (
    <div className="flex items-center justify-between">
      <div className="flex flex-col pr-4">
        <span className="font-semibold text-sm">{title}</span>
        <span className="text-xs text-muted-foreground mt-0.5">{desc}</span>
      </div>
      <ToggleSwitch isOn={isOn} onToggle={handleToggle} />
    </div>
  );
}
