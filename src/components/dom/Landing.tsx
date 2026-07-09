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
  { label: "STARFIELD GENERATION ................", status: "OK",   delay: 1 },
  { label: "WARP CORE CALIBRATION ...............", status: "OK",   delay: 2 },
  { label: "PILOT AUTHENTICATION ................", status: "OK",   delay: 3 },
  { label: "ALL SYSTEMS NOMINAL .................", status: "INIT", delay: 4 },
];

const STATUS_COLOR: Record<BootLine["status"], string> = {
  OK: "text-cyan/90",
  WARN: "text-yellow-400/90",
  INIT: "text-nebula",
};

const STATUS_LABEL: Record<BootLine["status"], string> = {
  OK: "[ OK ]",
  WARN: "[ WARN ]",
  INIT: "[ INIT ]",
};

const STEP_MS = 180;
const NOMINATE_HREF = "/nominate.html";
const INTRO_VIDEO_SRC = "/video/architects-universe-cosmic-teaser.mp4";

const LANDING_BRIEF = [
  "ServiceNow architecture",
  "Flexera / ITAM governance",
  "Enterprise automation",
];

const LANDING_METRICS = [
  { label: "Years", value: "15+" },
  { label: "Mission worlds", value: "6" },
  { label: "Focus", value: "Future systems" },
];

export default function Landing() {
  const phase = useUniverse((s) => s.phase);
  const audioOn = useUniverse((s) => s.audioOn);

  const [showIntro, setShowIntro] = useState(true);
  const [visibleLines, setVisibleLines] = useState(0);
  const [progress, setProgress] = useState(0);
  const [autoSecs, setAutoSecs] = useState(5);

  const nameRef = useRef<HTMLHeadingElement>(null);
  const introVideoRef = useRef<HTMLVideoElement>(null);
  const autoTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (phase !== "boot") return;
    if (useUniverse.getState().reducedMotion) {
      setShowIntro(false);
      return;
    }

    const video = introVideoRef.current;
    if (!video) return;

    const play = async () => {
      // Try with sound first — browsers allow this if the user has
      // previously interacted with the domain or has relaxed autoplay policy.
      video.muted = false;
      try {
        await video.play();
        return;
      } catch {
        // Browser blocked unmuted autoplay — fall back to muted
      }
      video.muted = true;
      try {
        await video.play();
      } catch {
        setShowIntro(false);
      }
    };

    void play();
  }, [phase]);

  useEffect(() => {
    if (phase !== "boot" || showIntro) return;
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
  }, [phase, showIntro]);

  useEffect(() => {
    if (phase !== "landing" || !nameRef.current) return;
    if (useUniverse.getState().reducedMotion) return;

    const letters = nameRef.current.querySelectorAll("span[data-letter]");
    gsap.fromTo(
      letters,
      { opacity: 0, y: 64, rotateX: -64, filter: "blur(10px)" },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        filter: "blur(0px)",
        duration: 1.3,
        stagger: 0.045,
        ease: "power4.out",
        delay: 0.34,
      },
    );
  }, [phase]);

  // Auto-begin: 5s after landing, launch the journey automatically
  useEffect(() => {
    if (phase !== "landing") return;
    setAutoSecs(5);
    let count = 5;
    autoTimerRef.current = setInterval(() => {
      count -= 1;
      setAutoSecs(count);
      if (count <= 0) {
        clearInterval(autoTimerRef.current!);
        autoTimerRef.current = null;
        useUniverse.getState().unlock("ignition");
        useUniverse.getState().setPhase("journey");
      }
    }, 1000);
    return () => {
      if (autoTimerRef.current) clearInterval(autoTimerRef.current);
    };
  }, [phase]);

  const toggleAudio = () => {
    useUniverse.getState().setAudioOn(!audioOn);
    sound.blip();
  };

  const begin = () => {
    if (autoTimerRef.current) {
      clearInterval(autoTimerRef.current);
      autoTimerRef.current = null;
    }
    const s = useUniverse.getState();
    s.unlock("ignition");
    s.setPhase("journey");
  };

  const skipIntro = () => {
    const video = introVideoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    sound.blip();
    setShowIntro(false);
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
          {phase === "boot" && showIntro && (
            <div className="absolute inset-0 overflow-hidden bg-black">
              <video
                ref={introVideoRef}
                className="absolute inset-0 h-full w-full object-cover"
                src={INTRO_VIDEO_SRC}
                autoPlay
                playsInline
                preload="auto"
                onEnded={() => setShowIntro(false)}
                onError={() => setShowIntro(false)}
              />

              {/* Thin bars only — enough to read text, no side darkening */}
              <div className="pointer-events-none absolute inset-x-0 top-0 h-[22%] bg-gradient-to-b from-black/50 to-transparent" />
              <div className="pointer-events-none absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-black/50 to-transparent" />
              <div className="landing-scanline absolute inset-x-0 top-[22%] h-px bg-gradient-to-r from-transparent via-cyan/40 to-transparent" />

              <div className="absolute left-6 top-7 md:left-10 md:top-9">
                <p className="font-mono text-[9px] uppercase tracking-[0.34em] text-dim/45">
                  {profile.name} // The Architect&apos;s Universe
                </p>
              </div>

              <div className="absolute bottom-8 left-6 right-6 flex items-end justify-between gap-4 md:bottom-12 md:left-10 md:right-10">
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.34em] text-cyan/58">
                    Transmission briefing // autoplay intro
                  </p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.26em] text-dim/45">
                    Sound on — browser may require a click to unmute
                  </p>
                </div>

                <button
                  type="button"
                  onClick={skipIntro}
                  className="rounded-full border border-cyan/35 bg-void/50 px-5 py-3 font-mono text-[11px] uppercase tracking-[0.34em] text-cyan backdrop-blur-md transition-colors hover:border-cyan hover:bg-cyan/10"
                >
                  Skip intro
                </button>
              </div>
            </div>
          )}

          {phase === "boot" && !showIntro && (
            <div
              className="flex w-full max-w-2xl flex-col gap-7 px-6 md:px-12"
              role="status"
              aria-live="polite"
            >
              <div className="flex items-center gap-3 border-b border-cyan/10 pb-5">
                <span
                  className="h-2 w-2 animate-pulse rounded-full bg-cyan"
                  style={{ boxShadow: "0 0 8px #4ff2ff" }}
                />
                <span className="font-mono text-[11px] uppercase tracking-[0.4em] text-cyan/70">
                  Deep Space Navigation System
                </span>
                <span className="ml-auto font-mono text-[9px] text-dim/30">
                  v5.2
                </span>
              </div>

              <div className="flex flex-col gap-3">
                {BOOT_SEQUENCE.slice(0, visibleLines).map((line) => (
                  <div
                    key={line.label}
                    className="boot-line flex items-center justify-between"
                  >
                    <span className="font-mono text-[11px] tracking-[0.18em] text-star/60">
                      {line.label}
                    </span>
                    <span
                      className={`font-mono text-[11px] tracking-widest ${STATUS_COLOR[line.status]}`}
                    >
                      {STATUS_LABEL[line.status]}
                    </span>
                  </div>
                ))}
                {visibleLines < BOOT_SEQUENCE.length && (
                  <span className="caret font-mono text-[11px] text-cyan/50" />
                )}
              </div>

              <div className="flex flex-col gap-2">
                <div className="h-px w-full bg-white/5">
                  <div
                    className="h-full transition-[width] duration-[220ms] ease-out"
                    style={{
                      width: `${progress}%`,
                      background: "linear-gradient(90deg, #4ff2ff, #7b5cff)",
                      boxShadow: "0 0 12px rgba(79,242,255,0.6)",
                    }}
                  />
                </div>
                <div className="flex justify-between font-mono text-[8px] uppercase tracking-[0.3em] text-white/25">
                  <span>Initialising</span>
                  <span>{progress}%</span>
                </div>
              </div>
            </div>
          )}

          {phase === "landing" && (
            <>
              <div
                aria-hidden="true"
                className="pointer-events-none absolute inset-0"
                style={{
                  background: `radial-gradient(ellipse 92% 76% at 50% 50%,
                    transparent 0%, rgba(5,6,15,0.34) 42%,
                    rgba(5,6,15,0.82) 72%, rgba(5,6,15,0.98) 100%)`,
                }}
              />
              <div className="landing-halo landing-halo-a absolute left-[18%] top-[48%] h-64 w-64 -translate-x-1/2 -translate-y-1/2 rounded-full" />
              <div className="landing-halo landing-halo-b absolute right-[20%] top-[42%] h-72 w-72 translate-x-1/2 -translate-y-1/2 rounded-full" />
              <div className="landing-grid absolute inset-x-0 bottom-[18%] h-px opacity-70" />

              <div className="relative flex w-full max-w-6xl flex-col items-center px-6 text-center">
                <motion.div
                  initial={{ opacity: 0, x: -16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.9, delay: 0.1 }}
                  className="absolute -top-18 left-0 hidden md:block"
                >
                  <p className="font-mono text-[10px] uppercase tracking-[0.4em] text-cyan/60">
                    {profile.callsign}
                  </p>
                  <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.3em] text-dim/50">
                    {profile.coordinates}
                  </p>
                </motion.div>

                <motion.a
                  href={NOMINATE_HREF}
                  target="_blank"
                  rel="noopener"
                  initial={{ opacity: 0, x: 16 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.9, delay: 2.6 }}
                  className="absolute -top-18 right-0 hidden items-center gap-2 md:flex"
                  style={{ textDecoration: "none" }}
                >
                  <span
                    className="inline-block h-1.5 w-1.5 rounded-full bg-magenta"
                    style={{ boxShadow: "0 0 6px rgba(200,107,255,0.8)" }}
                  />
                  <span className="font-mono text-[8px] uppercase tracking-[0.3em] text-magenta/80 transition-colors hover:text-magenta">
                    Awwwards Nominee
                  </span>
                </motion.a>

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

                <h1
                  ref={nameRef}
                  aria-label={profile.name}
                  className="font-display text-[clamp(3rem,10vw,8rem)] font-bold uppercase leading-none tracking-tight"
                  style={{
                    perspective: "800px",
                    textShadow:
                      "0 0 80px rgba(79,242,255,0.15), 0 2px 40px rgba(5,6,15,0.8)",
                  }}
                >
                  {profile.name.split(" ").map((word, wi, words) => (
                    <span key={word} className="inline-block whitespace-nowrap">
                      {word.split("").map((char, i) => (
                        <span
                          key={i}
                          data-letter
                          aria-hidden="true"
                          className="inline-block"
                        >
                          {char}
                        </span>
                      ))}
                      {wi < words.length - 1 && <span aria-hidden="true"> </span>}
                    </span>
                  ))}
                </h1>

                <motion.div
                  initial={{ scaleX: 0, opacity: 0 }}
                  animate={{ scaleX: 1, opacity: 1 }}
                  transition={{
                    duration: 1,
                    delay: 1.35,
                    ease: [0.22, 1, 0.36, 1],
                  }}
                  className="mt-8 h-px w-48 origin-center bg-gradient-to-r from-transparent via-cyan/50 to-transparent"
                />

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 1, delay: 1.48 }}
                  className="mt-7 max-w-4xl text-[clamp(1.2rem,2vw,1.9rem)] font-light tracking-[0.02em] text-star/88"
                  style={{ textShadow: "0 2px 20px rgba(5,6,15,0.9)" }}
                >
                  Designing enterprise systems for{" "}
                  <span className="text-aurora font-normal">tomorrow</span>.
                </motion.p>

                <motion.p
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 1.72 }}
                  className="mt-5 max-w-3xl text-sm leading-relaxed text-dim md:text-base"
                >
                  A cinematic voyage through platform architecture, cloud
                  governance, AI automation, and operating models designed for
                  enterprise scale.
                </motion.p>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 1, delay: 1.92 }}
                  className="mt-6 flex flex-wrap items-center justify-center gap-3"
                >
                  {LANDING_BRIEF.map((item) => (
                    <span key={item} className="landing-chip">
                      {item}
                    </span>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 2.05 }}
                  className="mt-8 grid w-full max-w-3xl gap-3 md:grid-cols-3"
                >
                  {LANDING_METRICS.map((metric) => (
                    <div key={metric.label} className="landing-metric">
                      <p className="landing-metric-value">{metric.value}</p>
                      <p className="landing-metric-label">{metric.label}</p>
                    </div>
                  ))}
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 18 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.9, delay: 2.3 }}
                  className="mt-12 flex flex-col items-center gap-5"
                >
                  <MagneticButton
                    onClick={begin}
                    className="group landing-cta relative overflow-hidden rounded-full border border-cyan/50 px-12 py-4 font-mono text-sm uppercase tracking-[0.4em] text-star transition-all duration-300 hover:border-cyan hover:text-void"
                  >
                    <span className="absolute inset-0 origin-left scale-x-0 bg-cyan transition-transform duration-300 ease-out group-hover:scale-x-100" />
                    <span className="relative">Begin journey</span>
                  </MagneticButton>

                  <button
                    type="button"
                    onClick={toggleAudio}
                    className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim/60 transition-colors hover:text-cyan"
                  >
                    {audioOn ? "Disable sound" : "Enable sound"}
                  </button>

                  {autoSecs > 0 && autoSecs <= 5 && (
                    <p className="font-mono text-[9px] uppercase tracking-[0.3em] text-dim/35 transition-opacity duration-700">
                      Auto-launching in {autoSecs}s
                    </p>
                  )}
                </motion.div>
              </div>
            </>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
