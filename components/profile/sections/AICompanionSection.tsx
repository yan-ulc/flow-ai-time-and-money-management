"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Check } from "lucide-react";
import { itemVariants } from "../motionVariants";
import type { UserTone } from "../profileTypes";
import { PersonalityCard } from "../ui/PersonalityCard";
import { SettingToggle } from "../ui/SettingToggle";

export function AICompanionSection({
  userTone,
  onToneChange,
}: {
  userTone: UserTone;
  onToneChange: (tone: UserTone) => void;
}) {
  return (
    <motion.div variants={itemVariants} className="flex flex-col gap-5">
      <div className="flex items-center gap-2 px-1">
        <BrainCircuit className="w-5 h-5 text-muted-foreground" />
        <h2 className="text-xl font-semibold tracking-tight">AI Companion</h2>
      </div>

      <div className="rounded-[1.5rem] bg-background border border-border/40 p-6 shadow-sm flex flex-col gap-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="font-semibold text-base">Personality Matrix</h3>
            <p className="text-sm text-muted-foreground mt-1">
              How should FlowAI talk to you?
            </p>
          </div>
          <div className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-bold flex items-center gap-1.5 border border-primary/20">
            <Check className="w-3.5 h-3.5" /> Memory Enabled
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <PersonalityCard
            title="Neutral"
            desc="Clear, concise, data-driven."
            active={userTone === "neutral"}
            onClick={() => onToneChange("neutral")}
          />
          <PersonalityCard
            title="Supportive"
            desc="Encouraging, warm, gentle."
            active={userTone === "supportive"}
            onClick={() => onToneChange("supportive")}
          />
          <PersonalityCard
            title="Savage"
            desc="Direct, sarcastic, strict."
            active={userTone === "savage"}
            onClick={() => onToneChange("savage")}
          />
        </div>

        <div className="h-px bg-border/40 my-2" />

        <div className="flex flex-col gap-4">
          <SettingToggle
            title="Proactive Insights"
            desc="Allow AI to analyze your behavior and suggest changes."
            defaultOn={true}
          />
          <SettingToggle
            title="Strict Budget Warnings"
            desc="AI will aggressively warn you when near limits."
            defaultOn={userTone === "savage"}
          />
        </div>
      </div>
    </motion.div>
  );
}
