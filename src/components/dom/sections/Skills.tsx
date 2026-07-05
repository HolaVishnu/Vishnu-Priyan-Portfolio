"use client";

import SectionShell from "../SectionShell";
import skillsData from "../../../data/skills.json";

export default function Skills() {
  const groupColor = new Map(skillsData.groups.map((g) => [g.id, g.color]));

  return (
    <SectionShell
      id="skills"
      designation="Star cluster // NGC-1708"
      title="A constellation of disciplines."
      subtitle="Platform architecture, ITAM operations, cloud systems, and observability stitched into one operating model."
    >
      <div className="section-surface max-h-[58vh] overflow-y-auto p-6 md:p-8" data-lenis-prevent>
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

        <ul className="grid grid-cols-2 gap-2">
          {skillsData.skills.map((skill) => (
            <li
              key={skill.id}
              className="rounded-sm border border-white/6 bg-white/[0.03] px-3 py-2 font-mono text-[11px] uppercase tracking-[0.2em] text-star/80"
              style={{ borderColor: groupColor.get(skill.group) ?? "#4ff2ff" }}
            >
              {skill.name}
            </li>
          ))}
        </ul>
      </div>
    </SectionShell>
  );
}
