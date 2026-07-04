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

/** Shared frame for every celestial stop's holographic panel.
 *
 * Desktop: floating panel on the left or right, vertically centred.
 * Mobile:  compact bottom-drawer that slides up from the viewport edge.
 */
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
        <>
          {/* ── Desktop layout (md+) ── */}
          <motion.section
            key={`${id}-desktop`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.75, ease: [0.22, 1, 0.36, 1] }}
            aria-label={typeof title === "string" ? title : id}
            className={`pointer-events-none fixed inset-0 z-20 hidden items-center px-14 md:flex ${
              side === "right" ? "justify-end" : "justify-start"
            }`}
          >
            <div className="pointer-events-auto w-full max-w-xl">
              <p className="eyebrow mb-4">{designation}</p>
              <h2 className="mb-6 font-display text-5xl font-bold leading-tight tracking-tight">
                {title}
              </h2>
              {children}
            </div>
          </motion.section>

          {/* ── Mobile layout (<md) ── */}
          <motion.section
            key={`${id}-mobile`}
            initial={{ opacity: 0, y: "100%" }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: "60%" }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            aria-label={typeof title === "string" ? title : id}
            className="pointer-events-none fixed inset-x-0 bottom-0 z-20 block md:hidden"
            style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
          >
            {/* Fade from scene into panel */}
            <div
              aria-hidden="true"
              className="pointer-events-none absolute inset-x-0 -top-16 h-16"
              style={{
                background:
                  "linear-gradient(to bottom, transparent, rgba(5,6,15,0.85))",
              }}
            />
            <div
              className="pointer-events-auto holo-panel holo-corners mx-3 mb-3 max-h-[52vh] overflow-y-auto rounded-xl p-5" data-lenis-prevent
            >
              <p className="eyebrow mb-2 text-[9px]">{designation}</p>
              <h2 className="mb-4 font-display text-2xl font-bold leading-tight tracking-tight">
                {title}
              </h2>
              {children}
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
