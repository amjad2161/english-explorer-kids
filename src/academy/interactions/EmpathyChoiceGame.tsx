import { useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { academyT } from "../i18n/academyTranslations";
import InteractionShell from "./shared/InteractionShell";
import { buildGameResult, type GameProps } from "./shared/gameTypes";
import { useAcademyStore } from "../store/academyStore";

const CHOICES = [
  { id: "help", key: "academy.game.empathy.help", empathy: 0.3, score: 100 },
  { id: "ask", key: "academy.game.empathy.ask", empathy: 0.2, score: 85 },
  { id: "ignore", key: "academy.game.empathy.ignore", empathy: -0.1, score: 40 },
] as const;

export default function EmpathyChoiceGame({ onComplete }: GameProps) {
  const { lang } = useLanguage();
  const startedAt = useRef(Date.now());
  const setEmpathyWarmth = useAcademyStore((s) => s.setEmpathyWarmth);
  const empathyWarmth = useAcademyStore((s) => s.empathyWarmth);
  const [chosen, setChosen] = useState<(typeof CHOICES)[number]["id"] | null>(null);

  const pick = (id: (typeof CHOICES)[number]["id"]) => {
    const c = CHOICES.find((x) => x.id === id);
    if (c) setEmpathyWarmth(Math.min(1, Math.max(0, empathyWarmth + c.empathy)));
    setChosen(id);
  };

  const choice = CHOICES.find((c) => c.id === chosen);

  return (
    <InteractionShell
      onComplete={onComplete}
      canComplete={chosen !== null}
      getResult={() =>
        buildGameResult(startedAt.current, (choice?.score ?? 50) / 100, choice?.score ?? 50, {
          choice: chosen,
        })
      }
    >
      <p className="text-center text-sm">{academyT(lang, "academy.game.empathy.instruction")}</p>
      <div className="space-y-2">
        {CHOICES.map((c) => (
          <button
            key={c.id}
            type="button"
            onClick={() => pick(c.id)}
            className={`w-full py-2 rounded-xl border hover:bg-pink-50 ${chosen === c.id ? "border-pink-500 bg-pink-50" : ""}`}
          >
            {academyT(lang, c.key)}
          </button>
        ))}
      </div>
    </InteractionShell>
  );
}
