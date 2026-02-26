import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { LanguageProvider } from "@/lib/i18n";
import AppHeader from "@/components/AppHeader";
import Index from "./pages/Index";
import AlphabetPage from "./pages/AlphabetPage";
import WordsPage from "./pages/WordsPage";
import QuizPage from "./pages/QuizPage";
import MemoryGame from "./pages/MemoryGame";
import LevelsPage from "./pages/LevelsPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AppHeader />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/alphabet" element={<AlphabetPage />} />
            <Route path="/words" element={<WordsPage />} />
            <Route path="/quiz" element={<QuizPage />} />
            <Route path="/memory" element={<MemoryGame />} />
            <Route path="/levels" element={<LevelsPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;
