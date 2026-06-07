import { useState } from "react";
import InteractionShell from "./shared/InteractionShell";

const PATH = ["→", "→", "↑", "→"];

export default function PixelPathGame({ onComplete }: { onComplete: () => void }) {
  const [step, setStep] = useState(0);
  const cmds = ["→", "↑", "←", "↓"];

  return (
    <InteractionShell onComplete={onComplete} canComplete={step >= PATH.length}>
      <p className="text-center text-sm">Program Pixel: {PATH.join(" ")}</p>
      <div className="flex justify-center gap-2">
        {cmds.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              if (c === PATH[step]) setStep((s) => s + 1);
            }}
            className="w-12 h-12 rounded-lg bg-cyan-500 text-white text-xl font-bold"
          >
            {c}
          </button>
        ))}
      </div>
      <p className="text-center">Step {step}/{PATH.length}</p>
    </InteractionShell>
  );
}
