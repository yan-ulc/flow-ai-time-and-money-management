"use client";

import type { ProfileAggregation, UserTone } from "../profileTypes";
import { AICompanionSection } from "./AICompanionSection";
import { FinancialIdentitySection } from "./FinancialIdentitySection";
import { PreferencesSecuritySection } from "./PreferencesSecuritySection";
import { RecentActivitySection } from "./RecentActivitySection";
import { SignOutSection } from "./SignOutSection";
import { SmartInsightsSection } from "./SmartInsightsSection";

export function ProfileColumns({
  agg,
  userTone,
  onToneChange,
  isDarkMode,
  onToggleTheme,
}: {
  agg: ProfileAggregation;
  userTone: UserTone;
  onToneChange: (tone: UserTone) => void;
  isDarkMode: boolean;
  onToggleTheme: () => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 flex flex-col gap-10">
        <FinancialIdentitySection agg={agg} />
        <AICompanionSection userTone={userTone} onToneChange={onToneChange} />
        <PreferencesSecuritySection
          isDarkMode={isDarkMode}
          onToggleTheme={onToggleTheme}
        />
      </div>

      <div className="flex flex-col gap-10">
        <SmartInsightsSection agg={agg} />
        <RecentActivitySection activityFeed={agg.activityFeed} />
        <SignOutSection />
      </div>
    </div>
  );
}
