import { useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { academyT } from "../i18n/academyTranslations";
import InteractionShell from "./shared/InteractionShell";
import { buildGameResult, type GameProps } from "./shared/gameTypes";

const ITEMS = [
  { id: "apple", safe: true },
  { id: "stove", safe: false },
  { id: "milk", safe: true },
  { id: "knife", safe: false },
];

export default function KitchenSafetyGame({ onComplete }: GameProps) {
  const { lang } = useLanguage();
  const startedAt = useRef(Date.now());
  const [picked, setPicked] = useState<Set<string>>(new Set());
  const safeCount = ITEMS.filter((i) => i.safe && picked.has(i.id)).length;
  const bad = ITEMS.some((i) => !i.safe && picked.has(i.id));

  return (
    <InteractionShell
      onComplete={onComplete}
      canComplete={safeCount >= 2 && !bad}
      getResult={() =>
        buildGameResult(startedAt.current, bad ? 0.4 : safeCount / 2, bad ? 40 : 90, {
          safePicked: safeCount,
          unsafePicked: bad,
        })
      }
    >
      <p className="text-sm text-center">{academyT(lang, "academy.game.kitchen.instruction")}</p>
      <div className="grid grid-cols-2 gap-2">
        {ITEMS.map((i) => (
          <button
            key={i.id}
            type="button"
            onClick={() => setPicked((s) => new Set(s).add(i.id))}
            className={`p-4 rounded-xl border-2 capitalize ${picked.has(i.id) ? "border-amber-500 bg-amber-50" : "border-gray-200"}`}
          >
            {i.id}
          </button>
        ))}
      </div>
    </InteractionShell>
  );
}
