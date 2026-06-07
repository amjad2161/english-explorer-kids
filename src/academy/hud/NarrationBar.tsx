import { useEffect, useRef } from "react";
import { useLanguage } from "@/lib/i18n";
import { academyT } from "../i18n/academyTranslations";
import { useAcademyStore } from "../store/academyStore";
import { getBeatAtTime } from "../cinema/masterScript";
import { speak, isSoundEnabled } from "@/lib/sounds";

const langToSpeech: Record<string, string> = {
  en: "en-US",
  he: "he-IL",
  ar: "ar-SA",
};

export default function NarrationBar() {
  const { lang, dir } = useLanguage();
  const elapsedSec = useAcademyStore((s) => s.elapsedSec);
  const mode = useAcademyStore((s) => s.mode);
  const playing = useAcademyStore((s) => s.playing);
  const lastSpoken = useRef(-1);

  const beat = getBeatAtTime(elapsedSec);
  const title = academyT(lang, beat.titleKey, { scene: beat.id, act: beat.act });
  const narration = academyT(lang, beat.narrationKey, { scene: beat.id, act: beat.act });

  useEffect(() => {
    if (!playing || mode === "interactive" || !isSoundEnabled()) return;
    if (lastSpoken.current === beat.id) return;
    if (elapsedSec - beat.startSec > 4) return;

    lastSpoken.current = beat.id;
    const speechLang = langToSpeech[lang] ?? "en-US";
    speak(narration, speechLang, 0.82, 1.05);
  }, [beat.id, beat.startSec, elapsedSec, lang, mode, narration, playing]);

  if (mode === "interactive") return null;

  return (
    <div className="fixed inset-x-0 bottom-20 z-40 flex justify-center px-4 pointer-events-none" dir={dir}>
      <div className="max-w-2xl w-full rounded-2xl bg-black/55 backdrop-blur-md text-white px-5 py-4 border border-white/10 shadow-xl animate-in fade-in slide-in-from-bottom-2 duration-500">
        <p className="text-xs uppercase tracking-wider text-amber-300/90 mb-1">
          {title}
        </p>
        <p className="text-base sm:text-lg font-medium leading-relaxed">{narration}</p>
      </div>
    </div>
  );
}
