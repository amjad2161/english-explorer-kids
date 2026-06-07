import { useLanguage } from "@/lib/i18n";
import { academyT } from "../../i18n/academyTranslations";
import type { GameResult } from "./gameTypes";

interface Props {
  children: React.ReactNode;
  onComplete: (result: GameResult) => void;
  canComplete?: boolean;
  getResult?: () => GameResult;
}

export default function InteractionShell({ children, onComplete, canComplete = false, getResult }: Props) {
  const { lang } = useLanguage();

  const handleComplete = () => {
    onComplete(
      getResult?.() ?? {
        accuracy: 1,
        score: 100,
        progress: 1,
        timeSpentSec: 1,
      },
    );
  };

  return (
    <div className="space-y-4">
      {children}
      <button
        type="button"
        disabled={!canComplete}
        onClick={handleComplete}
        className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 disabled:opacity-40 disabled:cursor-not-allowed hover:from-amber-600 hover:to-orange-600 transition-all"
      >
        {academyT(lang, "academy.success")}
      </button>
    </div>
  );
}
