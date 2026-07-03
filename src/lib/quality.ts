import type { Quality } from "./store";

/** Rough device-capability heuristic, evaluated once before the canvas mounts. */
export function detectQuality(): Quality {
  if (typeof window === "undefined") return "high";
  const coarse = window.matchMedia("(pointer: coarse)").matches;
  const nav = navigator as Navigator & { deviceMemory?: number };
  const lowMemory = nav.deviceMemory !== undefined && nav.deviceMemory <= 4;
  const fewCores =
    navigator.hardwareConcurrency !== undefined &&
    navigator.hardwareConcurrency <= 4;
  return coarse || lowMemory || fewCores ? "low" : "high";
}
