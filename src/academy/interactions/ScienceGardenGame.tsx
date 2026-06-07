import { useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { academyT } from "../i18n/academyTranslations";
import InteractionShell from "./shared/InteractionShell";
import { buildGameResult, type GameProps } from "./shared/gameTypes";

export default function ScienceGardenGame({ onComplete }: GameProps) {
  const { lang } = useLanguage();
  const startedAt = useRef(Date.now());
  const [water, setWater] = useState(0);
  const [sun, setSun] = useState(0);
  const complete = water >= 3 && sun >= 3;

  return (
    <InteractionShell
      onComplete={onComplete}
      canComplete={complete}
      getResult={() =>
        buildGameResult(startedAt.current, Math.min(water, sun) / 3, (water + sun) * 12, { water, sun })
      }
    >
      <p className="text-sm text-center">{academyT(lang, "academy.game.science.instruction")}</p>
      <div className="flex gap-4 justify-center">
        <button
          type="button"
          onClick={() => setWater((w) => w + 1)}
          className="px-4 py-2 rounded-xl bg-blue-400 text-white"
        >
          {academyT(lang, "academy.game.science.waterBtn", { count: water })}
        </button>
        <button
          type="button"
          onClick={() => setSun((s) => s + 1)}
          className="px-4 py-2 rounded-xl bg-yellow-400 text-white"
        >
          {academyT(lang, "academy.game.science.sunBtn", { count: sun })}
        </button>
      </div>
      <div className="text-center text-4xl">{complete ? "🌸" : "🌱"}</div>
    </InteractionShell>
  );
}
