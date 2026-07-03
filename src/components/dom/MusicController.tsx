"use client";

import { useEffect } from "react";
import { useUniverse } from "../../lib/store";
import { music } from "../../lib/music";
import soundtrack from "../../data/soundtrack.json";

function zoneTrackFor(phase: string, progress: number): string {
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

    const update = () => {
      const s = useUniverse.getState();

      const track = zoneTrackFor(s.phase, s.progress);
      if (track !== lastTrack) {
        lastTrack = track;
        music.setZoneTrack(track);
      }

      if (s.audioOn !== lastAudioOn) {
        lastAudioOn = s.audioOn;
        if (s.audioOn) music.enable();
        else music.disable();
      }
    };

    update();
    return useUniverse.subscribe(update);
  }, []);

  return null;
}
