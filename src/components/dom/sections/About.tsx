"use client";

import SectionShell from "../SectionShell";
import profileRaw from "../../../data/profile.json";

const profile = profileRaw as typeof profileRaw & {
  expertiseTitle: string;
  expertise: string[];
  outcomesTitle: string;
  outcomes: string[];
};

export default function About() {
  return (
    <SectionShell
      id="about"
      designation="Planet 01 // Origin"
      title="Architecture is the invisible force behind every resilient enterprise."
      subtitle="A systems-minded practice built across infrastructure, service operations, governance, and enterprise transformation."
    >
      <div className="section-surface max-h-[58vh] overflow-y-auto p-6 md:p-8" data-lenis-prevent>
        <p className="text-base leading-relaxed text-star/90 md:text-lg">
          {profile.bio[0]}
        </p>
        {profile.bio.slice(1).map((para) => (
          <p key={para.slice(0, 24)} className="mt-4 text-sm leading-relaxed text-dim">
            {para}
          </p>
        ))}

        <div className="hairline my-6" />

        {/* Expertise list */}
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan/80">
          {profile.expertiseTitle}
        </p>
        <ul className="mt-3 space-y-1.5">
          {profile.expertise.map((item) => (
            <li key={item.slice(0, 32)} className="flex gap-2.5 text-xs leading-relaxed text-dim">
              <span className="mt-0.5 shrink-0 text-nebula">▸</span>
              {item}
            </li>
          ))}
        </ul>

        <div className="hairline my-6" />

        {/* Outcomes list */}
        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan/80">
          {profile.outcomesTitle}
        </p>
        <ul className="mt-3 space-y-1.5">
          {profile.outcomes.map((item) => (
            <li key={item.slice(0, 32)} className="flex gap-2.5 text-xs leading-relaxed text-dim">
              <span className="mt-0.5 shrink-0 text-cyan">▸</span>
              {item}
            </li>
          ))}
        </ul>

        <div className="hairline my-6" />

        {/* Architecture principles */}
        <ul className="space-y-4">
          {profile.principles.map((p) => (
            <li key={p.title}>
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-cyan/90">
                ▸ {p.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-dim">{p.detail}</p>
            </li>
          ))}
        </ul>

        <div className="hairline my-6" />

        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">
          {profile.role} · {profile.location} · {profile.coordinates}
        </p>
      </div>
    </SectionShell>
  );
}
