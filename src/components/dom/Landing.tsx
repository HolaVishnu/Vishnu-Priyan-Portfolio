"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import gsap from "gsap";
import MagneticButton from "./MagneticButton";
import { useUniverse } from "../../lib/store";
import { sound } from "../../lib/sound";
import profile from "../../data/profile.json";

const BOOT_LINES = [
  "ARCHITECT CONSOLE v5.2",
  "CALIBRATING NAV ARRAY",
  "STARFIELD ONLINE",
  "AWAITING PILOT",
];

export default function Landing() {
  const phase = useUniverse((s) => s.phase);
  const audioOn = useUniverse((s) => s.audioOn);
  const [bootStep, setBootStep] = useState(0);
  const nameRef = useRef<HTMLHeadingElement>(null);

  // Boot sequence → landing
  useEffect(() => {
    if (phase !== "boot") return;
    if (useUniverse.getState().reducedMotion) {
      useUniverse.getState().setPhase("landing");
      return;
    }
    const interval = setInterval(() => {
      setBootStep((step) => {
        if (step >= BOOT_LINES.length) {
          clearInterval(interval);
          setTimeout(() => useUniverse.getState().setPhase("landing"), 500);
          return step;
        }
        return step + 1;
      });
    }, 420);
    return () => clearInterval(interval);
  }, [phase]);

  // Name reveal — letters drift in like debris assembling
  useEffect(() => {
    if (phase !== "landing" || !nameRef.current) return;
    if (useUniverse.getState().reducedMotion) return;
    const letters = nameRef.current.querySelectorAll("span[data-letter]");
    gsap.fromTo(
      letters,
      { opacity: 0, y: 44, rotateX: -50 },
      {
        opacity: 1,
        y: 0,
        rotateX: 0,
        duration: 1.15,
        stagger: 0.045,
        ease: "power3.out",
        delay: 0.2,
      }
    );
  }, [phase]);

  // Setting audioOn is enough: MusicController reacts synchronously within
  // the same click gesture, so autoplay policy is satisfied.
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
          exit={{ opacity: 0, scale: 1.04 }}
          transition={{ duration: 1.1, ease: [0.22, 1, 0.36, 1] }}
          className="fixed inset-0 z-40 flex items-center justify-center"
        >
          {phase === "boot" && (
            <div className="font-mono text-xs tracking-[0.3em] text-cyan/80" role="status">
              {BOOT_LINES.slice(0, bootStep).map((line) => (
                <p key={line} className="mb-2">
                  <span className="text-nebula">▸</span> {line}
                </p>
              ))}
              <p className="caret" />
            </div>
          )}

          {phase === "landing" && (
            <div className="flex max-w-4xl flex-col items-center px-6 text-center">
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 0.1 }}
                className="eyebrow mb-8"
              >
                SOL-3 // Incoming transmission
              </motion.p>

              <h1
                ref={nameRef}
                aria-label={profile.name}
                className="font-display text-[clamp(2.6rem,9vw,7rem)] font-bold uppercase leading-none tracking-tight"
                style={{ perspective: "600px" }}
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
                    {wi < words.length - 1 && (
                      <span aria-hidden="true">{" "}</span>
                    )}
                  </span>
                ))}
              </h1>

              <motion.p
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.3 }}
                className="mt-8 text-xl font-light text-star/90 md:text-2xl"
              >
                Designing enterprise systems for{" "}
                <span className="text-aurora font-normal">tomorrow</span>.
              </motion.p>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1, delay: 1.7 }}
                className="mt-5 font-mono text-[11px] uppercase tracking-[0.3em] text-dim"
              >
                {profile.subroles.join("  ·  ")}
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.9, delay: 2.1 }}
                className="mt-12 flex flex-col items-center gap-5"
              >
                <MagneticButton
                  onClick={begin}
                  className="group relative overflow-hidden rounded-full border border-cyan/40 px-10 py-4 font-mono text-sm uppercase tracking-[0.35em] text-star transition-colors duration-300 hover:border-cyan hover:text-void"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-cyan transition-transform duration-300 ease-out group-hover:scale-x-100" />
                  <span className="relative">Begin journey</span>
                </MagneticButton>

                <button
                  type="button"
                  onClick={toggleAudio}
                  className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim transition-colors hover:text-cyan"
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
