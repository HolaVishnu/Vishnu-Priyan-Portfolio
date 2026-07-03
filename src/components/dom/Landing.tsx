"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import MagneticButton from "./MagneticButton";
import { useUniverse } from "../../lib/store";
import { sound } from "../../lib/sound";
import profile from "../../data/profile.json";

interface BootLine {
  label: string;
  status: "OK" | "WARN" | "INIT";
  delay: number;
}

const BOOT_SEQUENCE: BootLine[] = [
  { label: "ARCHITECT CONSOLE v5.2 ............", status: "OK",   delay: 0 },
  { label: "NAVIGATION ARRAY ....................", status: "OK",   delay: 1 },
  { label: "STARFIELD GENERATION ................", status: "OK",   delay: 2 },
  { label: "WARP CORE CALIBRATION ...............", status: "OK",   delay: 3 },
  { label: "DEEP SPACE SECTOR SCAN ..............", status: "OK",   delay: 4 },
  { label: "BIOMETRIC SIGNATURE .................", status: "OK",   delay: 5 },
  { label: "PILOT AUTHENTICATION ................", status: "OK",   delay: 6 },
  { label: "THRUST VECTOR ONLINE ................", status: "OK",   delay: 7 },
  { label: "ALL SYSTEMS NOMINAL .................", status: "INIT", delay: 8 },
];

const STATUS_COLOR: Record<BootLine["status"], string> = {
  OK:   "text-cyan/90",
  WARN: "text-yellow-400/90",
  INIT: "text-nebula",
};
const STATUS_LABEL: Record<BootLine["status"], string> = {
  OK:   "[ OK ]",
  WARN: "[ WARN ]",
  INIT: "[ INIT ]",
};

const STEP_MS = 260;

export default function Landing() {
  const phase = useUniverse((s) => s.phase);
  const audioOn = useUniverse((s) => s.audioOn);

  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);
  const nameRef = useRef<HTMLHeadingElement>(null);

  // Boot sequence: reveal one line every STEP_MS, then transition to landing
  useEffect(() => {
    if (phase !== "boot") return;
    if (useUniverse.getState().reducedMotion) {
      useUniverse.getState().setPhase("landing");
      return;
    }
    let step = 0;
    const total = BOOT_SEQUENCE.length;
    const id = setInterval(() => {
      step += 1;
      setVisibleLines(step);
      setProgress(Math.round((step / total) * 100));
      if (step >= total) {
        clearInterval(id);
        setTimeout(() => useUniverse.getState().setPhase("landing"), 520);
      }
    }, STEP_MS);
    return () => clearInterval(id);
  }, [phase]);

  // Name reveal animation on landing phase
  useEffect(() => {
    if (phase !== "landing" || !nameRef.current) return;
    if (useUniverse.getState().reducedMotion) return;
    const letters = nameRef.current.querySelectorAll("span[data-letter]");
    gsap.fromTo(
      letters,
      { opacity: 0, y: 60, rotateX: -60, filter: "blur(8px)" },
      {
        opacity: 1, y: 0, rotateX: 0, filter: "blur(0px)",
        duration: 1.2, stagger: 0.048, ease: "power4.out", delay: 0.3,
      }
    );
  }, [phase]);

  const toggleAudio = () => {
    useUniverse.getState().setAudioOn(!audioOn);
    sound.blip();
  };

  const begin = () => {
    const s = useUniverse.getState();
    s.unlock("ignition");
    s.setPhase("journey");
  };

  return (
    <AnimatePresence>
      {phase !== "journey" && (
        <motion.div
          key="landing"
          exit={{ opacity: 0, scale: 1.06 }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-40 flex items-center justify-center"
        >
          {/* Vignette */}
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-0"
            style={{
              background: `radial-gradient(ellipse 90% 75% at 50% 50%,
                transparent 0%, rgba(5,6,15,0.45) 45%,
                rgba(5,6,15,0.82) 72%, rgba(5,6,15,0.97) 100%)`,
            }}
          />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 bottom-0 h-[45vh]"
            style={{ background: "linear-gradient(to top, rgba(5,6,15,0.98) 0%, rgba(5,6,15,0.6) 50%, transparent 100%)" }} />
          <div aria-hidden="true" className="pointer-events-none absolute inset-x-0 top-0 h-[30vh]"
            style={{ background: "linear-gradient(to bottom, rgba(5,6,15,0.92) 0%, transparent 100%)" }} />

          {/* ── Boot sequence ── */}
          {phase === "boot" && (
            <div className="flex w-full max-w-lg flex-col px-8" role="status" aria-live="polite">
              {/* Header bar */}
              <div className="mb-5 flex items-center gap-3 border-b border-cyan/10 pb-3">
                <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-cyan" />
                <span className="font-mono text-[9px] uppercase tracking-[0.4em] text-cyan/70">
                  Deep Space Navigation System
                </span>
              </div>

              {/* Boot lines */}
              <div className="space-y-[6px]">
                {BOOT_SEQUENCE.slice(0, visibleLines).map((line, i) => (
                  <motion.div
                    key={line.label}
                    initial={{ opacity: 0, x: -8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.25 }}
                    className="flex items-center justify-between font-mono text-[10px] tracking-[0.18em]"
                  >
                    <span className="text-dim/70">{line.label}</span>
                    <span className={STATUS_COLOR[line.status]}>
                      {STATUS_LABEL[line.status]}
                    </span>
                  </motion.div>
                ))}

                {/* Blinking caret */}
                {visibleLines < BOOT_SEQUENCE.length && (
                  <span className="caret font-mono text-[10px] tracking-[0.18em] text-cyan/60" />
                )}
              </div>

              {/* Progress bar */}
              <div className="mt-6">
                <div className="mb-1.5 flex justify-between font-mono text-[8px] uppercase tracking-[0.3em] text-dim/40">
                  <span>BOOT PROGRESS</span>
                  <span>{progress}%</span>
                </div>
                <div className="h-[2px] w-full overflow-hidden rounded-full bg-white/5">
                  <motion.div
                    className="h-full rounded-full"
                    style={{
                      background: "linear-gradient(90deg, #4ff2ff, #7b5cff)",
                      boxShadow: "0 0 12px rgba(79,242,255,0.5)",
                    }}
                    animate={{ width: `${progress}%` }}
                    transition={{ duration: 0.22, ease: "easeOut" }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* ── Landing screen ── */}
          {phase === "landing" && (
            <div className="relative flex w-full max-w-5xl flex-col items-center px-6 text-center">

              {/* Callsign — top-left corner */}
              <motion.div
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 0.1 }}
                className="absolute -top-16 left-0 hidden md:block"
              >
                <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-cyan/60">
                  {profile.callsign}
                </p>
                <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.3em] text-dim/50">
                  {profile.coordinates}
                </p>
              </motion.div>

              {/* Awwwards badge — top-right */}
              <motion.a
                href="/Vishnu-Priyan-Portfolio/nominate.html"
                target="_blank"
                rel="noopener"
                initial={{ opacity: 0, x: 16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.9, delay: 2.6 }}
                className="absolute -top-16 right-0 hidden items-center gap-2 md:flex"
                style={{ textDecoration: "none" }}
              >
                <span className="inline-block h-1.5 w-1.5 rounded-full bg-magenta" style={{ boxShadow: "0 0 6px rgba(200,107,255,0.8)" }} />
                <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-magenta/80 transition-colors hover:text-magenta">
                  Awwwards Nominee
                </span>
              </motion.a>

              {/* Eyebrow */}
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 0.15 }}
                className="mb-6 flex items-center gap-4"
              >
                <span className="h-px w-12 bg-cyan/30" />
                <p className="eyebrow">SOL-3 // Incoming transmission</p>
                <span className="h-px w-12 bg-cyan/30" />
              </motion.div>

              {/* Name */}
              <h1
                ref={nameRef}
                aria-label={profile.name}
                className="font-display text-[clamp(3rem,10vw,8rem)] font-bold uppercase leading-none tracking-tight"
                style={{
                  perspective: "800px",
                  textShadow: "0 0 80px rgba(79,242,255,0.15), 0 2px 40px rgba(5,6,15,0.8)",
                }}
              >
                {profile.name.split(" ").map((word, wi, words) => (
                  <span key={word} className="inline-block whitespace-nowrap">
                    {word.split("").map((char, i) => (
                      <span key={i} data-letter aria-hidden="true" className="inline-block">
                        {char}
                      </span>
                    ))}
                    {wi < words.length - 1 && <span aria-hidden="true">{" "}</span>}
                  </span>
                ))}
              </h1>

              {/* Divider */}
              <motion.div
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 1, delay: 1.4, ease: [0.22, 1, 0.36, 1] }}
                className="mt-8 h-px w-48 origin-center bg-gradient-to-r from-transparent via-cyan/50 to-transparent"
              />

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.5 }}
                className="mt-7 text-xl font-light tracking-wide text-star/85 md:text-2xl"
                style={{ textShadow: "0 2px 20px rgba(5,6,15,0.9)" }}
              >
                Designing enterprise systems for{" "}
                <span className="text-aurora font-normal">tomorrow</span>.
              </motion.p>

              {/* Role chips */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.9 }}
                className="mt-5 flex flex-wrap items-center justify-center gap-x-3 gap-y-2"
              >
                {profile.subroles.map((role, i) => (
                  <span key={role} className="flex items-center gap-3">
                    <span
                      className="font-mono text-[10px] uppercase tracking-[0.28em]"
                      style={{ color: "rgba(154,166,207,0.75)", textShadow: "0 1px 12px rgba(5,6,15,0.95)" }}
                    >
                      {role}
                    </span>
                    {i < profile.subroles.length - 1 && (
                      <span className="h-1 w-1 rounded-full bg-cyan/30" />
                    )}
                  </span>
                ))}
              </motion.div>

              {/* CTA */}
              <motion.div
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 2.3 }}
                className="mt-14 flex flex-col items-center gap-5"
              >
                <MagneticButton
                  onClick={begin}
                  className="group relative overflow-hidden rounded-full border border-cyan/50 px-12 py-4 font-mono text-sm uppercase tracking-[0.4em] text-star shadow-[0_0_30px_rgba(79,242,255,0.08)] transition-all duration-300 hover:border-cyan hover:shadow-[0_0_40px_rgba(79,242,255,0.25)] hover:text-void"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-cyan transition-transform duration-300 ease-out group-hover:scale-x-100" />
                  <span className="relative">Begin journey</span>
                </MagneticButton>

                <button
                  type="button"
                  onClick={toggleAudio}
                  className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim/60 transition-colors hover:text-cyan"
                >
                  {audioOn ? "◉ Sound on" : "○ Enable sound"}
                </button>
              </motion.div>
            </div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
