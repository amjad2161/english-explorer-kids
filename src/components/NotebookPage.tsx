import { useTheme } from "@/lib/theme";

/**
 * NotebookPage — A full-page notebook/chalkboard container.
 * All page content should sit inside this wrapper so it appears
 * "written on" the notebook paper (light) or chalkboard (dark).
 *
 * Provides: ruled lines, red margin, spiral binding (light)
 *           or wooden frame + chalk dust (dark).
 */

const NotebookPage = ({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className="relative min-h-screen flex justify-center px-2 sm:px-4 md:px-6 py-4 sm:py-6">
      {/* ── The notebook sheet ── */}
      <div
        className={`relative w-full max-w-4xl rounded-2xl sm:rounded-3xl overflow-hidden ${className}`}
        style={{
          background: isDark
            ? "linear-gradient(175deg, hsl(160 22% 16%) 0%, hsl(158 20% 19%) 50%, hsl(155 18% 17%) 100%)"
            : "linear-gradient(175deg, hsl(45 40% 98%) 0%, hsl(40 30% 96%) 50%, hsl(38 28% 95%) 100%)",
          boxShadow: isDark
            ? "0 8px 40px hsl(0 0% 0% / 0.4), 0 2px 8px hsl(0 0% 0% / 0.2), inset 0 1px 0 hsl(160 20% 24% / 0.5)"
            : "0 4px 24px hsl(0 0% 0% / 0.08), 0 8px 48px hsl(0 0% 0% / 0.06), 0 1px 3px hsl(0 0% 0% / 0.04)",
          border: isDark
            ? "3px solid hsl(30 35% 28%)"
            : "1px solid hsl(220 13% 88%)",
        }}
      >
        {/* ═══ LIGHT: Notebook details ═══ */}
        {!isDark && (
          <>
            {/* Ruled lines */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 31px, hsl(210 60% 75% / 0.12) 31px, hsl(210 60% 75% / 0.12) 32px)",
                backgroundSize: "100% 32px",
                backgroundPositionY: "16px",
              }}
            />

            {/* Red margin line */}
            <div
              className="absolute top-0 bottom-0 pointer-events-none"
              style={{
                left: "3rem",
                width: "2px",
                background: "hsl(0 65% 60% / 0.15)",
              }}
            />

            {/* Spiral binding holes */}
            <div className="absolute top-0 bottom-0 left-1.5 sm:left-2 flex flex-col items-center gap-[30px] pt-6 pointer-events-none z-20">
              {Array.from({ length: 30 }).map((_, i) => (
                <div
                  key={i}
                  className="w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 shrink-0"
                  style={{
                    borderColor: "hsl(var(--muted-foreground) / 0.18)",
                    background: "hsl(var(--background) / 0.6)",
                  }}
                />
              ))}
            </div>

            {/* Top edge fold */}
            <div
              className="absolute top-0 left-0 right-0 h-3 pointer-events-none"
              style={{
                background: "linear-gradient(180deg, hsl(35 25% 90% / 0.5) 0%, transparent 100%)",
              }}
            />
          </>
        )}

        {/* ═══ DARK: Chalkboard details ═══ */}
        {isDark && (
          <>
            {/* Chalk dust texture */}
            <div
              className="absolute inset-0 pointer-events-none opacity-[0.04]"
              style={{
                backgroundImage:
                  "radial-gradient(circle, hsl(45 30% 85%) 0.8px, transparent 0.8px)",
                backgroundSize: "16px 16px",
              }}
            />

            {/* Subtle chalk grid lines */}
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage:
                  "repeating-linear-gradient(0deg, transparent, transparent 31px, hsl(45 20% 80% / 0.03) 31px, hsl(45 20% 80% / 0.03) 32px)",
                backgroundSize: "100% 32px",
                backgroundPositionY: "16px",
              }}
            />

            {/* Wooden frame edges */}
            <div className="absolute inset-0 pointer-events-none rounded-2xl sm:rounded-3xl" style={{
              boxShadow: "inset 0 0 0 4px hsl(30 35% 25% / 0.6), inset 0 0 20px hsl(0 0% 0% / 0.15)",
            }} />

            {/* Chalk tray at bottom */}
            <div
              className="absolute bottom-0 left-3 right-3 h-5 pointer-events-none z-20"
              style={{
                background: "linear-gradient(0deg, hsl(30 35% 24%) 0%, hsl(30 30% 22%) 60%, transparent 100%)",
                borderRadius: "3px 3px 0 0",
              }}
            >
              <div className="absolute bottom-0.5 left-[12%] w-6 h-1.5 rounded-full" style={{ background: "hsl(0 0% 90% / 0.3)" }} />
              <div className="absolute bottom-1 left-[30%] w-5 h-1 rounded-full" style={{ background: "hsl(45 90% 65% / 0.3)" }} />
              <div className="absolute bottom-0.5 left-[65%] w-6 h-1.5 rounded-full" style={{ background: "hsl(210 70% 65% / 0.25)" }} />
            </div>

            {/* Vignette */}
            <div
              className="absolute inset-0 pointer-events-none rounded-2xl sm:rounded-3xl"
              style={{
                background: "radial-gradient(ellipse 80% 70% at 50% 50%, transparent 40%, hsl(160 25% 8% / 0.3) 100%)",
              }}
            />
          </>
        )}

        {/* ── Content area ── */}
        <div
          className="relative z-10"
          style={{
            paddingLeft: isDark ? "1.25rem" : "3.75rem",
            paddingRight: "1.25rem",
            paddingTop: "1.5rem",
            paddingBottom: isDark ? "2rem" : "1.5rem",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

export default NotebookPage;
