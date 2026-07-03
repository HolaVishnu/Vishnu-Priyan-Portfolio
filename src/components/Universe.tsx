"use client";

import dynamic from "next/dynamic";
import { useEffect } from "react";
import ScrollManager from "./ScrollManager";
import Overlay from "./dom/Overlay";
import Cursor from "./dom/Cursor";
import EasterEggs from "./dom/EasterEggs";
import { useUniverse } from "../lib/store";
import { detectQuality } from "../lib/quality";

const Scene = dynamic(() => import("./canvas/Scene"), { ssr: false });

export default function Universe() {
  const phase = useUniverse((s) => s.phase);

  useEffect(() => {
    useUniverse.getState().setQuality(detectQuality());

    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const applyMotion = () =>
      useUniverse.getState().setReducedMotion(mq.matches);
    applyMotion();
    mq.addEventListener("change", applyMotion);

    document.body.dataset.customCursor = window.matchMedia("(pointer: fine)")
      .matches
      ? "true"
      : "false";

    return () => mq.removeEventListener("change", applyMotion);
  }, []);

  return (
    <>
      <Scene />
      <ScrollManager />
      <Overlay />
      <Cursor />
      <EasterEggs />
      {/* The scroll runway: its length is the journey's length. */}
      <div
        style={{ height: phase === "journey" ? "1000vh" : "100vh" }}
        aria-hidden="true"
      />
    </>
  );
}
