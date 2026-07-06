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

// Hand-plotted star chart (local units, +x right, +y up, small z for depth).
// Every star has an authored position so the connection pairs in skills.json
// trace real constellation figures — chains, fans and forks like a sky map —
// instead of clumping into group blobs.
//
// Figures: the platform fan radiates from ServiceNow; the ITAM chain runs
// sam → flexera → fnms → bigfix with a scorpion tail (ham → tanium → sccm);
// cloud forms a "Y" off AWS; architecture arcs across the top with long
// bridge strokes down to ServiceNow and AWS.
const CHART: Record<string, [number, number, number]> = {
  // ServiceNow platform (cyan) — lower left fan
  servicenow:    [-7.2, -1.8,  0.5],
  itsm:          [-5.8,  1.4, -0.5],
  itom:          [-4.7, -1.1,  1  ],
  cmdb:          [-4.0, -3.6,  0  ],
  csdm:          [-1.8, -4.5,  1.5],
  // ITAM & endpoint (violet) — central chain with a tail
  snow:          [-1.6,  0.4, -1  ],
  sam:           [-0.9, -2.3,  0.5],
  ham:           [ 0.5, -5.0, -0.5],
  tanium:        [ 2.2, -6.3,  1  ],
  sccm:          [ 4.5, -6.7,  0  ],
  "flexera-one": [ 1.8, -0.9,  0  ],
  fnms:          [ 4.0, -2.3, -1  ],
  bigfix:        [ 5.9, -3.6,  0.5],
  fsm:           [ 2.7,  1.4,  1  ],
  fdp:           [ 4.5,  0,   -0.5],
  // Cloud & observability (magenta) — upper right "Y"
  aws:           [ 3.6,  3.6,  0  ],
  observe:       [ 5.4,  5.4, -1  ],
  solarwinds:    [ 7.7,  4.5,  0.5],
  pagerduty:     [ 5.9,  7.2,  0  ],
  // Architecture & practice (white) — upper left arc
  architecture:  [-4.5,  4.5, -0.5],
  integration:   [-2.2,  5.9,  0.5],
  itil:          [-6.8,  4.1,  1  ],
  ai:            [-2.7,  2.7, -1  ],
};

// The chart is authored centred on (0,0); shift it right of the camera's
// view axis so no star hides behind the left-side section panel.
const CHART_SHIFT = new THREE.Vector3(8, 0, 0);

// Burst timing: 23 stars stagger their peaks across 75% of the total
// burst-progress range; each star's local rise+fall occupies 40% of
// bp-space. Total real-time duration is controlled by BURST_DURATION_S.
const STAR_COUNT = 23;
const STAGGER_SPAN = 0.75;
const STAR_BP_WINDOW = 0.4;
const BURST_DURATION_S = 2.2;

function Star({
  skill,
  position,
  color,
  hovered,
  labelVisible,
  onHover,
  burstRef,
  starIndex,
}: {
  skill: Skill;
  position: THREE.Vector3;
  color: string;
  hovered: boolean;
  labelVisible: boolean;
  onHover: (id: string | null) => void;
  burstRef: React.MutableRefObject<number>;
  starIndex: number;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const size = 0.17 + skill.magnitude * 0.18;

  useFrame((state, delta) => {
    const mesh = meshRef.current;
    if (!mesh) return;

    // Staggered burst: star i's local progress starts at a fraction of bp
    const bp = burstRef.current;
    const startBp = (starIndex / STAR_COUNT) * STAGGER_SPAN;
    const localT = Math.max(0, Math.min((bp - startBp) / STAR_BP_WINDOW, 1));

    // Quick rise to 2.8x, slow fall back to 1 — like a nova flare
    let burstScale = 1;
    if (localT > 0) {
      if (localT < 0.22) {
        burstScale = 1 + (localT / 0.22) * 1.8; // 1 → 2.8
      } else {
        burstScale = 2.8 - ((localT - 0.22) / 0.78) * 1.8; // 2.8 → 1
      }
    }

    const hoverTarget = hovered ? 1.9 : 1;
    const finalTarget = Math.max(hoverTarget, burstScale);

    // Faster damp on the rise for a snappy pop feel
    const dampSpeed = localT > 0 && localT < 0.22 ? 16 : 8;
    const s = THREE.MathUtils.damp(mesh.scale.x, finalTarget, dampSpeed, delta);
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
  const [lineBright, setLineBright] = useState(false);
  const labelsVisible = useUniverse((s) => s.activeSection === "skills");

  // Burst state — all refs to avoid triggering React reconciliation on every frame
  const burstRef = useRef(0);
  const burstActiveRef = useRef(false);
  const hasFlashedRef = useRef(false);

  // Mirror labelsVisible into a ref so useFrame always sees the latest value
  const labelsVisibleRef = useRef(false);
  labelsVisibleRef.current = labelsVisible;

  useFrame((_, delta) => {
    // Detect first arrival at skills section
    if (labelsVisibleRef.current && !hasFlashedRef.current) {
      hasFlashedRef.current = true;
      burstRef.current = 0;
      burstActiveRef.current = true;
      // Lines flash bright then settle — driven by React state (one re-render each)
      setLineBright(true);
      setTimeout(() => setLineBright(false), 1500);
    }

    // Advance burst progress (0 → 1 over BURST_DURATION_S seconds)
    if (burstActiveRef.current) {
      burstRef.current = Math.min(burstRef.current + delta / BURST_DURATION_S, 1);
      if (burstRef.current >= 1) burstActiveRef.current = false;
    }
  });

  const { positions, colors } = useMemo(() => {
    const center = new THREE.Vector3(...WORLD.skillsCenter);
    const positions = new Map<string, THREE.Vector3>();
    const colors = new Map<string, string>();
    const groupColor = new Map(
      skillsData.groups.map((g) => [g.id, g.color] as const)
    );

    for (const skill of skillsData.skills as Skill[]) {
      const local = CHART[skill.id] ?? [0, 0, 0];
      positions.set(
        skill.id,
        center.clone().add(CHART_SHIFT).add(new THREE.Vector3(...local))
      );
      colors.set(skill.id, groupColor.get(skill.group) ?? "#4ff2ff");
    }
    return { positions, colors };
  }, []);

  const skills = skillsData.skills as Skill[];

  return (
    // Stars and lines are always in the scene — they're the landmark you fly
    // toward, so hiding them until arrival made the approach look blacked out.
    // Only the HTML labels wait for the skills section (labelsVisible).
    <group>
      {skills.map((skill, i) => (
        <Star
          key={skill.id}
          skill={skill}
          position={positions.get(skill.id)!}
          color={colors.get(skill.id)!}
          hovered={hovered === skill.id}
          labelVisible={labelsVisible}
          onHover={setHovered}
          burstRef={burstRef}
          starIndex={i}
        />
      ))}

      {skillsData.constellations.map(([a, b]) => {
        const lit = hovered === a || hovered === b;
        return (
          <Line
            key={`${a}-${b}`}
            points={[positions.get(a)!, positions.get(b)!]}
            color={lit || lineBright ? "#4ff2ff" : "#9b82ff"}
            lineWidth={lit || lineBright ? 2.4 : 1.1}
            transparent
            opacity={lit ? 0.9 : lineBright ? 0.88 : 0.38}
          />
        );
      })}
    </group>
  );
}
