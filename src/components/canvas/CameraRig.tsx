import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { easing } from "maath";
import * as THREE from "three";
import { cameraStateAt } from "../../lib/journey";
import { useUniverse } from "../../lib/store";
import { getStationPosition } from "../../lib/stationRegistry";

const BASE_FOV = 42;

const desiredPos = new THREE.Vector3();
const desiredTarget = new THREE.Vector3();
const currentTarget = new THREE.Vector3(0, 10, -260);
const dockingOffset = new THREE.Vector3();

export default function CameraRig() {
  const prevX = useRef<number | null>(null);
  const bank = useRef(0);

  useFrame((state, delta) => {
    const { phase, progress, velocity, focusedProject, reducedMotion } =
      useUniverse.getState();
    const t = state.clock.elapsedTime;
    const camera = state.camera as THREE.PerspectiveCamera;

    if (phase === "journey") {
      cameraStateAt(progress, desiredPos, desiredTarget);
    } else {
      // Landing: a slow, capped dolly toward the distant galaxy
      cameraStateAt(0, desiredPos, desiredTarget);
      desiredPos.z -= Math.min(t * 0.35, 7);
      if (!reducedMotion) desiredPos.y += Math.sin(t * 0.18) * 0.6;
    }

    // Bank into turns: roll follows the lateral drift of the flight path
    const dx = prevX.current === null ? 0 : desiredPos.x - prevX.current;
    prevX.current = desiredPos.x;
    const bankTarget =
      phase === "journey" && !reducedMotion && !focusedProject
        ? THREE.MathUtils.clamp(-dx * 0.9, -0.16, 0.16)
        : 0;
    bank.current = THREE.MathUtils.damp(bank.current, bankTarget, 2.2, delta);

    if (focusedProject) {
      const station = getStationPosition(focusedProject);
      if (station) {
        dockingOffset.set(3.6, 1.4, 6.8);
        desiredPos.copy(station).add(dockingOffset);
        desiredTarget.copy(station);
      }
    }

    if (!reducedMotion) {
      desiredPos.x += state.pointer.x * 0.8;
      desiredPos.y += state.pointer.y * 0.45;
    }

    const smoothing = focusedProject ? 1.0 : 0.55;
    easing.damp3(camera.position, desiredPos, smoothing, delta);
    easing.damp3(currentTarget, desiredTarget, smoothing, delta);
    camera.lookAt(currentTarget);
    camera.rotateZ(bank.current);

    // Speed widens the lens — the classic hyperdrive FOV kick
    const speedKick = reducedMotion
      ? 0
      : Math.min(Math.abs(velocity) * 0.09, 9);
    const fovTarget = BASE_FOV + (phase === "journey" ? speedKick : 0);
    camera.fov = THREE.MathUtils.damp(camera.fov, fovTarget, 2.2, delta);
    camera.updateProjectionMatrix();
  });

  return null;
}
