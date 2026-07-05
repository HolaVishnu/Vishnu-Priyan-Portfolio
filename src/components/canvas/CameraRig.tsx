import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import * as THREE from "three";
import {
  cameraStateAt,
  PROJECTS_OVERVIEW,
  STOPS,
  WORLD,
} from "../../lib/journey";
import { useUniverse, type ProjectFlightPhase } from "../../lib/store";
import { getStationPosition } from "../../lib/stationRegistry";

const BASE_FOV = 42;
const DOCK_DURATION = 1.45;
const UNDOCK_DURATION = 1.75;
const DOCK_CLEARANCE = 5.4;

const desiredPos = new THREE.Vector3();
const desiredTarget = new THREE.Vector3();
const currentTarget = new THREE.Vector3(0, 10, -260);
const forgeCenter = new THREE.Vector3(...WORLD.forgePlanet);
const projectsOverviewPos = new THREE.Vector3(...PROJECTS_OVERVIEW.camera);
const projectsOverviewTarget = new THREE.Vector3(...PROJECTS_OVERVIEW.target);
const projectsProgress = STOPS.find((stop) => stop.id === "projects")?.t ?? 0.47;

function easeInOutCubic(value: number): number {
  return value < 0.5
    ? 4 * value * value * value
    : 1 - Math.pow(-2 * value + 2, 3) / 2;
}

function shortestAngleDelta(from: number, to: number): number {
  return Math.atan2(Math.sin(to - from), Math.cos(to - from));
}

function writeDockPose(station: THREE.Vector3, out: THREE.Vector3): void {
  const dx = station.x - forgeCenter.x;
  const dz = station.z - forgeCenter.z;
  const length = Math.max(Math.hypot(dx, dz), 0.001);

  out.set(
    station.x + (dx / length) * DOCK_CLEARANCE,
    station.y + 1.8,
    station.z + (dz / length) * DOCK_CLEARANCE
  );
}

/** Keep every project flight on an exterior arc around Forge Prime. */
function writeOrbitalArc(
  out: THREE.Vector3,
  startAngle: number,
  startRadius: number,
  startY: number,
  end: THREE.Vector3,
  progress: number,
  radialBow: number,
  verticalBow: number
): void {
  const endX = end.x - forgeCenter.x;
  const endZ = end.z - forgeCenter.z;
  const endAngle = Math.atan2(endZ, endX);
  const endRadius = Math.hypot(endX, endZ);
  const angle = startAngle + shortestAngleDelta(startAngle, endAngle) * progress;
  const arc = Math.sin(Math.PI * progress);
  const radius =
    THREE.MathUtils.lerp(startRadius, endRadius, progress) + arc * radialBow;

  out.set(
    forgeCenter.x + Math.cos(angle) * radius,
    THREE.MathUtils.lerp(startY, end.y, progress) + arc * verticalBow,
    forgeCenter.z + Math.sin(angle) * radius
  );
}

export default function CameraRig() {
  const prevX = useRef<number | null>(null);
  const bank = useRef(0);
  const observedFlightPhase = useRef<ProjectFlightPhase>("idle");
  const flightStartedAt = useRef(0);
  const flightStartTarget = useRef(new THREE.Vector3());
  const flightStartAngle = useRef(0);
  const flightStartRadius = useRef(1);
  const flightStartY = useRef(0);
  const dockPose = useRef(new THREE.Vector3());

  useFrame((state, delta) => {
    const universe = useUniverse.getState();
    const {
      phase,
      progress,
      velocity,
      focusedProject,
      projectFlightPhase,
      projectFlightProject,
      reducedMotion,
    } = universe;
    const elapsed = state.clock.elapsedTime;
    const camera = state.camera as THREE.PerspectiveCamera;

    if (phase === "journey") {
      cameraStateAt(progress, desiredPos, desiredTarget);
    } else {
      cameraStateAt(0, desiredPos, desiredTarget);
      desiredPos.z -= Math.min(elapsed * 0.35, 7);
      if (!reducedMotion) desiredPos.y += Math.sin(elapsed * 0.18) * 0.6;
    }

    if (projectFlightPhase !== observedFlightPhase.current) {
      observedFlightPhase.current = projectFlightPhase;
      flightStartedAt.current = elapsed;
      flightStartTarget.current.copy(currentTarget);

      const relativeX = camera.position.x - forgeCenter.x;
      const relativeZ = camera.position.z - forgeCenter.z;
      flightStartAngle.current = Math.atan2(relativeZ, relativeX);
      flightStartRadius.current = Math.max(
        Math.hypot(relativeX, relativeZ),
        0.001
      );
      flightStartY.current = camera.position.y;
    }

    let flightProgress = 0;
    let flightLensKick = 0;
    const station = projectFlightProject
      ? getStationPosition(projectFlightProject)
      : undefined;

    if (projectFlightPhase === "docking" && station) {
      const duration = reducedMotion ? 0.001 : DOCK_DURATION;
      const linear = THREE.MathUtils.clamp(
        (elapsed - flightStartedAt.current) / duration,
        0,
        1
      );
      flightProgress = easeInOutCubic(linear);
      writeDockPose(station, dockPose.current);
      writeOrbitalArc(
        desiredPos,
        flightStartAngle.current,
        flightStartRadius.current,
        flightStartY.current,
        dockPose.current,
        flightProgress,
        3.2,
        2.1
      );
      desiredTarget.lerpVectors(
        flightStartTarget.current,
        station,
        flightProgress
      );
      flightLensKick = Math.sin(Math.PI * flightProgress) * 3.5;

      if (linear >= 1) universe.finishProjectDock();
    } else if (projectFlightPhase === "docked" && station) {
      writeDockPose(station, desiredPos);
      desiredTarget.copy(station);
    } else if (projectFlightPhase === "undocking") {
      const duration = reducedMotion ? 0.001 : UNDOCK_DURATION;
      const linear = THREE.MathUtils.clamp(
        (elapsed - flightStartedAt.current) / duration,
        0,
        1
      );
      flightProgress = easeInOutCubic(linear);
      writeOrbitalArc(
        desiredPos,
        flightStartAngle.current,
        flightStartRadius.current,
        flightStartY.current,
        projectsOverviewPos,
        flightProgress,
        4.8,
        2.8
      );
      desiredTarget.lerpVectors(
        flightStartTarget.current,
        projectsOverviewTarget,
        flightProgress
      );
      flightLensKick = Math.sin(Math.PI * flightProgress) * 4.5;

      if (linear >= 1) universe.finishProjectUndock(projectsProgress);
    }

    const flightActive =
      projectFlightPhase === "docking" || projectFlightPhase === "undocking";
    const dx = prevX.current === null ? 0 : desiredPos.x - prevX.current;
    prevX.current = desiredPos.x;
    const bankTarget =
      phase === "journey" &&
      !reducedMotion &&
      projectFlightPhase === "idle" &&
      !focusedProject
        ? THREE.MathUtils.clamp(-dx * 0.9, -0.16, 0.16)
        : 0;
    bank.current = THREE.MathUtils.damp(bank.current, bankTarget, 2.2, delta);

    if (!reducedMotion) {
      desiredPos.x += state.pointer.x * 0.8;
      desiredPos.y += state.pointer.y * 0.45;
    }

    if (flightActive || reducedMotion) {
      camera.position.copy(desiredPos);
      currentTarget.copy(desiredTarget);
    } else {
      const smoothing = projectFlightPhase === "docked" ? 0.42 : 0.55;
      easing.damp3(camera.position, desiredPos, smoothing, delta);
      easing.damp3(currentTarget, desiredTarget, smoothing, delta);
    }

    camera.lookAt(currentTarget);
    camera.rotateZ(bank.current);

    const speedKick =
      reducedMotion || projectFlightPhase !== "idle"
        ? 0
        : Math.min(Math.abs(velocity) * 0.09, 9);
    const fovTarget =
      BASE_FOV + (phase === "journey" ? speedKick + flightLensKick : 0);
    camera.fov = THREE.MathUtils.damp(camera.fov, fovTarget, 3.2, delta);
    camera.updateProjectionMatrix();
  });

  return null;
}
