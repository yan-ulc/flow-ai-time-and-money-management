"use client";

import React from "react";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Button } from "./ui/button";
import { Menu, TrendingUp, Zap } from "lucide-react";
import { Sidebar } from "./sidebar/Sidebar";
import { InsightPanel } from "./insight/InsightPanel";

export function MobileHeader() {
  return (
    <div className="flex items-center justify-between p-4 border-b bg-background md:hidden">
      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="md:hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Open Menu</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="w-80 p-0 border-r-0">
          <Sidebar />
        </SheetContent>
      </Sheet>

      <div className="flex items-center gap-2 font-bold text-lg tracking-tight">
        <Zap className="h-5 w-5 text-primary fill-primary" />
        <span>FlowAi</span>
      </div>

      <Sheet>
        <SheetTrigger asChild>
          <Button variant="ghost" size="icon" className="lg:hidden">
            <TrendingUp className="h-5 w-5" />
            <span className="sr-only">Open Insights</span>
          </Button>
        </SheetTrigger>
        <SheetContent side="right" className="w-80 p-0 sm:max-w-[400px]">
          <InsightPanel />
        </SheetContent>
      </Sheet>
    </div>
  );
}
