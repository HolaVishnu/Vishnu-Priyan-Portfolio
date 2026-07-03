"use client";

import { useEffect } from "react";
import { useUniverse } from "../../lib/store";
import { sound } from "../../lib/sound";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

export default function EasterEggs() {
  const warp = useUniverse((s) => s.warp);

  useEffect(() => {
    let index = 0;
    let timeout: ReturnType<typeof setTimeout>;

    const onKey = (e: KeyboardEvent) => {
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;
      index = key === KONAMI[index] ? index + 1 : key === KONAMI[0] ? 1 : 0;
      if (index === KONAMI.length) {
        index = 0;
        const s = useUniverse.getState();
        s.unlock("codebreaker");
        s.setWarp(true);
        sound.confirm();
        clearTimeout(timeout);
        timeout = setTimeout(() => useUniverse.getState().setWarp(false), 3500);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("keydown", onKey);
      clearTimeout(timeout);
    };
  }, []);

  if (!warp) return null;
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-[80]"
      style={{
        background:
          "radial-gradient(ellipse at center, rgba(79,242,255,0.14), transparent 60%)",
        animation: "warp-flash 3.4s ease-out forwards",
      }}
    />
  );
}
