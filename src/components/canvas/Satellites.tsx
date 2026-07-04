import { Float, Html } from "@react-three/drei";
import { WORLD } from "../../lib/journey";
import { useUniverse } from "../../lib/store";
import timelineData from "../../data/timeline.json";

// Camera at [5,6,-101] faces timelineCenter [16,6,-118]; screen-x tracks
// 0.84*dx + 0.54*dz. These offsets stagger that projection from -3.7 to -9.2
// so the fleet scatters diagonally down the LEFT half of the viewport —
// clear of the right-side description panel — instead of stacking into a
// vertical column.
// Measured at the settled timeline camera [5,6,-101], 1280x800: the visible
// field spans roughly rd -3.5..-7.5 (rd = 0.84*dx + 0.54*dz) before satellites
// fall off the left edge, and dy -3.2..+6.4 before they leave the frustum.
// The six craft zigzag right-left-right-left within that band with ~2 units
// of vertical separation per step so no two labels collide.
const OFFSETS: Array<[number, number, number]> = [
  [-5.1,  6.0,  0.5],
  [-7.5,  4.2, -1  ],
  [-3.4,  2.0, -2  ],
  [-9.5,  0,    1  ],
  [-5.5, -1.8,  0  ],
  [-8.7, -3.0,  1.5],
];

// Each craft gets its own attitude so the fleet reads as six individual
// spacecraft. Angles are capped (|y| ≤ 0.45) so the solar wings can never
// turn edge-on to the camera and collapse into a stray line.
const TILTS: Array<[number, number, number]> = [
  [ 0.1,   0.35, -0.08],
  [-0.14, -0.25,  0.12],
  [ 0.06,  0.45, -0.15],
  [-0.1,   0.2,   0.08],
  [ 0.15, -0.4,  -0.1 ],
  [-0.05,  0.3,   0.15],
];

function PanelWing({ side }: { side: 1 | -1 }) {
  return (
    <group>
      {/* Boom */}
      <mesh position={[side * 0.85, 0, 0]} rotation={[0, 0, Math.PI / 2]}>
        <cylinderGeometry args={[0.025, 0.025, 0.9, 6]} />
        <meshStandardMaterial color="#39406b" metalness={0.7} roughness={0.35} />
      </mesh>
      {/* Three cell segments with visible gaps — panels stand vertical
          (flat in the XY plane) so the camera always sees their face and
          they read as wings extending from the bus centre, never as a
          degenerate edge-on line. */}
      {[0, 1, 2].map((i) => (
        <group key={i} position={[side * (1.05 + i * 0.68), 0, 0]}>
          <mesh>
            <boxGeometry args={[0.58, 0.95, 0.03]} />
            <meshStandardMaterial
              color="#0d1440"
              metalness={0.55}
              roughness={0.3}
              emissive="#2b3fd6"
              emissiveIntensity={0.65}
            />
          </mesh>
          {/* Cell divider seam */}
          <mesh position={[0, 0, 0.02]}>
            <boxGeometry args={[0.58, 0.02, 0.005]} />
            <meshBasicMaterial color="#4ff2ff" toneMapped={false} transparent opacity={0.4} />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Satellite({
  company,
  period,
  offset,
  tilt,
}: {
  company: string;
  period: string;
  offset: [number, number, number];
  tilt: [number, number, number];
}) {
  const labelVisible = useUniverse((s) => s.activeSection === "timeline");
  const position: [number, number, number] = [
    WORLD.timelineCenter[0] + offset[0],
    WORLD.timelineCenter[1] + offset[1],
    WORLD.timelineCenter[2] + offset[2],
  ];

  return (
    <Float speed={1.1} rotationIntensity={0.2} floatIntensity={0.6} position={position}>
      {/* Scaled down so the fleet reads as distant spacecraft with air
          between them — full-size wings crowded neighbouring labels. */}
      <group rotation={tilt} scale={0.62}>
        {/* Hexagonal bus */}
        <mesh rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.7, 6]} />
          <meshStandardMaterial color="#161d44" metalness={0.75} roughness={0.3} />
        </mesh>

        {/* Gold thermal-foil band */}
        <mesh rotation={[Math.PI / 2, 0, 0]} position={[0, 0, -0.16]}>
          <cylinderGeometry args={[0.44, 0.44, 0.24, 6]} />
          <meshStandardMaterial
            color="#8a6d2f"
            metalness={0.9}
            roughness={0.45}
            emissive="#5a4010"
            emissiveIntensity={0.35}
          />
        </mesh>

        {/* Thruster nozzle aft */}
        <mesh position={[0, 0, -0.45]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.17, 0.2, 12]} />
          <meshStandardMaterial color="#0b0f2a" metalness={0.9} roughness={0.5} />
        </mesh>

        {/* Dish strut + dish */}
        <mesh position={[0, 0.42, 0]}>
          <cylinderGeometry args={[0.02, 0.02, 0.28, 6]} />
          <meshStandardMaterial color="#39406b" metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh position={[0, 0.6, 0.06]} rotation={[0.55, 0, 0]}>
          <cylinderGeometry args={[0.3, 0.05, 0.16, 20]} />
          <meshStandardMaterial color="#c8d2f0" metalness={0.6} roughness={0.25} />
        </mesh>

        {/* Antenna mast + nav beacon */}
        <mesh position={[0, -0.55, 0]}>
          <cylinderGeometry args={[0.015, 0.015, 0.45, 6]} />
          <meshStandardMaterial color="#39406b" metalness={0.7} roughness={0.35} />
        </mesh>
        <mesh position={[0, -0.8, 0]}>
          <sphereGeometry args={[0.055, 12, 12]} />
          <meshBasicMaterial color="#4ff2ff" toneMapped={false} />
        </mesh>

        {/* Solar wings */}
        <PanelWing side={1} />
        <PanelWing side={-1} />
      </group>

      {labelVisible && (
        <Html position={[0, -0.95, 0]} center distanceFactor={12} style={{ pointerEvents: "none" }}>
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
          tilt={TILTS[i % TILTS.length]}
        />
      ))}
    </group>
  );
}
