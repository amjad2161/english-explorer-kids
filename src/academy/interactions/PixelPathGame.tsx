import { useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { academyT } from "../i18n/academyTranslations";
import InteractionShell from "./shared/InteractionShell";
import { buildGameResult, type GameProps } from "./shared/gameTypes";

const PATH = ["→", "→", "↑", "→"];

export default function PixelPathGame({ onComplete }: GameProps) {
  const { lang } = useLanguage();
  const startedAt = useRef(Date.now());
  const [step, setStep] = useState(0);
  const [wrongMoves, setWrongMoves] = useState(0);
  const cmds = ["→", "↑", "←", "↓"];

  const tap = (c: string) => {
    if (c === PATH[step]) {
      setStep((s) => s + 1);
    } else {
      setWrongMoves((n) => n + 1);
    }
  };

  return (
    <InteractionShell
      onComplete={onComplete}
      canComplete={step >= PATH.length}
      getResult={() => {
        const total = step + wrongMoves;
        const accuracy = total > 0 ? step / total : 1;
        return buildGameResult(startedAt.current, accuracy, step * 25, { step, wrongMoves });
      }}
    >
      <p className="text-center text-sm">{academyT(lang, "academy.game.pixel.instruction", { path: PATH.join(" ") })}</p>
      <div className="flex justify-center gap-2">
        {cmds.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => tap(c)}
            className="w-12 h-12 rounded-lg bg-cyan-500 text-white text-xl font-bold"
          >
            {c}
          </button>
        ))}
      </div>
      <p className="text-center">{academyT(lang, "academy.game.pixel.step", { step, total: PATH.length })}</p>
    </InteractionShell>
  );
}
