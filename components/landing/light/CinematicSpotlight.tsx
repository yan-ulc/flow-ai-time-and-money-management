/**
 * CinematicSpotlight.tsx
 *
 * A production-quality cinematic spotlight / street-billboard light effect.
 * Designed to feel physically real — volumetric, atmospheric, depth-composited.
 */

import { useEffect, useRef, useCallback, useState, useMemo, useId } from "react";

// ─── Configuration (easy to tweak) ───────────────────────────────────────────

interface SpotlightConfig {
  /** Color of the light (default: warm white) */
  lightColor: string;
  /** Secondary color for edge fringe / warm bleed */
  warmColor: string;
  /** Angle from vertical in degrees (0 = straight down, positive = right) */
  angleDeg: number;
  /** How far the beam travels, 0–1 of viewport height */
  beamReach: number;
  /** Overall intensity multiplier, 0–1 */
  intensity: number;
  /** Source X position, 0–1 of viewport width */
  sourceX: number;
  /** Source Y position, 0–1 of viewport height */
  sourceY: number;
  /** Cone half-angle in degrees */
  coneAngle: number;
}

const DEFAULT_CONFIG: SpotlightConfig = {
  lightColor: "rgba(245, 238, 220, 1)",
  warmColor: "rgba(255, 210, 140, 1)",
  angleDeg: 15,
  beamReach: 0.88,
  intensity: 1,
  sourceX: 0.12,
  sourceY: 0.04,
  coneAngle: 14,
};

// ─── Types ────────────────────────────────────────────────────────────────────

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

// ─── Hook: Flicker & Drift animation values ───────────────────────────────────

function useCinematicAnimation() {
  const frameRef = useRef<number>(0);
  const timeRef = useRef<number>(0);
  const [flicker, setFlicker] = useState(1);
  const [drift, setDrift] = useState(0);
  const [bloomScale, setBloomScale] = useState(1);

  useEffect(() => {
    let last = performance.now();

    function tick(now: number) {
      const dt = (now - last) / 1000;
      last = now;
      timeRef.current += dt;
      const t = timeRef.current;

      // Flicker: sum of several primes-spaced sine waves → never repeats predictably
      const f =
        0.985 +
        0.006 * Math.sin(t * 7.3) +
        0.004 * Math.sin(t * 13.7) +
        0.003 * Math.sin(t * 31.1) +
        0.002 * Math.sin(t * 53.9);

      // Atmospheric drift: very slow Lissajous-style wander < 1°
      const d = 0.4 * Math.sin(t * 0.17) + 0.25 * Math.sin(t * 0.29 + 1.1);

      // Bloom breathe: almost invisible 98–102%
      const b = 1 + 0.018 * Math.sin(t * 0.91) + 0.008 * Math.sin(t * 2.33);

      setFlicker(f);
      setDrift(d);
      setBloomScale(b);

      frameRef.current = requestAnimationFrame(tick);
    }

    frameRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frameRef.current);
  }, []);

  return { flicker, drift, bloomScale };
}

// ─── Hook: Canvas-based dust particle system ──────────────────────────────────

function useDustCanvas(
  canvasRef: React.RefObject<HTMLCanvasElement | null>,
  config: SpotlightConfig,
  flicker: number
) {
  const particlesRef = useRef<DustParticle[]>([]);
  const rafRef = useRef<number>(0);

  const initParticles = useCallback(
    (w: number, h: number) => {
      const count = 55;
      const particles: DustParticle[] = [];

      const sx = config.sourceX * w;
      const sy = config.sourceY * h;
      const angleRad = (config.angleDeg * Math.PI) / 180;
      const reach = config.beamReach * h;

      for (let i = 0; i < count; i++) {
        const t = Math.random();
        const beamX = sx + Math.sin(angleRad) * reach * t;
        const beamY = sy + Math.cos(angleRad) * reach * t;
        const halfWidth = Math.tan((config.coneAngle * Math.PI) / 180) * reach * t;
        const spread = (Math.random() - 0.5) * 2 * halfWidth * 0.85;
        const perpX = -Math.sin(angleRad + Math.PI / 2) * spread;
        const perpY = -Math.cos(angleRad + Math.PI / 2) * spread;

        particles.push({
          x: beamX + perpX,
          y: beamY + perpY,
          vx: (Math.random() - 0.5) * 0.18,
          vy: -0.06 - Math.random() * 0.12,
          size: 0.5 + Math.random() * 1.2,
          opacity: 0,
          opacityTarget: 0.03 + Math.random() * 0.09,
          opacitySpeed: 0.003 + Math.random() * 0.005,
          life: Math.random(),
        });
      }

      particlesRef.current = particles;
    },
    [config]
  );

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    initParticles(w, h);

    const sx = config.sourceX * w;
    const sy = config.sourceY * h;
    const angleRad = (config.angleDeg * Math.PI) / 180;
    const reach = config.beamReach * h;

    function animate() {
      if (!ctx) return;
      ctx.clearRect(0, 0, w, h);

      particlesRef.current.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        p.life += 0.002;

        if (p.opacity < p.opacityTarget) p.opacity += p.opacitySpeed;
        else p.opacity -= p.opacitySpeed * 0.5;

        const dx = p.x - sx;
        const dy = p.y - sy;
        const t = (dx * Math.sin(angleRad) + dy * Math.cos(angleRad)) / reach;
        const perp =
          Math.abs(-dx * Math.cos(angleRad) + dy * Math.sin(angleRad));
        const halfWidth =
          Math.tan((config.coneAngle * Math.PI) / 180) * reach * t;

        if (t < 0 || t > 1.05 || perp > halfWidth * 1.1 || p.life > 1) {
          const newT = 0.1 + Math.random() * 0.9;
          const newBeamX = sx + Math.sin(angleRad) * reach * newT;
          const newBeamY = sy + Math.cos(angleRad) * reach * newT;
          const newHalfWidth =
            Math.tan((config.coneAngle * Math.PI) / 180) * reach * newT;
          const newSpread = (Math.random() - 0.5) * 2 * newHalfWidth * 0.8;
          p.x = newBeamX + Math.cos(angleRad) * newSpread;
          p.y = newBeamY - Math.sin(angleRad) * newSpread;
          p.vy = -0.06 - Math.random() * 0.12;
          p.vx = (Math.random() - 0.5) * 0.18;
          p.opacity = 0;
          p.opacityTarget = 0.03 + Math.random() * 0.09;
          p.life = 0;
        }

        const finalOpacity = p.opacity * flicker * config.intensity;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255, 230, 180, ${finalOpacity})`;
        ctx.fill();
      });

      rafRef.current = requestAnimationFrame(animate);
    }

    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [canvasRef, config, flicker, initParticles]);
}

// ─── Main Component ───────────────────────────────────────────────────────────

interface CinematicSpotlightProps {
  config?: Partial<SpotlightConfig>;
  children?: React.ReactNode;
  className?: string;
}

export default function CinematicSpotlight({
  config: userConfig,
  children,
  className = "",
}: CinematicSpotlightProps) {
  const config = useMemo<SpotlightConfig>(
    () => ({ ...DEFAULT_CONFIG, ...userConfig }),
    [userConfig]
  );

  const dustCanvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dims, setDims] = useState({ w: 1200, h: 800 });

  const { flicker, drift, bloomScale } = useCinematicAnimation();
  useDustCanvas(dustCanvasRef, config, flicker);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const ro = new ResizeObserver(([entry]) => {
      const { width, height } = entry.contentRect;
      setDims({ w: width, h: height });
      if (dustCanvasRef.current) {
        dustCanvasRef.current.width = width;
        dustCanvasRef.current.height = height;
      }
    });
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  const { w, h } = dims;
  const angleRad = ((config.angleDeg + drift) * Math.PI) / 180;
  const sx = config.sourceX * w;
  const sy = config.sourceY * h;
  const reach = config.beamReach * h;
  const coneRad = (config.coneAngle * Math.PI) / 180;

  const tipX = sx + Math.sin(angleRad) * reach;
  const tipY = sy + Math.cos(angleRad) * reach;

  const halfWidthAtTip = Math.tan(coneRad) * reach;
  const nearWidth = 6;
  const perpX = Math.cos(angleRad);
  const perpY = -Math.sin(angleRad);

  const n1x = sx - perpX * nearWidth;
  const n1y = sy - perpY * nearWidth;
  const n2x = sx + perpX * nearWidth;
  const n2y = sy + perpY * nearWidth;

  const f1x = tipX - perpX * halfWidthAtTip;
  const f1y = tipY - perpY * halfWidthAtTip;
  const f2x = tipX + perpX * halfWidthAtTip;
  const f2y = tipY + perpY * halfWidthAtTip;

  const hazeScale = 1.35;
  const hf1x = tipX - perpX * halfWidthAtTip * hazeScale;
  const hf1y = tipY - perpY * halfWidthAtTip * hazeScale;
  const hf2x = tipX + perpX * halfWidthAtTip * hazeScale;
  const hf2y = tipY + perpY * halfWidthAtTip * hazeScale;

  const uid = useId();
  const beamGradId = `beam-grad-${uid}`;
  const hazeGradId = `haze-grad-${uid}`;
  const poolGradId = `pool-grad-${uid}`;
  const fringeGradId = `fringe-grad-${uid}`;
  const noiseFilterId = `noise-${uid}`;
  const beamFilterId = `beam-filter-${uid}`;
  const clipId = `beam-clip-${uid}`;

  const poolRx = halfWidthAtTip * 0.9;
  const poolRy = halfWidthAtTip * 0.25;

  return (
    <div
      ref={containerRef}
      className={className}
      style={{
        position: "relative",
        width: "100%",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
        background: "#05060a",
      }}
    >
      <svg
        style={{
          position: "absolute",
          inset: 0,
          width: "100%",
          height: "100%",
          overflow: "visible",
          pointerEvents: "none",
          opacity: flicker * config.intensity,
        }}
        viewBox={`0 0 ${w} ${h}`}
        preserveAspectRatio="none"
      >
        <defs>
          <filter id={noiseFilterId} x="0%" y="0%" width="100%" height="100%">
            <feTurbulence
              type="fractalNoise"
              baseFrequency="0.65 0.68"
              numOctaves="4"
              stitchTiles="stitch"
              result="noise"
            />
            <feColorMatrix
              type="saturate"
              values="0"
              in="noise"
              result="grayNoise"
            />
            <feBlend in="SourceGraphic" in2="grayNoise" mode="overlay" result="blended" />
            <feComponentTransfer in="blended">
              <feFuncA type="linear" slope="0.06" />
            </feComponentTransfer>
          </filter>

          <filter
            id={beamFilterId}
            x="-30%"
            y="-10%"
            width="160%"
            height="120%"
          >
            <feGaussianBlur stdDeviation="8 14" result="blur" />
            <feComposite in="SourceGraphic" in2="blur" operator="over" />
          </filter>

          <clipPath id={clipId}>
            <polygon
              points={`${n1x},${n1y} ${n2x},${n2y} ${f2x + perpX * 20},${f2y + perpY * 20} ${f1x - perpX * 20},${f1y - perpY * 20}`}
            />
          </clipPath>

          <linearGradient
            id={beamGradId}
            x1={sx}
            y1={sy}
            x2={tipX}
            y2={tipY}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#f5eedc" stopOpacity="0.92" />
            <stop offset="8%" stopColor="#f0e8d0" stopOpacity="0.78" />
            <stop offset="25%" stopColor="#ede4c8" stopOpacity="0.52" />
            <stop offset="50%" stopColor="#e8ddb8" stopOpacity="0.30" />
            <stop offset="75%" stopColor="#e0d4a8" stopOpacity="0.14" />
            <stop offset="90%" stopColor="#d8c898" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#c8b880" stopOpacity="0.0" />
          </linearGradient>

          <linearGradient
            id={hazeGradId}
            x1={sx}
            y1={sy}
            x2={tipX}
            y2={tipY}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#fff8e8" stopOpacity="0.0" />
            <stop offset="15%" stopColor="#fff0d0" stopOpacity="0.22" />
            <stop offset="45%" stopColor="#ffeabc" stopOpacity="0.14" />
            <stop offset="80%" stopColor="#ffe090" stopOpacity="0.06" />
            <stop offset="100%" stopColor="#ffd860" stopOpacity="0.0" />
          </linearGradient>

          <radialGradient
            id={poolGradId}
            cx="50%"
            cy="50%"
            rx="50%"
            ry="50%"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="#f5e8c0" stopOpacity="0.38" />
            <stop offset="35%" stopColor="#f0de9a" stopOpacity="0.18" />
            <stop offset="70%" stopColor="#e8d070" stopOpacity="0.07" />
            <stop offset="100%" stopColor="#d8b840" stopOpacity="0.0" />
          </radialGradient>

          <linearGradient
            id={fringeGradId}
            x1={sx}
            y1={sy}
            x2={tipX}
            y2={tipY}
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#ffcc80" stopOpacity="0.0" />
            <stop offset="20%" stopColor="#ffb84a" stopOpacity="0.28" />
            <stop offset="55%" stopColor="#ff9e30" stopOpacity="0.16" />
            <stop offset="85%" stopColor="#ff8800" stopOpacity="0.05" />
            <stop offset="100%" stopColor="#ff6600" stopOpacity="0.0" />
          </linearGradient>
        </defs>

        <rect
          x={0}
          y={0}
          width={w}
          height={h}
          fill="transparent"
          filter={`url(#${noiseFilterId})`}
          style={{ mixBlendMode: "overlay" }}
          opacity={0.4}
        />

        <polygon
          points={`${n1x - perpX * 4},${n1y - perpY * 4} ${n2x + perpX * 4},${n2y + perpY * 4} ${hf2x},${hf2y} ${hf1x},${hf1y}`}
          fill={`url(#${hazeGradId})`}
          style={{
            filter: "blur(22px)",
            mixBlendMode: "screen",
          }}
          opacity={0.9}
        />

        <g clipPath={`url(#${clipId})`}>
          <polygon
            points={`${n1x},${n1y} ${n2x},${n2y} ${f2x},${f2y} ${f1x},${f1y}`}
            fill={`url(#${beamGradId})`}
            filter={`url(#${beamFilterId})`}
            style={{ mixBlendMode: "screen" }}
            opacity={0.88}
          />
        </g>

        <polygon
          points={`${n1x - perpX * nearWidth * 0.3},${n1y - perpY * nearWidth * 0.3} ${n1x + perpX * nearWidth * 0.5},${n1y + perpY * nearWidth * 0.5} ${f1x + perpX * 14},${f1y + perpY * 14} ${f1x - perpX * 10},${f1y - perpY * 10}`}
          fill={`url(#${fringeGradId})`}
          style={{
            filter: "blur(14px)",
            mixBlendMode: "screen",
          }}
          opacity={0.55}
        />
        <polygon
          points={`${n2x - perpX * nearWidth * 0.5},${n2y - perpY * nearWidth * 0.5} ${n2x + perpX * nearWidth * 0.3},${n2y + perpY * nearWidth * 0.3} ${f2x + perpX * 10},${f2y + perpY * 10} ${f2x - perpX * 14},${f2y - perpY * 14}`}
          fill={`url(#${fringeGradId})`}
          style={{
            filter: "blur(14px)",
            mixBlendMode: "screen",
          }}
          opacity={0.55}
        />

        <g
          transform={`rotate(${config.angleDeg + drift}, ${tipX}, ${tipY})`}
        >
          <ellipse
            cx={tipX}
            cy={tipY}
            rx={poolRx}
            ry={poolRy}
            fill={`url(#${poolGradId})`}
            style={{
              filter: "blur(18px)",
              mixBlendMode: "screen",
            }}
            opacity={0.75}
          />
        </g>

        <g
          transform={`rotate(${config.angleDeg + drift}, ${tipX}, ${tipY})`}
        >
          <ellipse
            cx={tipX}
            cy={tipY}
            rx={poolRx * 1.6}
            ry={poolRy * 2.0}
            fill="#f5e090"
            style={{
              filter: "blur(35px)",
              mixBlendMode: "screen",
            }}
            opacity={0.12}
          />
        </g>

        <g style={{ mixBlendMode: "screen" }}>
          <ellipse
            cx={sx}
            cy={sy}
            rx={28 * bloomScale}
            ry={22 * bloomScale}
            fill="#fff8e8"
            style={{ filter: "blur(16px)" }}
            opacity={0.55}
          />
          <ellipse
            cx={sx}
            cy={sy}
            rx={14 * bloomScale}
            ry={11 * bloomScale}
            fill="#fffaf0"
            style={{ filter: "blur(7px)" }}
            opacity={0.80}
          />
          <circle
            cx={sx}
            cy={sy}
            r={4 * bloomScale}
            fill="#ffffff"
            style={{ filter: "blur(1.5px)" }}
            opacity={0.98}
          />
          <ellipse
            cx={sx}
            cy={sy}
            rx={55 * bloomScale}
            ry={1.5}
            fill="#fffae0"
            style={{ filter: "blur(5px)" }}
            opacity={0.18}
          />
        </g>

        <g>
          <rect
            x={sx - 14}
            y={sy - 22}
            width={28}
            height={20}
            rx={4}
            fill="#1a1a1a"
            stroke="#2e2e2e"
            strokeWidth={1}
          />
          <ellipse
            cx={sx}
            cy={sy - 3}
            rx={13}
            ry={5}
            fill="#252420"
            stroke="#333"
            strokeWidth={0.5}
          />
          <rect
            x={sx - 3}
            y={sy - 38}
            width={6}
            height={18}
            rx={2}
            fill="#111"
          />
          <circle cx={sx} cy={sy - 38} r={4} fill="#0d0d0d" stroke="#222" strokeWidth={0.5} />
          <rect
            x={sx - 11}
            y={sy - 20}
            width={8}
            height={1.5}
            rx={1}
            fill="#444"
            opacity={0.6}
          />
        </g>

        <defs>
          <radialGradient
            id={`vignette-${uid}`}
            cx={`${config.sourceX * 100}%`}
            cy={`${config.sourceY * 100 + 30}%`}
            r="75%"
            gradientUnits="objectBoundingBox"
          >
            <stop offset="0%" stopColor="#000" stopOpacity="0.0" />
            <stop offset="45%" stopColor="#000" stopOpacity="0.18" />
            <stop offset="100%" stopColor="#000" stopOpacity="0.70" />
          </radialGradient>
        </defs>
        <rect
          x={0}
          y={0}
          width={w}
          height={h}
          fill={`url(#vignette-${uid})`}
          style={{ mixBlendMode: "multiply" }}
          opacity={1}
        />
      </svg>

      <canvas
        ref={dustCanvasRef}
        width={w}
        height={h}
        style={{
          position: "absolute",
          inset: 0,
          pointerEvents: "none",
          mixBlendMode: "screen",
          opacity: 0.85,
        }}
      />

      <div
        style={{
          position: "relative",
          zIndex: 10,
          width: "100%",
          height: "100%",
        }}
      >
        {children}
      </div>
    </div>
  );
}

export function CinematicSpotlightDemo() {
  return (
    <section className="relative w-full min-h-screen bg-[#05060a] overflow-hidden">
      <CinematicSpotlight
        config={{
          angleDeg: 18,
          sourceX: 0.10,
          sourceY: 0.03,
          coneAngle: 13,
          beamReach: 0.90,
          intensity: 1,
        }}
      >
        <div
          className="absolute inset-0 flex flex-col items-center justify-center text-center p-6"
        >
          <p
            className="text-[11px] tracking-[0.35em] uppercase text-[#8a7a60] mb-5 font-mono"
          >
            Cinematic Spotlight System
          </p>
          <h1
            className="text-5xl md:text-7xl font-light tracking-tight text-[#d8c9a8] mb-3 leading-none"
          >
            Light the dark.
          </h1>
          <p
            className="text-base md:text-lg text-[#6a5d44] max-w-sm"
          >
            Volumetric. Atmospheric. Physically real.
          </p>
        </div>
      </CinematicSpotlight>
    </section>
  );
}
