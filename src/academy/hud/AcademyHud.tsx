import { useLanguage } from "@/lib/i18n";
import { academyT } from "../i18n/academyTranslations";
import { useAcademyStore } from "../store/academyStore";
import { getBeatAtTime } from "../cinema/masterScript";
import { worldOrder, worldRegistry } from "../registries/worldRegistry";
import type { WorldId } from "../types";
import { MASTER_DURATION_SEC } from "../cinema/masterScript";

function formatTime(sec: number) {
  const m = Math.floor(sec / 60);
  const s = Math.floor(sec % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

export default function AcademyHud() {
  const { lang, dir } = useLanguage();
  const elapsedSec = useAcademyStore((s) => s.elapsedSec);
  const playing = useAcademyStore((s) => s.playing);
  const setPlaying = useAcademyStore((s) => s.setPlaying);
  const activeWorld = useAcademyStore((s) => s.activeWorld);
  const mode = useAcademyStore((s) => s.mode);
  const interactionComplete = useAcademyStore((s) => s.interactionComplete);
  const medalEarned = useAcademyStore((s) => s.medalEarned);
  const seek = useAcademyStore((s) => s.seek);
  const jumpToWorld = useAcademyStore((s) => s.jumpToWorld);

  const activeInteraction = useAcademyStore((s) => s.activeInteraction);
  const enterInteraction = useAcademyStore((s) => s.enterInteraction);
  const beat = getBeatAtTime(elapsedSec);
  const world = worldRegistry[activeWorld];
  const progress = (elapsedSec / MASTER_DURATION_SEC) * 100;
  const pendingInteraction =
    beat.interaction &&
    !interactionComplete.has(beat.interaction) &&
    !activeInteraction &&
    !playing &&
    mode === "cinematic";
  const sceneTitle = academyT(lang, beat.titleKey, { scene: beat.id, act: beat.act });
  const pauseLabel = academyT(lang, "academy.hud.pause");
  const playLabel = academyT(lang, "academy.hud.play");
  const interactiveLabel = academyT(lang, "academy.hud.interactive");
  const cinematicLabel = academyT(lang, "academy.hud.cinematic");

  return (
    <div className="fixed inset-x-0 top-0 z-40 pointer-events-none p-4" dir={dir}>
      <div className="flex items-start justify-between gap-4 pointer-events-auto">
        <div className="rounded-2xl bg-black/40 backdrop-blur-md text-white px-4 py-3 min-w-[200px]">
          <h1 className="text-lg font-bold text-amber-300">{academyT(lang, "academy.title")}</h1>
          <p className="text-sm opacity-90">{academyT(lang, world.titleKey)}</p>
          <p className="text-xs opacity-70 mt-1">{sceneTitle}</p>
        </div>

        <div className="rounded-2xl bg-black/40 backdrop-blur-md text-white px-4 py-3 text-center">
          <p className="text-2xl font-mono font-bold">{formatTime(elapsedSec)}</p>
          <p className="text-xs opacity-70">/ {formatTime(MASTER_DURATION_SEC)}</p>
        </div>

        <div className="flex flex-col gap-2 items-end">
          {pendingInteraction && beat.interaction && (
            <button
              type="button"
              onClick={() => enterInteraction(beat.interaction!)}
              className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 font-bold text-sm animate-pulse"
            >
              🎮 {academyT(lang, "academy.hud.startActivity")}
            </button>
          )}
          <button
            type="button"
            onClick={() => setPlaying(!playing)}
            className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white px-4 py-2 font-bold text-sm"
          >
            {playing ? "⏸" : "▶"} {playing ? pauseLabel : playLabel}
          </button>
          {medalEarned && (
            <span className="text-amber-300 text-sm font-bold">{academyT(lang, "academy.medal")}</span>
          )}
        </div>
      </div>

      <div className="mt-3 pointer-events-auto">
        <div className="h-2 rounded-full bg-white/20 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-amber-400 to-orange-500 transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
        <div className="flex justify-between mt-1 text-xs text-white/80">
          <span>{mode === "interactive" ? `🎮 ${interactiveLabel}` : `🎬 ${cinematicLabel}`}</span>
          <span>{academyT(lang, "academy.hud.interactionsCount", { done: interactionComplete.size })}</span>
        </div>
      </div>

      <div className="mt-2 flex gap-1 pointer-events-auto overflow-x-auto pb-1">
        {[1, 2, 3, 4, 5].map((act) => (
          <button
            key={act}
            type="button"
            onClick={() => seek(act === 1 ? 0 : act === 2 ? 720 : act === 3 ? 1560 : act === 4 ? 2520 : 3180)}
            className={`px-2 py-1 rounded-lg text-xs font-medium ${beat.act === act ? "bg-amber-500 text-white" : "bg-white/20 text-white"}`}
          >
            {academyT(lang, "academy.hud.act", { n: act })}
          </button>
        ))}
      </div>

      <div className="mt-2 flex gap-1 pointer-events-auto overflow-x-auto pb-1 max-w-full">
        {worldOrder.map((worldId: WorldId) => {
          const w = worldRegistry[worldId];
          const isActive = activeWorld === worldId;
          return (
            <button
              key={worldId}
              type="button"
              onClick={() => jumpToWorld(worldId)}
              className={`shrink-0 px-2 py-1 rounded-lg text-xs font-medium border ${
                isActive
                  ? "bg-white text-gray-900 border-white"
                  : "bg-black/30 text-white border-white/20 hover:bg-white/20"
              }`}
              style={isActive ? { borderColor: w.accentColor } : undefined}
            >
              {academyT(lang, w.titleKey)}
            </button>
          );
        })}
      </div>
    </div>
  );
}
