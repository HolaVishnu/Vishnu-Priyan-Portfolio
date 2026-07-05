import { useRef } from "react";
import { useFrame } from "@react-three/fiber";
import { Html } from "@react-three/drei";
import * as THREE from "three";
import { WORLD } from "../../lib/journey";
import { useUniverse } from "../../lib/store";
import { setStationPosition } from "../../lib/stationRegistry";
import { sound } from "../../lib/sound";
import projectsData from "../../data/projects.json";

const ORBIT_RADIUS = 13;
const Y_OFFSETS = [3, 0.5, -2, 4.5, -3.5, 1.5];
const worldPos = new THREE.Vector3();

function Station({
  id,
  codename,
  index,
  total,
}: {
  id: string;
  codename: string;
  index: number;
  total: number;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const ringRef = useRef<THREE.Mesh>(null);
  const angleRef = useRef((index / total) * Math.PI * 2 + 0.4);
  const labelVisible = useUniverse(
    (s) => s.activeSection === "projects" || s.focusedProject === id
  );

  useFrame((state, delta) => {
    const group = groupRef.current;
    if (!group) return;

    angleRef.current += delta * 0.02;
    const a = angleRef.current;
    group.position.set(
      WORLD.forgePlanet[0] + Math.cos(a) * ORBIT_RADIUS,
      WORLD.forgePlanet[1] +
        Y_OFFSETS[index % Y_OFFSETS.length] +
        Math.sin(state.clock.elapsedTime * 0.5 + index * 2) * 0.35,
      WORLD.forgePlanet[2] + Math.sin(a) * ORBIT_RADIUS
    );
    group.rotation.y += delta * 0.1;
    if (ringRef.current) ringRef.current.rotation.z += delta * 0.25;

    group.getWorldPosition(worldPos);
    setStationPosition(id, worldPos);
  });

  return (
    <group
      ref={groupRef}
      onClick={(e) => {
        e.stopPropagation();
        useUniverse.getState().startProjectDock(id);
        sound.confirm();
      }}
      onPointerOver={(e) => {
        e.stopPropagation();
        sound.blip();
        document.body.dataset.cursorHover = "true";
      }}
      onPointerOut={() => {
        delete document.body.dataset.cursorHover;
      }}
    >
      {/* Core hull */}
      <mesh>
        <octahedronGeometry args={[0.85, 0]} />
        <meshStandardMaterial color="#131a38" metalness={0.7} roughness={0.3} />
      </mesh>

      {/* Habitation ring */}
      <mesh ref={ringRef} rotation={[Math.PI / 2.4, 0, 0]}>
        <torusGeometry args={[1.5, 0.05, 12, 64]} />
        <meshBasicMaterial color="#4ff2ff" toneMapped={false} />
      </mesh>

      {/* Solar wings */}
      <mesh position={[1.9, 0, 0]}>
        <boxGeometry args={[1.6, 0.04, 0.7]} />
        <meshStandardMaterial color="#2a2260" metalness={0.4} roughness={0.4} emissive="#4130a8" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[-1.9, 0, 0]}>
        <boxGeometry args={[1.6, 0.04, 0.7]} />
        <meshStandardMaterial color="#2a2260" metalness={0.4} roughness={0.4} emissive="#4130a8" emissiveIntensity={0.6} />
      </mesh>

      {/* Comms mast + beacon */}
      <mesh position={[0, 1.15, 0]}>
        <cylinderGeometry args={[0.02, 0.02, 0.9, 6]} />
        <meshStandardMaterial color="#39406b" metalness={0.6} roughness={0.4} />
      </mesh>
      <mesh position={[0, 1.65, 0]}>
        <sphereGeometry args={[0.07, 12, 12]} />
        <meshBasicMaterial color="#c86bff" toneMapped={false} />
      </mesh>

      {labelVisible && (
        <Html position={[0, -1.7, 0]} center distanceFactor={18} style={{ pointerEvents: "none" }}>
          <div
            className="whitespace-nowrap text-center font-mono text-xs tracking-[0.3em] text-cyan uppercase"
            style={{ textShadow: "0 0 10px rgba(5,6,15,0.9)" }}
          >
            {codename}
          </div>
        </Html>
      )}
    </group>
  );
}

export default function Stations() {
  const projects = projectsData.projects;
  return (
    <group>
      {projects.map((p, i) => (
        <Station
          key={p.id}
          id={p.id}
          codename={p.codename}
          index={i}
          total={projects.length}
        />
      ))}
    </group>
  );
}
