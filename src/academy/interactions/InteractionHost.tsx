import { useRef } from "react";
import { useLanguage } from "@/lib/i18n";
import { academyT } from "../i18n/academyTranslations";
import { getInteractionMeta } from "../registries/interactionRegistry";
import { recordProgress } from "../progress/progressAdapter";
import { useAcademyStore } from "../store/academyStore";
import type { InteractionId } from "../types";
import type { GameProps, GameResult } from "./shared/gameTypes";
import RoomSortGame from "./RoomSortGame";
import KitchenSafetyGame from "./KitchenSafetyGame";
import StreetCrossingGame from "./StreetCrossingGame";
import CitrusFractionsGame from "./CitrusFractionsGame";
import PixelPathGame from "./PixelPathGame";
import HeartPulseGame from "./HeartPulseGame";
import ScienceGardenGame from "./ScienceGardenGame";
import AnimalHabitatsGame from "./AnimalHabitatsGame";
import RhythmRepeatGame from "./RhythmRepeatGame";
import EmpathyChoiceGame from "./EmpathyChoiceGame";
import WordConstellationGame from "./WordConstellationGame";
import FinalLocksGame from "./FinalLocksGame";

const GAMES: Record<InteractionId, React.FC<GameProps>> = {
  "room-sort": RoomSortGame,
  "kitchen-safety": KitchenSafetyGame,
  "street-crossing": StreetCrossingGame,
  "citrus-fractions": CitrusFractionsGame,
  "pixel-path": PixelPathGame,
  "heart-pulse": HeartPulseGame,
  "science-garden": ScienceGardenGame,
  "animal-habitats": AnimalHabitatsGame,
  "rhythm-repeat": RhythmRepeatGame,
  "empathy-choice": EmpathyChoiceGame,
  "word-constellation": WordConstellationGame,
  "final-locks": FinalLocksGame,
};

export default function InteractionHost() {
  const { lang } = useLanguage();
  const activeInteraction = useAcademyStore((s) => s.activeInteraction);
  const completeInteraction = useAcademyStore((s) => s.completeInteraction);
  const startedAt = useRef(Date.now());

  if (!activeInteraction) return null;

  const Game = GAMES[activeInteraction];
  const title = academyT(lang, `academy.interaction.${activeInteraction}`);

  const handleComplete = (result: GameResult) => {
    const meta = getInteractionMeta(activeInteraction);
    const metric = recordProgress(meta.gameId, meta.skills[0], {
      accuracy: result.accuracy,
      score: result.score,
      timeSpentSec: result.timeSpentSec ?? Math.max(1, Math.round((Date.now() - startedAt.current) / 1000)),
      progress: result.progress ?? 1,
      metadata: result.metadata,
    });
    completeInteraction(activeInteraction, metric);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      dir={lang === "en" ? "ltr" : "rtl"}
    >
      <div className="w-full max-w-lg rounded-2xl bg-white/95 dark:bg-slate-900/95 shadow-2xl border border-amber-200/50 p-6 animate-in fade-in zoom-in duration-300">
        <h2 className="text-xl font-bold text-center mb-4 text-amber-700 dark:text-amber-300">{title}</h2>
        <Game onComplete={handleComplete} />
      </div>
    </div>
  );
}
