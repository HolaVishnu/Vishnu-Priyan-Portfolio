import { create } from "zustand";

export type Phase = "boot" | "landing" | "journey";
export type Transmission = "idle" | "sending" | "sent";
export type Quality = "high" | "low";

export interface AchievementUnlock {
  id: string;
  at: number;
}

interface UniverseState {
  phase: Phase;
  /** 0..1 position along the journey spline */
  progress: number;
  /** smoothed scroll velocity from Lenis, px/frame */
  velocity: number;
  activeSection: string | null;
  focusedProject: string | null;
  audioOn: boolean;
  warp: boolean;
  transmission: Transmission;
  quality: Quality;
  reducedMotion: boolean;
  unlocked: string[];
  lastUnlock: AchievementUnlock | null;
  /** "Title · Artist · NCS" while a soundtrack track plays, else null */
  nowPlaying: string | null;

  setPhase: (phase: Phase) => void;
  setProgress: (progress: number, velocity: number) => void;
  setActiveSection: (id: string | null) => void;
  setFocusedProject: (id: string | null) => void;
  setAudioOn: (on: boolean) => void;
  setWarp: (warp: boolean) => void;
  setTransmission: (t: Transmission) => void;
  setQuality: (q: Quality) => void;
  setReducedMotion: (r: boolean) => void;
  setNowPlaying: (t: string | null) => void;
  unlock: (id: string) => void;
}

export const useUniverse = create<UniverseState>((set, get) => ({
  phase: "boot",
  progress: 0,
  velocity: 0,
  activeSection: null,
  focusedProject: null,
  audioOn: false,
  warp: false,
  transmission: "idle",
  quality: "high",
  reducedMotion: false,
  unlocked: [],
  lastUnlock: null,
  nowPlaying: null,

  setPhase: (phase) => set({ phase }),
  setProgress: (progress, velocity) => set({ progress, velocity }),
  setActiveSection: (activeSection) => set({ activeSection }),
  setFocusedProject: (focusedProject) => set({ focusedProject }),
  setAudioOn: (audioOn) => set({ audioOn }),
  setWarp: (warp) => set({ warp }),
  setTransmission: (transmission) => set({ transmission }),
  setQuality: (quality) => set({ quality }),
  setReducedMotion: (reducedMotion) => set({ reducedMotion }),
  setNowPlaying: (nowPlaying) => set({ nowPlaying }),
  unlock: (id) => {
    const { unlocked } = get();
    if (unlocked.includes(id)) return;
    set({ unlocked: [...unlocked, id], lastUnlock: { id, at: Date.now() } });
  },
}));
