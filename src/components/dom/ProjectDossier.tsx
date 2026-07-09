"use client";

import { useEffect } from "react";
import { AnimatePresence, motion } from "framer-motion";
import projectsData from "../../data/projects.json";
import { useUniverse } from "../../lib/store";

function clientName(tagline: string) {
  const parts = tagline.split("—");
  return parts[parts.length - 1]?.trim() ?? "Enterprise account";
}

export default function ProjectDossier() {
  const focusedProject = useUniverse((s) => s.focusedProject);
  const project = projectsData.projects.find((p) => p.id === focusedProject);

  const undock = () => {
    const store = useUniverse.getState();
    if (
      store.projectFlightPhase !== "docked" &&
      store.projectFlightPhase !== "docking"
    ) {
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
            className="fixed inset-0 z-35 bg-[radial-gradient(circle_at_50%_24%,rgba(43,28,90,0.28),transparent_18%),linear-gradient(180deg,rgba(2,3,10,0.7),rgba(2,3,10,0.94))]"
          />

          <motion.div
            key={project.id}
            initial={{ opacity: 0, y: 36, scale: 0.985 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.985 }}
            transition={{ duration: 0.74, delay: 0.42, ease: [0.22, 1, 0.36, 1] }}
            className="dossier-stage fixed inset-x-4 bottom-4 top-4 z-40 overflow-hidden rounded-[1.7rem] border border-cyan/12 bg-[linear-gradient(165deg,rgba(8,11,26,0.98),rgba(5,7,19,0.97))] shadow-[0_40px_120px_rgba(2,3,12,0.72)] md:inset-x-10 md:bottom-8 md:top-8"
          >
            <div className="relative z-10 flex h-full flex-col overflow-hidden">
              <div className="flex flex-wrap items-start justify-between gap-5 border-b border-white/7 px-5 py-4 md:px-8 md:py-6">
                <div className="min-w-0 max-w-4xl">
                  <div className="flex flex-wrap gap-2">
                    <span className="dossier-chip">
                      <span className="dossier-chip-dot" />
                      {project.codename}
                    </span>
                    <span className="dossier-chip">
                      <span className="dossier-chip-dot" />
                      {clientName(project.tagline)}
                    </span>
                    <span className="dossier-chip">
                      <span className="dossier-chip-dot" />
                      Docked
                    </span>
                  </div>

                  <h3 className="mt-4 max-w-3xl font-display text-3xl font-semibold leading-[0.92] tracking-tight text-star md:text-5xl">
                    {project.title}
                  </h3>
                  <p className="mt-3 max-w-2xl text-sm leading-relaxed text-dim md:text-base">
                    {project.tagline}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={undock}
                  autoFocus
                  aria-label={`Undock from ${project.title}`}
                  className="shrink-0 rounded-full border border-cyan/28 px-4 py-2 font-mono text-[10px] uppercase tracking-[0.28em] text-cyan transition-colors hover:border-cyan hover:bg-cyan/10"
                >
                  Undock
                </button>
              </div>

              <div className="grid min-h-0 flex-1 grid-cols-1 gap-0 md:grid-cols-[minmax(0,1.15fr)_minmax(23rem,0.9fr)]">
                <div
                  className="min-h-0 overflow-y-auto px-5 py-5 md:px-8 md:py-7"
                  data-lenis-prevent
                >
                  <div className="grid gap-4 xl:grid-cols-[minmax(0,1.18fr)_14rem]">
                    <div className="rounded-[1.15rem] border border-cyan/10 bg-[linear-gradient(160deg,rgba(10,14,29,0.84),rgba(5,7,18,0.78))] p-4 md:p-5">
                      <p className="eyebrow mb-3">Signal diagram</p>
                      <div className="overflow-hidden rounded-[1rem] border border-white/8 bg-black/55">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={project.diagram}
                          alt={`${project.title} architecture diagram`}
                          loading="lazy"
                          className="block w-full"
                        />
                      </div>
                    </div>

                    <div className="grid gap-3">
                      {project.outcome.map((o) => (
                        <div key={o.label} className="dossier-value-panel">
                          <p className="font-display text-2xl font-semibold text-star md:text-3xl">
                            {o.metric}
                          </p>
                          <p className="mt-1 font-mono text-[10px] uppercase tracking-[0.22em] text-dim/75">
                            {o.label}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-5 grid gap-4 xl:grid-cols-2">
                    <section className="dossier-value-panel">
                      <p className="eyebrow mb-3">The challenge</p>
                      <p className="dossier-value-copy">{project.challenge}</p>
                    </section>

                    <section className="dossier-value-panel">
                      <p className="eyebrow mb-3">Lessons learned</p>
                      <p className="dossier-value-copy">{project.lessons}</p>
                    </section>
                  </div>
                </div>

                <div
                  className="min-h-0 overflow-y-auto border-t border-white/7 px-5 py-5 md:border-l md:border-t-0 md:px-7 md:py-7"
                  data-lenis-prevent
                >
                  <section>
                    <p className="eyebrow mb-3">Architecture</p>
                    <ul className="space-y-3">
                      {project.architecture.map((item) => (
                        <li
                          key={item.slice(0, 24)}
                          className="flex gap-3 rounded-[0.95rem] border border-white/6 bg-white/[0.02] p-3 text-sm leading-relaxed text-star/80"
                        >
                          <span className="mt-0.5 text-cyan">▸</span>
                          {item}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="mt-5">
                    <p className="eyebrow mb-3">Tech stack</p>
                    <div className="flex flex-wrap gap-2">
                      {project.stack.map((tech) => (
                        <span
                          key={tech}
                          className="rounded-full border border-nebula/28 bg-nebula/6 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.15em] text-star/82"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </section>

                  {"mission_readout" in project && project.mission_readout && (
                    <section className="mt-5 dossier-value-panel">
                      <p className="eyebrow mb-3">Mission readout</p>
                      <p className="dossier-value-copy">{project.mission_readout}</p>
                    </section>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
