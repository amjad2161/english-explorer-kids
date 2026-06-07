import { useState } from "react";
import InteractionShell from "./shared/InteractionShell";
import { useAcademyStore } from "../store/academyStore";

export default function FinalLocksGame({ onComplete }: { onComplete: () => void }) {
  const openFinaleLock = useAcademyStore((s) => s.openFinaleLock);
  const awardMedal = useAcademyStore((s) => s.awardMedal);
  const locks = useAcademyStore((s) => s.finaleLocksOpen);
  const [puzzle, setPuzzle] = useState(0);

  const solve = () => {
    openFinaleLock();
    setPuzzle((p) => p + 1);
    if (puzzle + 1 >= 3) awardMedal();
  };

  return (
    <InteractionShell onComplete={onComplete} canComplete={locks >= 3}>
      <p className="text-center">Solve 3 puzzles to unlock the gates</p>
      <div className="flex justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <div key={i} className={`w-12 h-12 rounded-full flex items-center justify-center ${i < locks ? "bg-yellow-400" : "bg-gray-300"}`}>
            {i < locks ? "🔓" : "🔒"}
          </div>
        ))}
      </div>
      <button type="button" onClick={solve} disabled={locks >= 3} className="w-full py-3 rounded-xl bg-amber-500 text-white font-bold disabled:opacity-40">
        Solve puzzle ({locks}/3)
      </button>
    </InteractionShell>
  );
}
