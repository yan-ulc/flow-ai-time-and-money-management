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
  };
  lightOffset?: number;
  contentOffset?: number;
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
}: SpotlightSectionProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<DustParticle[]>([]);
  const [dims, setDims] = useState({ w: 1200, h: 800 });
  const uid = useId();

  // ─── Core Geometry Config ───
  const config = useMemo(() => ({
    sourceXr: 0.5, 
    sourceYr: -0.1, // Higher source for sharper vertical angle
    angleDeg: 0, // Perfectly vertical for all sections
    coneAngle: 24,
    reachR: 0.72,
    intensity: 1.3,
    ...userConfig
  }), [userConfig]);

  const getSourceX = useCallback((w: number) => {
    let base = w * 0.5;
    if (layout === "left") base = w * 0.25;
    if (layout === "right") base = w * 0.75;
    return base + lightOffset;
  }, [layout, lightOffset]);

  const getGeom = useCallback((w: number, h: number, driftDeg: number) => {
    const ar = ((config.angleDeg + driftDeg) * Math.PI) / 180;
    const sx = getSourceX(w);
    const sy = config.sourceYr * h;
    const reach = config.reachR * h;
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

    const resize = () => {
      w = container.clientWidth;
      h = container.clientHeight;
      setDims({ w, h });
      canvas.width = w;
      canvas.height = h;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      const g = getGeom(w, h, 0);
      particlesRef.current = Array.from({ length: 45 }, () => spawnParticle(g, Math.random()));
    };

    const update = (now: number) => {
      const dt = (now - lastT) / 1000;
      lastT = now;
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
      className="relative w-full min-h-screen bg-[#05060a] overflow-hidden flex items-center justify-center py-20"
    >
      {/* ─── Stage Lighting Layers ─── */}
      <svg 
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none z-10" 
        preserveAspectRatio="none"
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
      </svg>

      {/* ─── Atmospheric Dust ─── */}
      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none z-20" 
        style={{ mixBlendMode: 'screen', opacity: 0.7 }}
      />

      {/* ─── Focal Content Layer ─── */}
      <div 
        style={{ transform: `translateX(${contentOffset}px)` }}
        className={cn(
          "container relative z-40 flex flex-col md:flex-row items-center gap-16 lg:gap-24 px-8",
          layout === "right" && "md:flex-row-reverse",
          layout === "center" && "flex-col text-center"
        )}
      >
        
        {/* Holographic Exhibit Container */}
        <motion.div 
          style={{ 
            scale: springScale, 
            y: springY, 
            opacity: gifOpacity,
            rotateX: springRotate 
          }}
          className={cn(
            "relative w-full max-w-md group perspective-1000",
            layout === "center" ? "mx-auto" : "flex-1"
          )}
        >
          {/* Floor Shadow (Contact shadow) */}
          <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 w-[90%] h-8 bg-black/80 blur-2xl rounded-full" />
          
          <motion.img 
            {...bounceY}
            src={gifPath} 
            alt={headline}
            className="w-full h-full object-contain brightness-105 contrast-[1.02] relative z-10"
            loading="lazy"
          />
          
          {/* Atmospheric "Volumetric" Bloom behind content */}
          <div 
            className="absolute inset-0 z-0 blur-[120px] opacity-20 pointer-events-none"
            style={{ backgroundColor: profile.accentColor }}
          />
        </motion.div>

          <div 
            className="absolute -bottom-12 left-1/2 -translate-x-1/2 w-[70%] h-16 blur-[60px] opacity-25 z-0"
            style={{ backgroundColor: profile.accentColor }}
          />

        {/* Text Content Staging */}
        <div className={cn(
          "flex-1 max-w-lg lg:max-w-xl",
          layout === "center" && "max-w-3xl mt-16"
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
      
      {/* Global Environmental Depth */}
      <div className="absolute inset-0 z-0 bg-gradient-to-b from-[#05060a]/20 via-transparent to-[#05060a]/80" />
    </section>
  );
}
