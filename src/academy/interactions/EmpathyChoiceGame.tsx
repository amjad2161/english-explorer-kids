import { useState } from "react";
import InteractionShell from "./shared/InteractionShell";
import { useAcademyStore } from "../store/academyStore";

const CHOICES = [
  { id: "help", empathy: 0.3 },
  { id: "ignore", empathy: -0.1 },
  { id: "ask", empathy: 0.2 },
];

export default function EmpathyChoiceGame({ onComplete }: { onComplete: () => void }) {
  const setEmpathyWarmth = useAcademyStore((s) => s.setEmpathyWarmth);
  const empathyWarmth = useAcademyStore((s) => s.empathyWarmth);
  const [chosen, setChosen] = useState(false);

  const pick = (id: string) => {
    const c = CHOICES.find((x) => x.id === id);
    if (c) setEmpathyWarmth(Math.min(1, Math.max(0, empathyWarmth + c.empathy)));
    setChosen(true);
  };

  return (
    <InteractionShell onComplete={onComplete} canComplete={chosen}>
      <p className="text-center text-sm">Sara lost her sketchbook. What do you do?</p>
      <div className="space-y-2">
        {CHOICES.map((c) => (
          <button key={c.id} type="button" onClick={() => pick(c.id)} className="w-full py-2 rounded-xl border capitalize hover:bg-pink-50">
            {c.id}
          </button>
        ))}
      </div>
    </InteractionShell>
  );
}
