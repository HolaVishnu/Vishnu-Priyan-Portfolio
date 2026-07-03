export const galaxyVertex = /* glsl */ `
uniform float uTime;
uniform float uSize;

attribute float aScale;
attribute vec3 aColor;
attribute float aPhase;

varying vec3 vColor;

void main() {
  vec3 p = position;

  // Differential rotation: inner stars orbit faster than outer ones
  float dist = length(p.xz);
  float angle = atan(p.x, p.z) + uTime * (0.22 / (dist * 0.06 + 1.0));
  p.x = sin(angle) * dist;
  p.z = cos(angle) * dist;

  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  gl_Position = projectionMatrix * mv;
  gl_PointSize = uSize * aScale * (260.0 / -mv.z);

  float twinkle = 0.82 + 0.18 * sin(uTime * 0.9 + aPhase * 20.0);
  vColor = aColor * twinkle;
}
`;

export const galaxyFragment = /* glsl */ `
varying vec3 vColor;

void main() {
  float d = distance(gl_PointCoord, vec2(0.5));
  float strength = pow(smoothstep(0.5, 0.0, d), 3.0);
  gl_FragColor = vec4(vColor * strength, strength);
}
`;
