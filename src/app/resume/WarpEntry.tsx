"use client";

import { useEffect, useRef } from "react";

/**
 * When the resume page opens (always in a new tab from the 3D portfolio),
 * this overlay transitions from deep-space void to the white print surface —
 * a warp-exit effect so the page doesn't just hard-cut into existence.
 */
export default function WarpEntry() {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = overlayRef.current;
    if (!el) return;
    // Frame 1: full void cover
    el.style.opacity = "1";
    // Animate out
    const id = requestAnimationFrame(() => {
      el.style.transition = "opacity 0.9s cubic-bezier(0.22,1,0.36,1)";
      el.style.opacity = "0";
    });
    const hide = setTimeout(() => {
      el.style.display = "none";
    }, 1000);
    return () => {
      cancelAnimationFrame(id);
      clearTimeout(hide);
    };
  }, []);

  return (
    <>
      {/* Void warp-entry overlay */}
      <div
        ref={overlayRef}
        aria-hidden="true"
        style={{
          position: "fixed",
          inset: 0,
          zIndex: 9999,
          background: "#05060f",
          pointerEvents: "none",
          opacity: 1,
        }}
      />

      {/* Return to Universe button — floats top-left, no-print */}
      <a
        href="javascript:history.back()"
        className="no-print"
        style={{
          position: "fixed",
          top: "1.5rem",
          left: "1.5rem",
          zIndex: 100,
          display: "flex",
          alignItems: "center",
          gap: "0.5rem",
          padding: "0.5rem 1rem",
          background: "#05060f",
          border: "1px solid rgba(79,242,255,0.3)",
          borderRadius: "999px",
          fontFamily: "'IBM Plex Mono', monospace",
          fontSize: "0.5625rem",
          letterSpacing: "0.3em",
          textTransform: "uppercase",
          color: "rgba(79,242,255,0.9)",
          textDecoration: "none",
          transition: "all 0.3s cubic-bezier(0.22,1,0.36,1)",
          boxShadow: "0 0 20px rgba(79,242,255,0.08)",
        }}
        onMouseEnter={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background = "rgba(79,242,255,0.1)";
          (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(79,242,255,0.6)";
        }}
        onMouseLeave={(e) => {
          (e.currentTarget as HTMLAnchorElement).style.background = "#05060f";
          (e.currentTarget as HTMLAnchorElement).style.borderColor = "rgba(79,242,255,0.3)";
        }}
      >
        ← Return to Universe
      </a>
    </>
  );
}
