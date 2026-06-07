import { useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { academyT } from "../i18n/academyTranslations";
import InteractionShell from "./shared/InteractionShell";
import { buildGameResult, type GameProps } from "./shared/gameTypes";

const PATTERN = ["🍊", "🍋", "🍊", "🍋"];

export default function RhythmRepeatGame({ onComplete }: GameProps) {
  const { lang } = useLanguage();
  const startedAt = useRef(Date.now());
  const [input, setInput] = useState<string[]>([]);
  const [resets, setResets] = useState(0);
  const fruits = ["🍊", "🍋"];
  const success = input.length >= 4 && input.every((v, i) => v === PATTERN[i]);

  const tap = (f: string) => {
    const next = [...input, f];
    setInput(next);
    if (next.length === PATTERN.length) {
      const ok = next.every((v, i) => v === PATTERN[i]);
      if (!ok) {
        setResets((n) => n + 1);
        setInput([]);
      }
    }
  };

  return (
    <InteractionShell
      onComplete={onComplete}
      canComplete={success}
      getResult={() => {
        const attempts = resets + 1;
        const accuracy = attempts > 0 ? 1 / attempts : 1;
        return buildGameResult(startedAt.current, Math.min(1, accuracy), success ? 92 : 50, { resets });
      }}
    >
      <p className="text-center">{academyT(lang, "academy.game.rhythm.instruction", { pattern: PATTERN.join(" ") })}</p>
      <div className="flex justify-center gap-3">
        {fruits.map((f) => (
          <button key={f} type="button" onClick={() => tap(f)} className="text-4xl p-3 rounded-xl bg-purple-100">
            {f}
          </button>
        ))}
      </div>
      <p className="text-center">{input.join(" ") || "..."}</p>
    </InteractionShell>
  );
}
