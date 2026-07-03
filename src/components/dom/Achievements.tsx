"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { useUniverse } from "../../lib/store";
import { ACHIEVEMENTS } from "../../lib/achievements";

export default function Achievements() {
  const lastUnlock = useUniverse((s) => s.lastUnlock);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (!lastUnlock) return;
    setVisible(true);
    const t = setTimeout(() => setVisible(false), 3600);
    return () => clearTimeout(t);
  }, [lastUnlock]);

  const def = lastUnlock ? ACHIEVEMENTS[lastUnlock.id] : null;

  return (
    <div className="pointer-events-none fixed bottom-8 left-1/2 z-[70] -translate-x-1/2">
      <AnimatePresence>
        {visible && def && (
          <motion.div
            key={lastUnlock!.at}
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            role="status"
            className="holo-panel holo-corners px-5 py-3 text-center"
          >
            <p className="eyebrow">Achievement // {def.name}</p>
            <p className="mt-1 font-mono text-xs text-star/80">{def.detail}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
