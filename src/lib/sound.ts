/**
 * Generative ambient sound engine — no audio assets, everything is
 * synthesised with the Web Audio API. Two detuned drones through a slow
 * low-pass sweep make the "engine hum"; UI events get short sine blips.
 */

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

      // Slow filter sweep gives the drone a breathing quality
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
    if (this.master.gain.value < 0.001) return; // muted — stay silent
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

  blip() {
    this.tone(1240, 620, 0.04, 0.12);
  }

  confirm() {
    this.tone(520, 1040, 0.05, 0.22);
    setTimeout(() => this.tone(780, 1560, 0.04, 0.28), 110);
  }
}

export const sound = new SoundEngine();
