// EffectComposer is intentionally absent.
//
// The composer renders the scene to an internal render target, then blits to
// the main canvas framebuffer. Chrome's GPU compositor can sample the canvas
// BETWEEN the clear and the blit — producing a strip of the raw clear colour
// (#05060f) at the top, left, or right of the viewport during slow scroll.
// preserveDrawingBuffer does not help because the canvas IS cleared before the
// blit. The only reliable fix is to eliminate the intermediate buffer entirely
// and let Three.js write directly to the canvas each frame.
//
// Visual compensation lives in CSS (globals.css .scene-vignette overlay).

export default function Effects() {
  return null;
}
