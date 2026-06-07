import { useEffect, useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { academyT } from "../i18n/academyTranslations";
import InteractionShell from "./shared/InteractionShell";
import { buildGameResult, type GameProps } from "./shared/gameTypes";

export default function StreetCrossingGame({ onComplete }: GameProps) {
  const { lang } = useLanguage();
  const startedAt = useRef(Date.now());
  const [light, setLight] = useState<"red" | "green">("red");
  const [crossed, setCrossed] = useState(false);
  const [earlyAttempts, setEarlyAttempts] = useState(0);

  useEffect(() => {
    const id = setInterval(() => setLight((l) => (l === "red" ? "green" : "red")), 2000);
    return () => clearInterval(id);
  }, []);

  const tryCross = () => {
    if (light !== "green") {
      setEarlyAttempts((n) => n + 1);
      return;
    }
    setCrossed(true);
  };

  return (
    <InteractionShell
      onComplete={onComplete}
      canComplete={crossed}
      getResult={() => {
        const attempts = earlyAttempts + 1;
        const accuracy = crossed ? Math.max(0.5, 1 - earlyAttempts * 0.15) : 0;
        return buildGameResult(startedAt.current, accuracy, crossed ? 85 : 20, {
          earlyAttempts,
        });
      }}
    >
      <p className="text-sm text-center">{academyT(lang, "academy.game.street.instruction")}</p>
      <div className="flex justify-center">
        <div className={`w-16 h-16 rounded-full ${light === "green" ? "bg-green-500" : "bg-red-500"} shadow-lg`} />
      </div>
      <button
        type="button"
        disabled={crossed}
        onClick={tryCross}
        className="w-full py-3 rounded-xl bg-blue-500 text-white font-bold disabled:opacity-40"
      >
        {academyT(lang, "academy.game.street.cross")}
      </button>
    </InteractionShell>
  );
}
