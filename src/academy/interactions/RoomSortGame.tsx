import { useState } from "react";
import InteractionShell from "./shared/InteractionShell";

const TOYS = [
  { id: "ball", color: "bg-red-400", box: "red" },
  { id: "block", color: "bg-blue-400", box: "blue" },
  { id: "doll", color: "bg-green-400", box: "green" },
];

export default function RoomSortGame({ onComplete }: { onComplete: () => void }) {
  const [sorted, setSorted] = useState<Set<string>>(new Set());
  const toggle = (toy: string, box: string) => {
    const match = TOYS.find((t) => t.id === toy && t.box === box);
    if (match) setSorted((s) => new Set(s).add(toy));
  };
  return (
    <InteractionShell onComplete={onComplete} canComplete={sorted.size >= 3}>
      <p className="text-sm text-center text-muted-foreground">Drag toys to matching boxes</p>
      <div className="flex justify-center gap-2">
        {TOYS.map((t) => (
          <button key={t.id} type="button" className={`w-12 h-12 rounded-full ${t.color}`} onClick={() => toggle(t.id, t.box)}>
            {sorted.has(t.id) ? "✓" : t.id[0].toUpperCase()}
          </button>
        ))}
      </div>
      <div className="flex justify-center gap-3">
        {["red", "blue", "green"].map((box) => (
          <div key={box} className={`w-16 h-16 rounded-lg border-2 border-dashed flex items-center justify-center text-xs capitalize bg-${box}-100`}>
            {box}
          </div>
        ))}
      </div>
    </InteractionShell>
  );
}
