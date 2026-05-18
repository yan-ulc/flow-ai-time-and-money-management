"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowUp } from "lucide-react";

const AiAvatar = () => (
  <div className="w-8 h-8 shrink-0 flex items-center justify-center rounded-full bg-zinc-950 border border-zinc-800 shadow-sm">
    <span className="text-[10px] font-bold tracking-widest text-zinc-200">AI</span>
  </div>
);

const CONVERSATION = [
  { id: 1, role: "user", text: "I have a meeting with the design team tomorrow at 2 PM." },
  { id: 2, role: "ai", text: "Got it. I've scheduled 'Design Team Meeting' for tomorrow at 2:00 PM." },
  { id: 3, role: "user", text: "How much have I spent this week?" },
  { id: 4, role: "ai", text: "You've spent $350 this week. You still have 40% of your weekly budget remaining, you're doing great." },
];

export function HowItWorksSection() {
  const [visibleCount, setVisibleCount] = useState(0);

  useEffect(() => {
    let timeout: NodeJS.Timeout;
    
    const nextStep = (current: number) => {
      if (current > CONVERSATION.length) {
        // Wait before resetting
        timeout = setTimeout(() => {
          setVisibleCount(0);
          timeout = setTimeout(() => nextStep(1), 800);
        }, 5000);
      } else {
        setVisibleCount(current);
        // Vary the typing delay: AI takes slightly longer to reply to complex things
        const delay = current % 2 === 0 ? 2500 : 1800;
        timeout = setTimeout(() => nextStep(current + 1), delay);
      }
    };
    
    timeout = setTimeout(() => nextStep(1), 1000);
    return () => clearTimeout(timeout);
  }, []);

  const visibleMessages = CONVERSATION.slice(0, visibleCount);

  return (
    <section className="py-24 md:py-32 relative bg-background border-t border-white/5">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.08] tracking-tight text-slate-100 mb-8 drop-shadow-sm">
          Just Chat. We Do The Rest.
        </h2>
        <p className="text-base md:text-lg text-slate-300/80 leading-relaxed font-light mb-16 max-w-2xl mx-auto">
          No complex menus or confusing dashboards. Tell FlowAI what you need, and it instantly organizes your finances and schedule.
        </p>

        <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6 md:p-10 max-w-2xl mx-auto flex flex-col gap-5 shadow-2xl relative overflow-hidden min-h-[420px] md:min-h-[460px]">
          {/* Subtle top glow to make it look premium */}
          <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
          
          <div className="flex flex-col gap-4 w-full h-full justify-end pb-16">
            <AnimatePresence initial={false}>
              {visibleMessages.map((msg) => (
                <motion.div
                  layout
                  key={msg.id}
                  initial={{ opacity: 0, y: 20, scale: 0.8, transformOrigin: msg.role === "user" ? "bottom right" : "bottom left" }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                  transition={{ type: "spring", stiffness: 250, damping: 25 }}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start items-end gap-3"}`}
                >
                  {msg.role === "ai" && <AiAvatar />}
                  
                  <div 
                    className={`px-5 py-4 max-w-[85%] text-left text-sm md:text-base shadow-sm ${
                      msg.role === "user" 
                        ? "bg-zinc-800 text-zinc-100 rounded-2xl rounded-tr-sm font-medium" 
                        : "bg-zinc-100 text-zinc-900 rounded-2xl rounded-tl-sm font-semibold"
                    }`}
                  >
                    {msg.text}
                  </div>
                </motion.div>
              ))}
              
              {/* Typing Indicator */}
              {visibleCount > 0 && visibleCount < CONVERSATION.length && visibleCount % 2 !== 0 && (
                <motion.div
                  layout
                  key="typing"
                  initial={{ opacity: 0, y: 15, scale: 0.8, transformOrigin: "bottom left" }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8, transition: { duration: 0.2 } }}
                  transition={{ type: "spring", stiffness: 250, damping: 25 }}
                  className="flex justify-start items-end gap-3"
                >
                  <AiAvatar />
                  <div className="bg-zinc-100 text-zinc-900 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm flex items-center gap-1.5 h-[42px]">
                    <motion.span animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0 }} className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
                    <motion.span animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.2 }} className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
                    <motion.span animate={{ opacity: [0.3, 1, 0.3], y: [0, -3, 0] }} transition={{ duration: 1, repeat: Infinity, delay: 0.4 }} className="w-1.5 h-1.5 bg-zinc-500 rounded-full" />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* Floating Chat Input Mockup */}
          <motion.div 
            layout
            className="absolute bottom-6 left-6 right-6 md:bottom-8 md:left-10 md:right-10 flex items-center gap-2 bg-zinc-950 border border-zinc-800 rounded-full p-2 pr-2.5 shadow-xl"
          >
            <div className="flex-1 px-4 py-1 text-sm text-zinc-500 font-medium truncate text-left">
              {visibleCount === 0 
                ? "I have a meeting with the design team..."
                : visibleCount === 2
                  ? "How much have I spent this week?"
                  : "Message FlowAI..."}
            </div>
            <div className="w-8 h-8 rounded-full bg-zinc-100 flex items-center justify-center shrink-0 shadow-sm transition-transform hover:scale-105">
              <ArrowUp className="w-4 h-4 text-zinc-900" strokeWidth={3} />
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
