import { NOISE_2D } from "./noise";

export const ringVertex = /* glsl */ `
varying vec3 vPos;

void main() {
  vPos = position;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const ringFragment = /* glsl */ `
uniform vec3 uColorInner;
uniform vec3 uColorOuter;
uniform float uInnerRadius;
uniform float uOuterRadius;
uniform float uOpacity;

varying vec3 vPos;

${NOISE_2D}

void main() {
  float r = length(vPos.xy);
  float t = (r - uInnerRadius) / (uOuterRadius - uInnerRadius);

  // Banded density like a real planetary ring system
  float bands = fbm2(vec2(r * 3.4, 0.5));
  float edges = smoothstep(0.0, 0.12, t) * smoothstep(1.0, 0.82, t);
  float alpha = bands * edges * uOpacity;

  vec3 color = mix(uColorInner, uColorOuter, t);
  gl_FragColor = vec4(color, alpha);
}
`;
