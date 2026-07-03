import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Billboard } from "@react-three/drei";
import * as THREE from "three";
import { useUniverse } from "../../lib/store";
import { nebulaVertex, nebulaFragment } from "../../shaders/nebula";

interface CloudDef {
  position: [number, number, number];
  size: number;
  colorA: string;
  colorB: string;
  opacity: number;
  seed: number;
}

const CLOUDS: CloudDef[] = [
  // Near-camera glow — visible from the landing camera and About stop
  { position: [30, 10, 20],   size: 110, colorA: "#1a1060", colorB: "#4ff2ff", opacity: 0.28, seed: 1.7 },
  { position: [-20, -8, 10],  size: 90,  colorA: "#2a1466", colorB: "#7b5cff", opacity: 0.22, seed: 2.5 },
  // Mid-journey
  { position: [42, 14, -30],  size: 100, colorA: "#2a1a66", colorB: "#4ff2ff", opacity: 0.24, seed: 3.1 },
  { position: [-55, 6, -90],  size: 130, colorA: "#3b1e7a", colorB: "#c86bff", opacity: 0.26, seed: 8.4 },
  { position: [20, -20, -140],size: 110, colorA: "#101a4d", colorB: "#7b5cff", opacity: 0.22, seed: 12.9 },
  { position: [-30, 24, -190],size: 120, colorA: "#241456", colorB: "#4ff2ff", opacity: 0.20, seed: 17.2 },
  // Deep-journey
  { position: [58, -8, -230], size: 140, colorA: "#301a6e", colorB: "#8a63ff", opacity: 0.20, seed: 21.7 },
  { position: [0, 30, -120],  size: 90,  colorA: "#131c52", colorB: "#2ec7e6", opacity: 0.18, seed: 26.3 },
  { position: [-70, -14, -40],size: 110, colorA: "#2b1462", colorB: "#7b5cff", opacity: 0.20, seed: 30.8 },
  { position: [35, 8, -260],  size: 150, colorA: "#1a1048", colorB: "#c86bff", opacity: 0.18, seed: 35.5 },
];

function Cloud({ def }: { def: CloudDef }) {
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: nebulaVertex,
        fragmentShader: nebulaFragment,
        uniforms: {
          uColorA: { value: new THREE.Color(def.colorA) },
          uColorB: { value: new THREE.Color(def.colorB) },
          uTime: { value: 0 },
          uSeed: { value: def.seed },
          uOpacity: { value: def.opacity },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
      }),
    [def]
  );

  useFrame((state) => {
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    }
  });

  return (
    <Billboard position={def.position}>
      <mesh>
        <planeGeometry args={[def.size, def.size]} />
        <primitive object={material} attach="material" ref={materialRef} />
      </mesh>
    </Billboard>
  );
}

export default function Nebula() {
  const quality = useUniverse((s) => s.quality);
  const clouds = quality === "high" ? CLOUDS : CLOUDS.slice(0, 6);
  return (
    <group>
      {clouds.map((def) => (
        <Cloud key={def.seed} def={def} />
      ))}
    </group>
  );
}
