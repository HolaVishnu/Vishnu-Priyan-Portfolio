"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";
import { Preload, Sparkles } from "@react-three/drei";
import { useUniverse } from "../../lib/store";
import { WORLD } from "../../lib/journey";
import CameraRig from "./CameraRig";
import Effects from "./Effects";
import Galaxy from "./Galaxy";
import Starfield from "./Starfield";
import Nebula from "./Nebula";
import Planet from "./Planet";
import Asteroids from "./Asteroids";
import SkillConstellation from "./SkillConstellation";
import Stations from "./Stations";
import Satellites from "./Satellites";
import Monolith from "./Monolith";
import ContactMoon from "./ContactMoon";
import WarpStreaks from "./WarpStreaks";

export default function Scene() {
  const quality = useUniverse((s) => s.quality);
  const phase = useUniverse((s) => s.phase);

  return (
    <div className="fixed inset-0" aria-hidden="true">
      {/* CSS vignette — replaces the EffectComposer Vignette which causes
          blank frames when it resizes render targets during scroll. */}
      <div
        className="pointer-events-none absolute inset-0 z-10"
        style={{
          background:
            "radial-gradient(ellipse at center, transparent 55%, rgba(5,6,15,0.55) 78%, rgba(5,6,15,0.88) 100%)",
        }}
      />
      <Canvas
        camera={{ fov: 42, near: 0.1, far: 900, position: [0, 1, 96] }}
        dpr={[1, 2]}
        // Pause rendering while the intro video plays — canvas is hidden
        // behind the video anyway, so rendering is pure GPU waste that
        // competes with video decode and causes mouse lag.
        frameloop={phase === "boot" ? "demand" : "always"}
        gl={{
          antialias: false,
          // preserveDrawingBuffer prevents Chrome/ANGLE from blanking the
          // canvas between frames when the compositor is busy (e.g. during
          // scroll or GPU context switches).
          preserveDrawingBuffer: true,
          // "default" avoids the high-performance GPU path that can drop
          // context on integrated + discrete hybrid setups.
          powerPreference: "default",
        }}
        onCreated={({ gl }) => {
          gl.domElement.addEventListener("webglcontextlost", (e) =>
            e.preventDefault()
          );
        }}
      >
        <color attach="background" args={["#05060f"]} />
        <fogExp2 attach="fog" args={["#05060f", 0.0032]} />

        <ambientLight intensity={0.2} />
        <directionalLight position={[60, 40, 120]} intensity={1.2} color="#dfe8ff" />
        <pointLight position={[-18, 2, -50]} intensity={90} distance={70} decay={2} color="#7b5cff" />
        <pointLight position={[12, 10, -110]} intensity={70} distance={60} decay={2} color="#4ff2ff" />

        <Suspense fallback={null}>
          <Galaxy />
          <Starfield />
          <Nebula />

          {/* Dust drifting close to the flight path */}
          <Sparkles count={quality === "high" ? 160 : 60} scale={[40, 20, 140]} position={[0, 0, 10]} size={1.6} speed={0.25} opacity={0.5} color="#9fb2ff" />

          {/* Planet 1 — Origin (About) */}
          <Planet
            position={WORLD.aboutPlanet}
            radius={4.5}
            colors={{ deep: "#081833", mid: "#144f7a", high: "#7ddcf0", rim: "#4ff2ff" }}
            noiseScale={1.4}
            bands={2.2}
            bandStrength={0.3}
            seed={7.31}
            rotationSpeed={0.05}
            atmosphere={{ color: "#2ec7e6", power: 3.2, scale: 1.16 }}
            ring={{ inner: 6.4, outer: 7.6, colorInner: "#4ff2ff", colorOuter: "#7b5cff", opacity: 0.28, tilt: 0.42 }}
          />

          {/* Planet 2 — Skills constellation */}
          <SkillConstellation />

          {/* Planet 3 — Forge Prime (Projects) */}
          <Planet
            position={WORLD.forgePlanet}
            radius={7}
            colors={{ deep: "#160b33", mid: "#5b3bbd", high: "#c86bff", rim: "#8b5cf6" }}
            noiseScale={0.9}
            bands={3.0}
            bandStrength={0.85}
            seed={12.77}
            rotationSpeed={0.03}
            atmosphere={{ color: "#7b5cff", power: 2.6, scale: 1.18 }}
            ring={{ inner: 9.5, outer: 13.5, colorInner: "#7b5cff", colorOuter: "#4ff2ff", opacity: 0.5, tilt: 0.3 }}
          />
          <Asteroids />
          <Stations />

          {/* Planet 4 — Career satellites */}
          <Satellites />

          {/* Planet 5 — Resume monolith */}
          <Monolith />

          {/* Planet 6 — Contact moon */}
          <ContactMoon />

          {/* Velocity-reactive speed streaks around the camera */}
          <WarpStreaks />

          <Effects />
          <Preload all />
        </Suspense>

        <CameraRig />
      </Canvas>
    </div>
  );
}
