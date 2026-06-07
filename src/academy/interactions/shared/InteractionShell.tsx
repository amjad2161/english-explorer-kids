import { useLanguage } from "@/lib/i18n";
import { academyT } from "../../i18n/academyTranslations";

interface Props {
  children: React.ReactNode;
  onComplete: () => void;
  canComplete?: boolean;
}

export default function InteractionShell({ children, onComplete, canComplete = false }: Props) {
  const { lang } = useLanguage();
  return (
    <div className="space-y-4">
      {children}
      <button
        type="button"
        disabled={!canComplete}
        onClick={onComplete}
        className="w-full py-3 rounded-xl font-bold text-white bg-gradient-to-r from-amber-500 to-orange-500 disabled:opacity-40 disabled:cursor-not-allowed hover:from-amber-600 hover:to-orange-600 transition-all"
      >
        {academyT(lang, "academy.success")}
      </button>
    </div>
  );
}
