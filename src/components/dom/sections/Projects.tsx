"use client";

import { motion } from "framer-motion";
import SectionShell from "../SectionShell";
import { useUniverse } from "../../../lib/store";
import { sound } from "../../../lib/sound";
import projectsData from "../../../data/projects.json";

function clientName(tagline: string) {
  const parts = tagline.split("—");
  return parts[parts.length - 1]?.trim() ?? "Enterprise account";
}

export default function Projects() {
  const projectFlightPhase = useUniverse((s) => s.projectFlightPhase);
  const featuredProject = projectsData.projects[0];
  const remainingProjects = projectsData.projects.slice(1);

  const dock = (id: string) => {
    const store = useUniverse.getState();
    if (store.projectFlightPhase !== "idle" || store.focusedProject) return;
    store.startProjectDock(id);
    sound.confirm();
  };

  if (projectFlightPhase !== "idle") return null;

  return (
    <SectionShell
      id="projects"
      designation="Planet 03 // Forge Prime"
      title="Systems shipped into orbit."
      subtitle="Six mission dossiers where enterprise architecture translated into measurable resilience, compliance, and cost outcomes."
    >
      <div className="section-surface section-scroll-area p-4 md:p-5" data-lenis-prevent>
        <div className="project-masthead">
          <div className="project-masthead-copy">
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan/75">
              Mission forge
            </p>
            <p className="mt-2 max-w-xl text-sm leading-relaxed text-dim">
              A shipyard of delivered architecture programmes across banking,
              observability, CMDB governance, endpoint control, and cloud
              intelligence.
            </p>
          </div>
          <div className="project-kpis">
            <span>6 dossiers</span>
            <span>15+ years</span>
            <span>bank-scale delivery</span>
          </div>
        </div>

        <div className="project-overview-grid mt-4">
          <div className="forge-brief">
            <p className="forge-brief-label">Forge condition</p>
            <p className="forge-brief-copy">
              Every station in orbit is a real programme: no concepts, no
              moodboards, only systems that had to survive audit, scale, and
              enterprise politics.
            </p>
          </div>

          <button
            type="button"
            onClick={() => dock(featuredProject.id)}
            className="featured-mission block w-full text-left"
          >
            <div className="featured-mission-meta">
              <span>{featuredProject.codename}</span>
              <span>Prime dossier</span>
            </div>
            <div className="featured-mission-grid">
              <div>
                <p className="font-display text-[clamp(1.7rem,2.5vw,2.8rem)] font-semibold leading-[0.94] text-star">
                  {featuredProject.title}
                </p>
                <p className="mt-3 max-w-xl text-sm leading-relaxed text-dim">
                  {featuredProject.tagline}
                </p>
              </div>
              <div className="featured-mission-stat">
                <span className="featured-mission-arrow" aria-hidden="true">
                  →
                </span>
              </div>
            </div>
          </button>
        </div>

        <div className="mission-lane mt-4">
          {remainingProjects.map((project, index) => (
            <motion.button
              key={project.id}
              type="button"
              onClick={() => dock(project.id)}
              className="mission-card group block w-full text-left"
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.55, delay: index * 0.05, ease: [0.22, 1, 0.36, 1] }}
            >
              <div className="mission-card-grid">
                <div>
                  <p className="mission-index">
                    Mission {String(index + 2).padStart(2, "0")}
                  </p>
                  <p className="mt-2 font-display text-base font-semibold leading-tight text-star md:text-lg">
                    {project.title}
                  </p>
                </div>
                <div>
                  <p className="text-sm leading-relaxed text-dim">
                    {project.tagline}
                  </p>
                  <p className="mt-2 font-mono text-[10px] uppercase tracking-[0.22em] text-cyan/62">
                    Dock to {clientName(project.tagline)}
                  </p>
                </div>
                <span className="mission-card-arrow" aria-hidden="true">
                  →
                </span>
              </div>
            </motion.button>
          ))}
        </div>

        <p className="pt-4 text-center font-mono text-[9px] uppercase tracking-[0.28em] text-dim">
          Select a dossier to initiate docking
        </p>
      </div>
    </SectionShell>
  );
}
