import { useState } from "react";
import InteractionShell from "./shared/InteractionShell";

export default function ScienceGardenGame({ onComplete }: { onComplete: () => void }) {
  const [water, setWater] = useState(0);
  const [sun, setSun] = useState(0);
  return (
    <InteractionShell onComplete={onComplete} canComplete={water >= 3 && sun >= 3}>
      <div className="flex gap-4 justify-center">
        <button type="button" onClick={() => setWater((w) => w + 1)} className="px-4 py-2 rounded-xl bg-blue-400 text-white">
          💧 Water ({water})
        </button>
        <button type="button" onClick={() => setSun((s) => s + 1)} className="px-4 py-2 rounded-xl bg-yellow-400 text-white">
          ☀️ Sun ({sun})
        </button>
      </div>
      <div className="text-center text-4xl">{water >= 3 && sun >= 3 ? "🌸" : "🌱"}</div>
    </InteractionShell>
  );
}
