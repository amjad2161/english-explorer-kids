import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useLanguage } from "@/lib/i18n";
import { academyT } from "../i18n/academyTranslations";
import KidGeniusCanvas from "../engine/KidGeniusCanvas";
import AcademyHud from "../hud/AcademyHud";
import NarrationBar from "../hud/NarrationBar";
import AcademyAudio from "../audio/AcademyAudio";
import InteractionHost from "../interactions/InteractionHost";
import { useAcademyStore } from "../store/academyStore";
import { flushQueue } from "../progress/progressAdapter";
import { loadAcademySession } from "../store/sessionPersistence";
import OfflineIndicator from "@/components/OfflineIndicator";

export default function AcademyPage() {
  const { lang, dir } = useLanguage();
  const webglSupported = useAcademyStore((s) => s.webglSupported);
  const showStartOverlay = useAcademyStore((s) => s.showStartOverlay);
  const startSession = useAcademyStore((s) => s.startSession);
  const resumeSession = useAcademyStore((s) => s.resumeSession);
  const hydrateFromStorage = useAcademyStore((s) => s.hydrateFromStorage);
  const setPlaying = useAcademyStore((s) => s.setPlaying);

  const savedSession = loadAcademySession();
  const canResume = Boolean(savedSession?.sessionActive && savedSession.elapsedSec > 0);

  useEffect(() => {
    hydrateFromStorage();
    void flushQueue();

    const onOnline = () => {
      void flushQueue();
    };
    window.addEventListener("online", onOnline);
    return () => {
      window.removeEventListener("online", onOnline);
      setPlaying(false);
    };
  }, [hydrateFromStorage, setPlaying]);

  if (!webglSupported) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center" dir={dir}>
        <h1 className="text-2xl font-bold mb-4">{academyT(lang, "academy.title")}</h1>
        <p className="text-muted-foreground mb-6">{academyT(lang, "academy.webglUnavailable")}</p>
        <Link to="/" className="text-primary underline">
          ← {lang === "ar" ? "الرئيسية" : lang === "he" ? "בית" : "Home"}
        </Link>
      </div>
    );
  }

  if (showStartOverlay) {
    return (
      <div
        className="min-h-screen flex flex-col items-center justify-center p-8 text-center bg-gradient-to-b from-slate-950 via-indigo-950 to-amber-950"
        dir={dir}
      >
        <OfflineIndicator />
        <div className="max-w-md space-y-6">
          <h1 className="text-3xl font-bold text-amber-300">{academyT(lang, "academy.title")}</h1>
          <p className="text-white/80">{academyT(lang, "academy.subtitle")}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              type="button"
              onClick={() => startSession(true)}
              className="px-6 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white font-bold"
            >
              {academyT(lang, "academy.start")}
            </button>
            {canResume && (
              <button
                type="button"
                onClick={() => resumeSession()}
                className="px-6 py-3 rounded-xl bg-white/10 hover:bg-white/20 text-white font-bold border border-white/20"
              >
                {academyT(lang, "academy.resume")}
              </button>
            )}
          </div>
          <Link to="/" className="inline-block text-sm text-white/60 hover:text-white">
            ← {lang === "ar" ? "الرئيسية" : lang === "he" ? "בית" : "Home"}
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950">
      <OfflineIndicator />
      <KidGeniusCanvas />
      <AcademyAudio />
      <AcademyHud />
      <NarrationBar />
      <InteractionHost />
      <Link
        to="/"
        className="fixed bottom-4 left-4 z-40 rounded-xl bg-black/50 text-white px-4 py-2 text-sm backdrop-blur hover:bg-black/70"
      >
        ← {lang === "ar" ? "الرئيسية" : lang === "he" ? "בית" : "Home"}
      </Link>
    </div>
  );
}
