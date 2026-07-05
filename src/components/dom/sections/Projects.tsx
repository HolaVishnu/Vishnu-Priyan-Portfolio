"use client";

import SectionShell from "../SectionShell";
import { useUniverse } from "../../../lib/store";
import { sound } from "../../../lib/sound";
import projectsData from "../../../data/projects.json";

export default function Projects() {
  const projectFlightPhase = useUniverse((s) => s.projectFlightPhase);

  const dock = (id: string) => {
    const store = useUniverse.getState();
    if (store.projectFlightPhase !== "idle" || store.focusedProject) return;
    store.startProjectDock(id);
    sound.confirm();
  };

  const overviewVisible = projectFlightPhase === "idle";

  if (!overviewVisible) return null;

  return (
    <SectionShell
      id="projects"
      designation="Planet 03 // Forge Prime"
      title="Systems shipped into orbit."
      subtitle="Six mission dossiers where enterprise architecture translated into measurable resilience, compliance, and cost outcomes."
    >
      <div className="section-surface p-4 md:p-5">
        <div className="mb-4 grid grid-cols-[1.2fr_0.8fr] gap-4 border-b border-white/8 pb-4 max-md:grid-cols-1">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan/75">
              Mission ledger
            </p>
            <p className="mt-2 max-w-md text-sm leading-relaxed text-dim">
              Each station is a delivered transformation, not a concept render:
              real governance, real automation, real recovery, real savings.
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center">
            <div className="rounded-sm border border-white/8 bg-white/[0.03] px-2 py-3">
              <p className="font-display text-xl font-semibold text-star">6</p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.24em] text-dim">
                Dossiers
              </p>
            </div>
            <div className="rounded-sm border border-white/8 bg-white/[0.03] px-2 py-3">
              <p className="font-display text-xl font-semibold text-star">15+</p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.24em] text-dim">
                Years
              </p>
            </div>
            <div className="rounded-sm border border-white/8 bg-white/[0.03] px-2 py-3">
              <p className="font-display text-xl font-semibold text-star">CBA+</p>
              <p className="mt-1 font-mono text-[9px] uppercase tracking-[0.24em] text-dim">
                Enterprise
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          {projectsData.projects.map((project) => (
            <button
              key={project.id}
              type="button"
              onClick={() => dock(project.id)}
              className="mission-card group block w-full text-left"
            >
              <div className="mission-card-grid">
                <div>
                  <p className="font-mono text-[9px] uppercase tracking-[0.28em] text-cyan/75">
                    {project.codename}
                  </p>
                  <p className="mt-2 font-display text-lg font-semibold leading-tight text-star">
                    {project.title}
                  </p>
                </div>
                <p className="text-sm leading-relaxed text-dim">
                  {project.tagline}
                </p>
                <span className="mission-card-arrow" aria-hidden="true">
                  →
                </span>
              </div>
            </button>
          ))}
        </div>

        <p className="pt-4 text-center font-mono text-[9px] uppercase tracking-[0.28em] text-dim">
          Select a mission dossier to initiate docking
        </p>
      </div>
    </SectionShell>
  );
}
