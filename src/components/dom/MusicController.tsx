"use client";

import { useEffect } from "react";
import { useUniverse } from "../../lib/store";
import { music } from "../../lib/music";
import soundtrack from "../../data/soundtrack.json";

function zoneTrackFor(
  phase: string,
  progress: number
): string {
  if (phase !== "journey") return soundtrack.landingTrack;
  const zone = soundtrack.zones.find(
    (z) => progress >= z.from && progress < z.to
  );
  return zone?.track ?? soundtrack.zones[0].track;
}

/** Watches journey progress and keeps the soundtrack in the right zone. */
export default function MusicController() {
  useEffect(() => {
    let lastTrack: string | null = null;
    let lastAudioOn = useUniverse.getState().audioOn;
    let projectFlightLocked =
      useUniverse.getState().projectFlightPhase !== "idle";
    let releaseFrame: number | null = null;
    let settleFrame: number | null = null;
    let armedForGesture = false;

    const cancelRelease = () => {
      if (releaseFrame !== null) cancelAnimationFrame(releaseFrame);
      if (settleFrame !== null) cancelAnimationFrame(settleFrame);
      releaseFrame = null;
      settleFrame = null;
    };

    const onFirstGesture = () => {
      detachGestureArming();
      if (useUniverse.getState().audioOn) music.enable();
    };

    const detachGestureArming = () => {
      if (!armedForGesture) return;
      window.removeEventListener("pointerdown", onFirstGesture);
      window.removeEventListener("keydown", onFirstGesture);
      armedForGesture = false;
    };

    const ensureGestureArming = () => {
      if (armedForGesture) return;
      window.addEventListener("pointerdown", onFirstGesture, { once: true });
      window.addEventListener("keydown", onFirstGesture, { once: true });
      armedForGesture = true;
    };

    const syncAudioToggle = () => {
      const s = useUniverse.getState();
      if (s.audioOn !== lastAudioOn) {
        lastAudioOn = s.audioOn;
        if (s.audioOn) {
          ensureGestureArming();
          music.enable();
        } else {
          detachGestureArming();
          music.disable();
        }
      }
    };

    const syncZone = () => {
      const s = useUniverse.getState();
      const track = zoneTrackFor(s.phase, s.progress);
      if (track !== lastTrack) {
        lastTrack = track;
        music.setZoneTrack(track);
      }
    };

    const update = () => {
      const s = useUniverse.getState();
      syncAudioToggle();

      if (
        s.projectFlightPhase !== "idle" ||
        s.projectFlightProject !== null
      ) {
        cancelRelease();
        projectFlightLocked = true;
        return;
      }

      if (projectFlightLocked) {
        // ScrollManager synchronizes Lenis to Forge Prime immediately after
        // undocking. Keep the soundtrack frozen until that state has survived
        // two rendered frames, preventing a transient zone from reloading it.
        if (releaseFrame === null) {
          releaseFrame = requestAnimationFrame(() => {
            releaseFrame = null;
            settleFrame = requestAnimationFrame(() => {
              settleFrame = null;
              const settled = useUniverse.getState();
              if (
                settled.projectFlightPhase !== "idle" ||
                settled.projectFlightProject !== null
              ) {
                return;
              }
              projectFlightLocked = false;
              syncZone();
            });
          });
        }
        return;
      }

      syncZone();
    };

    if (lastAudioOn) ensureGestureArming();
    update();
    const unsubscribe = useUniverse.subscribe(update);
    return () => {
      cancelRelease();
      detachGestureArming();
      unsubscribe();
    };
  }, []);

  return null;
}
