export const beamVertex = /* glsl */ `
varying vec2 vUv;

void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const beamFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uTime;
uniform float uIntensity;

varying vec2 vUv;

void main() {
  // Fade along the beam's length, with data pulses racing upward
  float falloff = pow(1.0 - vUv.y, 1.4);
  float pulse = 0.85 + 0.15 * sin(vUv.y * 42.0 - uTime * 9.0);
  float alpha = falloff * pulse * uIntensity;
  gl_FragColor = vec4(uColor, alpha);
}
`;
