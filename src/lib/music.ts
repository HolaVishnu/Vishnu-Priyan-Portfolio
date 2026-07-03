import { useUniverse } from "./store";
import { sound } from "./sound";
import soundtrackData from "../data/soundtrack.json";

/**
 * Zone-based soundtrack engine. Tracks live in /public/audio (see the README
 * there); each journey zone crossfades into its own track. If a file is
 * missing the engine falls back to the generative ambient drone, so the
 * experience works with or without the soundtrack installed.
 */

interface TrackDef {
  id: string;
  title: string;
  artist: string;
  file: string;
}

const FADE_MS = 1800;
const TARGET_VOLUME = 0.32;

class MusicEngine {
  private players = new Map<string, HTMLAudioElement>();
  private missing = new Set<string>();
  private fades = new Map<string, number>();
  private currentId: string | null = null;
  private enabled = false;

  private getTrack(id: string): TrackDef | undefined {
    return (soundtrackData.tracks as TrackDef[]).find((t) => t.id === id);
  }

  private getPlayer(id: string): HTMLAudioElement | null {
    if (this.missing.has(id)) return null;
    let player = this.players.get(id);
    if (!player) {
      const track = this.getTrack(id);
      if (!track) return null;
      player = new Audio(track.file);
      player.loop = true;
      player.preload = "auto";
      player.volume = 0;
      player.addEventListener("error", () => {
        this.missing.add(id);
        if (this.currentId === id) this.fallbackToDrone();
      });
      this.players.set(id, player);
    }
    return player;
  }

  private fade(player: HTMLAudioElement, to: number) {
    const key = player.src;
    const existing = this.fades.get(key);
    if (existing) window.clearInterval(existing);

    const from = player.volume;
    const start = Date.now();
    const interval = window.setInterval(() => {
      const t = Math.min((Date.now() - start) / FADE_MS, 1);
      player.volume = from + (to - from) * t;
      if (t >= 1) {
        window.clearInterval(interval);
        this.fades.delete(key);
        if (to === 0) player.pause();
      }
    }, 50);
    this.fades.set(key, interval);
  }

  private fallbackToDrone() {
    if (!this.enabled) return;
    useUniverse.getState().setNowPlaying(null);
    sound.start();
  }

  /** Called by MusicController whenever the journey enters a new zone. */
  setZoneTrack(id: string) {
    if (this.currentId === id) return;
    this.currentId = id;
    if (this.enabled) this.playCurrent();
  }

  private playCurrent() {
    const id = this.currentId;
    if (!id) return;

    for (const [pid, player] of this.players) {
      if (pid !== id && !player.paused) this.fade(player, 0);
    }

    const player = this.getPlayer(id);
    if (!player) {
      this.fallbackToDrone();
      return;
    }

    const track = this.getTrack(id)!;
    player
      .play()
      .then(() => {
        sound.mute(); // the drone yields to the soundtrack
        useUniverse
          .getState()
          .setNowPlaying(`${track.title} · ${track.artist} · NCS`);
        this.fade(player, TARGET_VOLUME);
      })
      .catch((err: DOMException) => {
        // Only blacklist genuinely unplayable files. An autoplay-policy
        // rejection (NotAllowedError) is transient — the next user gesture
        // will succeed, so the track must stay eligible.
        if (err?.name === "NotSupportedError") this.missing.add(id);
        this.fallbackToDrone();
      });
  }

  /** Must be called from a user gesture (autoplay policy). */
  enable() {
    this.enabled = true;
    if (this.currentId) this.playCurrent();
    else this.fallbackToDrone();
  }

  disable() {
    this.enabled = false;
    for (const player of this.players.values()) {
      if (!player.paused) this.fade(player, 0);
    }
    sound.mute();
    useUniverse.getState().setNowPlaying(null);
  }
}

export const music = new MusicEngine();
