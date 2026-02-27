/**
 * usePerformanceTier — detects device performance and returns a quality tier.
 * Used to gracefully degrade animations on low-end devices.
 */
import { useState, useEffect } from "react";

export type PerformanceTier = "low" | "medium" | "high";

const detectTier = (): PerformanceTier => {
  // Check for reduced motion preference first
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return "low";
  
  // Use hardware concurrency as a proxy for device capability
  const cores = navigator.hardwareConcurrency ?? 2;
  // Use device memory if available (Chrome only)
  const memory = (navigator as { deviceMemory?: number }).deviceMemory ?? 4;
  
  if (cores <= 2 || memory <= 2) return "low";
  if (cores <= 4 || memory <= 4) return "medium";
  return "high";
};

export const usePerformanceTier = (): PerformanceTier => {
  const [tier, setTier] = useState<PerformanceTier>(() => {
    // Detect synchronously so there's no flash of wrong tier on first render
    if (typeof window === "undefined") return "medium";
    return detectTier();
  });
  
  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setTier(detectTier());
    mq.addEventListener("change", handler);
    return () => mq.removeEventListener("change", handler);
  }, []);
  
  return tier;
};
