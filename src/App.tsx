import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider, useLanguage, Language } from "@/lib/i18n";
import { useState } from "react";
import AppHeader from "@/components/AppHeader";
import WelcomeScreen, { hasCompletedOnboarding } from "@/components/WelcomeScreen";
import Index from "./pages/Index";
import AlphabetPage from "./pages/AlphabetPage";
import WordsPage from "./pages/WordsPage";
import QuizPage from "./pages/QuizPage";
import MemoryGame from "./pages/MemoryGame";
import LevelsPage from "./pages/LevelsPage";
import SpellingBee from "./pages/SpellingBee";
import WordScramble from "./pages/WordScramble";
import HangmanGame from "./pages/HangmanGame";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

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
      <AppHeader />
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
        <Route path="*" element={<NotFound />} />
      </Routes>
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
