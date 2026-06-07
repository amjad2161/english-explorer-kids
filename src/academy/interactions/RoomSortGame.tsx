import { useRef, useState } from "react";
import { useLanguage } from "@/lib/i18n";
import { academyT } from "../i18n/academyTranslations";
import InteractionShell from "./shared/InteractionShell";
import { buildGameResult, type GameProps } from "./shared/gameTypes";

const TOYS = [
  { id: "ball", color: "bg-red-400", box: "red" as const },
  { id: "block", color: "bg-blue-400", box: "blue" as const },
  { id: "doll", color: "bg-green-400", box: "green" as const },
];

const BOX_STYLES: Record<string, string> = {
  red: "bg-red-100 border-red-400",
  blue: "bg-blue-100 border-blue-400",
  green: "bg-green-100 border-green-400",
};

export default function RoomSortGame({ onComplete }: GameProps) {
  const { lang } = useLanguage();
  const startedAt = useRef(Date.now());
  const [sorted, setSorted] = useState<Set<string>>(new Set());
  const [selectedToy, setSelectedToy] = useState<string | null>(null);

  const onBoxClick = (box: string) => {
    if (!selectedToy) return;
    const toy = TOYS.find((t) => t.id === selectedToy);
    if (toy?.box === box) {
      setSorted((s) => new Set(s).add(selectedToy));
    }
    setSelectedToy(null);
  };

  return (
    <InteractionShell
      onComplete={onComplete}
      canComplete={sorted.size >= 3}
      getResult={() =>
        buildGameResult(startedAt.current, sorted.size / 3, sorted.size * 33, {
          sorted: sorted.size,
        })
      }
    >
      <p className="text-sm text-center text-muted-foreground">{academyT(lang, "academy.game.roomSort.instruction")}</p>
      <div className="flex justify-center gap-2">
        {TOYS.map((t) => (
          <button
            key={t.id}
            type="button"
            className={`w-12 h-12 rounded-full ${t.color} ring-2 ${selectedToy === t.id ? "ring-amber-500 scale-110" : "ring-transparent"} transition-transform`}
            onClick={() => setSelectedToy(t.id)}
            disabled={sorted.has(t.id)}
          >
            {sorted.has(t.id) ? "✓" : t.id[0].toUpperCase()}
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-3">
        {(["red", "blue", "green"] as const).map((box) => (
          <button
            key={box}
            type="button"
            onClick={() => onBoxClick(box)}
            className={`w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center text-xs capitalize ${BOX_STYLES[box]}`}
          >
            {box}
          </button>
        ))}
      </div>
    </InteractionShell>
  );
}
