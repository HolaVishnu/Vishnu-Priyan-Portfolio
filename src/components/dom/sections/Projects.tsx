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
    >
      <div className="grid grid-cols-2 gap-2.5">
        {projectsData.projects.map((project) => (
          <button
            key={project.id}
            type="button"
            onClick={() => dock(project.id)}
            className="holo-panel group block min-h-28 w-full p-4 text-left transition-colors duration-300 hover:border-cyan/40"
          >
            <p className="font-mono text-[9px] uppercase tracking-[0.25em] text-cyan/70">
              {project.codename}
            </p>
            <p className="mt-1.5 flex items-baseline justify-between gap-3 font-display text-sm font-semibold">
              {project.title}
              <span className="text-cyan transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </p>
            <p className="mt-1 line-clamp-2 text-[11px] leading-relaxed text-dim">
              {project.tagline}
            </p>
          </button>
        ))}
        <p className="col-span-2 pt-1 text-center font-mono text-[9px] uppercase tracking-[0.28em] text-dim">
          Select a mission dossier to initiate docking
        </p>
      </div>
    </SectionShell>
  );
}
