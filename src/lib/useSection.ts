import { useEffect, useState } from "react";
import { STOPS } from "./journey";
import { useUniverse } from "./store";

/**
 * True while the camera is within a stop's progress window.
 * Subscribes transiently so scroll updates don't re-render until the
 * visibility flag actually flips.
 */
export function useSectionVisible(id: string): boolean {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const stop = STOPS.find((s) => s.id === id);
    if (!stop) return;
    const update = () => {
      const s = useUniverse.getState();
      const v =
        s.phase === "journey" && Math.abs(s.progress - stop.t) < stop.window;
      setVisible((prev) => (prev === v ? prev : v));
    };
    update();
    return useUniverse.subscribe(update);
  }, [id]);

  return visible;
}
