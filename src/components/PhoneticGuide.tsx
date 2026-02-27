import { motion } from "framer-motion";
import { Volume2 } from "lucide-react";
import { speakEnglish } from "@/lib/sounds";
import { useLanguage } from "@/lib/i18n";

// IPA phonetic transcriptions for each letter
const phonetics: Record<string, { ipa: string; guide_he: string; guide_ar: string; guide_en: string }> = {
  A: { ipa: "/eɪ/", guide_he: "אֵי - כמו במילה 'היי'", guide_ar: "إيْ - مثل في كلمة 'هَيْ'", guide_en: "AY - as in 'hay'" },
  B: { ipa: "/biː/", guide_he: "בִּי - שפתיים סגורות ואז פתוח", guide_ar: "بِي - أغلق الشفاه ثم افتح", guide_en: "BEE - lips together then open" },
  C: { ipa: "/siː/", guide_he: "סִי - לשון מאחורי השיניים", guide_ar: "سِي - اللسان خلف الأسنان", guide_en: "SEE - tongue behind teeth" },
  D: { ipa: "/diː/", guide_he: "דִי - לשון נוגעת בחיך", guide_ar: "دِي - اللسان يلمس سقف الفم", guide_en: "DEE - tongue touches roof" },
  E: { ipa: "/iː/", guide_he: "אִי - פה מחייך", guide_ar: "إِي - فم مبتسم", guide_en: "EE - smiling mouth" },
  F: { ipa: "/ɛf/", guide_he: "אֶף - שיניים על השפה", guide_ar: "إِف - الأسنان على الشفة", guide_en: "EF - teeth on lip" },
  G: { ipa: "/dʒiː/", guide_he: "ג'י - כמו ג' רכה", guide_ar: "جِي - مثل الجيم", guide_en: "JEE - soft G sound" },
  H: { ipa: "/eɪtʃ/", guide_he: "אֵייצ' - נשיפת אוויר", guide_ar: "إيتْش - نفخ هواء", guide_en: "AITCH - breathy sound" },
  I: { ipa: "/aɪ/", guide_he: "אַי - כמו 'איי'", guide_ar: "آي - مثل 'آي'", guide_en: "EYE - like the word 'eye'" },
  J: { ipa: "/dʒeɪ/", guide_he: "ג'יי - כמו ג' חזקה", guide_ar: "جَيْ - مثل الجيم القوية", guide_en: "JAY - strong J sound" },
  K: { ipa: "/keɪ/", guide_he: "קֵיי - כמו 'קיי'", guide_ar: "كَيْ - مثل 'كاي'", guide_en: "KAY - sharp K sound" },
  L: { ipa: "/ɛl/", guide_he: "אֶל - לשון למעלה", guide_ar: "إِل - اللسان لأعلى", guide_en: "EL - tongue up" },
  M: { ipa: "/ɛm/", guide_he: "אֶם - שפתיים סגורות", guide_ar: "إِم - الشفاه مغلقة", guide_en: "EM - lips closed" },
  N: { ipa: "/ɛn/", guide_he: "אֶן - לשון מאחורי השיניים", guide_ar: "إِن - اللسان خلف الأسنان", guide_en: "EN - tongue behind teeth" },
  O: { ipa: "/oʊ/", guide_he: "אוֹ - פה עגול", guide_ar: "أُو - فم دائري", guide_en: "OH - round mouth" },
  P: { ipa: "/piː/", guide_he: "פִּי - פיצוץ אוויר", guide_ar: "بِي - انفجار هواء", guide_en: "PEE - burst of air" },
  Q: { ipa: "/kjuː/", guide_he: "קיוּ - כמו 'קיו'", guide_ar: "كْيُو - مثل 'كيو'", guide_en: "CUE - K + YOU" },
  R: { ipa: "/ɑːr/", guide_he: "אָר - לשון מסתלסלת", guide_ar: "آر - اللسان ملتف", guide_en: "AR - curled tongue" },
  S: { ipa: "/ɛs/", guide_he: "אֶס - צליל שריקה", guide_ar: "إِس - صوت صفير", guide_en: "ESS - hissing sound" },
  T: { ipa: "/tiː/", guide_he: "טִי - לשון קופצת", guide_ar: "تِي - اللسان يقفز", guide_en: "TEE - tongue taps" },
  U: { ipa: "/juː/", guide_he: "יוּ - שפתיים קדימה", guide_ar: "يُو - الشفاه للأمام", guide_en: "YOU - lips forward" },
  V: { ipa: "/viː/", guide_he: "וִי - שיניים על שפה + רטט", guide_ar: "فِي - أسنان على شفة + اهتزاز", guide_en: "VEE - teeth on lip + vibrate" },
  W: { ipa: "/ˈdʌbəljuː/", guide_he: "דַבְּליוּ - שפתיים עגולות", guide_ar: "دَبْلْيُو - شفاه مستديرة", guide_en: "DOUBLE-U - round lips" },
  X: { ipa: "/ɛks/", guide_he: "אֶקְס - קיי+ס ביחד", guide_ar: "إِكْس - ك+س معاً", guide_en: "EKS - K+S together" },
  Y: { ipa: "/waɪ/", guide_he: "וַואי - שפתיים עגולות ואז פתוח", guide_ar: "وَاي - شفاه مستديرة ثم افتح", guide_en: "WHY - lips round then open" },
  Z: { ipa: "/ziː/", guide_he: "זֶד - כמו דבורה", guide_ar: "زِد - مثل النحلة", guide_en: "ZEE - buzzing sound" },
};

interface Props {
  letter: string;
  showGuide?: boolean;
}

const PhoneticGuide = ({ letter, showGuide = true }: Props) => {
  const { lang } = useLanguage();
  const data = phonetics[letter.toUpperCase()];
  if (!data) return null;

  const guide = lang === "he" ? data.guide_he : lang === "ar" ? data.guide_ar : data.guide_en;

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-2"
    >
      {/* IPA Display */}
      <div className="flex items-center justify-center gap-3">
        <span className="font-mono text-lg text-primary/80 bg-primary/10 px-3 py-1 rounded-lg">
          {data.ipa}
        </span>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => speakEnglish(letter)}
          className="w-8 h-8 rounded-full bg-primary/15 flex items-center justify-center text-primary hover:bg-primary/25 transition-colors"
        >
          <Volume2 className="w-4 h-4" />
        </motion.button>
      </div>

      {/* Pronunciation Guide */}
      {showGuide && (
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-xs text-muted-foreground font-body bg-muted/40 rounded-lg px-3 py-2 leading-relaxed"
        >
          🗣️ {guide}
        </motion.p>
      )}
    </motion.div>
  );
};

export default PhoneticGuide;
