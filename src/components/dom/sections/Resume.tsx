"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionShell from "../SectionShell";
import { sound } from "../../../lib/sound";
import profile from "../../../data/profile.json";
import resumeData from "../../../data/resume.json";

function TypedLine({ text, delay }: { text: string; delay: number }) {
  const [shown, setShown] = useState(0);

  useEffect(() => {
    let interval: ReturnType<typeof setInterval>;
    const start = setTimeout(() => {
      interval = setInterval(() => {
        setShown((n) => {
          if (n >= text.length) {
            clearInterval(interval);
            return n;
          }
          return n + 2;
        });
      }, 16);
    }, delay);

    return () => {
      clearTimeout(start);
      clearInterval(interval);
    };
  }, [text, delay]);

  return (
    <p className="font-mono text-[11px] leading-relaxed tracking-wider text-cyan/80">
      {text.slice(0, shown)}
    </p>
  );
}

const STATUS_STYLE: Record<string, string> = {
  Active: "text-cyan",
  Expired: "text-dim",
  Planned: "text-nebula",
};

export default function Resume() {
  const [certsOpen, setCertsOpen] = useState(false);
  const [previewOpen, setPreviewOpen] = useState(false);

  const rows: Array<{ index: string; label: string; action: () => void }> = [
    {
      index: "01",
      label: "Preview resume",
      action: () => {
        setPreviewOpen(true);
        sound.confirm();
      },
    },
    {
      index: "02",
      label: "Print / save as PDF",
      action: () => {
        window.open("/resume", "_blank");
        sound.blip();
      },
    },
    {
      index: "03",
      label: "LinkedIn ->",
      action: () => {
        window.open(profile.linkedin, "_blank", "noopener");
        sound.blip();
      },
    },
    {
      index: "04",
      label: "GitHub ->",
      action: () => {
        window.open(profile.github, "_blank", "noopener");
        sound.blip();
      },
    },
    {
      index: "05",
      label: `Certifications [${resumeData.certifications.length}]`,
      action: () => {
        setCertsOpen((v) => !v);
        sound.blip();
      },
    },
  ];

  return (
    <SectionShell
      id="resume"
      designation="Artifact // TMA-1708"
      title="The record of the voyage."
    >
      <div className="holo-panel holo-corners section-scroll-area p-6 md:p-8" data-lenis-prevent>
        <TypedLine text="ARCHITECT TERMINAL v5.2 — connection stable" delay={300} />
        <TypedLine text="> query vishnu.priyan --full-profile" delay={1100} />
        <TypedLine
          text={`${resumeData.certifications.length} certifications / 15+ years / 6 flagship programmes`}
          delay={1900}
        />

        <div className="hairline my-5" />

        <ul className="space-y-1">
          {rows.map((row) => (
            <li key={row.index}>
              <button
                type="button"
                onClick={row.action}
                className="group flex w-full items-baseline gap-4 rounded px-2 py-2.5 text-left font-mono text-sm transition-colors hover:bg-cyan/5"
              >
                <span className="text-[10px] tracking-[0.2em] text-nebula">
                  {row.index}
                </span>
                <span className="uppercase tracking-[0.2em] text-star/85 transition-colors group-hover:text-cyan">
                  {row.label}
                </span>
              </button>
            </li>
          ))}
        </ul>

        <AnimatePresence>
          {certsOpen && (
            <motion.ul
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.4 }}
              className="mt-2 space-y-1.5 overflow-hidden border-l border-nebula/40 pl-4"
            >
              {resumeData.certifications.map((cert) => (
                <li key={cert.id} className="font-mono text-[11px] text-dim">
                  <span className="text-star/80">{cert.name}</span>
                  <span className="ml-2 text-nebula">/ {cert.issuer}</span>
                  <span
                    className={`ml-2 text-[9px] uppercase tracking-[0.2em] ${
                      STATUS_STYLE[cert.status] ?? "text-dim"
                    }`}
                  >
                    [{cert.status}]
                  </span>
                </li>
              ))}
            </motion.ul>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {previewOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-void/70 p-4 backdrop-blur-sm"
            onClick={() => setPreviewOpen(false)}
          >
            <motion.div
              initial={{ opacity: 0, y: 30, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 20 }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
              role="dialog"
              aria-label="Resume preview"
              className="holo-panel holo-corners max-h-[85vh] w-full max-w-2xl overflow-y-auto p-6 md:p-10"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="eyebrow">Personnel file</p>
                  <h3 className="mt-2 font-display text-2xl font-bold">
                    {profile.name}
                  </h3>
                  <p className="mt-1 font-mono text-[11px] uppercase tracking-[0.25em] text-dim">
                    {profile.role} / {profile.location}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setPreviewOpen(false)}
                  autoFocus
                  className="shrink-0 rounded border border-cyan/30 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan transition-colors hover:bg-cyan hover:text-void"
                >
                  Close
                </button>
              </div>

              <div className="hairline my-6" />
              <p className="text-sm leading-relaxed text-star/85">
                {resumeData.summary}
              </p>

              <p className="eyebrow mb-3 mt-7">Mission highlights</p>
              <ul className="space-y-2">
                {resumeData.highlights.map((h) => (
                  <li key={h.slice(0, 24)} className="flex gap-3 text-sm text-dim">
                    <span className="mt-0.5 text-cyan">▸</span>
                    {h}
                  </li>
                ))}
              </ul>

              <p className="eyebrow mb-3 mt-7">Certifications</p>
              <div className="grid gap-2 sm:grid-cols-2">
                {resumeData.certifications.map((cert) => (
                  <div
                    key={cert.id}
                    className="rounded border border-white/8 bg-void/40 p-3"
                  >
                    <p className="text-xs font-medium text-star/85">{cert.name}</p>
                    <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.2em] text-dim">
                      {cert.issuer} /{" "}
                      <span className={STATUS_STYLE[cert.status] ?? "text-dim"}>
                        {cert.status}
                      </span>
                    </p>
                  </div>
                ))}
              </div>

              <div className="mt-8 flex justify-end">
                <a
                  href="/resume"
                  target="_blank"
                  className="rounded-full border border-cyan/40 px-6 py-2.5 font-mono text-[11px] uppercase tracking-[0.3em] text-cyan transition-colors hover:bg-cyan hover:text-void"
                >
                  Open print version
                </a>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </SectionShell>
  );
}
