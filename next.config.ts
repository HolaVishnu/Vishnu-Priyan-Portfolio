import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  output: "export",
  // GitHub Pages serves the site under /Vishnu-Priyan-Portfolio
  basePath: isProd ? "/Vishnu-Priyan-Portfolio" : "",
  // next/image optimisation requires a server; use plain <img> for static export
  images: { unoptimized: true },
};

export default nextConfig;
