import { useState, useEffect } from "react";
import InteractionShell from "./shared/InteractionShell";

export default function StreetCrossingGame({ onComplete }: { onComplete: () => void }) {
  const [light, setLight] = useState<"red" | "green">("red");
  const [crossed, setCrossed] = useState(false);

  useEffect(() => {
    const id = setInterval(() => setLight((l) => (l === "red" ? "green" : "red")), 2000);
    return () => clearInterval(id);
  }, []);

  return (
    <InteractionShell onComplete={onComplete} canComplete={crossed}>
      <div className="flex justify-center">
        <div className={`w-16 h-16 rounded-full ${light === "green" ? "bg-green-500" : "bg-red-500"} shadow-lg`} />
      </div>
      <button
        type="button"
        disabled={light !== "green"}
        onClick={() => setCrossed(true)}
        className="w-full py-3 rounded-xl bg-blue-500 text-white font-bold disabled:opacity-40"
      >
        Cross
      </button>
    </InteractionShell>
  );
}
