"use client";

import { motion } from "framer-motion";
import {
  Bell,
  ChevronRight,
  DownloadCloud,
  Moon,
  Sun,
  Trash2,
} from "lucide-react";
import { itemVariants } from "../motionVariants";
import { SettingRow } from "../ui/SettingRow";
import { ToggleSwitch } from "../ui/ToggleSwitch";

export function PreferencesSecuritySection({
  isDarkMode,
  onToggleTheme,
}: {
  isDarkMode: boolean;
  onToggleTheme: () => void;
}) {
  return (
    <motion.div
      variants={itemVariants}
      className="grid grid-cols-1 md:grid-cols-2 gap-8"
    >
      <div className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold tracking-tight px-1">
          App Preferences
        </h2>
        <div className="rounded-[1.5rem] bg-background border border-border/40 overflow-hidden flex flex-col shadow-sm">
          <SettingRow
            icon={isDarkMode ? Moon : Sun}
            title={isDarkMode ? "Dark Mode" : "Light Mode"}
            desc="Interface theme"
            action={<ToggleSwitch isOn={isDarkMode} onToggle={onToggleTheme} />}
          />
          <div className="h-px bg-border/40" />
          <SettingRow
            icon={Bell}
            title="Notifications"
            desc="Manage alerts"
            action={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
          />
        </div>
      </div>

      <div className="flex flex-col gap-5">
        <h2 className="text-xl font-semibold tracking-tight px-1">
          Data & Security
        </h2>
        <div className="rounded-[1.5rem] bg-background border border-border/40 overflow-hidden flex flex-col shadow-sm">
          <SettingRow
            icon={DownloadCloud}
            title="Export Data"
            desc="Download as CSV"
            action={<ChevronRight className="w-4 h-4 text-muted-foreground" />}
          />
          <div className="h-px bg-border/40" />
          <SettingRow
            icon={Trash2}
            title="Delete Account"
            desc="Permanently remove data"
            destructive
            action={<ChevronRight className="w-4 h-4 text-rose-500" />}
          />
        </div>
      </div>
    </motion.div>
  );
}
