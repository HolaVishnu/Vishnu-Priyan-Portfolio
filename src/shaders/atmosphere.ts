export const atmosphereVertex = /* glsl */ `
varying vec3 vNormal;

void main() {
  vNormal = normalize(normalMatrix * normal);
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
`;

export const atmosphereFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uPower;

varying vec3 vNormal;

void main() {
  // Rendered on the back faces of a slightly larger sphere: the rim of the
  // shell reads as a glowing atmosphere around the planet.
  float intensity = pow(0.64 - dot(vNormal, vec3(0.0, 0.0, 1.0)), uPower);
  gl_FragColor = vec4(uColor, 1.0) * intensity;
}
`;
