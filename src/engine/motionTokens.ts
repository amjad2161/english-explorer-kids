/**
 * Motion tokens — film-grade controlled animation constants.
 * All interactive motion in the app should reference these tokens.
 */

export const MOTION = {
  // Durations (seconds)
  duration: {
    instant: 0.1,
    fast: 0.2,
    normal: 0.35,
    slow: 0.6,
    cinematic: 1.0,
    stageTransition: 0.8,
  },

  // Easing curves
  ease: {
    // Standard interactions
    out: [0.25, 0.46, 0.45, 0.94] as [number, number, number, number],
    in: [0.55, 0.06, 0.68, 0.19] as [number, number, number, number],
    inOut: [0.42, 0, 0.58, 1] as [number, number, number, number],
    // Bouncy — for rewards, celebrations
    bounce: [0.34, 1.56, 0.64, 1] as [number, number, number, number],
    // Cinematic — smooth camera moves
    cinematic: [0.22, 0.61, 0.36, 1] as [number, number, number, number],
  },

  // Spring configs
  spring: {
    gentle: { stiffness: 120, damping: 14 },
    snappy: { stiffness: 300, damping: 25 },
    bouncy: { stiffness: 400, damping: 10 },
    heavy: { stiffness: 80, damping: 20 },
  },

  // Page transition presets
  pageTransition: {
    initial: { opacity: 0, y: 16, scale: 0.98 },
    animate: { opacity: 1, y: 0, scale: 1 },
    exit: { opacity: 0, y: -10, scale: 0.99 },
    transition: { duration: 0.2, ease: [0.22, 0.61, 0.36, 1] as [number, number, number, number] },
  },

  // Stagger presets
  stagger: {
    fast: 0.04,
    normal: 0.07,
    slow: 0.12,
  },
} as const;

/**
 * Scene motion budget — max concurrent animations per quality tier
 */
export const MOTION_BUDGET = {
  low: { maxConcurrent: 4, maxParticles: 20 },
  med: { maxConcurrent: 10, maxParticles: 60 },
  high: { maxConcurrent: 20, maxParticles: 120 },
} as const;
