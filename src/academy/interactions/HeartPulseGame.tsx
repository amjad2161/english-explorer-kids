import { useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { academyT } from "../i18n/academyTranslations";
import InteractionShell from "./shared/InteractionShell";
import { buildGameResult, type GameProps } from "./shared/gameTypes";
import { useAcademyStore } from "../store/academyStore";

export default function HeartPulseGame({ onComplete }: GameProps) {
  const { lang } = useLanguage();
  const startedAt = useRef(Date.now());
  const setHeartBpm = useAcademyStore((s) => s.setHeartBpm);
  const [bpm, setBpm] = useState(80);
  const [done, setDone] = useState(false);

  const exercise = () => {
    const peak = 120;
    setBpm(peak);
    setHeartBpm(peak);
    setTimeout(() => {
      setBpm(72);
      setHeartBpm(72);
      setDone(true);
    }, 1500);
  };

  return (
    <InteractionShell
      onComplete={onComplete}
      canComplete={done}
      getResult={() => buildGameResult(startedAt.current, 1, 88, { peakBpm: 120, restBpm: 72 })}
    >
      <p className="text-center text-4xl">❤️ {bpm} BPM</p>
      <button type="button" onClick={exercise} disabled={done} className="w-full py-3 rounded-xl bg-pink-500 text-white font-bold disabled:opacity-40">
        {academyT(lang, "academy.game.heart.exercise")}
      </button>
    </InteractionShell>
  );
}
