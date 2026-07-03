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
  const posRef = useRef<HTMLSpanElement>(null);
  const velRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    // Transient subscription: telemetry writes straight to the DOM, no re-renders
    return useUniverse.subscribe((s) => {
      if (s.phase !== "journey") return;
      cameraStateAt(s.progress, tmpPos, tmpTarget);
      if (destRef.current)
        destRef.current.textContent = nearestStop(s.progress).designation;
      if (posRef.current)
        posRef.current.textContent = `X ${fmt(tmpPos.x)}  Y ${fmt(tmpPos.y)}  Z ${fmt(tmpPos.z)}`;
      if (velRef.current)
        velRef.current.textContent = `${Math.min(Math.abs(s.velocity) * 0.42, 99).toFixed(1)} PC/S`;
      if (dotRef.current) dotRef.current.style.top = `${s.progress * 100}%`;
      if (hintRef.current)
        hintRef.current.style.opacity = s.progress < 0.04 ? "1" : "0";
    });
  }, []);

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

          {/* Sound — top right */}
          <div className="absolute right-6 top-6 text-right md:right-10 md:top-8">
            <button
              type="button"
              onClick={toggleAudio}
              className="pointer-events-auto font-mono text-[10px] uppercase tracking-[0.3em] text-dim transition-colors hover:text-cyan"
            >
              {audioOn ? "◉ SND" : "○ SND"}
            </button>
            {audioOn && nowPlaying && (
              <p className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.25em] text-cyan/80">
                ♫ {nowPlaying}
              </p>
            )}
          </div>

          {/* Telemetry — bottom left */}
          <div className="absolute bottom-6 left-6 font-mono text-[10px] uppercase tracking-[0.25em] md:bottom-8 md:left-10">
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

          {/* Scroll hint — bottom right */}
          <p
            ref={hintRef}
            className="absolute bottom-8 right-6 font-mono text-[10px] uppercase tracking-[0.35em] text-dim transition-opacity duration-700 md:right-24"
          >
            Scroll to travel ↓
          </p>

          {/* Journey rail — right edge */}
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
        </motion.div>
      )}
    </AnimatePresence>
  );
}
