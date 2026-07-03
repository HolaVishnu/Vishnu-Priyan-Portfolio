"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Sci-fi targeting reticle cursor.
 * - Inner dot: exact pointer position, no lag.
 * - Outer ring: spring-trailed, dashed segments, slowly rotates.
 * - 4 corner L-brackets: converge inward on hover ("lock on").
 * - Click ripple: pulse ring that fades out.
 * - Fine-pointer only — coarse (touch) gets OS cursor.
 */
export default function Cursor() {
  const [enabled, setEnabled] = useState(false);
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<SVGSVGElement>(null);
  const bracketRef = useRef<HTMLDivElement>(null);
  const rippleRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!window.matchMedia("(pointer: fine)").matches) return;
    setEnabled(true);
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const dot = dotRef.current;
    const ring = ringRef.current;
    const brackets = bracketRef.current;
    const ripple = rippleRef.current;
    if (!dot || !ring || !brackets || !ripple) return;

    let mx = -200, my = -200;
    let rx = -200, ry = -200;
    let hovering = false;
    let rotation = 0;
    let rafId = 0;
    let rippleTimeout = 0;

    const onMove = (e: PointerEvent) => {
      mx = e.clientX;
      my = e.clientY;
      const t = e.target as Element | null;
      hovering = !!t?.closest("a, button, [data-cursor], [role='button']");
    };

    const onClick = (e: MouseEvent) => {
      ripple.style.left = `${e.clientX}px`;
      ripple.style.top = `${e.clientY}px`;
      ripple.style.opacity = "1";
      ripple.style.transform = "translate(-50%,-50%) scale(0)";
      ripple.style.transition = "none";
      // Force reflow
      void ripple.offsetWidth;
      ripple.style.transition =
        "transform 0.55s cubic-bezier(0.22,1,0.36,1), opacity 0.55s ease";
      ripple.style.transform = "translate(-50%,-50%) scale(1)";
      ripple.style.opacity = "0";
      clearTimeout(rippleTimeout);
      rippleTimeout = window.setTimeout(() => {
        ripple.style.opacity = "0";
      }, 560);
    };

    const loop = () => {
      // Spring lerp for the ring
      rx += (mx - rx) * 0.14;
      ry += (my - ry) * 0.14;
      rotation += hovering ? 0.4 : 0.18;

      // Dot — exact, no lag
      dot.style.transform = `translate(${mx}px,${my}px) translate(-50%,-50%)`;

      // Ring — trailed + rotating
      const ringScale = hovering ? 1.65 : 1;
      ring.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%) scale(${ringScale}) rotate(${rotation}deg)`;
      ring.style.opacity = hovering ? "1" : "0.6";

      // Brackets — converge on hover
      const bOffset = hovering ? "4px" : "10px";
      brackets.style.transform = `translate(${rx}px,${ry}px) translate(-50%,-50%)`;
      brackets.style.setProperty("--b-off", bOffset);
      brackets.style.opacity = hovering ? "1" : "0.45";

      rafId = requestAnimationFrame(loop);
    };

    rafId = requestAnimationFrame(loop);
    window.addEventListener("pointermove", onMove, { passive: true });
    window.addEventListener("click", onClick);

    return () => {
      cancelAnimationFrame(rafId);
      clearTimeout(rippleTimeout);
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("click", onClick);
    };
  }, [enabled]);

  if (!enabled) return null;

  // SVG ring: 32px, dashed circle
  const R = 14; // radius
  const circ = 2 * Math.PI * R;

  return (
    <div aria-hidden="true" className="pointer-events-none fixed inset-0 z-[90]">
      {/* Inner dot */}
      <div
        ref={dotRef}
        className="absolute left-0 top-0 h-[5px] w-[5px] rounded-full"
        style={{ background: "rgba(79,242,255,0.95)", boxShadow: "0 0 6px rgba(79,242,255,0.8)" }}
      />

      {/* Dashed rotating ring */}
      <svg
        ref={ringRef}
        width="32"
        height="32"
        viewBox="0 0 32 32"
        className="absolute left-0 top-0"
        style={{ transition: "opacity 0.25s ease, transform 0s" }}
      >
        <circle
          cx="16"
          cy="16"
          r={R}
          fill="none"
          stroke="rgba(79,242,255,0.9)"
          strokeWidth="1"
          strokeDasharray={`${circ * 0.18} ${circ * 0.07}`}
        />
        {/* Corner accent ticks */}
        <circle
          cx="16"
          cy="16"
          r={R}
          fill="none"
          stroke="rgba(79,242,255,0.5)"
          strokeWidth="1.5"
          strokeDasharray={`2 ${circ - 2}`}
        />
      </svg>

      {/* L-bracket corners — converge on hover */}
      <div
        ref={bracketRef}
        className="absolute left-0 top-0 h-10 w-10"
        style={{
          transition: "opacity 0.25s ease, transform 0s",
          ["--b-off" as string]: "10px",
        }}
      >
        {/* Top-left */}
        <div
          className="absolute"
          style={{
            top: "var(--b-off)",
            left: "var(--b-off)",
            width: 7,
            height: 7,
            borderTop: "1.5px solid rgba(79,242,255,0.9)",
            borderLeft: "1.5px solid rgba(79,242,255,0.9)",
            transition: "top 0.2s cubic-bezier(0.22,1,0.36,1), left 0.2s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
        {/* Top-right */}
        <div
          className="absolute"
          style={{
            top: "var(--b-off)",
            right: "var(--b-off)",
            width: 7,
            height: 7,
            borderTop: "1.5px solid rgba(79,242,255,0.9)",
            borderRight: "1.5px solid rgba(79,242,255,0.9)",
            transition: "top 0.2s cubic-bezier(0.22,1,0.36,1), right 0.2s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
        {/* Bottom-left */}
        <div
          className="absolute"
          style={{
            bottom: "var(--b-off)",
            left: "var(--b-off)",
            width: 7,
            height: 7,
            borderBottom: "1.5px solid rgba(79,242,255,0.9)",
            borderLeft: "1.5px solid rgba(79,242,255,0.9)",
            transition: "bottom 0.2s cubic-bezier(0.22,1,0.36,1), left 0.2s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
        {/* Bottom-right */}
        <div
          className="absolute"
          style={{
            bottom: "var(--b-off)",
            right: "var(--b-off)",
            width: 7,
            height: 7,
            borderBottom: "1.5px solid rgba(79,242,255,0.9)",
            borderRight: "1.5px solid rgba(79,242,255,0.9)",
            transition: "bottom 0.2s cubic-bezier(0.22,1,0.36,1), right 0.2s cubic-bezier(0.22,1,0.36,1)",
          }}
        />
      </div>

      {/* Click ripple */}
      <div
        ref={rippleRef}
        className="absolute left-0 top-0 h-16 w-16 rounded-full"
        style={{
          border: "1px solid rgba(79,242,255,0.6)",
          opacity: 0,
          pointerEvents: "none",
        }}
      />
    </div>
  );
}
