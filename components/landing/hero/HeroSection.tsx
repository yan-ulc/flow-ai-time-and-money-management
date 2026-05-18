"use client";

import { motion, useMotionValue, useSpring } from "framer-motion";
import { useEffect, useRef } from "react";
import ShaderBackground from "../backgroun/background";
import { HeroCopy } from "./HeroCopy";


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
      className="relative min-h-screen overflow-hidden px-6 pb-20 pt-28 md:px-12 lg:px-20 bg-transparent"
    >
      {/* 
         The Shader Background: 
         - Using absolute inset-0 to fill the hero section.
         - By not using a negative z-index, it naturally sits on top of the page background but behind the z-10 content.
      */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
        <ShaderBackground />
        {/* Seamless transition gradient to match SpotlightSection background */}
        <div className="absolute bottom-0 left-0 right-0 h-56 bg-gradient-to-t from-[#05060a] to-transparent" />
      </div>

      {/* Decorative Orbs - reduced opacity to let shader shine through */}
      <motion.div
        className="absolute right-[-10%] top-[10%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]"
        style={{ x: smoothX, y: smoothY }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute left-[-10%] bottom-[5%] h-[400px] w-[400px] rounded-full bg-emerald-400/10 blur-[100px]"
        style={{ x: smoothX, y: smoothY }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center justify-center min-h-[50vh]">
        <HeroCopy />
      </div>
    </section>
  );
}
