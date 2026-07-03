export const starfieldVertex = /* glsl */ `
uniform float uTime;
uniform float uWarp;

attribute float aScale;
attribute float aPhase;

varying float vIntensity;

void main() {
  vec4 mv = modelViewMatrix * vec4(position, 1.0);
  gl_Position = projectionMatrix * mv;

  float twinkle = 0.7 + 0.3 * sin(uTime * (0.8 + aPhase) + aPhase * 31.0);
  vIntensity = twinkle * (1.0 + uWarp * 1.6);
  gl_PointSize = (1.0 + uWarp * 2.2) * aScale * (480.0 / -mv.z);
}
`;

export const starfieldFragment = /* glsl */ `
uniform vec3 uColor;
varying float vIntensity;

void main() {
  float d = distance(gl_PointCoord, vec2(0.5));
  float strength = pow(smoothstep(0.5, 0.0, d), 2.6);
  gl_FragColor = vec4(uColor * strength * vIntensity, strength * vIntensity);
}
`;
