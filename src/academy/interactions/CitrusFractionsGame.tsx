import { useState } from "react";
import InteractionShell from "./shared/InteractionShell";

export default function CitrusFractionsGame({ onComplete }: { onComplete: () => void }) {
  const [slices, setSlices] = useState(0);
  return (
    <InteractionShell onComplete={onComplete} canComplete={slices >= 4}>
      <p className="text-center text-sm">Add slices to make a whole orange (4 slices)</p>
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
