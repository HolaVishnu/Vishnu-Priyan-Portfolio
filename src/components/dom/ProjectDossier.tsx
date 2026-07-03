"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUniverse } from "../../lib/store";
import { sound } from "../../lib/sound";
import projectsData from "../../data/projects.json";

/**
 * The holographic dossier that opens after the cinematic zoom docks
 * the camera at a project station.
 */
export default function ProjectDossier() {
  const focusedProject = useUniverse((s) => s.focusedProject);
  const project = projectsData.projects.find((p) => p.id === focusedProject);

  const undock = () => {
    useUniverse.getState().setFocusedProject(null);
    sound.blip();
  };

  useEffect(() => {
    if (!focusedProject) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") undock();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [focusedProject]);

  return (
    <AnimatePresence>
      {project && (
        <motion.aside
          key={project.id}
          initial={{ opacity: 0, x: 90 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
          aria-label={`${project.title} dossier`}
          className="holo-panel holo-corners fixed inset-x-4 bottom-4 top-4 z-40 overflow-y-auto p-6 md:inset-x-auto md:right-6 md:w-[540px] md:p-8"
        >
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="eyebrow">{project.codename}</p>
              <h3 className="mt-2 font-display text-2xl font-bold tracking-tight md:text-3xl">
                {project.title}
              </h3>
              <p className="mt-1.5 text-sm text-dim">{project.tagline}</p>
            </div>
            <button
              type="button"
              onClick={undock}
              autoFocus
              className="shrink-0 rounded border border-cyan/30 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan transition-colors hover:bg-cyan hover:text-void"
            >
              ✕ Undock
            </button>
          </div>

          <div className="hairline my-6" />

          <p className="eyebrow mb-3">The challenge</p>
          <p className="text-sm leading-relaxed text-star/85">{project.challenge}</p>

          <p className="eyebrow mb-3 mt-7">Architecture</p>
          <ul className="space-y-2.5">
            {project.architecture.map((item) => (
              <li key={item.slice(0, 24)} className="flex gap-3 text-sm leading-relaxed text-dim">
                <span className="mt-0.5 text-cyan">▸</span>
                {item}
              </li>
            ))}
          </ul>

          <p className="eyebrow mb-3 mt-7">Signal diagram</p>
          {/* eslint-disable-next-line @next/next/no-img-element -- static SVG asset */}
          <img
            src={project.diagram}
            alt={`${project.title} architecture diagram`}
            loading="lazy"
            className="w-full rounded border border-white/10 bg-void/60"
          />

          <p className="eyebrow mb-3 mt-7">Tech stack</p>
          <div className="flex flex-wrap gap-2">
            {project.stack.map((tech) => (
              <span
                key={tech}
                className="rounded-full border border-nebula/40 px-3 py-1 font-mono text-[10px] uppercase tracking-[0.15em] text-star/80"
              >
                {tech}
              </span>
            ))}
          </div>

          <p className="eyebrow mb-3 mt-7">Business outcome</p>
          <div className="grid grid-cols-3 gap-3">
            {project.outcome.map((o) => (
              <div key={o.label} className="rounded border border-white/8 bg-void/40 p-3">
                <p className="text-aurora font-display text-xl font-bold md:text-2xl">
                  {o.metric}
                </p>
                <p className="mt-1 text-[10px] leading-snug text-dim">{o.label}</p>
              </div>
            ))}
          </div>

          <p className="eyebrow mb-3 mt-7">Lessons learned</p>
          <p className="border-l-2 border-nebula pl-4 text-sm leading-relaxed text-dim">
            {project.lessons}
          </p>
        </motion.aside>
      )}
    </AnimatePresence>
  );
}
