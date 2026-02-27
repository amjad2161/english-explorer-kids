/**
 * Design System Tokens
 * Motion, spacing, and typography tokens for consistent UI across the app.
 * Supports trilingual rendering (Hebrew RTL, Arabic RTL, English LTR).
 */

export const motion = {
  // Easing curves
  easing: {
    standard: [0.4, 0, 0.2, 1] as const,
    enter: [0, 0, 0.2, 1] as const,
    exit: [0.4, 0, 1, 1] as const,
    bounce: [0.34, 1.56, 0.64, 1] as const,
    spring: { type: "spring" as const, stiffness: 300, damping: 24 },
  },
  // Duration scale (ms)
  duration: {
    instant: 100,
    fast: 200,
    normal: 300,
    slow: 500,
    celebration: 800,
    pageTransition: 400,
  },
  // Predefined motion variants for framer-motion
  variants: {
    fadeIn: {
      initial: { opacity: 0 },
      animate: { opacity: 1 },
      exit: { opacity: 0 },
    },
    slideUp: {
      initial: { opacity: 0, y: 20 },
      animate: { opacity: 1, y: 0 },
      exit: { opacity: 0, y: -10 },
    },
    scaleIn: {
      initial: { opacity: 0, scale: 0.9 },
      animate: { opacity: 1, scale: 1 },
      exit: { opacity: 0, scale: 0.95 },
    },
    bounceIn: {
      initial: { opacity: 0, scale: 0.3 },
      animate: {
        opacity: 1,
        scale: 1,
        transition: { type: "spring", stiffness: 300, damping: 20 },
      },
    },
    pressable: {
      whileHover: { scale: 1.04 },
      whileTap: { scale: 0.96 },
    },
    reward: {
      initial: { scale: 0, rotate: -180 },
      animate: {
        scale: 1,
        rotate: 0,
        transition: { type: "spring", stiffness: 200, damping: 15 },
      },
    },
  },
} as const;

export const typography = {
  // Font families per language
  fontFamily: {
    display: "'Baloo 2', cursive",
    body: "'Nunito', sans-serif",
    he: "'Rubik', 'Nunito', sans-serif",
    ar: "'Noto Sans Arabic', 'Nunito', sans-serif",
    en: "'Nunito', sans-serif",
  },
  // Scale
  size: {
    xs: "0.75rem",
    sm: "0.875rem",
    base: "1rem",
    lg: "1.125rem",
    xl: "1.25rem",
    "2xl": "1.5rem",
    "3xl": "1.875rem",
    "4xl": "2.25rem",
  },
} as const;

export const spacing = {
  page: { x: "1rem", y: "1.5rem" },
  section: "2rem",
  card: { x: "1.25rem", y: "1rem" },
  gap: { sm: "0.5rem", md: "1rem", lg: "1.5rem", xl: "2rem" },
} as const;

export const qualityTiers = {
  LOW: { shadows: false, blur: false, particles: false, animations: "reduced" },
  MED: { shadows: true, blur: false, particles: true, animations: "standard" },
  HIGH: { shadows: true, blur: true, particles: true, animations: "full" },
} as const;

export type QualityTier = keyof typeof qualityTiers;
