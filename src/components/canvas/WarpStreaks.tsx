import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { useUniverse } from "../../lib/store";
import { streaksVertex, streaksFragment } from "../../shaders/streaks";

const COUNT = 260;

/**
 * Camera-anchored speed streaks. Invisible at rest; scroll velocity (or the
 * Konami warp) makes space visibly rush past — the "travelling" feeling.
 */
export default function WarpStreaks() {
  const groupRef = useRef<THREE.Group>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const speedRef = useRef(0);

  const geometry = useMemo(() => {
    const positions = new Float32Array(COUNT * 2 * 3);
    const tips = new Float32Array(COUNT * 2);
    for (let i = 0; i < COUNT; i++) {
      const theta = Math.random() * Math.PI * 2;
      const r = 2.2 + Math.random() * 10;
      const x = Math.cos(theta) * r;
      const y = Math.sin(theta) * r;
      const z = -40 + Math.random() * 46;
      for (let v = 0; v < 2; v++) {
        const idx = (i * 2 + v) * 3;
        positions[idx] = x;
        positions[idx + 1] = y;
        positions[idx + 2] = z;
        tips[i * 2 + v] = v;
      }
    }
    const geo = new THREE.BufferGeometry();
    geo.setAttribute("position", new THREE.BufferAttribute(positions, 3));
    geo.setAttribute("aTip", new THREE.BufferAttribute(tips, 1));
    return geo;
  }, []);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: streaksVertex,
        fragmentShader: streaksFragment,
        uniforms: {
          uOffset: { value: 0 },
          uSpeed: { value: 0 },
          uColor: { value: new THREE.Color("#bfe9ff") },
          uOpacity: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    []
  );

  useFrame((state, delta) => {
    const group = groupRef.current;
    const mat = materialRef.current;
    if (!group || !mat) return;

    const { velocity, phase, warp, reducedMotion } = useUniverse.getState();
    const scrollSpeed =
      phase === "journey" ? Math.min(Math.abs(velocity) * 0.012, 1) : 0;
    const target = Math.max(scrollSpeed, warp ? 1 : 0);
    speedRef.current = THREE.MathUtils.damp(speedRef.current, target, 3, delta);

    const speed = speedRef.current;
    mat.uniforms.uSpeed.value = speed;
    mat.uniforms.uOpacity.value = reducedMotion ? 0 : speed * 0.55;
    mat.uniforms.uOffset.value += (2 + speed * 85) * delta;

    group.position.copy(state.camera.position);
    group.quaternion.copy(state.camera.quaternion);
  });

  return (
    <group ref={groupRef}>
      <lineSegments geometry={geometry} frustumCulled={false}>
        <primitive object={material} attach="material" ref={materialRef} />
      </lineSegments>
    </group>
  );
}
