import { useLayoutEffect, useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { WORLD } from "../../lib/journey";
import { useUniverse } from "../../lib/store";

/** Instanced asteroid belt in the Forge Prime ring plane. */
export default function Asteroids() {
  const quality = useUniverse((s) => s.quality);
  const count = quality === "high" ? 140 : 70;
  const meshRef = useRef<THREE.InstancedMesh>(null);
  const groupRef = useRef<THREE.Group>(null);

  const geometry = useMemo(() => new THREE.IcosahedronGeometry(1, 0), []);
  const material = useMemo(
    () =>
      new THREE.MeshStandardMaterial({
        color: "#1a2040",
        roughness: 0.9,
        metalness: 0.25,
        flatShading: true,
      }),
    []
  );

  useLayoutEffect(() => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const dummy = new THREE.Object3D();
    for (let i = 0; i < count; i++) {
      const angle = Math.random() * Math.PI * 2;
      const r = 10 + Math.random() * 6.5;
      dummy.position.set(
        Math.cos(angle) * r,
        (Math.random() - 0.5) * 2.4,
        Math.sin(angle) * r
      );
      dummy.rotation.set(
        Math.random() * Math.PI,
        Math.random() * Math.PI,
        Math.random() * Math.PI
      );
      const s = 0.08 + Math.pow(Math.random(), 2) * 0.45;
      dummy.scale.setScalar(s);
      dummy.updateMatrix();
      mesh.setMatrixAt(i, dummy.matrix);
    }
    mesh.instanceMatrix.needsUpdate = true;
  }, [count]);

  useFrame((_, delta) => {
    if (groupRef.current) groupRef.current.rotation.y += delta * 0.016;
  });

  return (
    <group
      ref={groupRef}
      position={[WORLD.forgePlanet[0], WORLD.forgePlanet[1], WORLD.forgePlanet[2]]}
      rotation={[0.3, 0, 0]}
    >
      <instancedMesh ref={meshRef} args={[geometry, material, count]} />
    </group>
  );
}
