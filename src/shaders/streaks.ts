export const streaksVertex = /* glsl */ `
uniform float uOffset;
uniform float uSpeed;

attribute float aTip;

varying float vFade;

void main() {
  vec3 p = position;

  // Recycle streaks through a 46-unit tube around the camera; travel speed
  // scrolls them backward past the viewer.
  float span = 46.0;
  float z = mod(p.z + 40.0 + uOffset, span) - 40.0;

  // The tail vertex stretches with speed — dashes become lines become streaks
  z -= aTip * (0.5 + uSpeed * 6.5);
  p.z = z;

  // Fade in far ahead, fade out just before passing the camera
  vFade = smoothstep(-40.0, -30.0, z) * (1.0 - smoothstep(0.0, 5.0, z));

  gl_Position = projectionMatrix * modelViewMatrix * vec4(p, 1.0);
}
`;

export const streaksFragment = /* glsl */ `
uniform vec3 uColor;
uniform float uOpacity;

varying float vFade;

void main() {
  gl_FragColor = vec4(uColor, uOpacity * vFade);
}
`;
