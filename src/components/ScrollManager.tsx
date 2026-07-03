"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import { STOPS, activeStopAt } from "../lib/journey";
import { useUniverse } from "../lib/store";
import { ambient } from "../lib/sound";

const EASE_OUT = (x: number) => 1 - Math.pow(1 - x, 3);

/**
 * Owns the Lenis instance. Scroll position becomes journey progress;
 * "universe:navigate" events (from the HUD minimap) fly to a stop.
 */
export default function ScrollManager() {
  const lenisRef = useRef<Lenis | null>(null);
  const phase = useUniverse((s) => s.phase);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      // smoothTouch/touchMultiplier are valid Lenis options not yet typed
      // in this version's type definitions.
      ...({ smoothTouch: true, touchMultiplier: 1.8 } as object),
    } as ConstructorParameters<typeof Lenis>[0]);
    lenisRef.current = lenis;
    lenis.stop();

    let rafId = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    lenis.on("scroll", (e: Lenis) => {
      const limit = e.limit > 0 ? e.limit : 1;
      const p = Math.min(Math.max(e.scroll / limit, 0), 1);
      const s = useUniverse.getState();
      s.setProgress(p, e.velocity);

      const stop = activeStopAt(p);
      const id = stop?.id ?? null;
      if (s.activeSection !== id) s.setActiveSection(id);
      if (p > 0.9) s.unlock("voyager");
    });

    const navigate = (ev: Event) => {
      const t = (ev as CustomEvent<number>).detail;
      const limit = document.documentElement.scrollHeight - window.innerHeight;
      lenis.scrollTo(t * limit, { duration: 2.4, easing: EASE_OUT });
    };
    window.addEventListener("universe:navigate", navigate);

    // Docking at a station pauses travel; undocking resumes it.
    // Also drive the per-section ambient engine.
    const unsubscribe = useUniverse.subscribe((state, prev) => {
      if (state.focusedProject !== prev.focusedProject) {
        if (state.focusedProject) lenis.stop();
        else if (state.phase === "journey") lenis.start();
      }
      // Ambient section morph
      if (state.activeSection !== prev.activeSection) {
        ambient.setSection(state.activeSection);
      }
      // Ambient enable/disable follows music toggle
      if (state.audioOn !== prev.audioOn) {
        if (state.audioOn) ambient.enable();
        else ambient.disable();
      }
    });

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener("universe:navigate", navigate);
      unsubscribe();
      lenis.destroy();
    };
  }, []);

  useEffect(() => {
    const lenis = lenisRef.current;
    if (!lenis) return;
    if (phase === "journey") {
      // Wait one frame for the scroll runway to expand to full length
      requestAnimationFrame(() => {
        lenis.resize();
        lenis.start();
        const limit =
          document.documentElement.scrollHeight - window.innerHeight;
        lenis.scrollTo(STOPS[0].t * limit, { duration: 3.4, easing: EASE_OUT });
      });
    } else {
      lenis.stop();
    }
  }, [phase]);

  return null;
}
