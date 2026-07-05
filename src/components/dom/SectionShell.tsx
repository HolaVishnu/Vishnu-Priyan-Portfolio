"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useSectionVisible } from "../../lib/useSection";

interface SectionShellProps {
  id: string;
  designation: string;
  title: ReactNode;
  subtitle?: ReactNode;
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
  subtitle,
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
            <div className="pointer-events-auto flex w-full max-w-[44rem] gap-6">
              <div className="section-rail hidden w-16 shrink-0 lg:flex">
                <span className="section-rail-line" />
                <div className="section-rail-copy">
                  <span className="section-rail-label">Orbit</span>
                  <span className="section-rail-id">{designation.split("//")[0]?.trim()}</span>
                </div>
              </div>
              <div className="min-w-0 flex-1">
                <div className="section-shell">
                  <p className="eyebrow mb-4">{designation}</p>
                  <h2 className="section-title">{title}</h2>
                  {subtitle && <p className="section-subtitle">{subtitle}</p>}
                  <div className="section-divider" />
                  {children}
                </div>
              </div>
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
              className="pointer-events-auto section-shell mx-3 mb-3 max-h-[52vh] overflow-y-auto rounded-xl p-5"
              data-lenis-prevent
            >
              <p className="eyebrow mb-2 text-[9px]">{designation}</p>
              <h2 className="section-title !mb-3 !text-xl">{title}</h2>
              {subtitle && <p className="section-subtitle mb-4 !text-sm">{subtitle}</p>}
              {children}
            </div>
          </motion.section>
        </>
      )}
    </AnimatePresence>
  );
}
