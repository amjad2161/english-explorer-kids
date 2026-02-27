import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { LanguageProvider, useLanguage, Language } from "@/lib/i18n";
import { ThemeProvider } from "@/lib/theme";
import React, { useState, useEffect, useCallback } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { EraserTransitionProvider } from "@/components/ChalkEraserTransition";
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
import CharacterStage from "@/components/character/CharacterStage";
const Index = React.lazy(() => import("./pages/Index"));
const AlphabetPage = React.lazy(() => import("./pages/AlphabetPage"));
const WordsPage = React.lazy(() => import("./pages/WordsPage"));
const QuizPage = React.lazy(() => import("./pages/QuizPage"));
const MemoryGame = React.lazy(() => import("./pages/MemoryGame"));
const LevelsPage = React.lazy(() => import("./pages/LevelsPage"));
const SpellingBee = React.lazy(() => import("./pages/SpellingBee"));
const WordScramble = React.lazy(() => import("./pages/WordScramble"));
const HangmanGame = React.lazy(() => import("./pages/HangmanGame"));
const PatternPuzzle = React.lazy(() => import("./pages/PatternPuzzle"));
const AchievementsPage = React.lazy(() => import("./pages/AchievementsPage"));
const StatsPage = React.lazy(() => import("./pages/StatsPage"));
const SettingsPage = React.lazy(() => import("./pages/SettingsPage"));
const ProgressReport = React.lazy(() => import("./pages/ProgressReport"));
const ParentDashboard = React.lazy(() => import("./pages/ParentDashboard"));
const NotFound = React.lazy(() => import("./pages/NotFound"));
const StoryPage = React.lazy(() => import("./pages/StoryPage"));
const LearningPathPage = React.lazy(() => import("./pages/LearningPathPage"));
const PhonicsGame = React.lazy(() => import("./pages/PhonicsGame"));
const GrammarBuilder = React.lazy(() => import("./pages/GrammarBuilder"));
const TPRPage = React.lazy(() => import("./pages/TPRPage"));

const LazyFallback = () => (
  <div className="flex items-center justify-center min-h-screen text-4xl animate-bounce">🦉</div>
);

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
        <Route path="/" element={<React.Suspense fallback={<LazyFallback />}><PageWrapper><Index /></PageWrapper></React.Suspense>} />
        <Route path="/alphabet" element={<React.Suspense fallback={<LazyFallback />}><PageWrapper><AlphabetPage /></PageWrapper></React.Suspense>} />
        <Route path="/words" element={<React.Suspense fallback={<LazyFallback />}><PageWrapper><WordsPage /></PageWrapper></React.Suspense>} />
        <Route path="/quiz" element={<React.Suspense fallback={<LazyFallback />}><PageWrapper><QuizPage /></PageWrapper></React.Suspense>} />
        <Route path="/memory" element={<React.Suspense fallback={<LazyFallback />}><PageWrapper><MemoryGame /></PageWrapper></React.Suspense>} />
        <Route path="/levels" element={<React.Suspense fallback={<LazyFallback />}><PageWrapper><LevelsPage /></PageWrapper></React.Suspense>} />
        <Route path="/spelling" element={<React.Suspense fallback={<LazyFallback />}><PageWrapper><SpellingBee /></PageWrapper></React.Suspense>} />
        <Route path="/scramble" element={<React.Suspense fallback={<LazyFallback />}><PageWrapper><WordScramble /></PageWrapper></React.Suspense>} />
        <Route path="/hangman" element={<React.Suspense fallback={<LazyFallback />}><PageWrapper><HangmanGame /></PageWrapper></React.Suspense>} />
        <Route path="/pattern" element={<React.Suspense fallback={<LazyFallback />}><PageWrapper><PatternPuzzle /></PageWrapper></React.Suspense>} />
        <Route path="/achievements" element={<React.Suspense fallback={<LazyFallback />}><PageWrapper><AchievementsPage /></PageWrapper></React.Suspense>} />
        <Route path="/stats" element={<React.Suspense fallback={<LazyFallback />}><PageWrapper><StatsPage /></PageWrapper></React.Suspense>} />
        <Route path="/settings" element={<React.Suspense fallback={<LazyFallback />}><PageWrapper><SettingsPage /></PageWrapper></React.Suspense>} />
        <Route path="/report" element={<React.Suspense fallback={<LazyFallback />}><PageWrapper><ProgressReport /></PageWrapper></React.Suspense>} />
        <Route path="/parent" element={<React.Suspense fallback={<LazyFallback />}><PageWrapper><ParentDashboard /></PageWrapper></React.Suspense>} />
        <Route path="/story" element={<React.Suspense fallback={<LazyFallback />}><PageWrapper><StoryPage /></PageWrapper></React.Suspense>} />
        <Route path="/learn" element={<React.Suspense fallback={<LazyFallback />}><PageWrapper><LearningPathPage /></PageWrapper></React.Suspense>} />
        <Route path="/phonics" element={<React.Suspense fallback={<LazyFallback />}><PageWrapper><PhonicsGame /></PageWrapper></React.Suspense>} />
        <Route path="/grammar" element={<React.Suspense fallback={<LazyFallback />}><PageWrapper><GrammarBuilder /></PageWrapper></React.Suspense>} />
        <Route path="/tpr" element={<React.Suspense fallback={<LazyFallback />}><PageWrapper><TPRPage /></PageWrapper></React.Suspense>} />
        <Route path="*" element={<React.Suspense fallback={<LazyFallback />}><PageWrapper><NotFound /></PageWrapper></React.Suspense>} />
      </Routes>
    </AnimatePresence>
  );
};

const AppRoutes = () => (
  <EraserTransitionProvider>
    <AppHeader />
    <AchievementWatcher />
    <KeyboardShortcuts />
    <BreakReminder />
    <OfflineIndicator />
    <PWAInstallPrompt />
    <main role="main" aria-label="Main content">
      <AnimatedRoutes />
    </main>
    <AppFooter />
    {/* Persistent character companion — mounted once, never remounts across routes */}
    <CharacterStage size="md" />
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

const App = () => (
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
);

export default App;
