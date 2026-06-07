import { useState } from "react";
import InteractionShell from "./shared/InteractionShell";

const PAIRS = [
  { animal: "🐟", habitat: "ocean" },
  { animal: "🦁", habitat: "savanna" },
  { animal: "🐧", habitat: "ice" },
];

export default function AnimalHabitatsGame({ onComplete }: { onComplete: () => void }) {
  const [matched, setMatched] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);

  const pick = (type: "animal" | "habitat", value: string) => {
    if (type === "animal") {
      setSelected(value);
      return;
    }
    const pair = PAIRS.find((p) => p.habitat === value);
    if (pair && selected === pair.animal) {
      setMatched((m) => m + 1);
      setSelected(null);
    }
  };

  return (
    <InteractionShell onComplete={onComplete} canComplete={matched >= 3}>
      <div className="flex justify-center gap-2">
        {PAIRS.map((p) => (
          <button key={p.animal} type="button" onClick={() => pick("animal", p.animal)} className="text-3xl p-2 rounded-lg border">
            {p.animal}
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-2">
        {PAIRS.map((p) => (
          <button key={p.habitat} type="button" onClick={() => pick("habitat", p.habitat)} className="px-3 py-2 rounded-lg border capitalize text-sm">
            {p.habitat}
          </button>
        ))}
      </div>
    </InteractionShell>
  );
}
