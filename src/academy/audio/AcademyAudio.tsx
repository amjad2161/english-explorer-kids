import { useEffect, useRef } from "react";
import { useAcademyStore } from "../store/academyStore";
import { worldRegistry } from "../registries/worldRegistry";
import { isMusicEnabled } from "@/lib/sounds";

/** Procedural ambient pads per world — no external assets required */
const WORLD_TONES: Record<string, { freq: number; detune: number; filter: number }> = {
  "academy-hub": { freq: 220, detune: 3, filter: 800 },
  "citrus-market": { freq: 262, detune: 5, filter: 1200 },
  "logic-lab": { freq: 196, detune: 7, filter: 600 },
  "anatomy-explorer": { freq: 247, detune: 4, filter: 900 },
  "science-garden": { freq: 294, detune: 6, filter: 1400 },
  "animals-kingdom": { freq: 330, detune: 2, filter: 1000 },
  "music-stage": { freq: 349, detune: 8, filter: 1600 },
  "feelings-world": { freq: 277, detune: 5, filter: 1100 },
  "language-universe": { freq: 311, detune: 4, filter: 1300 },
  "academy-finale": { freq: 392, detune: 3, filter: 1800 },
};

function createAmbient(ctx: AudioContext, key: string, volume: number) {
  const tone = WORLD_TONES[key] ?? WORLD_TONES["academy-hub"];
  const master = ctx.createGain();
  master.gain.value = 0;

  const osc1 = ctx.createOscillator();
  osc1.type = "sine";
  osc1.frequency.value = tone.freq;
  osc1.detune.value = tone.detune;

  const osc2 = ctx.createOscillator();
  osc2.type = "triangle";
  osc2.frequency.value = tone.freq * 1.5;
  osc2.detune.value = -tone.detune;

  const filter = ctx.createBiquadFilter();
  filter.type = "lowpass";
  filter.frequency.value = tone.filter;

  const lfo = ctx.createOscillator();
  lfo.frequency.value = 0.08;
  const lfoGain = ctx.createGain();
  lfoGain.gain.value = 0.04;
  lfo.connect(lfoGain);
  lfoGain.connect(master.gain);

  osc1.connect(filter);
  osc2.connect(filter);
  filter.connect(master);
  master.connect(ctx.destination);

  osc1.start();
  osc2.start();
  lfo.start();

  const fadeIn = ctx.currentTime + 0.05;
  master.gain.setValueAtTime(0, ctx.currentTime);
  master.gain.linearRampToValueAtTime(volume, fadeIn + 1.2);

  return {
    stop: () => {
      const t = ctx.currentTime;
      master.gain.cancelScheduledValues(t);
      master.gain.setValueAtTime(master.gain.value, t);
      master.gain.linearRampToValueAtTime(0, t + 0.8);
      setTimeout(() => {
        osc1.stop();
        osc2.stop();
        lfo.stop();
        master.disconnect();
      }, 900);
    },
  };
}

export default function AcademyAudio() {
  const activeWorld = useAcademyStore((s) => s.activeWorld);
  const playing = useAcademyStore((s) => s.playing);
  const mode = useAcademyStore((s) => s.mode);
  const ctxRef = useRef<AudioContext | null>(null);
  const ambientRef = useRef<{ stop: () => void } | null>(null);
  const musicKey = worldRegistry[activeWorld].ambientMusic;

  useEffect(() => {
    if (!isMusicEnabled()) return;

    const start = () => {
      if (!ctxRef.current) {
        ctxRef.current = new AudioContext();
      }
      const ctx = ctxRef.current;
      if (ctx.state === "suspended") void ctx.resume();

      ambientRef.current?.stop();
      const vol = mode === "interactive" ? 0.04 : 0.07;
      ambientRef.current = createAmbient(ctx, musicKey, vol);
    };

    if (playing) start();
    else ambientRef.current?.stop();

    return () => ambientRef.current?.stop();
  }, [musicKey, playing, mode]);

  useEffect(
    () => () => {
      ambientRef.current?.stop();
      void ctxRef.current?.close();
    },
    [],
  );

  return null;
}
