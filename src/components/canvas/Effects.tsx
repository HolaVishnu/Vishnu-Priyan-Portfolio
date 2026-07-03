import { useMemo } from "react";
import * as THREE from "three";
import {
  EffectComposer,
  Bloom,
  ChromaticAberration,
  Vignette,
} from "@react-three/postprocessing";
import { useUniverse } from "../../lib/store";

/**
 * Depth of field is deliberately absent: at these scene scales it reads as
 * an out-of-focus page, not cinema. MSAA is also off — multisampled blits
 * break compositing on some Windows/ANGLE GPUs (black or half-rendered
 * frames); bloom masks the aliasing instead.
 */
export default function Effects() {
  const quality = useUniverse((s) => s.quality);
  const caOffset = useMemo(() => new THREE.Vector2(0.00035, 0.0002), []);

  if (quality === "low") {
    return (
      <EffectComposer multisampling={0}>
        <Bloom mipmapBlur intensity={0.9} luminanceThreshold={0.2} luminanceSmoothing={0.35} radius={0.7} />
        <Vignette eskil={false} offset={0.22} darkness={0.8} />
      </EffectComposer>
    );
  }

  return (
    <EffectComposer multisampling={0}>
      <Bloom mipmapBlur intensity={1.15} luminanceThreshold={0.18} luminanceSmoothing={0.35} radius={0.75} />
      <ChromaticAberration offset={caOffset} />
      <Vignette eskil={false} offset={0.22} darkness={0.8} />
    </EffectComposer>
  );
}
