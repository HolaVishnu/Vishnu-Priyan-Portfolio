"use client";

import SectionShell from "../SectionShell";
import profile from "../../../data/profile.json";

export default function About() {
  return (
    <SectionShell
      id="about"
      designation="Planet 01 // Origin"
      title="Architecture is a creative act."
    >
      <div className="holo-panel holo-corners max-h-[58vh] overflow-y-auto p-6 md:p-8" data-lenis-prevent>
        <p className="text-base leading-relaxed text-star/90 md:text-lg">
          {profile.bio[0]}
        </p>
        {profile.bio.slice(1).map((para) => (
          <p key={para.slice(0, 24)} className="mt-4 text-sm leading-relaxed text-dim">
            {para}
          </p>
        ))}

        <div className="hairline my-6" />

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
