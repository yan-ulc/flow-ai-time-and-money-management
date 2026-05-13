"use client";

import { api } from "@/convex/_generated/api";
import { Transaction } from "@/lib/financial-aggregation";
import { buildProfileAggregation } from "@/lib/profile-aggregation";
import { useUser } from "@clerk/nextjs";
import { useMutation, useQuery } from "convex/react";
import { motion } from "framer-motion";
import React, { useMemo } from "react";
import { toast } from "sonner";
import { containerVariants } from "./motionVariants";
import type { UserTone } from "./profileTypes";
import { ProfileColumns, ProfileHero, ProfileLoadingState } from "./sections";

export function ProfileDashboard() {
  const { user: clerkUser } = useUser();
  const dbUser = useQuery(
    api.users.getUserByClerkId,
    clerkUser?.id ? { clerkId: clerkUser.id } : "skip",
  );
  const finances = useQuery(
    api.finances.getFinances,
    dbUser ? { userId: dbUser._id } : "skip",
  );
  const schedules = useQuery(
    api.schedules.getSchedules,
    dbUser ? { userId: dbUser._id } : "skip",
  );
  const updateSettings = useMutation(api.users.updateUserSettings);

  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains("dark"));
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const handleToneChange = async (tone: UserTone) => {
    if (!dbUser) return;
    try {
      await updateSettings({ userId: dbUser._id, settings: { tone } });
      toast.success(`AI Tone updated to ${tone}`);
    } catch (error) {
      toast.error("Failed to update tone");
    }
  };

  const agg = useMemo(() => {
    if (!finances || !schedules) return null;
    return buildProfileAggregation(
      finances as Transaction[],
      schedules as any[],
    );
  }, [finances, schedules]);

  const isLoading = !dbUser || !agg;

  if (isLoading) {
    return <ProfileLoadingState />;
  }

  const userTone = dbUser?.settings?.tone || "neutral";

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full w-full max-w-6xl mx-auto p-4 md:p-8 gap-8 pb-32"
    >
      <ProfileHero clerkUser={clerkUser} userTone={userTone} agg={agg} />
      <ProfileColumns
        agg={agg}
        userTone={userTone}
        onToneChange={handleToneChange}
        isDarkMode={isDarkMode}
        onToggleTheme={toggleTheme}
      />
    </motion.div>
  );
}
