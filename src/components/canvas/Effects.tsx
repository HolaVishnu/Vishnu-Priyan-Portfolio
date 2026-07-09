"use client";

// EffectComposer removed — it resizes WebGL render targets during scroll
// which causes blank/black frames. Vignette is handled via CSS radial-gradient
// in Scene.tsx; Bloom is not worth the compositor blit race it introduces.
export default function Effects() {
  return null;
}
