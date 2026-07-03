import { useMemo, useRef, useState } from "react";
import { useFrame } from "@react-three/fiber";
import { Html, Line } from "@react-three/drei";
import * as THREE from "three";
import { WORLD } from "../../lib/journey";
import { sound } from "../../lib/sound";
import { useUniverse } from "../../lib/store";
import skillsData from "../../data/skills.json";

interface Skill {
  id: string;
  name: string;
  group: string;
  magnitude: number;
  note: string;
}

/** Deterministic pseudo-random from a string id, so layout is stable. */
function seeded(id: string, salt: number): number {
  let h = salt;
  for (let i = 0; i < id.length; i++) h = (h * 31 + id.charCodeAt(i)) % 2147483647;
  return (h % 1000) / 1000;
}

// Offsets keep every cluster centre-right of the camera's view axis —
// leftward offsets would put stars behind the section panel.
const GROUP_OFFSETS: Record<string, [number, number, number]> = {
  platform: [0, -0.5, 0],
  itam: [3.5, -5.5, -2.5],
  cloud: [8, 3.5, -3.5],
  architecture: [0.5, 4.6, 3.5],
};

function Star({
  skill,
  position,
  color,
  hovered,
  labelVisible,
  onHover,
}: {
  skill: Skill;
  position: THREE.Vector3;
  color: string;
  hovered: boolean;
  labelVisible: boolean;
  onHover: (id: string | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const size = 0.17 + skill.magnitude * 0.18;

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;
    const target = hovered ? 1.9 : 1;
    const s = THREE.MathUtils.damp(mesh.scale.x, target, 8, delta);
    mesh.scale.setScalar(s);
    mesh.position.y =
      position.y + Math.sin(state.clock.elapsedTime * 0.7 + position.x) * 0.15;
  });

  return (
    <group>
      <mesh
        ref={meshRef}
        position={position}
        onPointerOver={(e) => {
          e.stopPropagation();
          onHover(skill.id);
          sound.blip();
        }}
        onPointerOut={() => onHover(null)}
      >
        <icosahedronGeometry args={[size, 1]} />
        <meshBasicMaterial color={color} toneMapped={false} />
      </mesh>
      {labelVisible && (
      <Html
        position={[position.x, position.y + size + 0.5, position.z]}
        center
        distanceFactor={16}
        style={{ pointerEvents: "none" }}
      >
        <div
          className={`whitespace-nowrap text-center font-mono transition-all duration-300 ${
            hovered ? "opacity-100" : "opacity-90"
          }`}
        >
          <span
            className="text-xs font-medium tracking-[0.25em] uppercase"
            style={{
              color: hovered ? color : "#dfe5fa",
              textShadow: "0 0 10px rgba(5,6,15,0.9), 0 0 3px rgba(5,6,15,1)",
            }}
          >
            {skill.name}
          </span>
          {hovered && (
            <div className="mt-1 max-w-[200px] whitespace-normal rounded border border-cyan-400/20 bg-[#070918]/90 px-2.5 py-1.5 text-[10px] normal-case tracking-normal text-[#c9d2f0]">
              {skill.note}
            </div>
          )}
        </div>
      </Html>
      )}
    </group>
  );
}

export default function SkillConstellation() {
  const [hovered, setHovered] = useState<string | null>(null);
  // Labels only render near the constellation stop — elsewhere they'd
  // bleed through other scenes as faint floating text.
  const labelsVisible = useUniverse((s) => s.activeSection === "skills");

  const { positions, colors } = useMemo(() => {
    const center = new THREE.Vector3(...WORLD.skillsCenter);
    const positions = new Map<string, THREE.Vector3>();
    const colors = new Map<string, string>();
    const groupColor = new Map(
      skillsData.groups.map((g) => [g.id, g.color] as const)
    );

    for (const skill of skillsData.skills as Skill[]) {
      const offset = GROUP_OFFSETS[skill.group] ?? [0, 0, 0];
      const jitter = new THREE.Vector3(
        (seeded(skill.id, 7) - 0.5) * 7.5,
        (seeded(skill.id, 13) - 0.5) * 5.5,
        (seeded(skill.id, 29) - 0.5) * 6
      );
      positions.set(
        skill.id,
        center.clone().add(new THREE.Vector3(...offset)).add(jitter)
      );
      colors.set(skill.id, groupColor.get(skill.group) ?? "#4ff2ff");
    }
    return { positions, colors };
  }, []);

  return (
    <group>
      {(skillsData.skills as Skill[]).map((skill) => (
        <Star
          key={skill.id}
          skill={skill}
          position={positions.get(skill.id)!}
          color={colors.get(skill.id)!}
          hovered={hovered === skill.id}
          labelVisible={labelsVisible}
          onHover={setHovered}
        />
      ))}

      {skillsData.constellations.map(([a, b]) => {
        const lit = hovered === a || hovered === b;
        return (
          <Line
            key={`${a}-${b}`}
            points={[positions.get(a)!, positions.get(b)!]}
            color={lit ? "#4ff2ff" : "#9b82ff"}
            lineWidth={lit ? 1.8 : 1.1}
            transparent
            opacity={lit ? 0.9 : 0.38}
          />
        );
      })}
    </group>
  );
}
