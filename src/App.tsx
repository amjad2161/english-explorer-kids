import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider, useLanguage, Language } from "@/lib/i18n";
import { useState, useEffect } from "react";
import AppHeader from "@/components/AppHeader";
import AchievementToast from "@/components/AchievementToast";
import WelcomeScreen, { hasCompletedOnboarding } from "@/components/WelcomeScreen";
import { useAchievementChecker } from "@/hooks/useAchievementChecker";
import Index from "./pages/Index";
import AlphabetPage from "./pages/AlphabetPage";
import WordsPage from "./pages/WordsPage";
import QuizPage from "./pages/QuizPage";
import MemoryGame from "./pages/MemoryGame";
import LevelsPage from "./pages/LevelsPage";
import SpellingBee from "./pages/SpellingBee";
import WordScramble from "./pages/WordScramble";
import HangmanGame from "./pages/HangmanGame";
import AchievementsPage from "./pages/AchievementsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const AchievementWatcher = () => {
  const location = useLocation();
  const { current, dismiss, runCheck } = useAchievementChecker();

  // Check achievements on every route change
  useEffect(() => {
    const timer = setTimeout(runCheck, 500);
    return () => clearTimeout(timer);
  }, [location.pathname, runCheck]);

  return <AchievementToast achievement={current} onDone={dismiss} />;
};

const AppRoutes = () => (
  <>
    <AppHeader />
    <AchievementWatcher />
    <Routes>
      <Route path="/" element={<Index />} />
      <Route path="/alphabet" element={<AlphabetPage />} />
      <Route path="/words" element={<WordsPage />} />
      <Route path="/quiz" element={<QuizPage />} />
      <Route path="/memory" element={<MemoryGame />} />
      <Route path="/levels" element={<LevelsPage />} />
      <Route path="/spelling" element={<SpellingBee />} />
      <Route path="/scramble" element={<WordScramble />} />
      <Route path="/hangman" element={<HangmanGame />} />
      <Route path="/achievements" element={<AchievementsPage />} />
      <Route path="*" element={<NotFound />} />
    </Routes>
  </>
);

const AppContent = () => {
  const { setLang } = useLanguage();
  const [onboarded, setOnboarded] = useState(hasCompletedOnboarding);

  if (!onboarded) {
    return (
      <WelcomeScreen
        onComplete={(lang: Language) => {
          setLang(lang);
          setOnboarded(true);
        }}
      />
    );
  }

  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
