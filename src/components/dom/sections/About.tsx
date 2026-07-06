"use client";

import SectionShell from "../SectionShell";
import profileRaw from "../../../data/profile.json";

const profile = profileRaw as typeof profileRaw & {
  expertise: string[];
  outcomes: string[];
  principles: { title: string; detail: string }[];
};

export default function About() {
  const featuredExpertise = profile.expertise.slice(0, 4);
  const featuredOutcomes = profile.outcomes.slice(0, 4);
  const featuredPrinciples = profile.principles.slice(0, 2);

  return (
    <SectionShell
      id="about"
      designation="Planet 01 // Origin"
      title="Architecture is the invisible force behind every resilient enterprise."
      subtitle="A systems-minded practice built across infrastructure, service operations, governance, and enterprise transformation."
    >
      <div className="section-surface section-scroll-area p-6 md:p-8" data-lenis-prevent>
        <p className="text-base leading-relaxed text-star/90 md:text-lg">
          {profile.bio[0]}
        </p>
        <p className="mt-4 max-w-3xl text-sm leading-relaxed text-dim">
          I design the operating model behind the platform: trusted CMDBs,
          governed ITAM estates, resilient cloud foundations, and the automation
          layer that keeps large enterprises moving without depending on
          heroics.
        </p>

        <div className="hairline my-6" />

        <div className="grid gap-3 md:grid-cols-2">
          {featuredExpertise.map((item) => (
            <div key={item} className="orbital-chip">
              <span className="orbital-chip-dot" />
              <span>{item}</span>
            </div>
          ))}
        </div>

        <div className="hairline my-6" />

        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan/80">
          Outcome record
        </p>
        <div className="mt-3 grid gap-3 md:grid-cols-2">
          {featuredOutcomes.map((item) => (
            <div key={item} className="metric-panel">
              <p className="text-sm leading-relaxed text-star/88">{item}</p>
            </div>
          ))}
        </div>

        <div className="hairline my-6" />

        <ul className="grid gap-5 md:grid-cols-2">
          {featuredPrinciples.map((principle) => (
            <li
              key={principle.title}
              className="rounded-sm border border-white/8 bg-white/[0.02] p-4"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.25em] text-cyan/90">
                {principle.title}
              </p>
              <p className="mt-1 text-sm leading-relaxed text-dim">
                {principle.detail}
              </p>
            </li>
          ))}
        </ul>

        <div className="hairline my-6" />

        <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-dim">
          {profile.role} / {profile.location} / {profile.coordinates}
        </p>
      </div>
    </SectionShell>
  );
}
