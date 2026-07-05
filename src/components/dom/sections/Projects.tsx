"use client";

import SectionShell from "../SectionShell";
import { useUniverse } from "../../../lib/store";
import { sound } from "../../../lib/sound";
import projectsData from "../../../data/projects.json";

export default function Projects() {
  const dock = (id: string) => {
    useUniverse.getState().startProjectDock(id);
    sound.confirm();
  };

  return (
    <SectionShell
      id="projects"
      designation="Planet 03 // Forge Prime"
      title="Systems shipped into orbit."
    >
      <div className="max-h-[58vh] space-y-3 overflow-y-auto pr-1" data-lenis-prevent>
        {projectsData.projects.map((project) => (
          <button
            key={project.id}
            type="button"
            onClick={() => dock(project.id)}
            className="holo-panel group block w-full p-5 text-left transition-colors duration-300 hover:border-cyan/40"
          >
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan/70">
              {project.codename}
            </p>
            <p className="mt-1.5 flex items-baseline justify-between gap-4 font-display text-lg font-semibold">
              {project.title}
              <span className="text-cyan transition-transform duration-300 group-hover:translate-x-1.5">
                →
              </span>
            </p>
            <p className="mt-1 text-xs leading-relaxed text-dim">
              {project.tagline}
            </p>
          </button>
        ))}
        <p className="pt-1 text-center font-mono text-[10px] uppercase tracking-[0.3em] text-dim">
          Select a station to dock — or click one in orbit
        </p>
      </div>
    </SectionShell>
  );
}
