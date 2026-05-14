"use client";

import { useEffect, useRef, useMemo, useState, useCallback, useId } from "react";
import { cn } from "@/lib/utils";

// ─── Types & Config ──────────────────────────────────────────────────────────

interface SpotlightConfig {
  sourceXr: number;
  sourceYr: number;
  angleDeg: number;
  coneAngle: number;
  reachR: number;
  intensity: number;
}

const CFG: SpotlightConfig = {
  sourceXr: 0.11,
  sourceYr: 0.04,
  angleDeg: 17,
  coneAngle: 28,
  reachR: 0.82,
  intensity: 1.1,
};

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

// ─── Main Component ──────────────────────────────────────────────────────────

export function CinematicSpotlightEffect() {
  const containerRef = useRef<HTMLDivElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particlesRef = useRef<DustParticle[]>([]);
  const [dims, setDims] = useState({ w: 1200, h: 680 });

  const uid = useId();

  // Geometry calculation helper
  const getGeom = useCallback((w: number, h: number, driftDeg: number) => {
    const ar = ((CFG.angleDeg + driftDeg) * Math.PI) / 180;
    const sx = CFG.sourceXr * w;
    const sy = CFG.sourceYr * h;
    const reach = CFG.reachR * h;
    const cr = (CFG.coneAngle * Math.PI) / 180;
    const tipX = sx + Math.sin(ar) * reach;
    const tipY = sy + Math.cos(ar) * reach;
    const hw = Math.tan(cr) * reach;
    const px = Math.cos(ar), py = -Math.sin(ar);
    const nw = 5;
    return { sx, sy, tipX, tipY, hw, px, py, nw, ar, reach, cr };
  }, []);

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
    const sp = (Math.random() - 0.5) * 2 * hw2 * 0.82;
    return {
      x: bx + Math.cos(ar) * sp,
      y: by - Math.sin(ar) * sp,
      vx: (Math.random() - 0.5) * 0.16,
      vy: -0.05 - Math.random() * 0.11,
      size: 0.5 + Math.random() * 1.1,
      opacity: 0,
      opacityTarget: 0.025 + Math.random() * 0.08,
      opacitySpeed: 0.003 + Math.random() * 0.004,
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

    let w = window.innerWidth;
    let h = 680;
    let lastT = performance.now();
    let totalT = 0;
    let rafId: number;

    const resize = () => {
      w = container.clientWidth;
      h = container.clientHeight || 680;
      setDims({ w, h });
      canvas.width = w;
      canvas.height = h;
      svg.setAttribute('viewBox', `0 0 ${w} ${h}`);
      
      const g = getGeom(w, h, 0);
      particlesRef.current = Array.from({ length: 60 }, () => spawnParticle(g, Math.random()));
    };

    const update = (now: number) => {
      const dt = (now - lastT) / 1000;
      lastT = now;
      totalT += dt;

      const flicker = 0.984 + 
        0.006 * Math.sin(totalT * 7.3) + 
        0.004 * Math.sin(totalT * 13.7) + 
        0.003 * Math.sin(totalT * 31.1) + 
        0.002 * Math.sin(totalT * 53.9);
      
      const drift = 0.42 * Math.sin(totalT * 0.17) + 0.26 * Math.sin(totalT * 0.29 + 1.1);
      const bloom = 1 + 0.018 * Math.sin(totalT * 0.91) + 0.008 * Math.sin(totalT * 2.33);

      const g = getGeom(w, h, drift);
      const { sx, sy, tipX, tipY, hw, px, py, nw, ar, reach, cr } = g;

      // ─── SVG Updates ───
      svg.style.opacity = (flicker * CFG.intensity).toString();

      // Update Gradients
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
      const fringeGrad = svg.getElementById(`fringeGrad-${uid}`);
      if (fringeGrad) {
        fringeGrad.setAttribute('x1', sx.toString()); fringeGrad.setAttribute('y1', sy.toString());
        fringeGrad.setAttribute('x2', tipX.toString()); fringeGrad.setAttribute('y2', tipY.toString());
      }
      const poolGrad = svg.getElementById(`poolGrad-${uid}`);
      if (poolGrad) {
        poolGrad.setAttribute('cx', tipX.toString()); poolGrad.setAttribute('cy', tipY.toString());
        poolGrad.setAttribute('rx', (hw * 0.45).toString()); poolGrad.setAttribute('ry', (hw * 0.12).toString());
      }
      const vigGrad = svg.getElementById(`vigGrad-${uid}`);
      if (vigGrad) {
        vigGrad.setAttribute('cx', sx.toString()); vigGrad.setAttribute('cy', sy.toString());
        const r = Math.max(w, h) * 0.85;
        vigGrad.setAttribute('r', r.toString());
      }

      // Update Polygons
      svg.getElementById(`beamLayer-${uid}`)?.setAttribute('points', getPointsString(g, 1));
      svg.getElementById(`hazeLayer-${uid}`)?.setAttribute('points', getPointsString(g, 1.38));

      const fL = svg.getElementById(`fringeL-${uid}`);
      if (fL) {
        fL.setAttribute('points', [
          [sx - px * nw * 0.3, sy - py * nw * 0.3], [sx + px * nw * 0.5, sy + py * nw * 0.5],
          [tipX - px * hw + px * 16, tipY - py * hw + py * 16], [tipX - px * hw - px * 12, tipY - py * hw - py * 12]
        ].map(p => p.join(',')).join(' '));
      }
      const fR = svg.getElementById(`fringeR-${uid}`);
      if (fR) {
        fR.setAttribute('points', [
          [sx - px * nw * 0.5, sy - py * nw * 0.5], [sx + px * nw * 0.3, sy + py * nw * 0.3],
          [tipX + px * hw + px * 12, tipY + py * hw + py * 12], [tipX + px * hw - px * 16, tipY + py * hw - py * 16]
        ].map(p => p.join(',')).join(' '));
      }

      // Pool & Bloom
      const poolRot = 0;
      const pO = svg.getElementById(`poolOuter-${uid}`);
      if (pO) {
        pO.setAttribute('cx', tipX.toString()); pO.setAttribute('cy', tipY.toString());
        pO.setAttribute('rx', (hw * 0.45).toString()); pO.setAttribute('ry', (hw * 0.12).toString());
        pO.setAttribute('transform', `rotate(${poolRot},${tipX},${tipY})`);
      }
      const pI = svg.getElementById(`poolInner-${uid}`);
      if (pI) {
        pI.setAttribute('cx', tipX.toString()); pI.setAttribute('cy', tipY.toString());
        pI.setAttribute('rx', (hw * 0.8).toString()); pI.setAttribute('ry', (hw * 0.22).toString());
        pI.setAttribute('transform', `rotate(${poolRot},${tipX},${tipY})`);
      }

      const ba = svg.getElementById(`bloomAura-${uid}`);
      if (ba) {
        ba.setAttribute('cx', sx.toString()); ba.setAttribute('cy', sy.toString());
        ba.setAttribute('rx', (30 * bloom).toString()); ba.setAttribute('ry', (23 * bloom).toString());
      }
      const bm = svg.getElementById(`bloomMid-${uid}`);
      if (bm) {
        bm.setAttribute('cx', sx.toString()); bm.setAttribute('cy', sy.toString());
        bm.setAttribute('rx', (14 * bloom).toString()); bm.setAttribute('ry', (11 * bloom).toString());
      }
      svg.getElementById(`bloomCore-${uid}`)?.setAttribute('cx', sx.toString());
      svg.getElementById(`bloomCore-${uid}`)?.setAttribute('cy', sy.toString());
      svg.getElementById(`bloomCore-${uid}`)?.setAttribute('r', (4.5 * bloom).toString());
      
      const lf = svg.getElementById(`lensFlare-${uid}`);
      if (lf) {
        lf.setAttribute('cx', sx.toString()); lf.setAttribute('cy', sy.toString());
        lf.setAttribute('rx', (60 * bloom).toString()); lf.setAttribute('ry', '1.5');
      }

      // Lamp housing
      svg.getElementById(`mountArm-${uid}`)?.setAttribute('x', (sx - 3).toString());
      svg.getElementById(`mountArm-${uid}`)?.setAttribute('y', (sy - 42).toString());
      svg.getElementById(`mountBolt-${uid}`)?.setAttribute('cx', sx.toString());
      svg.getElementById(`mountBolt-${uid}`)?.setAttribute('cy', (sy - 42).toString());
      svg.getElementById(`housingBody-${uid}`)?.setAttribute('x', (sx - 15).toString());
      svg.getElementById(`housingBody-${uid}`)?.setAttribute('y', (sy - 25).toString());
      svg.getElementById(`housingDish-${uid}`)?.setAttribute('cx', sx.toString());
      svg.getElementById(`housingDish-${uid}`)?.setAttribute('cy', (sy - 4).toString());
      svg.getElementById(`housingSpec-${uid}`)?.setAttribute('x', (sx - 12).toString());
      svg.getElementById(`housingSpec-${uid}`)?.setAttribute('y', (sy - 22).toString());

      // ─── Canvas Updates (Dust) ───
      ctx.clearRect(0, 0, w, h);
      particlesRef.current.forEach((p, i) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 0.0018;

        if (p.opacity < p.opacityTarget) p.opacity += p.opacitySpeed;
        else p.opacity -= p.opacitySpeed * 0.55;

        const dx = p.x - sx, dy = p.y - sy;
        const tVal = (dx * Math.sin(ar) + dy * Math.cos(ar)) / reach;
        const perp = Math.abs(-dx * Math.cos(ar) + dy * Math.sin(ar));
        const phw = Math.tan(cr) * reach * tVal;

        if (tVal < 0 || tVal > 1.06 || perp > phw * 1.12 || p.life > 1) {
          particlesRef.current[i] = spawnParticle(g);
          return;
        }

        const fo = p.opacity * flicker * CFG.intensity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,228,172,${fo})`;
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
  }, [uid, getGeom, spawnParticle]);

  return (
    <div 
      ref={containerRef}
      className="relative w-full h-[680px] bg-[#05060a] overflow-hidden"
    >
      <svg 
        ref={svgRef}
        className="absolute inset-0 w-full h-full pointer-events-none overflow-visible" 
        preserveAspectRatio="none"
      >
        <defs>
          <filter id={`beamBlur-${uid}`} x="-40%" y="-10%" width="180%" height="120%">
            <feGaussianBlur stdDeviation="4 10"/>
          </filter>
          <filter id={`hazeBlur-${uid}`} x="-50%" y="-20%" width="200%" height="140%">
            <feGaussianBlur stdDeviation="20 24"/>
          </filter>
          <filter id={`poolBlur-${uid}`} x="-60%" y="-60%" width="220%" height="220%">
            <feGaussianBlur stdDeviation="22"/>
          </filter>
          <filter id={`sourceBloom-${uid}`} x="-200%" y="-200%" width="500%" height="500%">
            <feGaussianBlur stdDeviation="12"/>
          </filter>
          <filter id={`coreGlow-${uid}`} x="-300%" y="-300%" width="700%" height="700%">
            <feGaussianBlur stdDeviation="3"/>
          </filter>
          <filter id={`fringeBlur-${uid}`} x="-30%" y="-10%" width="160%" height="120%">
            <feGaussianBlur stdDeviation="6 8"/>
          </filter>
          <filter id={`wallNoise-${uid}`} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence type="fractalNoise" baseFrequency="0.72 0.68" numOctaves="4" stitchTiles="stitch" result="noise"/>
            <feColorMatrix type="saturate" values="0" in="noise" result="gn"/>
            <feBlend in="SourceGraphic" in2="gn" mode="overlay" result="b"/>
            <feComponentTransfer in="b"><feFuncA type="linear" slope="0.05"/></feComponentTransfer>
          </filter>

          <linearGradient id={`beamGrad-${uid}`} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f5eedc" stopOpacity="0.9" />
            <stop offset="8%" stopColor="#f0e8d0" stopOpacity="0.76" />
            <stop offset="25%" stopColor="#ede4c8" stopOpacity="0.5" />
            <stop offset="50%" stopColor="#e8ddb8" stopOpacity="0.28" />
            <stop offset="75%" stopColor="#e0d4a8" stopOpacity="0.13" />
            <stop offset="90%" stopColor="#d8c898" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#c8b880" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`hazeGrad-${uid}`} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#fff8e8" stopOpacity="0" />
            <stop offset="15%" stopColor="#fff0d0" stopOpacity="0.2" />
            <stop offset="45%" stopColor="#ffeabc" stopOpacity="0.12" />
            <stop offset="80%" stopColor="#ffe090" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#ffd860" stopOpacity="0" />
          </linearGradient>
          <linearGradient id={`fringeGrad-${uid}`} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#ffcc80" stopOpacity="0" />
            <stop offset="20%" stopColor="#ffb84a" stopOpacity="0.26" />
            <stop offset="55%" stopColor="#ff9e30" stopOpacity="0.14" />
            <stop offset="85%" stopColor="#ff8800" stopOpacity="0.04" />
            <stop offset="100%" stopColor="#ff6600" stopOpacity="0" />
          </linearGradient>
          <radialGradient id={`poolGrad-${uid}`} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#f5e8c0" stopOpacity="0.36" />
            <stop offset="35%" stopColor="#f0de9a" stopOpacity="0.17" />
            <stop offset="70%" stopColor="#e8d070" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#d8b840" stopOpacity="0" />
          </radialGradient>
          <radialGradient id={`vigGrad-${uid}`} gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#000" stopOpacity="0" />
            <stop offset="40%" stopColor="#000" stopOpacity="0.15" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.72" />
          </radialGradient>
        </defs>

        <rect id={`wallTex-${uid}`} x="0" y="0" width="100%" height="100%" fill="transparent" filter={`url(#wallNoise-${uid})`} style={{ mixBlendMode: 'overlay' }} opacity="0.45"/>
        <polygon id={`hazeLayer-${uid}`} style={{ mixBlendMode: 'screen' }} filter={`url(#hazeBlur-${uid})`} fill={`url(#hazeGrad-${uid})`} opacity="0.85"/>
        <polygon id={`beamLayer-${uid}`} style={{ mixBlendMode: 'screen' }} filter={`url(#beamBlur-${uid})`} fill={`url(#beamGrad-${uid})`} opacity="0.90"/>
        <polygon id={`fringeL-${uid}`} style={{ mixBlendMode: 'screen' }} filter={`url(#fringeBlur-${uid})`} fill={`url(#fringeGrad-${uid})`} opacity="0.50"/>
        <polygon id={`fringeR-${uid}`} style={{ mixBlendMode: 'screen' }} filter={`url(#fringeBlur-${uid})`} fill={`url(#fringeGrad-${uid})`} opacity="0.50"/>
        <ellipse id={`poolOuter-${uid}`} style={{ mixBlendMode: 'screen' }} filter={`url(#poolBlur-${uid})`} fill={`url(#poolGrad-${uid})`} opacity="0.72"/>
        <ellipse id={`poolInner-${uid}`} style={{ mixBlendMode: 'screen' }} filter={`url(#poolBlur-${uid})`} fill="#f5e090" opacity="0.14"/>
        <ellipse id={`bloomAura-${uid}`} style={{ mixBlendMode: 'screen' }} filter={`url(#sourceBloom-${uid})`} fill="#fff8e8" opacity="0.55"/>
        <ellipse id={`bloomMid-${uid}`} style={{ mixBlendMode: 'screen' }} filter={`url(#sourceBloom-${uid})`} fill="#fffaf0" opacity="0.80"/>
        <circle id={`bloomCore-${uid}`} style={{ mixBlendMode: 'screen' }} filter={`url(#coreGlow-${uid})`} fill="#ffffff" opacity="0.98"/>
        <ellipse id={`lensFlare-${uid}`} style={{ mixBlendMode: 'screen' }} fill="#fffae0" opacity="0.18"/>
        <rect id={`vignette-${uid}`} x="0" y="0" width="100%" height="100%" fill={`url(#vigGrad-${uid})`} style={{ mixBlendMode: 'multiply' }}/>

        <g id={`lampHousing-${uid}`}>
          <rect id={`mountArm-${uid}`} rx="2" fill="#111" width="6" height="22"/>
          <circle id={`mountBolt-${uid}`} fill="#0d0d0d" stroke="#222" strokeWidth="0.5" r="4"/>
          <rect id={`housingBody-${uid}`} rx="4" fill="#1a1a1a" stroke="#2e2e2e" strokeWidth="1" width="30" height="22"/>
          <ellipse id={`housingDish-${uid}`} fill="#252420" stroke="#333" strokeWidth="0.5" rx="14" ry="5"/>
          <rect id={`housingSpec-${uid}`} rx="1" fill="#444" opacity="0.6" width="9" height="1.5"/>
        </g>
      </svg>

      <canvas 
        ref={canvasRef} 
        className="absolute inset-0 pointer-events-none" 
        style={{ mixBlendMode: 'screen', opacity: 0.85 }}
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none select-none">
        <p className="text-[10px] tracking-[0.38em] uppercase text-[#6a5d44] mb-4 font-mono">Cinematic Spotlight System</p>
        <h1 className="text-4xl md:text-6xl font-light tracking-tight text-[#d8c9a8] mb-2.5 leading-none">Light the dark.</h1>
        <p className="text-sm md:text-base text-[#554839] max-w-[340px] px-6">Volumetric. Atmospheric. Physically real.</p>
      </div>
    </div>
  );
}
