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
    const goingDark = nextTheme === "dark";

    // Create overlay
    const overlay = document.createElement("div");
    overlay.style.cssText = `
      position: fixed;
      inset: 0;
      z-index: 99999;
      pointer-events: none;
      background: ${goingDark
        ? "radial-gradient(circle at 50% 0%, hsl(160 20% 8% / 0.95), hsl(160 25% 6% / 0.98))"
        : "radial-gradient(circle at 50% 0%, hsl(45 80% 97% / 0.95), hsl(220 16% 96% / 0.98))"
      };
      opacity: 0;
      transition: opacity 0.6s cubic-bezier(0.4, 0, 0.2, 1);
      overflow: hidden;
    `;

    // Create celestial body (sun setting or moon rising)
    const celestial = document.createElement("div");
    const size = Math.min(window.innerWidth * 0.12, 80);
    if (goingDark) {
      // Sun setting down + moon rising up
      celestial.innerHTML = `
        <div style="position:absolute;top:20%;left:50%;transform:translateX(-50%);font-size:${size}px;line-height:1;filter:drop-shadow(0 0 20px hsl(45 100% 55% / 0.6));transition:all 1s cubic-bezier(0.4,0,0.2,1);opacity:1;" class="theme-sun">☀️</div>
        <div style="position:absolute;bottom:-${size}px;left:50%;transform:translateX(-50%);font-size:${size * 0.85}px;line-height:1;filter:drop-shadow(0 0 16px hsl(220 60% 70% / 0.5));transition:all 1s cubic-bezier(0.25,0.46,0.45,0.94);opacity:0;" class="theme-moon">🌙</div>
      `;
    } else {
      // Moon setting down + sun rising up
      celestial.innerHTML = `
        <div style="position:absolute;top:20%;left:50%;transform:translateX(-50%);font-size:${size * 0.85}px;line-height:1;filter:drop-shadow(0 0 16px hsl(220 60% 70% / 0.5));transition:all 1s cubic-bezier(0.4,0,0.2,1);opacity:1;" class="theme-moon">🌙</div>
        <div style="position:absolute;bottom:-${size}px;left:50%;transform:translateX(-50%);font-size:${size}px;line-height:1;filter:drop-shadow(0 0 24px hsl(45 100% 55% / 0.7));transition:all 1s cubic-bezier(0.25,0.46,0.45,0.94);opacity:0;" class="theme-sun">☀️</div>
      `;
    }
    celestial.style.cssText = "position:absolute;inset:0;pointer-events:none;";
    overlay.appendChild(celestial);

    // Add tiny stars for dark mode
    if (goingDark) {
      for (let i = 0; i < 20; i++) {
        const star = document.createElement("div");
        star.textContent = "✦";
        star.style.cssText = `
          position:absolute;
          left:${5 + Math.random() * 90}%;
          top:${5 + Math.random() * 60}%;
          font-size:${4 + Math.random() * 8}px;
          color:hsl(45 80% 85% / ${0.15 + Math.random() * 0.4});
          opacity:0;
          transition:opacity ${0.3 + Math.random() * 0.5}s ease ${0.2 + Math.random() * 0.6}s;
          pointer-events:none;
        `;
        overlay.appendChild(star);
      }
    }

    document.body.appendChild(overlay);

    // Animate
    requestAnimationFrame(() => {
      overlay.style.opacity = "1";

      // Animate celestial bodies after a brief moment
      setTimeout(() => {
        const sun = overlay.querySelector(".theme-sun") as HTMLElement;
        const moon = overlay.querySelector(".theme-moon") as HTMLElement;
        if (goingDark && sun && moon) {
          sun.style.top = "110%";
          sun.style.opacity = "0.3";
          moon.style.bottom = "35%";
          moon.style.opacity = "1";
        } else if (!goingDark && sun && moon) {
          moon.style.top = "110%";
          moon.style.opacity = "0.3";
          sun.style.bottom = "30%";
          sun.style.opacity = "1";
        }
        // Show stars
        overlay.querySelectorAll("div[style*='font-size']").forEach(el => {
          if (el.textContent === "✦") (el as HTMLElement).style.opacity = "1";
        });
      }, 80);
    });

    // Switch theme at peak
    setTimeout(() => {
      setTheme(nextTheme);

      setTimeout(() => {
        overlay.style.opacity = "0";
        overlay.addEventListener("transitionend", () => overlay.remove(), { once: true });
        setTimeout(() => overlay.remove(), 800);
      }, 200);
    }, 500);
  }, [theme]);

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
