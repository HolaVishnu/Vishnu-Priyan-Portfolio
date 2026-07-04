"use client";

import { useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import SectionShell from "../SectionShell";
import MagneticButton from "../MagneticButton";
import { useUniverse } from "../../../lib/store";
import { sound } from "../../../lib/sound";
import profile from "../../../data/profile.json";

const SENDING_LINES = [
  "ALIGNING DISH → LAST MOON",
  "ENCODING SIGNAL",
  "TRANSMITTING ···",
];

// The site ships as a static export (GitHub Pages) — there is no server to
// receive POSTs. Web3Forms relays submissions straight to the inbox without
// a backend. The access key is public by design and safe to commit: grab one
// free at https://web3forms.com (email → instant key) and paste it here.
// Until a key is set, the form falls back to opening a pre-filled mail
// compose so no transmission is ever silently lost.
const WEB3FORMS_KEY = "e4270272-2e05-41af-9aeb-ec1c4105f2c7";
const RELAY_CONFIGURED = !WEB3FORMS_KEY.startsWith("YOUR_");

export default function Contact() {
  const transmission = useUniverse((s) => s.transmission);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !message.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError("All three fields are needed to route the signal — including a valid return address.");
      sound.blip();
      return;
    }
    setError(null);
    useUniverse.getState().setTransmission("sending");
    sound.confirm();

    // Fire the payload while the beam animation plays
    if (RELAY_CONFIGURED) {
      fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          access_key: WEB3FORMS_KEY,
          name,
          email,
          message,
          subject: `Portfolio signal from ${name}`,
          from_name: "The Architect's Universe",
        }),
      }).catch(() => {
        /* the mailto link below always remains available */
      });
    } else {
      // No relay key yet — open a pre-filled compose so the signal still lands
      const subject = encodeURIComponent(`Signal from ${name} — Architect's Universe`);
      const body = encodeURIComponent(`${message}\n\n— ${name}\n${email}`);
      window.location.href = `mailto:${profile.email}?subject=${subject}&body=${body}`;
    }

    setTimeout(() => {
      useUniverse.getState().setTransmission("sent");
      useUniverse.getState().unlock("signal");
      sound.confirm();
    }, 2800);
  };

  const reset = () => {
    useUniverse.getState().setTransmission("idle");
    setName("");
    setEmail("");
    setMessage("");
  };

  const inputClass =
    "w-full border-b border-nebula/30 bg-transparent py-2 font-mono text-sm text-star placeholder:text-dim/50 focus:border-cyan focus:outline-none transition-colors";

  return (
    <SectionShell
      id="contact"
      designation="Moon // Relay station"
      title="Send a signal."
      side="right"
    >
      <div className="holo-panel holo-corners p-6 md:p-8">
        <AnimatePresence mode="wait">
          {transmission === "idle" && (
            <motion.form
              key="form"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onSubmit={submit}
              noValidate
            >
              <p className="mb-6 text-sm leading-relaxed text-dim">
                The relay station forwards everything to my inbox. Projects,
                platform questions, or just a hello from another orbit — all
                frequencies welcome.
              </p>

              <label className="block">
                <span className="eyebrow">Ident</span>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  autoComplete="name"
                  className={inputClass}
                />
              </label>

              <label className="mt-5 block">
                <span className="eyebrow">Return signal</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  autoComplete="email"
                  className={inputClass}
                />
              </label>

              <label className="mt-5 block">
                <span className="eyebrow">Message</span>
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="What should we build?"
                  rows={4}
                  className={`${inputClass} resize-none`}
                />
              </label>

              {error && (
                <p role="alert" className="mt-4 font-mono text-[11px] text-magenta">
                  {error}
                </p>
              )}

              <div className="mt-7 flex items-center justify-between gap-4">
                <MagneticButton
                  type="submit"
                  className="group relative overflow-hidden rounded-full border border-cyan/40 px-8 py-3 font-mono text-xs uppercase tracking-[0.35em] text-star transition-colors duration-300 hover:border-cyan hover:text-void"
                >
                  <span className="absolute inset-0 origin-left scale-x-0 bg-cyan transition-transform duration-300 ease-out group-hover:scale-x-100" />
                  <span className="relative">Transmit ▸</span>
                </MagneticButton>
                <a
                  href={`mailto:${profile.email}`}
                  className="font-mono text-[10px] uppercase tracking-[0.25em] text-dim transition-colors hover:text-cyan"
                >
                  or hail directly
                </a>
              </div>
            </motion.form>
          )}

          {transmission === "sending" && (
            <motion.div
              key="sending"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="py-8"
              role="status"
            >
              {SENDING_LINES.map((line, i) => (
                <motion.p
                  key={line}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.8 }}
                  className="mb-3 font-mono text-xs tracking-[0.3em] text-cyan/85"
                >
                  <span className="text-nebula">▸</span> {line}
                </motion.p>
              ))}
            </motion.div>
          )}

          {transmission === "sent" && (
            <motion.div
              key="sent"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="py-6 text-center"
              role="status"
            >
              <p className="font-display text-2xl font-bold text-aurora">
                Transmission received.
              </p>
              <p className="mt-3 text-sm text-dim">
                Your signal is on its way across the void. Expect a response
                within one orbit — 48 Earth hours.
              </p>
              <button
                type="button"
                onClick={reset}
                className="mt-6 font-mono text-[10px] uppercase tracking-[0.3em] text-dim transition-colors hover:text-cyan"
              >
                ▸ Send another signal
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </SectionShell>
  );
}
