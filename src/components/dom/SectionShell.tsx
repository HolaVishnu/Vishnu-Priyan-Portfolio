"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSectionVisible } from "../../lib/useSection";

interface SectionShellProps {
  id: string;
  designation: string;
  title: ReactNode;
  side?: "left" | "right";
  children: ReactNode;
}

/** Shared frame for every celestial stop's holographic panel. */
export default function SectionShell({
  id,
  designation,
  title,
  side = "left",
  children,
}: SectionShellProps) {
  const visible = useSectionVisible(id);

  return (
    <AnimatePresence>
      {visible && (
        <motion.section
          key={id}
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
          aria-label={typeof title === "string" ? title : id}
          className={`pointer-events-none fixed inset-0 z-20 flex items-center px-5 md:px-14 ${
            side === "right" ? "justify-end" : "justify-start"
          }`}
        >
          <div className="pointer-events-auto w-full max-w-xl">
            <p className="eyebrow mb-4">{designation}</p>
            <h2 className="mb-6 font-display text-3xl font-bold leading-tight tracking-tight md:text-5xl">
              {title}
            </h2>
            {children}
          </div>
        </motion.section>
      )}
    </AnimatePresence>
  );
}
