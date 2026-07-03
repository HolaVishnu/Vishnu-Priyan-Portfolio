import { useMemo } from "react";
import { Float, Sparkles } from "@react-three/drei";
import * as THREE from "three";
import { WORLD } from "../../lib/journey";

/**
 * The resume artifact — a monolith in the 1 : 4 : 9 ratio,
 * humanity's favourite alien invitation to go further.
 */
export default function Monolith() {
  const boxGeometry = useMemo(() => new THREE.BoxGeometry(1.8, 4.05, 0.45), []);
  const edges = useMemo(() => new THREE.EdgesGeometry(boxGeometry), [boxGeometry]);

  return (
    <group position={[WORLD.monolith[0], WORLD.monolith[1], WORLD.monolith[2]]}>
      <Float speed={0.8} rotationIntensity={0.15} floatIntensity={0.5}>
        <group rotation={[0, 0.5, 0.04]}>
          <mesh geometry={boxGeometry}>
            <meshStandardMaterial color="#05060a" metalness={0.85} roughness={0.22} />
          </mesh>
          <lineSegments geometry={edges}>
            <lineBasicMaterial color="#4ff2ff" transparent opacity={0.85} toneMapped={false} />
          </lineSegments>
        </group>
      </Float>
      <Sparkles count={42} scale={7} size={2.2} speed={0.3} opacity={0.55} color="#4ff2ff" />
    </group>
  );
}
