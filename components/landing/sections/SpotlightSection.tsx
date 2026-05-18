"use client";

import { useEffect, useRef, useState, useCallback, useId, useMemo } from "react";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { cn } from "@/lib/utils";

// ─── Types & Configuration ───────────────────────────────────────────────────

interface LightingProfile {
  beamColor: string;
  hazeColor: string;
  fringeColor?: string;
  poolColor: string;
  accentColor: string;
}

interface SpotlightSectionProps {
  id: string;
  gifPath: string;
  headline: string;
  subheadline: string;
  layout?: "left" | "right" | "center";
  profile: LightingProfile;
  config?: {
    angleDeg?: number;
    coneAngle?: number;
    reachR?: number;
    intensity?: number;
    sourceYr?: number;
  };
  lightOffset?: number;
  contentOffset?: number;
  contentOffsetY?: number;
}

interface DustParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  opacityTarget: number;
  opacitySpeed: number;
  life: number;
}

// ─── Component ───────────────────────────────────────────────────────────────

export function SpotlightSection({
  id,
  gifPath,
  headline,
  subheadline,
  layout = "left",
  profile,
  config: userConfig,
  lightOffset = 0,
  contentOffset = 0,
  contentOffsetY = 0,
}: SpotlightSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const gifContainerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<DustParticle[]>([]);
  const gifCenterRef = useRef<number>(0);
  const [dims, setDims] = useState({ w: 1200, h: 800 });
  const uid = useId();

  // ─── Core Geometry Config ───
  const config = useMemo(() => ({
    sourceXr: 0.5, 
    sourceYr: 0.05, // Lowered source so the lamp fixture is visible from the ceiling
    angleDeg: 0, // Perfectly vertical for all sections
    coneAngle: 24,
    reachR: 0.72,
    intensity: 1.3,
    ...userConfig
  }), [userConfig]);

  const getSourceX = useCallback(() => {
    return gifCenterRef.current + lightOffset;
  }, [lightOffset]);

  const getGeom = useCallback((w: number, h: number, driftDeg: number) => {
    const ar = ((config.angleDeg + driftDeg) * Math.PI) / 180;
    const sx = getSourceX();
    const sy = config.sourceYr * h;
    const reach = (config.reachR * h) + contentOffsetY;
    const cr = (config.coneAngle * Math.PI) / 180;
    const tipX = sx + Math.sin(ar) * reach;
    const tipY = sy + Math.cos(ar) * reach;
    const hw = Math.tan(cr) * reach;
    const px = Math.cos(ar), py = -Math.sin(ar);
    const nw = 8;
    return { sx, sy, tipX, tipY, hw, px, py, nw, ar, reach, cr };
  }, [config, getSourceX]);

  const getPointsString = (g: any, scale = 1) => {
    const { sx, sy, tipX, tipY, hw, px, py, nw } = g;
    return [
      [sx - px * nw, sy - py * nw],
      [sx + px * nw, sy + py * nw],
      [tipX + px * hw * scale, tipY + py * hw * scale],
      [tipX - px * hw * scale, tipY - py * hw * scale],
    ].map(p => p.join(',')).join(' ');
  };

  const spawnParticle = useCallback((g: any, progress = 0) => {
    const { sx, sy, ar, reach, cr } = g;
    const t2 = 0.1 + Math.random() * 0.9;
    const bx = sx + Math.sin(ar) * reach * t2;
    const by = sy + Math.cos(ar) * reach * t2;
    const hw2 = Math.tan(cr) * reach * t2;
    const sp = (Math.random() - 0.5) * 2 * hw2 * 0.85;
    return {
      x: bx + Math.cos(ar) * sp,
      y: by - Math.sin(ar) * sp,
      vx: (Math.random() - 0.5) * 0.18,
      vy: -0.05 - Math.random() * 0.12,
      size: 0.5 + Math.random() * 1.3,
      opacity: 0,
      opacityTarget: 0.03 + Math.random() * 0.12,
      opacitySpeed: 0.003 + Math.random() * 0.005,
      life: progress,
    };
  }, []);

  useEffect(() => {
    const svg = svgRef.current;
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!svg || !canvas || !container) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let w = container.clientWidth;
    let h = container.clientHeight;
    let lastT = performance.now();
    let totalT = 0;
    let rafId: number;
    let isVisible = false;

    const io = new IntersectionObserver(
      (entries) => {
        isVisible = entries[0].isIntersecting;
      },
      { threshold: 0 }
    );
    io.observe(container);

    const resize = () => {
      w = container.clientWidth;
      h = container.clientHeight;
      setDims({ w, h });
      canvas.width = w;
      canvas.height = h;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      
      // Calculate exact center of the GIF for perfect lighting alignment
      if (gifContainerRef.current) {
        const cRect = container.getBoundingClientRect();
        const gRect = gifContainerRef.current.getBoundingClientRect();
        gifCenterRef.current = (gRect.left - cRect.left) + gRect.width / 2;
      } else {
        let base = w * 0.5;
        if (layout === "left") base = w * 0.25;
        if (layout === "right") base = w * 0.75;
        gifCenterRef.current = base + contentOffset;
      }

      const g = getGeom(w, h, 0);
      particlesRef.current = Array.from({ length: 45 }, () => spawnParticle(g, Math.random()));
    };

    const update = (now: number) => {
      const dt = (now - lastT) / 1000;
      lastT = now;
      
      if (!isVisible) {
        rafId = requestAnimationFrame(update);
        return;
      }
      
      totalT += dt;

      const flicker = 0.98 + 0.02 * Math.sin(totalT * 10.5);
      const drift = 0.85 * Math.sin(totalT * 0.22) + 0.45 * Math.sin(totalT * 0.38 + 1.2);
      const bloom = 1 + 0.03 * Math.sin(totalT * 1.8);

      const g = getGeom(w, h, drift);
      const { sx, sy, tipX, tipY, hw, px, py, nw, ar, reach, cr } = g;

      // Update SVG Gradients & Layers
      const beamGrad = svg.getElementById(`beamGrad-${uid}`);
      if (beamGrad) {
        beamGrad.setAttribute('x1', sx.toString()); beamGrad.setAttribute('y1', sy.toString());
        beamGrad.setAttribute('x2', tipX.toString()); beamGrad.setAttribute('y2', tipY.toString());
      }
      const hazeGrad = svg.getElementById(`hazeGrad-${uid}`);
      if (hazeGrad) {
        hazeGrad.setAttribute('x1', sx.toString()); hazeGrad.setAttribute('y1', sy.toString());
        hazeGrad.setAttribute('x2', tipX.toString()); hazeGrad.setAttribute('y2', tipY.toString());
      }
      const poolGrad = svg.getElementById(`poolGrad-${uid}`);
      if (poolGrad) {
        poolGrad.setAttribute('cx', tipX.toString()); poolGrad.setAttribute('cy', tipY.toString());
        poolGrad.setAttribute('rx', (hw * 0.8).toString()); poolGrad.setAttribute('ry', (hw * 0.2).toString());
      }

      svg.getElementById(`beamLayer-${uid}`)?.setAttribute('points', getPointsString(g, 1));
      svg.getElementById(`hazeLayer-${uid}`)?.setAttribute('points', getPointsString(g, 1.45));
      
      const pO = svg.getElementById(`poolOuter-${uid}`);
      if (pO) {
        pO.setAttribute('cx', tipX.toString()); pO.setAttribute('cy', tipY.toString());
        pO.setAttribute('rx', (hw * 0.8).toString()); pO.setAttribute('ry', (hw * 0.2).toString());
      }

      const bc = svg.getElementById(`bloomCore-${uid}`);
      if (bc) {
        bc.setAttribute('cx', sx.toString()); bc.setAttribute('cy', sy.toString());
        bc.setAttribute('r', (6 * bloom).toString());
      }

      // Update Lamp Fixture
      const lamp = svg.getElementById(`lampFixture-${uid}`);
      if (lamp) {
        lamp.setAttribute('transform', `translate(${sx}, ${sy})`);
      }
      const lampRim = svg.getElementById(`lampRim-${uid}`);
      if (lampRim) {
        lampRim.setAttribute('opacity', (0.7 * flicker).toString());
      }
      const lampBulb = svg.getElementById(`lampBulb-${uid}`);
      if (lampBulb) {
        lampBulb.setAttribute('opacity', (0.95 * flicker).toString());
      }

      // Dust Rendering
      ctx.clearRect(0, 0, w, h);
      particlesRef.current.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 0.0016;

        if (p.opacity < p.opacityTarget) p.opacity += p.opacitySpeed;
        else p.opacity -= p.opacitySpeed * 0.55;

        const dx = p.x - sx, dy = p.y - sy;
        const tVal = (dx * Math.sin(ar) + dy * Math.cos(ar)) / reach;
        const perp = Math.abs(-dx * Math.cos(ar) + dy * Math.sin(ar));
        const phw = Math.tan(cr) * reach * tVal;

        if (tVal < 0 || tVal > 1.05 || perp > phw * 1.15 || p.life > 1) {
          particlesRef.current[i] = spawnParticle(g);
          return;
        }

        const fo = p.opacity * flicker * config.intensity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = profile.beamColor.replace(')', `, ${fo})`).replace('rgb', 'rgba');
        ctx.fill();
      });

      rafId = requestAnimationFrame(update);
    };

    const ro = new ResizeObserver(resize);
    ro.observe(container);
    resize();
    rafId = requestAnimationFrame(update);

    return () => {
      ro.disconnect();
      io.disconnect();
      cancelAnimationFrame(rafId);
    };
  }, [uid, getGeom, spawnParticle, config.intensity, profile.beamColor]);

  // ─── Animation Hooks ───
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const gifScale = useTransform(scrollYProgress, [0.15, 0.45], [0.94, 1]);
  const gifOpacity = useTransform(scrollYProgress, [0, 0.25, 0.75, 1], [0, 1, 1, 0]);
  const gifRotate = useTransform(scrollYProgress, [0.1, 0.5], [1.5, 0]);
  const gifY = useTransform(scrollYProgress, [0, 0.45], [60, 0]);
  
  const springScale = useSpring(gifScale, { stiffness: 80, damping: 25 });
  const springY = useSpring(gifY, { stiffness: 80, damping: 25 });
  const springRotate = useSpring(gifRotate, { stiffness: 80, damping: 25 });

  const bounceY = useMemo(() => ({
    animate: { 
      y: [0, -25, 0],
      rotate: [-0.5, 0.5, -0.5]
    },
    transition: { 
      duration: 8, 
      repeat: Infinity, 
      ease: "easeInOut" as const
    }
  }), []);

  return (
    <section 
      ref={containerRef}
      className="relative w-full min-h-screen flex items-center justify-center py-20 bg-transparent"
    >
      {/* ─── Stage Lighting Layers ─── */}
      <svg 
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10" 
        preserveAspectRatio="none"
        style={{ overflow: 'visible', willChange: 'transform', transform: 'translateZ(0)' }}
      >
        <defs>
          <filter id={`beamBlur-${uid}`} x="-40%" y="-10%" width="180%" height="120%">
            <feGaussianBlur stdDeviation="10 18"/>
          </filter>
          <filter id={`hazeBlur-${uid}`} x="-50%" y="-20%" width="200%" height="140%">
            <feGaussianBlur stdDeviation="35 45"/>
          </filter>
          <filter id={`poolBlur-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="28"/>
          </filter>
          
          <linearGradient id={`beamGrad-${uid}`} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={profile.beamColor} stopOpacity="0.85" />
            <stop offset="35%" stopColor={profile.beamColor} stopOpacity="0.35" />
            <stop offset="70%" stopColor={profile.beamColor} stopOpacity="0.08" />
            <stop offset="100%" stopColor={profile.beamColor} stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`hazeGrad-${uid}`} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={profile.hazeColor} stopOpacity="0" />
            <stop offset="50%" stopColor={profile.hazeColor} stopOpacity="0.12" />
            <stop offset="100%" stopColor={profile.hazeColor} stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`poolGrad-${uid}`} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor={profile.poolColor} stopOpacity="0.45" />
            <stop offset="100%" stopColor={profile.poolColor} stopOpacity="0" />
          </radialGradient>
        </defs>

        <polygon id={`hazeLayer-${uid}`} style={{ mixBlendMode: 'screen' }} filter={`url(#hazeBlur-${uid})`} fill={`url(#hazeGrad-${uid})`} opacity="0.85"/>
        <polygon id={`beamLayer-${uid}`} style={{ mixBlendMode: 'screen' }} filter={`url(#beamBlur-${uid})`} fill={`url(#beamGrad-${uid})`} opacity="0.92"/>
        <ellipse id={`poolOuter-${uid}`} style={{ mixBlendMode: 'screen' }} filter={`url(#poolBlur-${uid})`} fill={`url(#poolGrad-${uid})`} opacity="0.8"/>
        <circle id={`bloomCore-${uid}`} style={{ mixBlendMode: 'screen' }} fill="#ffffff" opacity="0.98" filter="blur(6px)"/>
        
        {/* Lamp Fixture */}
        <g id={`lampFixture-${uid}`}>
          {/* Reflector Body */}
          <path d="M -45 5 C -45 -15, -15 -28, -6 -28 L 6 -28 C 15 -28, 45 -15, 45 5 Z" fill="#020617" stroke="#1e293b" strokeWidth="1" />
          <ellipse cx="0" cy="5" rx="45" ry="12" fill="#000000" stroke="#1e293b" strokeWidth="1" />
          
          {/* Glowing inner rim representing reflection */}
          <ellipse cx="0" cy="3" rx="24" ry="6" id={`lampRim-${uid}`} fill={profile.beamColor} opacity="0.8" style={{ mixBlendMode: 'screen' }} filter="blur(2px)" />
          
          {/* Bright bulb core */}
          <circle cx="0" cy="5" r="8" id={`lampBulb-${uid}`} fill="#ffffff" opacity="0.98" filter="blur(4px)" style={{ mixBlendMode: 'screen' }} />
        </g>
      </svg>

      {/* ─── Atmospheric Dust ─── */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none z-20" 
        style={{ mixBlendMode: 'screen', opacity: 0.7, willChange: 'transform', transform: 'translateZ(0)' }}
      />

      {/* ─── Focal Content Layer ─── */}
      <div 
        className={cn(
          "container relative z-40 w-full px-8 mx-auto",
          layout === "center" 
            ? "flex flex-col items-center text-center gap-16" 
            : "grid grid-cols-1 md:grid-cols-2 items-center gap-12 lg:gap-20"
        )}
      >
        
        {/* Holographic Exhibit Container */}
        <div 
          ref={gifContainerRef}
          className={cn(
            "relative w-full",
            layout === "center" ? "mx-auto max-w-md" : "flex justify-center",
            layout === "right" ? "md:order-2" : "md:order-1"
          )}
          style={{ transform: `translate(${contentOffset}px, ${contentOffsetY}px)` }}
        >
          <motion.div 
            style={{ 
              scale: springScale, 
              y: springY, 
              opacity: gifOpacity,
              rotateX: springRotate 
            }}
            className="relative w-full max-w-md h-full group perspective-1000"
          >
          {/* ─── Dynamic Floor Shadow System ─── */}
          <div className="absolute -bottom-30 left-1/2 -translate-x-1/2 w-[80%] h-12 pointer-events-none z-0">
            {/* Deep Contact Shadow */}
            <motion.div 
              animate={{ 
                scale: [1, 0.75, 1],
                opacity: [0.5, 0.2, 0.5],
                filter: ["blur(16px)", "blur(24px)", "blur(16px)"]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute inset-0 bg-black/90 rounded-[100%]"
            />
            
            {/* Color-Matched Ambient Glow */}
            <motion.div 
              animate={{ 
                scale: [1.4, 1.1, 1.4],
                opacity: [0.25, 0.1, 0.25],
                filter: ["blur(32px)", "blur(48px)", "blur(32px)"]
              }}
              transition={{ 
                duration: 8, 
                repeat: Infinity, 
                ease: "easeInOut" 
              }}
              className="absolute inset-0 rounded-[100%]"
              style={{ backgroundColor: profile.accentColor }}
            />
          </div>
          
          <motion.img 
            {...bounceY}
            src={gifPath} 
            alt={headline}
            className="w-full h-full object-contain brightness-105 contrast-[1.02] relative z-10 drop-shadow-[0_15px_35px_rgba(0,0,0,0.4)]"
            loading="lazy"
          />
          
          {/* Atmospheric "Volumetric" Bloom behind content */}
          <div 
            className="absolute inset-0 z-0 blur-[120px] opacity-20 pointer-events-none"
            style={{ backgroundColor: profile.accentColor }}
          />
          </motion.div>
        </div>

        {/* Text Content Staging */}
        <div className={cn(
          "flex flex-col justify-center",
          layout === "center" ? "max-w-3xl items-center" : "max-w-xl",
          layout === "right" ? "md:order-1" : "md:order-2",
          layout === "left" && "md:pl-8",
          layout === "right" && "md:pr-8"
        )}>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            whileInView={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
          >
            <p className="text-xs uppercase tracking-[0.4em] text-cyan-200/80 mb-6">
              System Component // {id.toUpperCase()}
            </p>
            
            <h2 className="text-4xl md:text-5xl lg:text-6xl font-semibold leading-[1.08] tracking-tight text-slate-100 mb-8 drop-shadow-sm">
              {headline}
            </h2>
            
            <p className="text-base md:text-lg text-slate-300/80 leading-relaxed font-light mb-10">
              {subheadline}
            </p>

            <div 
              className="h-[1px] w-12 transition-all duration-700 ease-in-out"
              style={{ backgroundColor: profile.accentColor }}
            />
          </motion.div>
        </div>
      </div>
    </section>
  );
}
