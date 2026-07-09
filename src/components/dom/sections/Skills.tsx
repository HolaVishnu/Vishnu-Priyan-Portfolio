"use client";

import { useUniverse } from "../../../lib/store";
import SectionShell from "../SectionShell";
import skillsData from "../../../data/skills.json";

export default function Skills() {
  const groupColor = new Map(skillsData.groups.map((g) => [g.id, g.color]));
  const hoveredSkill = useUniverse((s) => s.hoveredSkill);

  return (
    <SectionShell
      id="skills"
      designation="Star cluster // NGC-1708"
      title="A constellation of disciplines."
      subtitle="Platform architecture, ITAM operations, cloud systems, and observability stitched into one operating model."
    >
      <div className="section-surface section-scroll-area p-6 md:p-8" data-lenis-prevent>
        <p className="text-sm leading-relaxed text-dim">
          Every discipline is a star. Hover them to trace the constellations —
          the ServiceNow platform feeds the data model, the ITAM estate
          (Flexera, BigFix, Tanium, SCCM) feeds the ledger, and observability
          watches it all.
        </p>

        <div className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
          {skillsData.groups.map((g) => (
            <span
              key={g.id}
              className="flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.25em] text-dim"
            >
              <span
                className="inline-block h-1.5 w-1.5 rounded-full"
                style={{ background: g.color }}
              />
              {g.name}
            </span>
          ))}
        </div>

        <div className="hairline my-5" />

        <ul className="grid grid-cols-2 gap-2 xl:grid-cols-3">
          {skillsData.skills.map((skill) => {
            const isHovered = hoveredSkill === skill.id;
            const color = groupColor.get(skill.group) ?? "#4ff2ff";
            return (
              <li
                key={skill.id}
                className="rounded-sm border px-3 py-2 font-mono text-[11px] uppercase tracking-[0.2em] transition-all duration-200"
                style={{
                  borderColor: color,
                  background: isHovered ? `${color}18` : "rgba(255,255,255,0.03)",
                  color: isHovered ? color : "rgba(223,229,250,0.80)",
                  boxShadow: isHovered ? `0 0 12px ${color}40` : "none",
                }}
              >
                {skill.name}
              </li>
            );
          })}
        </ul>
      </div>
    </SectionShell>
  );
}
