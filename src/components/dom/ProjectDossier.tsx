"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import projectsData from "../../data/projects.json";
import { useUniverse } from "../../lib/store";

/**
 * The holographic dossier that opens after the cinematic zoom docks
 * the camera at a project station.
 */
export default function ProjectDossier() {
  const focusedProject = useUniverse((s) => s.focusedProject);
  const project = projectsData.projects.find((p) => p.id === focusedProject);

  const undock = () => {
    const store = useUniverse.getState();
    if (store.projectFlightPhase !== "docked" && store.projectFlightPhase !== "docking") {
      return;
    }
    store.startProjectUndock();
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
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45 }}
            className="fixed inset-0 z-35 bg-[radial-gradient(circle_at_72%_46%,rgba(18,24,56,0.26),transparent_28%),linear-gradient(180deg,rgba(2,3,10,0.68),rgba(2,3,10,0.82))]"
          />

          <motion.aside
            key={project.id}
            initial={{ opacity: 0, x: 90 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 60 }}
            transition={{ duration: 0.7, delay: 0.55, ease: [0.22, 1, 0.36, 1] }}
            aria-label={`${project.title} dossier`}
            data-lenis-prevent
            className="holo-panel holo-corners fixed inset-x-4 bottom-4 top-4 z-40 overflow-y-auto overflow-x-hidden border-cyan/20 bg-[rgba(6,8,22,0.96)] p-5 md:inset-x-auto md:right-6 md:w-[540px] md:p-8"
          >
            <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(180deg,rgba(6,8,22,0.985),rgba(6,8,22,0.965))]" />

            <div className="relative z-10 flex items-start justify-between gap-4">
              <div className="min-w-0">
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
                aria-label={`Undock from ${project.title}`}
                className="shrink-0 rounded border border-cyan/30 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-cyan transition-colors hover:bg-cyan hover:text-void"
              >
                x Undock
              </button>
            </div>

            <div className="relative z-10 hairline my-6" />

            <section className="relative z-10">
              <p className="eyebrow mb-3">The challenge</p>
              <p className="text-sm leading-relaxed text-star/88">
                {project.challenge}
              </p>
            </section>

            <section className="relative z-10">
              <p className="eyebrow mb-3 mt-7">Signal diagram</p>
              <div className="rounded border border-cyan/20 bg-void/88 p-2 shadow-[0_0_0_1px_rgba(79,242,255,0.08),0_18px_48px_rgba(2,4,14,0.5)]">
                {/* eslint-disable-next-line @next/next/no-img-element -- static SVG asset */}
                <img
                  src={project.diagram}
                  alt={`${project.title} architecture diagram`}
                  loading="lazy"
                  className="w-full rounded border border-white/10 bg-[#050814]"
                />
              </div>
            </section>

            <section className="relative z-10">
              <p className="eyebrow mb-3 mt-7">Architecture</p>
              <ul className="space-y-2.5">
                {project.architecture.map((item) => (
                  <li
                    key={item.slice(0, 24)}
                    className="flex gap-3 text-sm leading-relaxed text-star/80"
                  >
                    <span className="mt-0.5 text-cyan">▸</span>
                    {item}
                  </li>
                ))}
              </ul>
            </section>

            <section className="relative z-10">
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
            </section>

            <section className="relative z-10">
              <p className="eyebrow mb-3 mt-7">Business outcome</p>
              <div className="grid grid-cols-3 gap-3">
                {project.outcome.map((o) => (
                  <div
                    key={o.label}
                    className="rounded border border-white/8 bg-void/58 p-3"
                  >
                    <p className="text-aurora font-display text-xl font-bold md:text-2xl">
                      {o.metric}
                    </p>
                    <p className="mt-1 text-[10px] leading-snug text-dim">
                      {o.label}
                    </p>
                  </div>
                ))}
              </div>
            </section>

            <section className="relative z-10 pb-6">
              <p className="eyebrow mb-3 mt-7">Lessons learned</p>
              <p className="border-l-2 border-nebula pl-4 text-sm leading-relaxed text-star/78">
                {project.lessons}
              </p>
            </section>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
