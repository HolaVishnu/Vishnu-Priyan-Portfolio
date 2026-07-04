import Link from "next/link";

/**
 * Themed 404 — "Signal lost". Static export writes this out as 404.html,
 * which GitHub Pages serves automatically for any unknown path.
 *
 * Deliberately lightweight: pure DOM + CSS, no three.js, so a mistyped URL
 * doesn't pay the full 3D-scene cost just to see an error page.
 */

// Deterministic star specks — fixed values so server and client markup match.
const STARS: Array<[x: number, y: number, size: number, opacity: number, delay: number]> = [
  [6, 14, 2, 0.55, 0], [16, 68, 1, 0.35, 1.2], [11, 40, 1, 0.45, 2.1],
  [23, 22, 2, 0.6, 0.6], [31, 82, 1, 0.3, 1.8], [38, 12, 1, 0.5, 0.3],
  [44, 58, 2, 0.4, 2.4], [52, 30, 1, 0.35, 1.5], [58, 76, 1, 0.5, 0.9],
  [64, 18, 2, 0.55, 2.7], [71, 46, 1, 0.3, 0.4], [78, 66, 2, 0.45, 1.1],
  [84, 26, 1, 0.5, 2.0], [90, 74, 1, 0.35, 0.7], [94, 38, 2, 0.6, 1.6],
  [27, 50, 1, 0.4, 2.9], [48, 88, 1, 0.45, 0.2], [86, 90, 1, 0.4, 2.3],
];

export default function NotFound() {
  return (
    <main className="relative flex min-h-[100dvh] flex-col items-center justify-center overflow-hidden bg-void px-6 text-center">
      {/* Star specks */}
      {STARS.map(([x, y, size, opacity, delay], i) => (
        <span
          key={i}
          aria-hidden="true"
          className="absolute rounded-full bg-star"
          style={{
            left: `${x}%`,
            top: `${y}%`,
            width: size,
            height: size,
            opacity,
            animation: `drift 6s ease-in-out ${delay}s infinite`,
          }}
        />
      ))}

      {/* Faint nebula glow behind the headline */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-1/2 top-1/2 h-[70vh] w-[80vw] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-25"
        style={{ background: "radial-gradient(circle, rgba(123,92,255,0.35) 0%, transparent 65%)" }}
      />

      {/* Corner brackets — the telemetry-frame motif */}
      <span aria-hidden="true" className="absolute left-6 top-6 h-4 w-4 border-l-[1.5px] border-t-[1.5px] border-cyan/40" />
      <span aria-hidden="true" className="absolute right-6 top-6 h-4 w-4 border-r-[1.5px] border-t-[1.5px] border-cyan/40" />
      <span aria-hidden="true" className="absolute bottom-6 left-6 h-4 w-4 border-b-[1.5px] border-l-[1.5px] border-cyan/40" />
      <span aria-hidden="true" className="absolute bottom-6 right-6 h-4 w-4 border-b-[1.5px] border-r-[1.5px] border-cyan/40" />

      <div className="relative">
        <p className="eyebrow mb-6 flex items-center justify-center gap-3">
          <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-magenta" style={{ boxShadow: "0 0 8px rgba(200,107,255,0.9)" }} />
          ERR-404 // Telemetry lost
        </p>

        <h1
          className="font-display text-[clamp(3rem,9vw,7rem)] font-bold uppercase leading-none tracking-tight"
          style={{ textShadow: "0 0 80px rgba(79,242,255,0.15), 0 2px 40px rgba(5,6,15,0.8)" }}
        >
          Signal lost
        </h1>

        <p className="mx-auto mt-7 max-w-md text-sm leading-relaxed text-dim">
          These coordinates drift beyond charted space. The beacon you followed
          has gone dark — but the home system is still broadcasting.
        </p>

        <div className="mt-12 flex justify-center">
          <Link
            href="/"
            className="group relative overflow-hidden rounded-full border border-cyan/50 px-10 py-4 font-mono text-xs uppercase tracking-[0.4em] text-star shadow-[0_0_30px_rgba(79,242,255,0.08)] transition-all duration-300 hover:border-cyan hover:shadow-[0_0_40px_rgba(79,242,255,0.25)] hover:text-void"
          >
            <span className="absolute inset-0 origin-left scale-x-0 bg-cyan transition-transform duration-300 ease-out group-hover:scale-x-100" />
            <span className="relative">Return to known space</span>
          </Link>
        </div>
      </div>

      {/* Telemetry footer */}
      <p className="absolute bottom-8 font-mono text-[9px] uppercase tracking-[0.3em] text-dim/40">
        POS X ---.- Y ---.- Z ---.- · VEL 0.0 PC/S · SECTOR UNCHARTED
      </p>
    </main>
  );
}
