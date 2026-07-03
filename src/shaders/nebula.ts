import { NOISE_2D } from "./noise";

export const nebulaVertex = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const nebulaFragment = /* glsl */ `
uniform vec3 uColorA;
uniform vec3 uColorB;
uniform float uTime;
uniform float uSeed;
uniform float uOpacity;

varying vec2 vUv;

${NOISE_2D}

void main() {
  vec2 centered = vUv - 0.5;
  float radial = length(centered);

  float cloud = fbm2(vUv * 3.2 + uSeed + vec2(uTime * 0.015, uTime * -0.01));
  cloud = smoothstep(0.32, 0.85, cloud);

  float mask = smoothstep(0.5, 0.08, radial);
  float alpha = cloud * mask * uOpacity;

  vec3 color = mix(uColorA, uColorB, cloud);
  gl_FragColor = vec4(color, alpha);
}
`;
