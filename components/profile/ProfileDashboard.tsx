"use client";

import React, { useMemo } from "react";
import { useQuery, useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import { useUser, SignOutButton } from "@clerk/nextjs";
import { cn, formatCurrency } from "@/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { 
  User, Mail, Bell, Moon, Sun, Shield, LogOut, ChevronRight, Check, Activity, 
  Sparkles, BrainCircuit, Trash2, Zap, CircleDashed, CheckCircle2, Wallet,
  CreditCard, PieChart, DownloadCloud, ChevronDown
} from "lucide-react";
import { buildProfileAggregation } from "@/lib/profile-aggregation";
import { Transaction } from "@/lib/financial-aggregation";
import { format, isToday, isYesterday } from "date-fns";

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { staggerChildren: 0.1, delayChildren: 0.05 } 
  }
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

export function ProfileDashboard() {
  const { user: clerkUser } = useUser();
  const dbUser = useQuery(api.users.getUserByClerkId, clerkUser?.id ? { clerkId: clerkUser.id } : "skip");
  const finances = useQuery(api.finances.getFinances, dbUser ? { userId: dbUser._id } : "skip");
  const schedules = useQuery(api.schedules.getSchedules, dbUser ? { userId: dbUser._id } : "skip");
  const updateSettings = useMutation(api.users.updateUserSettings);

  const [isDarkMode, setIsDarkMode] = React.useState(false);

  React.useEffect(() => {
    setIsDarkMode(document.documentElement.classList.contains('dark'));
  }, []);

  const toggleTheme = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    if (newMode) document.documentElement.classList.add('dark');
    else document.documentElement.classList.remove('dark');
  };

  const handleToneChange = async (tone: "neutral" | "supportive" | "savage") => {
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
    return buildProfileAggregation(finances as Transaction[], schedules as any[]);
  }, [finances, schedules]);

  const isLoading = !dbUser || !agg;

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[50vh]">
        <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }}>
          <CircleDashed className="w-8 h-8 text-primary/40" />
        </motion.div>
      </div>
    );
  }

  const userTone = dbUser?.settings?.tone || "neutral";

  return (
    <motion.div 
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col h-full w-full max-w-6xl mx-auto p-4 md:p-8 gap-8 pb-32"
    >
      {/* 1. HERO SECTION */}
      <motion.div variants={itemVariants} className="flex flex-col lg:flex-row gap-10 rounded-[2.5rem] bg-gradient-to-br from-background to-muted/30 border border-border/50 p-8 md:p-10 shadow-sm relative overflow-hidden group min-h-[280px]">
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/10 blur-[100px] rounded-full transition-opacity duration-1000 opacity-40 group-hover:opacity-80" />
        <div className="absolute bottom-0 left-10 w-64 h-64 bg-blue-500/5 blur-[80px] rounded-full" />
        
        {/* Left: Identity Column */}
        <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-start lg:items-start gap-8 relative z-10 flex-shrink-0 text-center sm:text-left lg:w-[35%]">
          
          <div className="flex flex-col sm:flex-row lg:flex-col items-center sm:items-start gap-6 w-full">
            <motion.div whileHover={{ scale: 1.05 }} className="w-28 h-28 rounded-[2rem] bg-secondary border-4 border-background shadow-xl flex items-center justify-center overflow-hidden shrink-0 transition-all duration-500 hover:shadow-primary/20">
              {clerkUser?.imageUrl ? (
                <img src={clerkUser.imageUrl} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <User className="w-14 h-14 text-muted-foreground" />
              )}
            </motion.div>
            
            <div className="flex flex-col justify-center gap-1.5 flex-1">
              <h1 className="text-4xl font-bold tracking-tight text-foreground/95">{clerkUser?.fullName || "Flow User"}</h1>
              <div className="flex items-center justify-center sm:justify-start gap-2 text-sm text-muted-foreground font-medium">
                <Mail className="w-4 h-4 opacity-70" />
                <span>{clerkUser?.primaryEmailAddress?.emailAddress || "no-email@example.com"}</span>
              </div>
              <div className="inline-flex items-center justify-center sm:justify-start gap-2 px-3.5 py-1.5 rounded-full bg-emerald-500/10 text-emerald-600 text-[11px] font-bold uppercase tracking-wider mt-3 w-fit mx-auto sm:mx-0 border border-emerald-500/20">
                <Shield className="w-3.5 h-3.5" />
                Free Plan
              </div>
            </div>
          </div>

          <div className="hidden lg:block w-full h-px bg-border/50 my-2" />

          {/* AI Context & Streak */}
          <div className="flex flex-row flex-wrap items-center justify-center sm:justify-start gap-4 w-full">
            <p className="text-sm font-medium text-muted-foreground flex items-center gap-2 bg-background/50 px-3 py-1.5 rounded-xl border border-border/40 backdrop-blur-sm">
              <BrainCircuit className="w-4 h-4 text-primary" />
              <span className="text-foreground font-semibold">AI:</span> 
              {userTone.charAt(0).toUpperCase() + userTone.slice(1)} Mode
            </p>
            <div className="flex items-center gap-1.5 text-xs font-bold text-orange-500 bg-orange-500/10 px-3 py-1.5 rounded-xl border border-orange-500/20 backdrop-blur-sm">
              <Zap className="w-4 h-4" fill="currentColor" />
              5 Day Streak
            </div>
          </div>
        </div>

        <div className="hidden lg:block w-px bg-border/50 relative z-10 self-stretch my-4" />
        <div className="block lg:hidden w-full h-px bg-border/50 relative z-10" />

        {/* Right: Quick Stats Grid */}
        <div className="flex-1 w-full relative z-10 flex flex-col justify-center h-full">
          <div className="grid grid-cols-2 gap-4 lg:gap-5 h-full">
            <QuickStat title="Total Balance" value={formatCurrency(agg.totalBalance)} />
            <QuickStat title="Monthly Spend" value={formatCurrency(agg.monthlyExpense)} />
            <QuickStat title="Schedules Done" value={agg.schedulesCompleted} />
            <QuickStat title="Insights Used" value={agg.aiInsightsUsed} />
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* LEFT COLUMN: 2/3 width on desktop */}
        <div className="lg:col-span-2 flex flex-col gap-10">
          
          {/* 2. FINANCIAL IDENTITY */}
          <motion.div variants={itemVariants} className="flex flex-col gap-5">
            <div className="flex items-center gap-2 px-1">
              <PieChart className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold tracking-tight">Financial Identity</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Snapshot Card */}
              <div className="rounded-[1.5rem] bg-background border border-border/40 p-6 shadow-sm flex flex-col gap-4 group hover:shadow-md hover:border-border/60 transition-all duration-300">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Snapshot</span>
                  <span className={cn(
                    "px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider border",
                    agg.healthStatus === "Healthy" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                    agg.healthStatus === "Stable" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                    agg.healthStatus === "Warning" ? "bg-orange-500/10 text-orange-600 border-orange-500/20" :
                    "bg-rose-500/10 text-rose-600 border-rose-500/20"
                  )}>
                    {agg.healthStatus}
                  </span>
                </div>
                
                <div className="grid grid-cols-2 gap-y-4 gap-x-4 mt-2">
                  <div className="flex flex-col gap-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Income</p>
                    <p className="text-sm font-semibold text-emerald-500">{formatCurrency(agg.monthlyIncome)}</p>
                  </div>
                  <div className="flex flex-col gap-1">
                    <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">Expense</p>
                    <p className="text-sm font-semibold text-rose-500">{formatCurrency(agg.monthlyExpense)}</p>
                  </div>
                </div>

                <div className="mt-auto pt-4">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-wider mb-2">
                    <span className="text-muted-foreground">Savings Rate</span>
                    <span className={agg.savingsRate > 0 ? "text-emerald-500" : "text-rose-500"}>{agg.savingsRate.toFixed(1)}%</span>
                  </div>
                  <div className="w-full h-2 bg-muted/40 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(0, Math.min(100, agg.savingsRate))}%` }}
                      transition={{ duration: 1, ease: "easeOut", delay: 0.2 }}
                      className={cn("h-full rounded-full", agg.savingsRate > 20 ? "bg-emerald-500" : agg.savingsRate > 0 ? "bg-blue-500" : "bg-rose-500")} 
                    />
                  </div>
                </div>
              </div>

              {/* Personality Card */}
              <div className="rounded-[1.5rem] bg-gradient-to-br from-primary/5 to-transparent border border-border/40 p-6 shadow-sm flex flex-col relative overflow-hidden group hover:shadow-md hover:border-primary/20 transition-all duration-300">
                <BrainCircuit className="absolute top-6 right-6 w-32 h-32 text-primary/[0.03] group-hover:scale-110 group-hover:rotate-3 transition-transform duration-700" />
                <span className="text-xs font-bold uppercase tracking-wider text-primary mb-4 relative z-10">Spending Personality</span>
                <p className="text-base font-medium leading-relaxed relative z-10 text-foreground/90">
                  {agg.spendingPersonality}
                </p>
              </div>
            </div>
          </motion.div>

          {/* 3. AI COMPANION SETTINGS */}
          <motion.div variants={itemVariants} className="flex flex-col gap-5">
            <div className="flex items-center gap-2 px-1">
              <BrainCircuit className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold tracking-tight">AI Companion</h2>
            </div>
            
            <div className="rounded-[1.5rem] bg-background border border-border/40 p-6 shadow-sm flex flex-col gap-6">
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-semibold text-base">Personality Matrix</h3>
                  <p className="text-sm text-muted-foreground mt-1">How should FlowAI talk to you?</p>
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
                  onClick={() => handleToneChange("neutral")} 
                />
                <PersonalityCard 
                  title="Supportive" 
                  desc="Encouraging, warm, gentle." 
                  active={userTone === "supportive"} 
                  onClick={() => handleToneChange("supportive")} 
                />
                <PersonalityCard 
                  title="Savage" 
                  desc="Direct, sarcastic, strict." 
                  active={userTone === "savage"} 
                  onClick={() => handleToneChange("savage")} 
                />
              </div>
              
              <div className="h-px bg-border/40 my-2" />
              
              <div className="flex flex-col gap-4">
                <SettingToggle title="Proactive Insights" desc="Allow AI to analyze your behavior and suggest changes." defaultOn={true} />
                <SettingToggle title="Strict Budget Warnings" desc="AI will aggressively warn you when near limits." defaultOn={userTone === "savage"} />
              </div>

            </div>
          </motion.div>

          {/* 4. PREFERENCES & SECURITY */}
          <motion.div variants={itemVariants} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-semibold tracking-tight px-1">App Preferences</h2>
              <div className="rounded-[1.5rem] bg-background border border-border/40 overflow-hidden flex flex-col shadow-sm">
                <SettingRow icon={isDarkMode ? Moon : Sun} title={isDarkMode ? "Dark Mode" : "Light Mode"} desc="Interface theme" action={<ToggleSwitch isOn={isDarkMode} onToggle={toggleTheme} />} />
                <div className="h-px bg-border/40" />
                <SettingRow icon={Bell} title="Notifications" desc="Manage alerts" action={<ChevronRight className="w-4 h-4 text-muted-foreground" />} />
              </div>
            </div>

            <div className="flex flex-col gap-5">
              <h2 className="text-xl font-semibold tracking-tight px-1">Data & Security</h2>
              <div className="rounded-[1.5rem] bg-background border border-border/40 overflow-hidden flex flex-col shadow-sm">
                <SettingRow icon={DownloadCloud} title="Export Data" desc="Download as CSV" action={<ChevronRight className="w-4 h-4 text-muted-foreground" />} />
                <div className="h-px bg-border/40" />
                <SettingRow icon={Trash2} title="Delete Account" desc="Permanently remove data" destructive action={<ChevronRight className="w-4 h-4 text-rose-500" />} />
              </div>
            </div>
          </motion.div>

        </div>

        {/* RIGHT COLUMN: 1/3 width on desktop */}
        <div className="flex flex-col gap-10">
          
          {/* SMART INSIGHTS FEED */}
          <motion.div variants={itemVariants} className="flex flex-col gap-5">
            <div className="flex items-center gap-2 px-1">
              <Sparkles className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-semibold tracking-tight">Smart Insights</h2>
            </div>
            <div className="flex flex-col gap-3">
              <AnimatePresence mode="popLayout">
                {[
                  agg.healthStatus === "Warning" && {
                    id: "insight-warning",
                    type: "warning" as const,
                    text: "Your expenses have exceeded your income this month. Be careful.",
                    delay: 0.1
                  },
                  agg.topCategory !== "general" && {
                    id: "insight-top-cat",
                    type: "neutral" as const,
                    text: `We noticed ${agg.topCategory} is your biggest expense right now. Consider reviewing those schedules.`,
                    delay: 0.2
                  },
                  agg.savingsRate > 10 && {
                    id: "insight-savings",
                    type: "success" as const,
                    text: "Great job! Your savings rate is very healthy. Keep up the momentum.",
                    delay: 0.3
                  },
                  (agg.healthStatus === "Stable" && agg.savingsRate <= 10) && {
                    id: "insight-stable",
                    type: "neutral" as const,
                    text: "Your cash flow is stable, but there is room to improve your savings rate.",
                    delay: 0.4
                  }
                ].filter(Boolean).map((insight: any) => (
                  <motion.div 
                    key={insight.id} 
                    initial={{ opacity: 0, y: 10 }} 
                    animate={{ opacity: 1, y: 0 }} 
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: insight.delay }}
                  >
                    <InsightCard type={insight.type} text={insight.text} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </motion.div>

          {/* RECENT ACTIVITY */}
          <motion.div variants={itemVariants} className="flex flex-col gap-5 h-full">
            <div className="flex items-center gap-2 px-1">
              <Activity className="w-5 h-5 text-muted-foreground" />
              <h2 className="text-xl font-semibold tracking-tight">Recent Activity</h2>
            </div>
            
            <div className="rounded-[1.5rem] bg-background border border-border/40 p-6 shadow-sm flex-1">
              <div className="flex flex-col relative before:absolute before:inset-y-2 before:left-3.5 before:w-px before:bg-border/60 gap-8">
                {agg.activityFeed.length === 0 ? (
                  <p className="text-sm text-muted-foreground pl-12">No recent activity.</p>
                ) : (
                  agg.activityFeed.map((item, i) => {
                    const isPositive = item.semanticType === "positive";
                    return (
                      <motion.div 
                        key={`${item.id}-${i}`} 
                        initial={{ opacity: 0, x: -10 }} 
                        animate={{ opacity: 1, x: 0 }} 
                        transition={{ delay: 0.1 * i }}
                        className="relative pl-12 group cursor-default"
                      >
                        <div className={cn(
                          "absolute left-0 top-0.5 w-7 h-7 rounded-full border-2 border-background flex items-center justify-center transition-transform duration-300 group-hover:scale-110 shadow-sm",
                          isPositive ? "bg-emerald-500/10 text-emerald-600 border-emerald-50" : "bg-rose-500/10 text-rose-600 border-rose-50"
                        )}>
                          {item.type === "schedule" ? <CheckCircle2 className="w-3.5 h-3.5" /> : 
                           isPositive ? <Wallet className="w-3.5 h-3.5" /> : <CreditCard className="w-3.5 h-3.5" />}
                        </div>
                        <div className="flex flex-col">
                          <span className="text-sm font-semibold">{item.title}</span>
                          <span className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.description}</span>
                          <span className="text-[10px] text-muted-foreground/60 mt-1.5 font-bold uppercase tracking-wider">
                            {isToday(item.dateObj) ? 'Today' : isYesterday(item.dateObj) ? 'Yesterday' : format(item.dateObj, "MMM d")} • {format(item.dateObj, "HH:mm")}
                          </span>
                        </div>
                      </motion.div>
                    );
                  })
                )}
              </div>
            </div>
          </motion.div>

          <motion.div variants={itemVariants} className="mt-auto pt-6 border-t border-border/40">
            <SignOutButton>
              <button className="flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-rose-500 hover:bg-rose-500/10 hover:border-rose-500/20 border border-transparent transition-all duration-300 w-full font-semibold bg-rose-500/5 group">
                <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" /> Sign Out
              </button>
            </SignOutButton>
          </motion.div>

        </div>
      </div>
    </motion.div>
  );
}

function QuickStat({ title, value }: { title: string, value: string | number }) {
  return (
    <div className="bg-background/80 backdrop-blur-md border border-border/40 rounded-2xl p-5 flex flex-col justify-center transition-all duration-300 hover:shadow-md hover:border-border/60 hover:-translate-y-0.5 h-full min-h-[100px]">
      <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground mb-2">{title}</span>
      <span className="text-xl sm:text-2xl font-bold text-foreground tracking-tight line-clamp-1">{value}</span>
    </div>
  );
}

function PersonalityCard({ title, desc, active, onClick }: { title: string, desc: string, active: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "flex flex-col items-start p-4 rounded-xl border text-left transition-all duration-300",
        active 
          ? "bg-primary/5 border-primary/40 ring-1 ring-primary/20 shadow-sm transform -translate-y-0.5" 
          : "bg-muted/10 border-border/40 hover:bg-muted/30 hover:-translate-y-0.5 hover:shadow-sm"
      )}
    >
      <div className="flex items-center justify-between w-full mb-2">
        <span className={cn("font-semibold text-sm", active ? "text-primary" : "text-foreground")}>{title}</span>
        <AnimatePresence mode="popLayout">
          {active && (
            <motion.div key="check-icon" initial={{ scale: 0 }} animate={{ scale: 1 }} exit={{ scale: 0 }}>
              <Check className="w-4 h-4 text-primary" />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="text-xs text-muted-foreground">{desc}</p>
    </button>
  );
}

function SettingRow({ icon: Icon, title, desc, action, destructive }: any) {
  return (
    <div className="flex items-center justify-between p-4 hover:bg-muted/30 transition-colors cursor-pointer group">
      <div className="flex items-center gap-4">
        <div className={cn("p-2.5 rounded-lg transition-colors", destructive ? "bg-rose-500/10 text-rose-500 group-hover:bg-rose-500/20" : "bg-muted text-foreground group-hover:bg-primary/10 group-hover:text-primary")}>
          <Icon className="w-4 h-4" />
        </div>
        <div className="flex flex-col">
          <span className={cn("font-semibold text-sm", destructive && "text-rose-500")}>{title}</span>
          <span className="text-xs text-muted-foreground">{desc}</span>
        </div>
      </div>
      <div className={cn("transition-transform duration-300", destructive ? "group-hover:translate-x-1" : "group-hover:translate-x-1")}>{action}</div>
    </div>
  );
}

function SettingToggle({ title, desc, defaultOn }: { title: string, desc: string, defaultOn: boolean }) {
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

function ToggleSwitch({ isOn, onToggle }: { isOn: boolean, onToggle: () => void }) {
  return (
    <button 
      onClick={onToggle}
      className={cn(
        "w-11 h-6 rounded-full relative transition-colors duration-300 shrink-0",
        isOn ? "bg-primary" : "bg-muted-foreground/30"
      )}
    >
      <motion.div 
        animate={{ x: isOn ? 22 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-sm" 
      />
    </button>
  );
}

function InsightCard({ type, text }: { type: "warning" | "success" | "neutral", text: string }) {
  return (
    <div className={cn(
      "p-4 rounded-[1rem] border text-sm font-medium leading-relaxed shadow-sm transition-all duration-300 hover:shadow-md hover:-translate-y-0.5",
      type === "warning" ? "bg-orange-500/5 border-orange-500/20 text-orange-700 dark:text-orange-300" :
      type === "success" ? "bg-emerald-500/5 border-emerald-500/20 text-emerald-700 dark:text-emerald-300" :
      "bg-muted/30 border-border/50 text-foreground"
    )}>
      {text}
    </div>
  );
}
