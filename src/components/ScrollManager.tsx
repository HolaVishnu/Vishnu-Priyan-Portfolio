"use client";

import Lenis from "lenis";
import { useEffect, useRef } from "react";
import { STOPS, activeStopAt } from "../lib/journey";
import { useUniverse } from "../lib/store";

const EASE_OUT = (x: number) => 1 - Math.pow(1 - x, 3);
const PROJECTS_PROGRESS =
  STOPS.find((stop) => stop.id === "projects")?.t ?? 0.47;

/**
 * Owns Lenis and the journey scroll position. Project flights are a hard
 * hand-off: Lenis is frozen until CameraRig reports that undocking has fully
 * reached Forge Prime, then scroll is synchronized once and resumed.
 */
export default function ScrollManager() {
  const lenisRef = useRef<Lenis | null>(null);
  const resumeRafRef = useRef<number | null>(null);
  const phase = useUniverse((s) => s.phase);

  useEffect(() => {
    const lenis = new Lenis({
      lerp: 0.09,
      smoothWheel: true,
      ...({ smoothTouch: true, touchMultiplier: 1.8 } as object),
    } as ConstructorParameters<typeof Lenis>[0]);
    lenisRef.current = lenis;
    lenis.stop();

    const root = document.documentElement;
    const initialRootOverflow = root.style.overflow;

    const cancelPendingResume = () => {
      if (resumeRafRef.current !== null) {
        cancelAnimationFrame(resumeRafRef.current);
        resumeRafRef.current = null;
      }
    };

    const lockJourneyScroll = () => {
      cancelPendingResume();
      lenis.stop();
      root.style.overflow = "hidden";
    };

    const resumeJourneyAtProjects = () => {
      cancelPendingResume();
      lenis.stop();
      lenis.resize();
      const limit = document.documentElement.scrollHeight - window.innerHeight;
      if (limit > 0) {
        // Lenis deliberately remains stopped during this synchronization.
        // `force` permits the exact scroll write without briefly re-enabling
        // wheel input and creating another owner for the camera.
        lenis.scrollTo(PROJECTS_PROGRESS * limit, {
          immediate: true,
          force: true,
        });
      }

      resumeRafRef.current = requestAnimationFrame(() => {
        root.style.overflow = initialRootOverflow;
        lenis.resize();
        lenis.start();
        resumeRafRef.current = null;
      });
    };

    let rafId = 0;
    const loop = (time: number) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(loop);
    };
    rafId = requestAnimationFrame(loop);

    lenis.on("scroll", (e: Lenis) => {
      const s = useUniverse.getState();
      if (s.projectFlightPhase !== "idle") return;

      const limit = e.limit > 0 ? e.limit : 1;
      const p = Math.min(Math.max(e.scroll / limit, 0), 1);
      s.setProgress(p, e.velocity);

      const stop = activeStopAt(p);
      const id = stop?.id ?? null;
      if (s.activeSection !== id) s.setActiveSection(id);
      if (p > 0.9) s.unlock("voyager");
    });

    const navigate = (ev: Event) => {
      if (useUniverse.getState().projectFlightPhase !== "idle") return;
      const t = (ev as CustomEvent<number>).detail;
      const limit = document.documentElement.scrollHeight - window.innerHeight;
      lenis.scrollTo(t * limit, { duration: 2.4, easing: EASE_OUT });
    };
    window.addEventListener("universe:navigate", navigate);

    const unsubscribe = useUniverse.subscribe((state, prev) => {
      if (state.projectFlightPhase !== prev.projectFlightPhase) {
        const enteringFlight =
          prev.projectFlightPhase === "idle" &&
          state.projectFlightPhase !== "idle";
        const completedUndock =
          prev.projectFlightPhase === "undocking" &&
          state.projectFlightPhase === "idle";

        if (enteringFlight) lockJourneyScroll();
        if (completedUndock) resumeJourneyAtProjects();
      }

    });

    return () => {
      cancelPendingResume();
      root.style.overflow = initialRootOverflow;
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
      requestAnimationFrame(() => {
        lenis.resize();
        const state = useUniverse.getState();
        if (state.projectFlightPhase !== "idle") {
          lenis.stop();
          return;
        }
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
