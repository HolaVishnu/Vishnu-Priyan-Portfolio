"use client";

import { useEffect, useRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import * as THREE from "three";
import { STOPS, cameraStateAt, nearestStop } from "../../lib/journey";
import { useUniverse } from "../../lib/store";
import { sound } from "../../lib/sound";
import profile from "../../data/profile.json";

// Toggling audioOn is enough: MusicController reacts synchronously (inside
// the same click gesture), starting the soundtrack or the drone fallback.

// public/ assets sit under the GitHub Pages basePath in production but at
// the root in dev — a hardcoded prod path 404s on localhost.
const NOMINATE_HREF =
  (process.env.NODE_ENV === "production" ? "/Vishnu-Priyan-Portfolio" : "") +
  "/nominate.html";

const tmpPos = new THREE.Vector3();
const tmpTarget = new THREE.Vector3();

function fmt(n: number): string {
  const sign = n < 0 ? "-" : "+";
  return sign + Math.abs(n).toFixed(1).padStart(5, "0");
}

/**
 * Mission telemetry — the signature element. Destination, coordinates and
 * velocity update live with scroll; the rail on the right is the journey map.
 */
export default function Hud() {
  const phase = useUniverse((s) => s.phase);
  const activeSection = useUniverse((s) => s.activeSection);
  const audioOn = useUniverse((s) => s.audioOn);
  const nowPlaying = useUniverse((s) => s.nowPlaying);

  const destRef = useRef<HTMLSpanElement>(null);
  const destMobileRef = useRef<HTMLSpanElement>(null);
  const posRef = useRef<HTMLSpanElement>(null);
  const velRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const hintMobileRef = useRef<HTMLParagraphElement>(null);
  // SVG progress arc
  const arcRef = useRef<SVGCircleElement>(null);
  const arcPctRef = useRef<SVGTSpanElement>(null);

  // Arc geometry
  const ARC_R = 20;
  const ARC_CIRC = 2 * Math.PI * ARC_R;

  useEffect(() => {
    // Transient subscription: telemetry writes straight to the DOM, no re-renders
    return useUniverse.subscribe((s) => {
      if (s.phase !== "journey") return;
      cameraStateAt(s.progress, tmpPos, tmpTarget);
      const dest = nearestStop(s.progress).designation;
      if (destRef.current) destRef.current.textContent = dest;
      if (destMobileRef.current) destMobileRef.current.textContent = dest;
      if (posRef.current)
        posRef.current.textContent = `X ${fmt(tmpPos.x)}  Y ${fmt(tmpPos.y)}  Z ${fmt(tmpPos.z)}`;
      if (velRef.current)
        velRef.current.textContent = `${Math.min(Math.abs(s.velocity) * 0.42, 99).toFixed(1)} PC/S`;
      if (dotRef.current) dotRef.current.style.top = `${s.progress * 100}%`;
      // Progress arc
      if (arcRef.current) {
        const offset = ARC_CIRC * (1 - s.progress);
        arcRef.current.style.strokeDashoffset = String(offset);
      }
      if (arcPctRef.current)
        arcPctRef.current.textContent = `${Math.round(s.progress * 100)}`;
      const hintOpacity = s.progress < 0.04 ? "1" : "0";
      if (hintRef.current) hintRef.current.style.opacity = hintOpacity;
      if (hintMobileRef.current) hintMobileRef.current.style.opacity = hintOpacity;
    });
  }, [ARC_CIRC]);

  const toggleAudio = () => {
    useUniverse.getState().setAudioOn(!audioOn);
    sound.blip();
  };

  const navigate = (t: number) => {
    window.dispatchEvent(new CustomEvent("universe:navigate", { detail: t }));
    sound.blip();
  };

  return (
    <AnimatePresence>
      {phase === "journey" && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, delay: 0.6 }}
          className="pointer-events-none fixed inset-0 z-30"
        >
          {/* Identity — top left */}
          <div className="absolute left-6 top-6 font-mono text-[10px] uppercase tracking-[0.3em] md:left-10 md:top-8">
            <p className="text-star/90">
              {profile.name} <span className="text-dim">// {profile.callsign}</span>
            </p>
            <p className="mt-1.5 flex items-center gap-2 text-dim">
              <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-cyan" />
              SYS ONLINE
            </p>
          </div>

          {/* Sound + Awwwards badge — top right */}
          <div className="absolute right-6 top-6 flex flex-col items-end gap-2 text-right md:right-10 md:top-8">
            <button
              type="button"
              onClick={toggleAudio}
              className="pointer-events-auto font-mono text-[10px] uppercase tracking-[0.3em] text-dim transition-colors hover:text-cyan"
            >
              {audioOn ? "◉ SND" : "○ SND"}
            </button>
            {audioOn && nowPlaying && (
              <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-cyan/80">
                ♫ {nowPlaying}
              </p>
            )}
            {/* Awwwards nominate badge */}
            <a
              href={NOMINATE_HREF}
              target="_blank"
              rel="noopener"
              className="pointer-events-auto mt-1 hidden items-center gap-1.5 md:flex"
              style={{ textDecoration: "none" }}
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full bg-magenta"
                style={{ boxShadow: "0 0 5px rgba(200,107,255,0.8)", animation: "pulse 2s ease-in-out infinite" }}
              />
              <span className="font-mono text-[8px] uppercase tracking-[0.28em] text-magenta/75 transition-colors hover:text-magenta">
                Awwwards Nominee
              </span>
            </a>
          </div>

          {/* Telemetry — bottom left (desktop only) */}
          <div className="absolute bottom-6 left-6 hidden font-mono text-[10px] uppercase tracking-[0.25em] md:block md:bottom-8 md:left-10">
            <p className="text-dim">
              DEST <span ref={destRef} className="ml-2 text-cyan/90" />
            </p>
            <p className="mt-1.5 text-dim">
              POS <span ref={posRef} className="ml-2 text-star/85" />
            </p>
            <p className="mt-1.5 text-dim">
              VEL <span ref={velRef} className="ml-2 text-star/85" />
            </p>
          </div>

          {/* DEST only — mobile bottom left */}
          <div className="absolute bottom-[calc(4rem+env(safe-area-inset-bottom,0px))] left-4 font-mono text-[9px] uppercase tracking-[0.25em] md:hidden">
            <p className="text-dim">
              <span ref={destMobileRef} className="text-cyan/80" />
            </p>
          </div>

          {/* Scroll hint — desktop only */}
          <p
            ref={hintRef}
            className="absolute bottom-8 right-6 hidden font-mono text-[10px] uppercase tracking-[0.35em] text-dim transition-opacity duration-700 md:block md:right-24"
          >
            Scroll to travel ↓
          </p>

          {/* Swipe hint — mobile only */}
          <p
            ref={hintMobileRef}
            className="absolute right-4 font-mono text-[9px] uppercase tracking-[0.3em] text-dim transition-opacity duration-700 md:hidden"
            style={{ bottom: "calc(3.75rem + env(safe-area-inset-bottom, 0px))" }}
          >
            Swipe ↕
          </p>

          {/* Scroll progress arc — bottom right (desktop), above scroll hint */}
          <div className="absolute bottom-[4.5rem] right-6 hidden md:block md:right-10" aria-hidden="true">
            <svg width="48" height="48" viewBox="0 0 48 48">
              <circle cx="24" cy="24" r={ARC_R} fill="none" stroke="rgba(123,92,255,0.15)" strokeWidth="1.5" />
              <circle
                ref={arcRef}
                cx="24" cy="24" r={ARC_R}
                fill="none"
                stroke="url(#arcGrad)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeDasharray={ARC_CIRC}
                strokeDashoffset={ARC_CIRC}
                style={{ transform: "rotate(-90deg)", transformOrigin: "24px 24px", transition: "stroke-dashoffset 0.4s ease" }}
              />
              <defs>
                <linearGradient id="arcGrad" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#4ff2ff" />
                  <stop offset="100%" stopColor="#7b5cff" />
                </linearGradient>
              </defs>
              <text x="24" y="26" textAnchor="middle" fill="rgba(154,166,207,0.7)" fontSize="7" fontFamily="IBM Plex Mono, monospace">
                <tspan ref={arcPctRef}>0</tspan>
                <tspan fontSize="5">%</tspan>
              </text>
            </svg>
          </div>

          {/* Journey rail — right edge (desktop) */}
          <nav
            aria-label="Journey stops"
            className="pointer-events-auto absolute right-6 top-1/2 hidden -translate-y-1/2 md:block md:right-10"
          >
            <div className="relative h-64 w-px bg-nebula/25">
              <div
                ref={dotRef}
                className="absolute -left-[2.5px] h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-star shadow-[0_0_8px_rgba(79,242,255,0.9)]"
              />
              {STOPS.map((stop) => (
                <button
                  key={stop.id}
                  type="button"
                  onClick={() => navigate(stop.t)}
                  aria-label={`Travel to ${stop.name}`}
                  className="group absolute -left-[5px] flex h-[11px] w-[11px] items-center justify-center"
                  style={{ top: `${stop.t * 100}%`, transform: "translateY(-50%)" }}
                >
                  <span
                    className={`h-[7px] w-[7px] rotate-45 border transition-all duration-300 ${
                      activeSection === stop.id
                        ? "border-cyan bg-cyan"
                        : "border-nebula/60 bg-void group-hover:border-cyan"
                    }`}
                  />
                  <span className="absolute right-5 whitespace-nowrap font-mono text-[9px] uppercase tracking-[0.3em] text-cyan opacity-0 transition-opacity duration-200 group-hover:opacity-100">
                    {stop.name}
                  </span>
                </button>
              ))}
            </div>
          </nav>

          {/* Mobile bottom section nav — horizontal dots */}
          <nav
            aria-label="Journey stops"
            className="pointer-events-auto absolute inset-x-0 flex items-center justify-center gap-4 pb-[env(safe-area-inset-bottom,0px)] md:hidden"
            style={{ bottom: "0.5rem" }}
          >
            {STOPS.map((stop) => (
              <button
                key={stop.id}
                type="button"
                onClick={() => navigate(stop.t)}
                aria-label={`Travel to ${stop.name}`}
                className="flex flex-col items-center gap-1 p-1"
              >
                <span
                  className={`block h-[6px] w-[6px] rotate-45 border transition-all duration-300 ${
                    activeSection === stop.id
                      ? "scale-125 border-cyan bg-cyan"
                      : "border-nebula/50 bg-void"
                  }`}
                />
                <span className="font-mono text-[7px] uppercase tracking-[0.2em] text-dim/70">
                  {stop.name.split(" ")[0]}
                </span>
              </button>
            ))}
          </nav>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
