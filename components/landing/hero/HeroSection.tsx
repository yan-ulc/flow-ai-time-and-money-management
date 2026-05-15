"use client";

import { motion } from "framer-motion";
import ShaderBackground from "../backgroun/background";
import { HeroCopy } from "./HeroCopy";

export function HeroSection() {
  return (
    <section className="relative min-h-[110vh] overflow-hidden px-6 pb-48 pt-28 md:px-12 lg:px-20 bg-transparent flex flex-col justify-center">
      {/* 
         The Shader Background: 
         - Using absolute inset-0 to fill the hero section.
         - By not using a negative z-index, it naturally sits on top of the page background but behind the z-10 content.
      */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <ShaderBackground />
        {/* Bottom Transition Gradient */}
        <div className="absolute inset-x-0 bottom-0 h-64 bg-gradient-to-t from-[#07090d] to-transparent" />
      </div>

      {/* Decorative Orbs - reduced opacity to let shader shine through */}
      <motion.div
        className="absolute right-[-10%] top-[10%] h-[500px] w-[500px] rounded-full bg-cyan-500/10 blur-[120px]"
        animate={{ opacity: [0.4, 0.6, 0.4] }}
        transition={{ duration: 16, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />
      <motion.div
        className="absolute left-[-10%] bottom-[5%] h-[400px] w-[400px] rounded-full bg-emerald-400/10 blur-[100px]"
        animate={{ opacity: [0.35, 0.55, 0.35] }}
        transition={{ duration: 18, repeat: Infinity, ease: "easeInOut" }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto flex max-w-4xl flex-col items-center justify-center">
        <HeroCopy />
      </div>
    </section>
  );
}
