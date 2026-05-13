"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";
import { HeroCopy } from "./HeroCopy";
import { HeroMockup } from "./HeroMockup";

export function HeroSection() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const smoothX = useSpring(x, { stiffness: 55, damping: 20 });
  const smoothY = useSpring(y, { stiffness: 55, damping: 20 });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleMove = (event: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      const offsetX = event.clientX - rect.left - rect.width / 2;
      const offsetY = event.clientY - rect.top - rect.height / 2;
      x.set((offsetX / rect.width) * 18);
      y.set((offsetY / rect.height) * 18);
    };

    const reset = () => {
      x.set(0);
      y.set(0);
    };

    container.addEventListener("mousemove", handleMove);
    container.addEventListener("mouseleave", reset);

    return () => {
      container.removeEventListener("mousemove", handleMove);
      container.removeEventListener("mouseleave", reset);
    };
  }, [x, y]);

  return (
    <section
      ref={containerRef}
      className="relative min-h-screen overflow-hidden px-6 pb-20 pt-28 md:px-12 lg:px-20"
    >
      <motion.div
        className="absolute right-[-20%] top-[10%] h-[420px] w-[420px] rounded-full bg-cyan-400/10 blur-3xl"
        style={{ x: smoothX, y: smoothY }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute left-[-15%] bottom-[5%] h-[360px] w-[360px] rounded-full bg-emerald-300/10 blur-3xl"
        style={{ x: smoothX, y: smoothY }}
        aria-hidden="true"
      />

      <div className="relative mx-auto flex max-w-6xl flex-col items-center gap-12 lg:flex-row lg:items-start lg:gap-16">
        <div className="w-full lg:w-1/2">
          <HeroCopy />
        </div>
        <div className="w-full lg:w-1/2">
          <HeroMockup />
        </div>
      </div>
    </section>
  );
}
