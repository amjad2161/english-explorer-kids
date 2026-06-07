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

export default function AcademyPage() {
  const { lang, dir } = useLanguage();
  const webglSupported = useAcademyStore((s) => s.webglSupported);
  const setPlaying = useAcademyStore((s) => s.setPlaying);

  useEffect(() => {
    setPlaying(true);
    void flushQueue();
    return () => setPlaying(false);
  }, [setPlaying]);

  if (!webglSupported) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-8 text-center" dir={dir}>
        <h1 className="text-2xl font-bold mb-4">{academyT(lang, "academy.title")}</h1>
        <p className="text-muted-foreground mb-6">WebGL is not available on this device.</p>
        <Link to="/" className="text-primary underline">← Home</Link>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-950">
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
