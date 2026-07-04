/**
 * Generative ambient sound engine — no audio assets, everything is
 * synthesised with the Web Audio API.
 *
 * SoundEngine: global drone + UI blips/confirms.
 * AmbientEngine: per-section tone layers that morph as the user travels.
 */

// ── Section ambient profiles ──────────────────────────────────────────────────

interface SectionProfile {
  baseFreq: number;       // fundamental drone Hz
  filterFreq: number;     // lowpass cutoff Hz
  lfoRate: number;        // LFO speed Hz (breathing speed)
  lfoDepth: number;       // filter mod depth Hz
  oscType: OscillatorType;
  gain: number;
}

const SECTION_PROFILES: Record<string, SectionProfile> = {
  about: {
    baseFreq: 48, filterFreq: 280, lfoRate: 0.04, lfoDepth: 80,
    oscType: "sine", gain: 0.09,
  },
  skills: {
    baseFreq: 110, filterFreq: 520, lfoRate: 0.12, lfoDepth: 160,
    oscType: "triangle", gain: 0.07,
  },
  projects: {
    baseFreq: 65, filterFreq: 200, lfoRate: 0.07, lfoDepth: 60,
    oscType: "sawtooth", gain: 0.05,
  },
  timeline: {
    baseFreq: 220, filterFreq: 680, lfoRate: 0.09, lfoDepth: 200,
    oscType: "sine", gain: 0.06,
  },
  resume: {
    baseFreq: 36, filterFreq: 160, lfoRate: 0.025, lfoDepth: 40,
    oscType: "sine", gain: 0.1,
  },
  contact: {
    baseFreq: 165, filterFreq: 800, lfoRate: 0.06, lfoDepth: 120,
    oscType: "triangle", gain: 0.06,
  },
};

// ── Global drone + UI blip engine ────────────────────────────────────────────

class SoundEngine {
  private ctx: AudioContext | null = null;
  private master: GainNode | null = null;
  private lfo: OscillatorNode | null = null;
  private running = false;

  private ensureContext() {
    if (this.ctx) return;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    this.ctx = new Ctor();
    this.master = this.ctx.createGain();
    this.master.gain.value = 0;
    this.master.connect(this.ctx.destination);
  }

  start() {
    this.ensureContext();
    if (!this.ctx || !this.master) return;
    void this.ctx.resume();
    if (!this.running) {
      this.running = true;
      const now = this.ctx.currentTime;

      const filter = this.ctx.createBiquadFilter();
      filter.type = "lowpass";
      filter.frequency.value = 320;
      filter.Q.value = 0.8;
      filter.connect(this.master);

      this.lfo = this.ctx.createOscillator();
      this.lfo.frequency.value = 0.05;
      const lfoGain = this.ctx.createGain();
      lfoGain.gain.value = 140;
      this.lfo.connect(lfoGain);
      lfoGain.connect(filter.frequency);
      this.lfo.start(now);

      const droneSpecs: Array<[OscillatorType, number, number]> = [
        ["triangle", 55, 0.5],
        ["sine", 82.5, 0.3],
        ["sine", 110.4, 0.12],
      ];
      for (const [type, freq, gain] of droneSpecs) {
        const osc = this.ctx.createOscillator();
        osc.type = type;
        osc.frequency.value = freq;
        osc.detune.value = Math.random() * 8 - 4;
        const g = this.ctx.createGain();
        g.gain.value = gain;
        osc.connect(g);
        g.connect(filter);
        osc.start(now);
      }
    }
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(0.11, this.ctx.currentTime, 1.2);
  }

  mute() {
    if (!this.ctx || !this.master) return;
    this.master.gain.cancelScheduledValues(this.ctx.currentTime);
    this.master.gain.setTargetAtTime(0, this.ctx.currentTime, 0.4);
  }

  private tone(freqFrom: number, freqTo: number, gain: number, duration: number) {
    if (!this.ctx || !this.master) return;
    if (this.master.gain.value < 0.001) return;
    const now = this.ctx.currentTime;
    const osc = this.ctx.createOscillator();
    const g = this.ctx.createGain();
    osc.type = "sine";
    osc.frequency.setValueAtTime(freqFrom, now);
    osc.frequency.exponentialRampToValueAtTime(freqTo, now + duration);
    g.gain.setValueAtTime(gain, now);
    g.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    osc.connect(g);
    g.connect(this.ctx.destination);
    osc.start(now);
    osc.stop(now + duration + 0.02);
  }

  blip() { this.tone(1240, 620, 0.04, 0.12); }

  confirm() {
    this.tone(520, 1040, 0.05, 0.22);
    setTimeout(() => this.tone(780, 1560, 0.04, 0.28), 110);
  }
}

// ── Per-section ambient layer ────────────────────────────────────────────────

class AmbientEngine {
  private ctx: AudioContext | null = null;
  private masterGain: GainNode | null = null;
  private filter: BiquadFilterNode | null = null;
  private lfo: OscillatorNode | null = null;
  private lfoGain: GainNode | null = null;
  private oscs: OscillatorNode[] = [];
  private currentSection: string | null = null;
  private muted = true;

  private ensureContext() {
    if (this.ctx) return;
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext;
    this.ctx = new Ctor();
    this.masterGain = this.ctx.createGain();
    this.masterGain.gain.value = 0;
    this.masterGain.connect(this.ctx.destination);

    this.filter = this.ctx.createBiquadFilter();
    this.filter.type = "lowpass";
    this.filter.Q.value = 1.2;
    this.filter.connect(this.masterGain);

    this.lfoGain = this.ctx.createGain();
    this.lfoGain.gain.value = 0;
    this.lfoGain.connect(this.filter.frequency);

    this.lfo = this.ctx.createOscillator();
    this.lfo.type = "sine";
    this.lfo.frequency.value = 0.05;
    this.lfo.connect(this.lfoGain);
    this.lfo.start();
  }

  enable() {
    this.ensureContext();
    if (!this.ctx) return;
    void this.ctx.resume();
    this.muted = false;
    if (this.currentSection) this.applyProfile(this.currentSection);
  }

  disable() {
    this.muted = true;
    if (!this.ctx || !this.masterGain) return;
    this.masterGain.gain.cancelScheduledValues(this.ctx.currentTime);
    this.masterGain.gain.setTargetAtTime(0, this.ctx.currentTime, 0.6);
  }

  setSection(sectionId: string | null) {
    if (!sectionId || sectionId === this.currentSection) return;
    this.currentSection = sectionId;
    if (!this.muted) this.applyProfile(sectionId);
  }

  private applyProfile(sectionId: string) {
    const profile = SECTION_PROFILES[sectionId];
    if (!profile || !this.ctx || !this.filter || !this.lfo || !this.lfoGain || !this.masterGain) return;

    const now = this.ctx.currentTime;
    const FADE = 2.5; // crossfade seconds

    // Morph filter
    this.filter.frequency.cancelScheduledValues(now);
    this.filter.frequency.setTargetAtTime(profile.filterFreq, now, FADE);

    // Morph LFO
    this.lfo.frequency.cancelScheduledValues(now);
    this.lfo.frequency.setTargetAtTime(profile.lfoRate, now, FADE);
    this.lfoGain.gain.cancelScheduledValues(now);
    this.lfoGain.gain.setTargetAtTime(profile.lfoDepth, now, FADE);

    // Rebuild oscillators with crossfade
    const oldOscs = this.oscs;
    this.oscs = [];

    // Fade out old oscillators
    for (const osc of oldOscs) {
      try {
        // We can't easily fade osc gain here (already connected), just stop them
        osc.stop(now + FADE);
      } catch { /* already stopped */ }
    }

    // Spin up new oscillators
    const fundamentals = [
      profile.baseFreq,
      profile.baseFreq * 1.5,
      profile.baseFreq * 2,
    ];
    const gains = [0.5, 0.25, 0.12];

    for (let i = 0; i < fundamentals.length; i++) {
      const osc = this.ctx.createOscillator();
      osc.type = i === 0 ? profile.oscType : "sine";
      osc.frequency.value = fundamentals[i];
      osc.detune.value = (Math.random() * 10 - 5);
      const g = this.ctx.createGain();
      g.gain.setValueAtTime(0, now);
      g.gain.setTargetAtTime(gains[i] * profile.gain * 6, now, FADE);
      osc.connect(g);
      g.connect(this.filter);
      osc.start(now);
      this.oscs.push(osc);
    }

    // Fade master in
    this.masterGain.gain.cancelScheduledValues(now);
    this.masterGain.gain.setTargetAtTime(profile.gain, now, FADE * 0.6);
  }
}

export const sound = new SoundEngine();
export const ambient = new AmbientEngine();
