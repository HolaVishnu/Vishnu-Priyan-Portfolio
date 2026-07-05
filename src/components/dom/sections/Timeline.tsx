"use client";

import { motion } from "framer-motion";
import SectionShell from "../SectionShell";
import timelineData from "../../../data/timeline.json";

export default function Timeline() {
  return (
    <SectionShell
      id="timeline"
      designation="Satellite network // K-Belt"
      title="Every orbit taught me something."
      subtitle="A career sequence shaped by banking, consulting, service operations, and large-scale platform modernisation."
      side="right"
    >
      <div className="section-surface max-h-[58vh] overflow-y-auto p-6 md:p-8" data-lenis-prevent>
        <ol className="space-y-7">
          {timelineData.entries.map((entry, i) => (
            <motion.li
              key={entry.id}
              initial={{ opacity: 0, x: 24 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.6, delay: 0.15 + i * 0.12, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-cyan/70">
                {entry.designation}
              </p>
              <p className="mt-1.5 font-display text-lg font-semibold">
                {entry.role}
              </p>
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-dim">
                {entry.company} · {entry.period}
              </p>
              <ul className="mt-2.5 space-y-1.5">
                {entry.achievements.map((a) => (
                  <li key={a.slice(0, 24)} className="flex gap-2.5 text-xs leading-relaxed text-dim">
                    <span className="mt-0.5 text-nebula">▸</span>
                    {a}
                  </li>
                ))}
              </ul>
            </motion.li>
          ))}
        </ol>
      </div>
    </SectionShell>
  );
}
