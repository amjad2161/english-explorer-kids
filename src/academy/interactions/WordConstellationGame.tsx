import { useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { academyT } from "../i18n/academyTranslations";
import InteractionShell from "./shared/InteractionShell";
import { buildGameResult, type GameProps } from "./shared/gameTypes";

const WORD = ["S", "T", "A", "R"];
const LETTERS = ["S", "T", "A", "R", "X", "M"];

export default function WordConstellationGame({ onComplete }: GameProps) {
  const { lang } = useLanguage();
  const startedAt = useRef(Date.now());
  const [built, setBuilt] = useState<string[]>([]);
  const [mistakes, setMistakes] = useState(0);
  const success = built.join("") === "STAR";

  const tap = (l: string) => {
    const next = [...built, l];
    if (next.length <= WORD.length && WORD[next.length - 1] === l) {
      setBuilt(next);
    } else {
      setMistakes((n) => n + 1);
      setBuilt([]);
    }
  };

  return (
    <InteractionShell
      onComplete={onComplete}
      canComplete={success}
      getResult={() => {
        const attempts = mistakes + 1;
        const accuracy = success ? Math.max(0.5, 1 - mistakes * 0.15) : 0;
        return buildGameResult(startedAt.current, accuracy, success ? 95 : 30, { mistakes });
      }}
    >
      <p className="text-sm text-center">{academyT(lang, "academy.game.word.instruction")}</p>
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
