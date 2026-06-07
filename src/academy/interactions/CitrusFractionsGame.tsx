import { useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { academyT } from "../i18n/academyTranslations";
import InteractionShell from "./shared/InteractionShell";
import { buildGameResult, type GameProps } from "./shared/gameTypes";

export default function CitrusFractionsGame({ onComplete }: GameProps) {
  const { lang } = useLanguage();
  const startedAt = useRef(Date.now());
  const [slices, setSlices] = useState(0);

  return (
    <InteractionShell
      onComplete={onComplete}
      canComplete={slices >= 4}
      getResult={() => buildGameResult(startedAt.current, slices / 4, slices * 25, { slices })}
    >
      <p className="text-center text-sm">{academyT(lang, "academy.game.citrus.instruction")}</p>
      <div className="flex justify-center gap-1">
        {Array.from({ length: 4 }, (_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setSlices((s) => Math.min(4, s + 1))}
            className={`w-14 h-14 rounded-full border-2 ${i < slices ? "bg-orange-400 border-orange-600" : "border-orange-200"}`}
          />
        ))}
      </div>
      <p className="text-center font-bold text-orange-600">{slices}/4</p>
    </InteractionShell>
  );
}
