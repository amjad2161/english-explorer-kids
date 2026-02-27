import { createContext, useContext, useEffect, useState, useCallback, ReactNode } from "react";

type Theme = "light" | "dark";

interface ThemeContextType {
  theme: Theme;
  toggleTheme: () => void;
}

const ThemeContext = createContext<ThemeContextType>({ theme: "light", toggleTheme: () => {} });

const STORAGE_KEY = "english-fun-theme";

export const ThemeProvider = ({ children }: { children: ReactNode }) => {
  const [theme, setTheme] = useState<Theme>(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === "dark" || saved === "light") return saved;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === "dark") {
      root.classList.add("dark");
    } else {
      root.classList.remove("dark");
    }
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const toggleTheme = useCallback(() => {
    const nextTheme = theme === "light" ? "dark" : "light";

    // Create a smooth crossfade overlay
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 99999;
      pointer-events: none;
      background: ${nextTheme === "dark"
        ? "radial-gradient(circle at 50% 0%, hsl(160 20% 8% / 0.95), hsl(160 25% 6% / 0.98))"
        : "radial-gradient(circle at 50% 0%, hsl(45 80% 97% / 0.95), hsl(220 16% 96% / 0.98))"
      };
      opacity: 0;
      transition: opacity 0.5s cubic-bezier(0.4, 0, 0.2, 1);
    `;
    document.body.appendChild(overlay);

    // Trigger fade in
    requestAnimationFrame(() => {
      overlay.style.opacity = "1";
    });

    // Switch theme at peak opacity
    setTimeout(() => {
      setTheme(nextTheme);

      // Fade out
      setTimeout(() => {
        overlay.style.opacity = "0";
        overlay.addEventListener("transitionend", () => overlay.remove(), { once: true });
        // Fallback removal
        setTimeout(() => overlay.remove(), 600);
      }, 80);
    }, 350);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
