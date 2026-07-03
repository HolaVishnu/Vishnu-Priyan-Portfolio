import { Float, Html } from "@react-three/drei";
import { WORLD } from "../../lib/journey";
import { useUniverse } from "../../lib/store";
import timelineData from "../../data/timeline.json";

const OFFSETS: Array<[number, number, number]> = [
  [-11, 2.5, 5],
  [-6, -1.5, 1],
  [-1, 3, -2],
  [4, -2, -5],
  [9, 2, -8],
  [14, -0.5, -11],
];

function Satellite({
  company,
  period,
  offset,
}: {
  company: string;
  period: string;
  offset: [number, number, number];
}) {
  const labelVisible = useUniverse((s) => s.activeSection === "timeline");
  const position: [number, number, number] = [
    WORLD.timelineCenter[0] + offset[0],
    WORLD.timelineCenter[1] + offset[1],
    WORLD.timelineCenter[2] + offset[2],
  ];

  return (
    <Float speed={1.1} rotationIntensity={0.25} floatIntensity={0.7} position={position}>
      {/* Bus */}
      <mesh>
        <boxGeometry args={[0.9, 0.55, 0.55]} />
        <meshStandardMaterial color="#141b3d" metalness={0.7} roughness={0.35} />
      </mesh>

      {/* Solar arrays */}
      <mesh position={[1.35, 0, 0]}>
        <boxGeometry args={[1.7, 0.03, 0.75]} />
        <meshStandardMaterial color="#241d5e" metalness={0.4} roughness={0.4} emissive="#3d2fa5" emissiveIntensity={0.7} />
      </mesh>
      <mesh position={[-1.35, 0, 0]}>
        <boxGeometry args={[1.7, 0.03, 0.75]} />
        <meshStandardMaterial color="#241d5e" metalness={0.4} roughness={0.4} emissive="#3d2fa5" emissiveIntensity={0.7} />
      </mesh>

      {/* Dish */}
      <mesh position={[0, 0.5, 0.1]} rotation={[0.5, 0, 0]}>
        <cylinderGeometry args={[0.28, 0.06, 0.18, 16]} />
        <meshStandardMaterial color="#39406b" metalness={0.6} roughness={0.3} />
      </mesh>

      {/* Nav beacon */}
      <mesh position={[0, -0.42, 0]}>
        <sphereGeometry args={[0.05, 10, 10]} />
        <meshBasicMaterial color="#4ff2ff" toneMapped={false} />
      </mesh>

      {labelVisible && (
        <Html position={[0, -1.1, 0]} center distanceFactor={16} style={{ pointerEvents: "none" }}>
          <div
            className="whitespace-nowrap text-center font-mono"
            style={{ textShadow: "0 0 10px rgba(5,6,15,0.9)" }}
          >
            <div className="text-xs tracking-[0.3em] text-cyan uppercase">{company}</div>
            <div className="mt-0.5 text-[10px] tracking-[0.2em] text-[#c3cbea]">{period}</div>
          </div>
        </Html>
      )}
    </Float>
  );
}

export default function Satellites() {
  return (
    <group>
      {timelineData.entries.map((entry, i) => (
        <Satellite
          key={entry.id}
          company={entry.company}
          period={entry.period}
          offset={OFFSETS[i % OFFSETS.length]}
        />
      ))}
    </group>
  );
}
