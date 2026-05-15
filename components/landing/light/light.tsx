"use client";
import React from "react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export function LampDemo() {
  return (
    <LampContainer>
      <motion.h1
        initial={{ opacity: 0.5, y: 100 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{
          delay: 0.3,
          duration: 0.8,
          ease: "easeInOut",
        }}
        className="mt-8 bg-gradient-to-br from-slate-300 to-slate-500 py-4 bg-clip-text text-center text-4xl font-medium tracking-tight text-transparent md:text-7xl"
      >
        Build lamps <br /> the right way
      </motion.h1>
    </LampContainer>
  );
}

export const LampContainer = ({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-[#03060b] w-full z-0",
        className
      )}
    >
      <div className="relative flex w-full flex-1 scale-y-125 items-center justify-center isolate z-0 ">
        {/* Main Trapezoidal Light Beam */}
        <motion.div
          initial={{ opacity: 0, height: "0rem", width: "10rem" }}
          whileInView={{ opacity: 1, height: "45rem", width: "60rem" }}
          transition={{
            delay: 0.3,
            duration: 1.5,
            ease: [0.16, 1, 0.3, 1],
          }}
          style={{
            background: "linear-gradient(to bottom, rgba(34, 211, 238, 0.12) 0%, transparent 90%)",
            clipPath: "polygon(40% 0%, 60% 0%, 100% 100%, 0% 100%)",
            maskImage: "radial-gradient(ellipse at 50% 0%, black 20%, transparent 80%)",
          }}
          className="absolute inset-auto z-10 blur-[80px]"
        />

        {/* Conic Edge Rays - Left */}
        <motion.div
          initial={{ opacity: 0, width: "15rem" }}
          whileInView={{ opacity: 0.3, width: "35rem" }}
          transition={{
            delay: 0.3,
            duration: 1,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto right-1/2 h-64 overflow-visible w-[35rem] bg-gradient-conic from-cyan-400/30 via-transparent to-transparent text-white [--conic-position:from_70deg_at_center_top] blur-[40px]"
        >
          <div className="absolute w-[100%] left-0 bg-[#03060b] h-48 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
          <div className="absolute w-48 h-[100%] left-0 bg-[#03060b] bottom-0 z-20 [mask-image:linear-gradient(to_right,white,transparent)]" />
        </motion.div>

        {/* Conic Edge Rays - Right */}
        <motion.div
          initial={{ opacity: 0, width: "15rem" }}
          whileInView={{ opacity: 0.3, width: "35rem" }}
          transition={{
            delay: 0.3,
            duration: 1,
            ease: "easeInOut",
          }}
          style={{
            backgroundImage: `conic-gradient(var(--conic-position), var(--tw-gradient-stops))`,
          }}
          className="absolute inset-auto left-1/2 h-64 w-[35rem] bg-gradient-conic from-transparent via-transparent to-cyan-400/30 text-white [--conic-position:from_290deg_at_center_top] blur-[40px]"
        >
          <div className="absolute w-48 h-[100%] right-0 bg-[#03060b] bottom-0 z-20 [mask-image:linear-gradient(to_left,white,transparent)]" />
          <div className="absolute w-[100%] right-0 bg-[#03060b] h-48 bottom-0 z-20 [mask-image:linear-gradient(to_top,white,transparent)]" />
        </motion.div>

        {/* Atmosphere & Depth */}
        <div className="absolute top-1/2 h-48 w-full translate-y-12 scale-x-150 bg-[#03060b] blur-2xl"></div>
        <div className="absolute top-1/2 z-50 h-48 w-full bg-transparent opacity-10 backdrop-blur-md"></div>
        
        {/* Source Glow */}
        <div className="absolute inset-auto z-50 h-36 w-[28rem] -translate-y-1/2 rounded-full bg-cyan-400/30 blur-3xl"></div>
        
        <motion.div
          initial={{ width: "8rem" }}
          whileInView={{ width: "16rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-30 h-36 w-64 -translate-y-[6rem] rounded-full bg-cyan-300/40 blur-2xl"
        ></motion.div>

        {/* Source Core Line */}
        <motion.div
          initial={{ width: "15rem" }}
          whileInView={{ width: "30rem" }}
          transition={{
            delay: 0.3,
            duration: 0.8,
            ease: "easeInOut",
          }}
          className="absolute inset-auto z-50 h-0.5 w-[30rem] -translate-y-[7rem] bg-cyan-300/60"
        ></motion.div>

        {/* Top Shadow Mask */}
        <div className="absolute inset-auto z-40 h-44 w-full -translate-y-[12.5rem] bg-[#03060b]"></div>
      </div>

      <div className="relative z-50 flex -translate-y-80 flex-col items-center px-5">
        {children}
      </div>
    </div>
  );
};
