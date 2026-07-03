import { useMemo, useRef, type ReactNode } from "react";
import { useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { planetVertex, planetFragment } from "../../shaders/planet";
import { atmosphereVertex, atmosphereFragment } from "../../shaders/atmosphere";
import { ringVertex, ringFragment } from "../../shaders/ring";

/** Single distant "sun" every planet is lit from, for coherent shadows. */
const SUN = new THREE.Vector3(80, 60, 160);

export interface PlanetProps {
  position: readonly [number, number, number];
  radius: number;
  colors: { deep: string; mid: string; high: string; rim: string };
  noiseScale?: number;
  bands?: number;
  bandStrength?: number;
  seed?: number;
  rotationSpeed?: number;
  atmosphere?: { color: string; power?: number; scale?: number };
  ring?: {
    inner: number;
    outer: number;
    colorInner: string;
    colorOuter: string;
    opacity?: number;
    tilt?: number;
  };
  children?: ReactNode;
}

export default function Planet({
  position,
  radius,
  colors,
  noiseScale = 1.2,
  bands = 2.4,
  bandStrength = 0.4,
  seed = 1,
  rotationSpeed = 0.04,
  atmosphere,
  ring,
  children,
}: PlanetProps) {
  const surfaceRef = useRef<THREE.Mesh>(null);

  const lightDir = useMemo(() => {
    return SUN.clone().sub(new THREE.Vector3(...position)).normalize();
  }, [position]);

  const surfaceMaterial = useMemo(
    () =>
      new THREE.ShaderMaterial({
        vertexShader: planetVertex,
        fragmentShader: planetFragment,
        uniforms: {
          uColorDeep: { value: new THREE.Color(colors.deep) },
          uColorMid: { value: new THREE.Color(colors.mid) },
          uColorHigh: { value: new THREE.Color(colors.high) },
          uRimColor: { value: new THREE.Color(colors.rim) },
          uLightDir: { value: lightDir },
          uNoiseScale: { value: noiseScale },
          uBands: { value: bands },
          uBandStrength: { value: bandStrength },
          uSeed: { value: seed },
        },
      }),
    [colors, lightDir, noiseScale, bands, bandStrength, seed]
  );

  const atmosphereMaterial = useMemo(() => {
    if (!atmosphere) return null;
    return new THREE.ShaderMaterial({
      vertexShader: atmosphereVertex,
      fragmentShader: atmosphereFragment,
      uniforms: {
        uColor: { value: new THREE.Color(atmosphere.color) },
        uPower: { value: atmosphere.power ?? 3.0 },
      },
      side: THREE.BackSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [atmosphere]);

  const ringMaterial = useMemo(() => {
    if (!ring) return null;
    return new THREE.ShaderMaterial({
      vertexShader: ringVertex,
      fragmentShader: ringFragment,
      uniforms: {
        uColorInner: { value: new THREE.Color(ring.colorInner) },
        uColorOuter: { value: new THREE.Color(ring.colorOuter) },
        uInnerRadius: { value: ring.inner },
        uOuterRadius: { value: ring.outer },
        uOpacity: { value: ring.opacity ?? 0.4 },
      },
      side: THREE.DoubleSide,
      transparent: true,
      depthWrite: false,
      blending: THREE.AdditiveBlending,
    });
  }, [ring]);

  useFrame((_, delta) => {
    if (surfaceRef.current) surfaceRef.current.rotation.y += rotationSpeed * delta;
  });

  return (
    <group position={[position[0], position[1], position[2]]}>
      <mesh ref={surfaceRef}>
        <sphereGeometry args={[radius, 48, 48]} />
        <primitive object={surfaceMaterial} attach="material" />
      </mesh>

      {atmosphere && atmosphereMaterial && (
        <mesh scale={atmosphere.scale ?? 1.16}>
          <sphereGeometry args={[radius, 32, 32]} />
          <primitive object={atmosphereMaterial} attach="material" />
        </mesh>
      )}

      {ring && ringMaterial && (
        <mesh rotation={[-Math.PI / 2 + (ring.tilt ?? 0.3), 0, 0]}>
          <ringGeometry args={[ring.inner, ring.outer, 128]} />
          <primitive object={ringMaterial} attach="material" />
        </mesh>
      )}

      {children}
    </group>
  );
}
