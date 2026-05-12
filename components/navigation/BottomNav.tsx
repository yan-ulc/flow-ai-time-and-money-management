"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { Sparkles, BarChart2, Calendar as CalendarIcon, User, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import { QuickAddModal } from "./QuickAddModal";

export function BottomNav() {
  const pathname = usePathname();
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);

  const navItems = [
    { name: "AI", href: "/app", icon: Sparkles },
    { name: "Stats", href: "/app/stats", icon: BarChart2 },
    // Center button is handled separately
    { name: "Calendar", href: "/app/calendar", icon: CalendarIcon },
    { name: "Profile", href: "/app/profile", icon: User },
  ];

  return (
    <>
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center justify-center">
        {/* Floating Dock */}
        <motion.div 
          initial={{ y: 100, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ type: "spring", stiffness: 260, damping: 20 }}
          className="flex items-center gap-1 md:gap-2 px-3 py-2 rounded-full bg-background/60 backdrop-blur-xl border border-border/50 shadow-2xl shadow-black/10 dark:shadow-black/40"
        >
          {navItems.slice(0, 2).map((item) => {
            const isActive = pathname === item.href;
            return (
              <NavItem 
                key={item.name} 
                item={item} 
                isActive={isActive} 
              />
            );
          })}

          {/* Center Orb (Quick Add) */}
          <button 
            onClick={() => setIsQuickAddOpen(true)}
            className="group relative flex items-center justify-center w-12 h-12 md:w-14 md:h-14 mx-1 md:mx-2 rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 focus-visible:ring-offset-background"
          >
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary to-blue-500 opacity-80 blur-md group-hover:opacity-100 transition-opacity duration-300" />
            <div className="absolute inset-[1px] rounded-full bg-background z-10" />
            <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-primary/20 to-blue-500/20 z-10" />
            <Plus className="w-6 h-6 md:w-7 md:h-7 text-primary z-20 transition-transform duration-300 group-hover:rotate-90 group-hover:scale-110" />
          </button>

          {navItems.slice(2, 4).map((item) => {
            const isActive = pathname === item.href;
            return (
              <NavItem 
                key={item.name} 
                item={item} 
                isActive={isActive} 
              />
            );
          })}
        </motion.div>
      </div>

      {/* Quick Add Modal */}
      <QuickAddModal open={isQuickAddOpen} onOpenChange={setIsQuickAddOpen} />
    </>
  );
}

// Sub-component for individual nav items
function NavItem({ item, isActive }: { item: any, isActive: boolean }) {
  const Icon = item.icon;
  
  return (
    <Link 
      href={item.href}
      className={cn(
        "relative flex flex-col items-center justify-center w-14 h-12 md:w-16 rounded-full transition-colors duration-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2",
        isActive ? "text-primary" : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
      )}
    >
      <div className="relative z-10 flex flex-col items-center justify-center gap-1">
        <Icon className={cn(
          "w-5 h-5 transition-transform duration-200",
          isActive && "scale-110"
        )} />
        <span className={cn(
          "text-[10px] font-medium transition-all duration-200",
          isActive ? "opacity-100 translate-y-0" : "opacity-0 translate-y-1 absolute bottom-0"
        )}>
          {item.name}
        </span>
      </div>
      
      {/* Active Indicator Blob */}
      {isActive && (
        <motion.div
          layoutId="bottomNavActiveBlob"
          className="absolute inset-0 rounded-full bg-primary/10 -z-0"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
        />
      )}
    </Link>
  );
}
