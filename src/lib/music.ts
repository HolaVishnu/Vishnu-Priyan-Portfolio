import { useUniverse } from "./store";
import { sound } from "./sound";
import soundtrackData from "../data/soundtrack.json";

interface TrackDef {
  id: string;
  title: string;
  artist: string;
  file: string;
}

const FADE_MS = 1400;
const TARGET_VOLUME = 0.32;

/**
 * A single-channel soundtrack engine. Every zone uses the same media element,
 * so two songs can never remain audible at the same time. Project docking
 * leaves this channel untouched; zone selection resumes after undocking.
 */
class MusicEngine {
  private player: HTMLAudioElement | null = null;
  private currentId: string | null = null;
  private loadedId: string | null = null;
  private enabled = false;
  private playbackRequest = 0;
  private fadeTimer: number | null = null;

  private getTrack(id: string): TrackDef | undefined {
    return (soundtrackData.tracks as TrackDef[]).find((track) => track.id === id);
  }

  private getPlayer() {
    if (this.player) return this.player;

    const player = new Audio();
    player.loop = true;
    player.preload = "auto";
    player.volume = 0;
    player.addEventListener("error", () => {
      if (this.loadedId === this.currentId) this.fallbackToDrone();
    });
    this.player = player;
    return player;
  }

  private clearFade() {
    if (this.fadeTimer === null) return;
    window.clearInterval(this.fadeTimer);
    this.fadeTimer = null;
  }

  private fadeTo(target: number) {
    const player = this.player;
    if (!player) return;

    this.clearFade();
    const from = player.volume;
    const startedAt = Date.now();
    this.fadeTimer = window.setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const progress = Math.min(elapsed / FADE_MS, 1);
      player.volume = from + (target - from) * progress;
      if (progress === 1) this.clearFade();
    }, 50);
  }

  private stopPlayer() {
    this.clearFade();
    if (!this.player) return;
    this.player.pause();
    this.player.volume = 0;
  }

  private fallbackToDrone() {
    if (!this.enabled) return;
    this.stopPlayer();
    useUniverse.getState().setNowPlaying(null);
    sound.start();
  }

  setZoneTrack(id: string) {
    if (this.currentId === id) {
      if (this.enabled && this.player?.paused) this.playCurrent();
      return;
    }

    this.currentId = id;
    this.playbackRequest += 1;
    if (this.enabled) this.playCurrent();
  }

  private playCurrent() {
    const id = this.currentId;
    if (!id || !this.enabled) return;

    const track = this.getTrack(id);
    if (!track) {
      this.fallbackToDrone();
      return;
    }

    const player = this.getPlayer();
    const request = ++this.playbackRequest;

    if (this.loadedId !== id) {
      // Replacing src on the one shared player synchronously terminates the
      // previous song before the next asynchronous play request begins.
      this.stopPlayer();
      this.loadedId = id;
      player.src = track.file;
      player.load();
    }

    if (!player.paused) {
      sound.mute();
      useUniverse
        .getState()
        .setNowPlaying(`${track.title} · ${track.artist} · NCS`);
      this.fadeTo(TARGET_VOLUME);
      return;
    }

    player.volume = 0;
    player
      .play()
      .then(() => {
        if (
          request !== this.playbackRequest ||
          this.currentId !== id ||
          this.loadedId !== id ||
          !this.enabled
        ) {
          return;
        }

        sound.mute();
        useUniverse
          .getState()
          .setNowPlaying(`${track.title} · ${track.artist} · NCS`);
        this.fadeTo(TARGET_VOLUME);
      })
      .catch((error: DOMException) => {
        if (
          request === this.playbackRequest &&
          this.currentId === id &&
          this.enabled &&
          error?.name !== "AbortError"
        ) {
          this.fallbackToDrone();
        }
      });
  }

  /** Must be reached from a user gesture to satisfy browser autoplay policy. */
  enable() {
    this.enabled = true;
    if (this.currentId) this.playCurrent();
    else this.fallbackToDrone();
  }

  disable() {
    this.enabled = false;
    this.playbackRequest += 1;
    this.stopPlayer();
    sound.mute();
    useUniverse.getState().setNowPlaying(null);
  }
}

export const music = new MusicEngine();
