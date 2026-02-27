/**
 * Design System Tokens — typed exports for use in three.js materials and JS logic.
 *
 * Colours here must stay in sync with the CSS custom properties in index.css /
 * tailwind.config.ts.  When updating a colour, update BOTH places.
 */

/** Primary brand palette */
export const colors = {
  primary: "#f5920a",       // warm orange — brand CTA
  primaryFg: "#ffffff",
  secondary: "#8b5cf6",     // violet
  accent: "#ec4899",        // pink
  sunshine: "#fbbf24",      // yellow / star colour
  grass: "#22c55e",         // green / correct
  sky: "#38bdf8",           // blue
  lavender: "#a78bfa",      // soft purple
  candy: "#f43f5e",         // red-pink
  chalk: "#f5f0e8",         // off-white chalk
  board: "#1f3a2e",         // chalkboard dark green

  // Semantic
  success: "#22c55e",
  error: "#ef4444",
  warning: "#f59e0b",
  info: "#38bdf8",

  // Neutrals
  background: "#fffbf0",
  surface: "#ffffff",
  border: "#e5e7eb",
  mutedFg: "#9ca3af",
  foreground: "#111827",
} as const;

/** Spacing scale (px) — matches Tailwind default */
export const spacing = {
  xs: 4,
  sm: 8,
  md: 16,
  lg: 24,
  xl: 32,
  "2xl": 48,
  "3xl": 64,
} as const;

/** Motion presets — use with Framer Motion `transition` prop */
export const motion = {
  spring: { type: "spring" as const, stiffness: 200, damping: 18 },
  springBouncy: { type: "spring" as const, stiffness: 350, damping: 14 },
  ease: { duration: 0.3, ease: "easeOut" as const },
  slow: { duration: 0.6, ease: "easeInOut" as const },
} as const;

/** Three.js material hex colours derived from design tokens */
export const threeMaterials = {
  owlBody: "#c8a97e",       // warm tan
  owlHead: "#d4b896",
  owlEye: "#2d2d2d",
  owlIris: "#5b4fcf",       // violet iris
  owlBeak: "#e07b39",
  owlWing: "#a07850",
  owlAccent: colors.primary,
  ambientLight: "#ffffff",
  pointLight: "#fffbf0",
} as const;

export type ColorToken = keyof typeof colors;
export type ThreeMaterialToken = keyof typeof threeMaterials;
