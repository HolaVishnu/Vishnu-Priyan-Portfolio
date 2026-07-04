import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "The Architect's Universe — Vishnu Priyaan";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

/**
 * OG image generated at build time — no binary asset to maintain.
 * Dark space aesthetic matching the portfolio's design tokens.
 */
export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          background: "#05060f",
          fontFamily: "sans-serif",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Background radial glows */}
        <div
          style={{
            position: "absolute",
            width: 700,
            height: 700,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(123,92,255,0.18) 0%, transparent 70%)",
            top: -200,
            left: -100,
          }}
        />
        <div
          style={{
            position: "absolute",
            width: 600,
            height: 600,
            borderRadius: "50%",
            background: "radial-gradient(circle, rgba(79,242,255,0.12) 0%, transparent 70%)",
            bottom: -150,
            right: -100,
          }}
        />

        {/* Thin horizontal accent line */}
        <div
          style={{
            position: "absolute",
            top: 80,
            left: 80,
            right: 80,
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(79,242,255,0.3), transparent)",
          }}
        />
        <div
          style={{
            position: "absolute",
            bottom: 80,
            left: 80,
            right: 80,
            height: 1,
            background: "linear-gradient(90deg, transparent, rgba(79,242,255,0.3), transparent)",
          }}
        />

        {/* Corner brackets TL */}
        <div style={{ position: "absolute", top: 48, left: 48, width: 28, height: 28, borderTop: "2px solid rgba(79,242,255,0.6)", borderLeft: "2px solid rgba(79,242,255,0.6)" }} />
        {/* Corner brackets BR */}
        <div style={{ position: "absolute", bottom: 48, right: 48, width: 28, height: 28, borderBottom: "2px solid rgba(79,242,255,0.6)", borderRight: "2px solid rgba(79,242,255,0.6)" }} />

        {/* Awwwards badge */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "6px 18px",
            background: "rgba(200,107,255,0.1)",
            border: "1px solid rgba(200,107,255,0.3)",
            borderRadius: 999,
            marginBottom: 32,
          }}
        >
          <div style={{ width: 6, height: 6, borderRadius: "50%", background: "#c86bff" }} />
          <span style={{ color: "rgba(200,107,255,0.9)", fontSize: 13, letterSpacing: "0.35em", textTransform: "uppercase" }}>
            Awwwards Nomination
          </span>
        </div>

        {/* Title */}
        <div
          style={{
            fontSize: 88,
            fontWeight: 800,
            lineHeight: 0.92,
            letterSpacing: "-0.04em",
            textAlign: "center",
            color: "#f4f7ff",
            marginBottom: 12,
          }}
        >
          The Architect&apos;s
        </div>
        <div
          style={{
            fontSize: 88,
            fontWeight: 800,
            lineHeight: 0.92,
            letterSpacing: "-0.04em",
            textAlign: "center",
            background: "linear-gradient(100deg, #4ff2ff 0%, #7b5cff 50%, #c86bff 100%)",
            backgroundClip: "text",
            WebkitBackgroundClip: "text",
            color: "transparent",
            marginBottom: 40,
          }}
        >
          Universe
        </div>

        {/* Divider */}
        <div
          style={{
            width: 80,
            height: 1,
            background: "rgba(79,242,255,0.4)",
            marginBottom: 32,
          }}
        />

        {/* Subtitle */}
        <div style={{ color: "rgba(154,166,207,0.85)", fontSize: 22, fontWeight: 300, letterSpacing: "0.04em", textAlign: "center", marginBottom: 10 }}>
          Vishnu Priyaan Chellappa
        </div>
        <div style={{ color: "rgba(154,166,207,0.5)", fontSize: 14, letterSpacing: "0.3em", textTransform: "uppercase", textAlign: "center" }}>
          Infrastructure &amp; ITSM Solutions Architect · 15+ Years
        </div>

        {/* Bottom label */}
        <div
          style={{
            position: "absolute",
            bottom: 48,
            display: "flex",
            alignItems: "center",
            gap: 12,
            color: "rgba(79,242,255,0.5)",
            fontSize: 12,
            letterSpacing: "0.3em",
            textTransform: "uppercase",
          }}
        >
          <span>Six Worlds</span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(79,242,255,0.4)" }} />
          <span>One Journey</span>
          <span style={{ width: 3, height: 3, borderRadius: "50%", background: "rgba(79,242,255,0.4)" }} />
          <span>Built with React Three Fiber</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
