import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider, useLanguage, Language } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import { useState, useEffect, useCallback, forwardRef } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EraserTransitionProvider } from "@/components/ChalkEraserTransition";
import CinematicCanvas from "@/engine/CinematicCanvas";
import AppHeader from "@/components/AppHeader";
import AppFooter from "@/components/AppFooter";
import AchievementToast from "@/components/AchievementToast";
import ErrorBoundary from "@/components/ErrorBoundary";
import WelcomeScreen, { hasCompletedOnboarding } from "@/components/WelcomeScreen";
import SplashScreen from "@/components/SplashScreen";
import { useAchievementChecker } from "@/hooks/useAchievementChecker";
import OfflineIndicator from "@/components/OfflineIndicator";
import PWAInstallPrompt from "@/components/PWAInstallPrompt";
import BreakReminder from "@/components/BreakReminder";
import KeyboardShortcuts from "@/components/KeyboardShortcuts";
import OwlPageEntrance from "@/components/OwlPageEntrance";
import Index from "./pages/Index";
import AlphabetPage from "./pages/AlphabetPage";
import WordsPage from "./pages/WordsPage";
import QuizPage from "./pages/QuizPage";
import MemoryGame from "./pages/MemoryGame";
import LevelsPage from "./pages/LevelsPage";
import SpellingBee from "./pages/SpellingBee";
import WordScramble from "./pages/WordScramble";
import HangmanGame from "./pages/HangmanGame";
import PatternPuzzle from "./pages/PatternPuzzle";
import AchievementsPage from "./pages/AchievementsPage";
import StatsPage from "./pages/StatsPage";
import SettingsPage from "./pages/SettingsPage";
import ProgressReport from "./pages/ProgressReport";
import ParentDashboard from "./pages/ParentDashboard";
import NotFound from "./pages/NotFound";
import StoryPage from "./pages/StoryPage";
import ABCAnimalsPage from "./pages/ABCAnimalsPage";
import AnimalMatchGame from "./pages/AnimalMatchGame";

const queryClient = new QueryClient();

const pageVariants = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.3, ease: "easeOut" as const } },
  exit: { opacity: 0, y: -8, transition: { duration: 0.2, ease: "easeIn" as const } },
};

const PageWrapper = ({ children }: { children: React.ReactNode }) => (
  <motion.div variants={pageVariants} initial="initial" animate="animate" exit="exit">
    {children}
  </motion.div>
);

const AchievementWatcher = () => {
  const location = useLocation();
  const { current, dismiss, runCheck } = useAchievementChecker();

  useEffect(() => {
    const timer = setTimeout(runCheck, 500);
    return () => clearTimeout(timer);
  }, [location.pathname, runCheck]);

  return <AchievementToast achievement={current} onDone={dismiss} />;
};

const AnimatedRoutes = () => {
  const location = useLocation();

  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<PageWrapper><Index /></PageWrapper>} />
        <Route path="/alphabet" element={<PageWrapper><AlphabetPage /></PageWrapper>} />
        <Route path="/words" element={<PageWrapper><WordsPage /></PageWrapper>} />
        <Route path="/quiz" element={<PageWrapper><QuizPage /></PageWrapper>} />
        <Route path="/memory" element={<PageWrapper><MemoryGame /></PageWrapper>} />
        <Route path="/levels" element={<PageWrapper><LevelsPage /></PageWrapper>} />
        <Route path="/spelling" element={<PageWrapper><SpellingBee /></PageWrapper>} />
        <Route path="/scramble" element={<PageWrapper><WordScramble /></PageWrapper>} />
        <Route path="/hangman" element={<PageWrapper><HangmanGame /></PageWrapper>} />
        <Route path="/pattern" element={<PageWrapper><PatternPuzzle /></PageWrapper>} />
        <Route path="/achievements" element={<PageWrapper><AchievementsPage /></PageWrapper>} />
        <Route path="/stats" element={<PageWrapper><StatsPage /></PageWrapper>} />
        <Route path="/settings" element={<PageWrapper><SettingsPage /></PageWrapper>} />
        <Route path="/report" element={<PageWrapper><ProgressReport /></PageWrapper>} />
        <Route path="/parent" element={<PageWrapper><ParentDashboard /></PageWrapper>} />
        <Route path="/story" element={<PageWrapper><StoryPage /></PageWrapper>} />
        <Route path="/abc-animals" element={<PageWrapper><ABCAnimalsPage /></PageWrapper>} />
        <Route path="/animal-match" element={<PageWrapper><AnimalMatchGame /></PageWrapper>} />
        <Route path="*" element={<PageWrapper><NotFound /></PageWrapper>} />
      </Routes>
    </AnimatePresence>
  );
};

const AppRoutes = () => (
  <EraserTransitionProvider>
    <CinematicCanvas />
    <AppHeader />
    <AchievementWatcher />
    <KeyboardShortcuts />
    <BreakReminder />
    <OfflineIndicator />
    <PWAInstallPrompt />
    <main role="main" aria-label="Main content" className="relative z-10">
      <OwlPageEntrance />
      <AnimatedRoutes />
    </main>
    <AppFooter />
  </EraserTransitionProvider>
);

const AppContent = () => {
  const { setLang } = useLanguage();
  const [onboarded, setOnboarded] = useState(hasCompletedOnboarding);
  const [splashDone, setSplashDone] = useState(false);

  const handleSplashComplete = useCallback(() => setSplashDone(true), []);

  // Show splash on first load (before onboarding)
  if (!onboarded) {
    if (!splashDone) {
      return <SplashScreen onComplete={handleSplashComplete} />;
    }
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

const App = forwardRef<HTMLDivElement>((_props, _ref) => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <ThemeProvider>
        <TooltipProvider>
          <ErrorBoundary>
            <Toaster />
            <Sonner />
            <AppContent />
          </ErrorBoundary>
        </TooltipProvider>
      </ThemeProvider>
    </LanguageProvider>
  </QueryClientProvider>
));

App.displayName = "App";

export default App;
