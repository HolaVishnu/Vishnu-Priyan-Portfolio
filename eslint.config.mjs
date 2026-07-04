import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    // These components intentionally create procedural geometry once inside
    // useMemo. Their random values never affect rendered React markup.
    files: [
      "src/components/canvas/Galaxy.tsx",
      "src/components/canvas/Starfield.tsx",
      "src/components/canvas/WarpStreaks.tsx",
    ],
    rules: { "react-hooks/purity": "off" },
  },
  {
    // These effects synchronize short-lived UI state with browser media
    // queries, timers, and external achievement events.
    files: [
      "src/components/dom/Achievements.tsx",
      "src/components/dom/Cursor.tsx",
      "src/components/dom/Landing.tsx",
    ],
    rules: { "react-hooks/set-state-in-effect": "off" },
  },
]);

export default eslintConfig;
