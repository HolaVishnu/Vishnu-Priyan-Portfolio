import { NOISE_3D } from "./noise";

export const planetVertex = /* glsl */ `
varying vec3 vNormalW;
varying vec3 vPosObj;
varying vec3 vViewDirW;

void main() {
  vNormalW = normalize(mat3(modelMatrix) * normal);
  vPosObj = position;
  vec4 worldPos = modelMatrix * vec4(position, 1.0);
  vViewDirW = normalize(cameraPosition - worldPos.xyz);
  gl_Position = projectionMatrix * viewMatrix * worldPos;
}
`;

export const planetFragment = /* glsl */ `
uniform vec3 uColorDeep;
uniform vec3 uColorMid;
uniform vec3 uColorHigh;
uniform vec3 uRimColor;
uniform vec3 uLightDir;
uniform float uNoiseScale;
uniform float uBands;
uniform float uBandStrength;
uniform float uSeed;

varying vec3 vNormalW;
varying vec3 vPosObj;
varying vec3 vViewDirW;

${NOISE_3D}

void main() {
  vec3 n = normalize(vNormalW);

  float turbulence = fbm3(vPosObj * uNoiseScale + uSeed);
  float bands = sin(vPosObj.y * uBands + turbulence * 4.0) * 0.5 + 0.5;
  float surface = mix(turbulence, bands, uBandStrength);

  vec3 color = mix(uColorDeep, uColorMid, smoothstep(0.12, 0.58, surface));
  color = mix(color, uColorHigh, smoothstep(0.6, 0.95, surface));

  float diffuse = max(dot(n, normalize(uLightDir)), 0.0);
  float light = 0.16 + 0.84 * pow(diffuse, 0.85);

  float rim = pow(1.0 - max(dot(n, normalize(vViewDirW)), 0.0), 3.0);

  gl_FragColor = vec4(color * light + uRimColor * rim * 0.7, 1.0);
}
`;
