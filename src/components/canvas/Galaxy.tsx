import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { GALAXY_POSITION } from "../../lib/journey";
import { useUniverse } from "../../lib/store";
import { galaxyVertex, galaxyFragment } from "../../shaders/galaxy";

const RADIUS = 70;
const BRANCHES = 4;

export default function Galaxy() {
  const quality = useUniverse((s) => s.quality);
  const count = quality === "high" ? 18000 : 9000;
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const phases = new Float32Array(count);

    const inside = new THREE.Color("#ffe9c4");
    const mid = new THREE.Color("#8a63ff");
    const edge = new THREE.Color("#4ff2ff");
    const c = new THREE.Color();

    for (let i = 0; i < count; i++) {
      const r = Math.pow(Math.random(), 1.6) * RADIUS;
      const branchAngle = ((i % BRANCHES) / BRANCHES) * Math.PI * 2;
      const spinAngle = r * 0.045;

      const randPow = 2.8;
      const rx = Math.pow(Math.random(), randPow) * (Math.random() < 0.5 ? 1 : -1) * 0.35 * r;
      const ry = Math.pow(Math.random(), randPow) * (Math.random() < 0.5 ? 1 : -1) * 0.12 * r;
      const rz = Math.pow(Math.random(), randPow) * (Math.random() < 0.5 ? 1 : -1) * 0.35 * r;

      positions[i * 3] = Math.cos(branchAngle + spinAngle) * r + rx;
      positions[i * 3 + 1] = ry;
      positions[i * 3 + 2] = Math.sin(branchAngle + spinAngle) * r + rz;

      const half = RADIUS * 0.4;
      if (r < half) c.copy(inside).lerp(mid, r / half);
      else c.copy(mid).lerp(edge, (r - half) / (RADIUS - half));
      colors[i * 3] = c.r;
      colors[i * 3 + 1] = c.g;
      colors[i * 3 + 2] = c.b;

      scales[i] = 0.6 + Math.random() * 1.8;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aColor", new THREE.BufferAttribute(colors, 3));
    geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    return geo;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: galaxyVertex,
        fragmentShader: galaxyFragment,
        uniforms: {
          uTime: { value: 0 },
          uSize: { value: 2.4 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <points
      geometry={geometry}
      position={GALAXY_POSITION}
      rotation={[0.5, 0, 0.14]}
      scale={1.7}
    >
      <primitive object={material} attach="material" ref={materialRef} />
    </points>
  );
}
