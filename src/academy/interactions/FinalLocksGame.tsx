import { useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { academyT } from "../i18n/academyTranslations";
import InteractionShell from "./shared/InteractionShell";
import { buildGameResult, type GameProps } from "./shared/gameTypes";
import { useAcademyStore } from "../store/academyStore";

const PUZZLES = [
  { key: "academy.game.final.q1", answer: 3 },
  { key: "academy.game.final.q2", answer: 5 },
  { key: "academy.game.final.q3", answer: 8 },
] as const;

export default function FinalLocksGame({ onComplete }: GameProps) {
  const { lang } = useLanguage();
  const startedAt = useRef(Date.now());
  const mistakes = useRef(0);
  const openFinaleLock = useAcademyStore((s) => s.openFinaleLock);
  const awardMedal = useAcademyStore((s) => s.awardMedal);
  const locks = useAcademyStore((s) => s.finaleLocksOpen);
  const [puzzleIdx, setPuzzleIdx] = useState(0);
  const [answer, setAnswer] = useState("");

  const submit = () => {
    if (locks >= 3 || puzzleIdx >= PUZZLES.length) return;
    const expected = PUZZLES[puzzleIdx].answer;
    if (Number(answer) !== expected) {
      mistakes.current += 1;
      setAnswer("");
      return;
    }
    openFinaleLock();
    const nextLocks = useAcademyStore.getState().finaleLocksOpen;
    if (nextLocks >= 3) awardMedal();
    setPuzzleIdx((i) => i + 1);
    setAnswer("");
  };

  const puzzle = PUZZLES[Math.min(puzzleIdx, PUZZLES.length - 1)];

  return (
    <InteractionShell
      onComplete={onComplete}
      canComplete={locks >= 3}
      getResult={() => {
        const attempts = locks + mistakes.current;
        const accuracy = attempts > 0 ? locks / attempts : 1;
        return buildGameResult(startedAt.current, accuracy, locks * 33, {
          locks,
          mistakes: mistakes.current,
        });
      }}
    >
      <p className="text-center">{academyT(lang, "academy.game.final.instruction")}</p>
      <div className="flex justify-center gap-2">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={`w-12 h-12 rounded-full flex items-center justify-center ${i < locks ? "bg-yellow-400" : "bg-gray-300"}`}
          >
            {i < locks ? "🔓" : "🔒"}
          </div>
        ))}
      </div>
      {locks < 3 && (
        <div className="space-y-2">
          <p className="text-center font-medium">{academyT(lang, puzzle.key)}</p>
          <input
            type="number"
            inputMode="numeric"
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border text-center"
            placeholder="?"
          />
          <button
            type="button"
            onClick={submit}
            className="w-full py-3 rounded-xl bg-amber-500 text-white font-bold"
          >
            {academyT(lang, "academy.game.final.solve", { locks })}
          </button>
        </div>
      )}
    </InteractionShell>
  );
}
