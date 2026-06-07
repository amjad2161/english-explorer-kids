import { useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { academyT } from "../i18n/academyTranslations";
import InteractionShell from "./shared/InteractionShell";
import { buildGameResult, type GameProps } from "./shared/gameTypes";

const PAIRS = [
  { animal: "🐟", habitat: "ocean" },
  { animal: "🦁", habitat: "savanna" },
  { animal: "🐧", habitat: "ice" },
];

export default function AnimalHabitatsGame({ onComplete }: GameProps) {
  const { lang } = useLanguage();
  const startedAt = useRef(Date.now());
  const [matched, setMatched] = useState(0);
  const [selected, setSelected] = useState<string | null>(null);
  const [wrongAttempts, setWrongAttempts] = useState(0);

  const pick = (type: "animal" | "habitat", value: string) => {
    if (type === "animal") {
      setSelected(value);
      return;
    }
    const pair = PAIRS.find((p) => p.habitat === value);
    if (pair && selected === pair.animal) {
      setMatched((m) => m + 1);
      setSelected(null);
    } else {
      setWrongAttempts((n) => n + 1);
      setSelected(null);
    }
  };

  return (
    <InteractionShell
      onComplete={onComplete}
      canComplete={matched >= 3}
      getResult={() => {
        const attempts = matched + wrongAttempts;
        const accuracy = attempts > 0 ? matched / attempts : 1;
        return buildGameResult(startedAt.current, accuracy, matched * 33, { matched, wrongAttempts });
      }}
    >
      <p className="text-sm text-center">{academyT(lang, "academy.game.animals.instruction")}</p>
      <div className="flex justify-center gap-2">
        {PAIRS.map((p) => (
          <button
            key={p.animal}
            type="button"
            onClick={() => pick("animal", p.animal)}
            className={`text-3xl p-2 rounded-lg border ${selected === p.animal ? "border-amber-500 bg-amber-50" : ""}`}
          >
            {p.animal}
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-2">
        {PAIRS.map((p) => (
          <button
            key={p.habitat}
            type="button"
            onClick={() => pick("habitat", p.habitat)}
            className="px-3 py-2 rounded-lg border capitalize text-sm"
          >
            {p.habitat}
          </button>
        ))}
      </div>
    </InteractionShell>
  );
}
