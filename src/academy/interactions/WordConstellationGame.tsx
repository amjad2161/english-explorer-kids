import { useState } from "react";
import InteractionShell from "./shared/InteractionShell";

const WORD = ["S", "T", "A", "R"];
const LETTERS = ["S", "T", "A", "R", "X", "M"];

export default function WordConstellationGame({ onComplete }: { onComplete: () => void }) {
  const [built, setBuilt] = useState<string[]>([]);

  const tap = (l: string) => {
    const next = [...built, l];
    if (next.length <= WORD.length && WORD[next.length - 1] === l) {
      setBuilt(next);
    } else {
      setBuilt([]);
    }
  };

  return (
    <InteractionShell onComplete={onComplete} canComplete={built.join("") === "STAR"}>
      <p className="text-center font-mono text-2xl tracking-widest">{built.join("") || "_ _ _ _"}</p>
      <div className="flex flex-wrap justify-center gap-2">
        {LETTERS.map((l) => (
          <button key={l} type="button" onClick={() => tap(l)} className="w-10 h-10 rounded-full bg-teal-500 text-white font-bold">
            {l}
          </button>
        ))}
      </div>
    </InteractionShell>
  );
}
