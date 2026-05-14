"use client";

const ORBS = [
  {
    className: "-top-10 left-[5%]",
    size: "h-72 w-72",
    color: "bg-cyan-400/20",
    duration: 24,
    delay: 0,
  },
  {
    className: "top-[20%] right-[8%]",
    size: "h-80 w-80",
    color: "bg-emerald-400/15",
    duration: 28,
    delay: 2,
  },
  {
    className: "bottom-[8%] left-[18%]",
    size: "h-64 w-64",
    color: "bg-sky-300/15",
    duration: 26,
    delay: 4,
  },
  {
    className: "bottom-[-12%] right-[15%]",
    size: "h-72 w-72",
    color: "bg-amber-200/12",
    duration: 30,
    delay: 1,
  },
];

export function AmbientBackground() {
  return (
    <div className="absolute inset-0 -z-10 overflow-hidden">
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 20%, rgba(56,189,248,0.12), transparent 55%), radial-gradient(circle at 80% 15%, rgba(16,185,129,0.12), transparent 50%), radial-gradient(circle at 50% 85%, rgba(251,191,36,0.08), transparent 55%)",
        }}
      />

      <div
        className="absolute inset-0 opacity-45"
        style={{
          backgroundImage:
            "linear-gradient(120deg, rgba(148,163,184,0.08), transparent 40%), linear-gradient(300deg, rgba(94,234,212,0.06), transparent 45%)",
        }}
      />

      <div
        className="absolute inset-0 opacity-25"
        style={{
          backgroundImage:
            "linear-gradient(rgba(148,163,184,0.08) 1px, transparent 1px), linear-gradient(90deg, rgba(148,163,184,0.08) 1px, transparent 1px)",
          backgroundSize: "120px 120px",
        }}
      />

      {ORBS.map((orb, index) => (
        <div
          key={index}
          className={`absolute ${orb.className} ${orb.size} ${orb.color} rounded-full blur-3xl opacity-50`}
        />
      ))}

      <div
        className="absolute inset-0 opacity-12 mix-blend-soft-light"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%2260%22 height=%2260%22 viewBox=%220 0 60 60%22%3E%3Cfilter id=%22n%22 x=%220%22 y=%220%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.9%22 numOctaves=%221%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%2260%22 height=%2260%22 filter=%22url(%23n)%22 opacity=%220.4%22/%3E%3C/svg%3E')",
        }}
      />

      <div className="absolute inset-0 bg-gradient-to-b from-slate-950/40 via-transparent to-slate-950" />
    </div>
  );
}
