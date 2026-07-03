import { useMemo, useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { WORLD } from "../../lib/journey";
import { useUniverse } from "../../lib/store";
import { beamVertex, beamFragment } from "../../shaders/beam";
import Planet from "./Planet";

const BEAM_HEIGHT = 70;

export default function ContactMoon() {
  const beamRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  const beamMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: beamVertex,
        fragmentShader: beamFragment,
        uniforms: {
          uColor: { value: new THREE.Color("#4ff2ff") },
          uTime: { value: 0 },
          uIntensity: { value: 0 },
        },
        transparent: true,
        depthWrite: false,
        blending: THREE.AdditiveBlending,
        side: THREE.DoubleSide,
      }),
    []
  );

  useFrame((state, delta) => {
    const mat = materialRef.current;
    const beam = beamRef.current;
    if (!mat || !beam) return;

    mat.uniforms.uTime.value = state.clock.elapsedTime;
    const transmission = useUniverse.getState().transmission;
    const target = transmission === "sending" ? 1 : 0;
    const next = THREE.MathUtils.damp(mat.uniforms.uIntensity.value, target, 2.4, delta);
    mat.uniforms.uIntensity.value = next;

    beam.visible = next > 0.01;
    const stretch = 0.15 + next * 0.85;
    beam.scale.set(1, stretch, 1);
    beam.position.y = 2.2 + (BEAM_HEIGHT * stretch) / 2;
  });

  const transmission = useUniverse((s) => s.transmission);

  return (
    <group position={[WORLD.contactMoon[0], WORLD.contactMoon[1], WORLD.contactMoon[2]]}>
      <Planet
        position={[0, 0, 0]}
        radius={2.2}
        colors={{ deep: "#10131f", mid: "#3c4258", high: "#9aa4c0", rim: "#4ff2ff" }}
        noiseScale={3.4}
        bands={0}
        bandStrength={0}
        seed={4.19}
        rotationSpeed={0.06}
        atmosphere={{ color: "#2ec7e6", power: 3.6, scale: 1.12 }}
      />

      {/* Transmission beam — fires when a signal is sent from the terminal */}
      <mesh ref={beamRef} visible={false}>
        <cylinderGeometry args={[0.22, 0.5, BEAM_HEIGHT, 24, 1, true]} />
        <primitive object={beamMaterial} attach="material" ref={materialRef} />
      </mesh>

      {transmission === "sent" && (
        <Sparkles count={80} scale={9} size={3} speed={1.4} opacity={0.8} color="#4ff2ff" />
      )}
    </group>
  );
}
