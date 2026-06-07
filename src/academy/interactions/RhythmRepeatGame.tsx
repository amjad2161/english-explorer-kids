import { useState } from "react";
import InteractionShell from "./shared/InteractionShell";

const PATTERN = ["🍊", "🍋", "🍊", "🍋"];

export default function RhythmRepeatGame({ onComplete }: { onComplete: () => void }) {
  const [input, setInput] = useState<string[]>([]);
  const fruits = ["🍊", "🍋"];

  const tap = (f: string) => {
    const next = [...input, f];
    setInput(next);
    if (next.length === PATTERN.length) {
      const ok = next.every((v, i) => v === PATTERN[i]);
      if (!ok) setInput([]);
    }
  };

  return (
    <InteractionShell onComplete={onComplete} canComplete={input.length >= 4 && input.every((v, i) => v === PATTERN[i])}>
      <p className="text-center">Repeat: {PATTERN.join(" ")}</p>
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
