"use client";

import {
  EffectComposer,
  Bloom,
  Vignette,
} from "@react-three/postprocessing";
import { BlendFunction, KernelSize } from "postprocessing";
import { useUniverse } from "../../lib/store";

export default function Effects() {
  const quality = useUniverse((s) => s.quality);

  return (
    <EffectComposer enableNormalPass={false} multisampling={0}>
      <Bloom
        intensity={1.1}
        luminanceThreshold={0.52}
        luminanceSmoothing={0.88}
        kernelSize={quality === "high" ? KernelSize.LARGE : KernelSize.MEDIUM}
        blendFunction={BlendFunction.ADD}
        mipmapBlur
      />
      <Vignette
        offset={0.36}
        darkness={0.68}
        blendFunction={BlendFunction.NORMAL}
      />
    </EffectComposer>
  );
}
