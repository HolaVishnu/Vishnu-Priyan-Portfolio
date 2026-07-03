import * as THREE from "three";

/**
 * The journey is a single camera flight along a Catmull-Rom spline.
 * Scroll progress (0..1) is remapped piecewise-linearly so the camera sits
 * exactly at each stop's viewpoint when progress === stop.t.
 */

export interface StopDef {
  id: string;
  name: string;
  designation: string;
  /** scroll progress at which the camera arrives */
  t: number;
  /** half-width of the progress window in which the section is visible */
  window: number;
  camera: [number, number, number];
  target: [number, number, number];
}

export const GALAXY_POSITION: [number, number, number] = [0, 18, -430];

export const STOPS: StopDef[] = [
  {
    id: "about",
    name: "Origin",
    designation: "PLANET 01 // ORIGIN",
    t: 0.14,
    window: 0.075,
    // Camera sits left of planet; target at planet so it fills centre-right.
    // Panel on left overlays with glass; planet glows through it and fills
    // the right half of the viewport.
    camera: [-5, 2.4, 54],
    target: [-16, 1, 42],
  },
  {
    id: "skills",
    name: "Constellation",
    designation: "STAR CLUSTER // NGC-1708",
    t: 0.3,
    window: 0.075,
    camera: [4, 4, 12],
    target: [18, 5, -6],
  },
  {
    id: "projects",
    name: "The Forge",
    designation: "PLANET 03 // FORGE PRIME",
    t: 0.47,
    window: 0.08,
    camera: [-8, -0.5, -46],
    target: [-26, -3, -66],
  },
  {
    id: "timeline",
    name: "Orbit Trail",
    designation: "SATELLITE NETWORK // K-BELT",
    t: 0.64,
    window: 0.075,
    camera: [5, 6, -101],
    target: [16, 6, -118],
  },
  {
    id: "resume",
    name: "The Monolith",
    designation: "ARTIFACT // TMA-1708",
    t: 0.8,
    window: 0.07,
    camera: [-2, 0.5, -152],
    target: [-10, -0.5, -166],
  },
  {
    id: "contact",
    name: "Last Moon",
    designation: "MOON // RELAY STATION",
    t: 0.95,
    window: 0.065,
    camera: [0.5, 3.2, -200],
    target: [1, 3, -212],
  },
];

// World anchors used by the 3D setpieces (kept next to the stops so the
// scene layout and the camera choreography live in one file).
export const WORLD = {
  aboutPlanet: [-16, 1, 42] as const,
  skillsCenter: [18, 5, -6] as const,
  forgePlanet: [-26, -3, -66] as const,
  timelineCenter: [16, 6, -118] as const,
  monolith: [-10, -0.5, -166] as const,
  contactMoon: [1, 3, -212] as const,
};

const camPoints: THREE.Vector3[] = [
  new THREE.Vector3(0, 1, 96),
  ...STOPS.map((s) => new THREE.Vector3(...s.camera)),
  new THREE.Vector3(0, 3.6, -205),
];

const targetPoints: THREE.Vector3[] = [
  new THREE.Vector3(0, 10, -260),
  ...STOPS.map((s) => new THREE.Vector3(...s.target)),
  new THREE.Vector3(0, 10, -340),
];

const knots = [0, ...STOPS.map((s) => s.t), 1];

const camCurve = new THREE.CatmullRomCurve3(camPoints, false, "centripetal", 0.5);
const targetCurve = new THREE.CatmullRomCurve3(targetPoints, false, "centripetal", 0.5);

/** Maps scroll progress into curve parameter space so stops land exactly. */
function mapProgress(p: number): number {
  const clamped = Math.min(Math.max(p, 0), 1);
  let i = 0;
  while (i < knots.length - 2 && clamped > knots[i + 1]) i++;
  const span = knots[i + 1] - knots[i];
  const local = span > 0 ? (clamped - knots[i]) / span : 0;
  return (i + local) / (knots.length - 1);
}

/** Writes the camera position and look-at target for a given progress. */
export function cameraStateAt(
  p: number,
  outPos: THREE.Vector3,
  outTarget: THREE.Vector3
): void {
  const u = mapProgress(p);
  camCurve.getPoint(u, outPos);
  targetCurve.getPoint(u, outTarget);
}

export function nearestStop(p: number): StopDef {
  let best = STOPS[0];
  let bestDist = Infinity;
  for (const stop of STOPS) {
    const d = Math.abs(p - stop.t);
    if (d < bestDist) {
      bestDist = d;
      best = stop;
    }
  }
  return best;
}

export function activeStopAt(p: number): StopDef | null {
  for (const stop of STOPS) {
    if (Math.abs(p - stop.t) < stop.window) return stop;
  }
  return null;
}
