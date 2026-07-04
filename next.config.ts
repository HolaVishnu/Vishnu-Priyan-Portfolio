import type { NextConfig } from "next";

const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  poweredByHeader: false,
  experimental: {
    optimizePackageImports: [
      "three",
      "@react-three/fiber",
      "@react-three/drei",
      "framer-motion",
      "maath",
    ],
  },
  compiler: {
    removeConsole: isProd ? { exclude: ["error", "warn"] } : false,
  },
};

export default nextConfig;
