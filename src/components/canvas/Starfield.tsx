import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useUniverse } from "../../lib/store";
import { starfieldVertex, starfieldFragment } from "../../shaders/starfield";

export default function Starfield() {
  const quality = useUniverse((s) => s.quality);
  const count = quality === "high" ? 2800 : 1400;
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const geometry = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const scales = new Float32Array(count);
    const phases = new Float32Array(count);
    const dir = new THREE.Vector3();

    for (let i = 0; i < count; i++) {
      // 1/3 near-field (60–140 units) for large, prominent stars;
      // 2/3 far-field (140–350 units) for depth.
      const near = i < count / 3;
      const minR = near ? 60 : 140;
      const maxR = near ? 140 : 350;
      dir
        .set(Math.random() * 2 - 1, Math.random() * 2 - 1, Math.random() * 2 - 1)
        .normalize()
        .multiplyScalar(minR + Math.random() * (maxR - minR));
      positions[i * 3] = dir.x;
      positions[i * 3 + 1] = dir.y;
      positions[i * 3 + 2] = dir.z - 60;
      scales[i] = near ? 1.2 + Math.random() * 2.0 : 0.5 + Math.random() * 1.4;
      phases[i] = Math.random() * Math.PI * 2;
    }

    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aScale", new THREE.BufferAttribute(scales, 1));
    geo.setAttribute("aPhase", new THREE.BufferAttribute(phases, 1));
    return geo;
  }, [count]);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: starfieldVertex,
        fragmentShader: starfieldFragment,
        uniforms: {
          uTime: { value: 0 },
          uWarp: { value: 0 },
          uColor: { value: new THREE.Color("#cfe0ff") },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useFrame((state, delta) => {
    const mat = materialRef.current;
    if (!mat) return;
    mat.uniforms.uTime.value = state.clock.elapsedTime;
    // Stars brighten and swell with travel speed; Konami warp maxes it out
    const { warp, velocity, phase, reducedMotion } = useUniverse.getState();
    const speedWarp =
      phase === "journey" && !reducedMotion
        ? Math.min(Math.abs(velocity) * 0.008, 0.5)
        : 0;
    const warpTarget = Math.max(warp ? 1 : 0, speedWarp);
    mat.uniforms.uWarp.value = THREE.MathUtils.damp(
      mat.uniforms.uWarp.value,
      warpTarget,
      3,
      delta
    );
  });

  return (
    <points geometry={geometry}>
      <primitive object={material} attach="material" ref={materialRef} />
    </points>
  );
}
