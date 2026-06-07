import { useState } from "react";
import InteractionShell from "./shared/InteractionShell";
import { useAcademyStore } from "../store/academyStore";

export default function HeartPulseGame({ onComplete }: { onComplete: () => void }) {
  const setHeartBpm = useAcademyStore((s) => s.setHeartBpm);
  const [bpm, setBpm] = useState(80);
  const [done, setDone] = useState(false);

  const exercise = () => {
    const next = 120;
    setBpm(next);
    setHeartBpm(next);
    setTimeout(() => {
      setBpm(72);
      setHeartBpm(72);
      setDone(true);
    }, 1500);
  };

  return (
    <InteractionShell onComplete={onComplete} canComplete={done}>
      <p className="text-center text-4xl">❤️ {bpm} BPM</p>
      <button type="button" onClick={exercise} className="w-full py-3 rounded-xl bg-pink-500 text-white font-bold">
        Exercise!
      </button>
    </InteractionShell>
  );
}
