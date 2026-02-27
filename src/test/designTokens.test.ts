import { describe, it, expect } from "vitest";
import { motion, typography, spacing, qualityTiers } from "@/lib/designTokens";

describe("designTokens", () => {
  describe("motion", () => {
    it("has standard easing curves", () => {
      expect(motion.easing.standard).toHaveLength(4);
      expect(motion.easing.bounce).toHaveLength(4);
    });

    it("has duration scale in ascending order", () => {
      expect(motion.duration.instant).toBeLessThan(motion.duration.fast);
      expect(motion.duration.fast).toBeLessThan(motion.duration.normal);
      expect(motion.duration.normal).toBeLessThan(motion.duration.slow);
      expect(motion.duration.slow).toBeLessThan(motion.duration.celebration);
    });

    it("has motion variants for common animations", () => {
      expect(motion.variants.fadeIn).toBeDefined();
      expect(motion.variants.slideUp).toBeDefined();
      expect(motion.variants.bounceIn).toBeDefined();
      expect(motion.variants.pressable).toBeDefined();
      expect(motion.variants.reward).toBeDefined();
    });
  });

  describe("typography", () => {
    it("has font families for all three languages", () => {
      expect(typography.fontFamily.he).toBeTruthy();
      expect(typography.fontFamily.ar).toBeTruthy();
      expect(typography.fontFamily.en).toBeTruthy();
    });

    it("has a complete size scale", () => {
      expect(Object.keys(typography.size).length).toBeGreaterThanOrEqual(6);
    });
  });

  describe("spacing", () => {
    it("has page, section, card, and gap spacings", () => {
      expect(spacing.page).toBeDefined();
      expect(spacing.section).toBeDefined();
      expect(spacing.card).toBeDefined();
      expect(spacing.gap).toBeDefined();
    });
  });

  describe("qualityTiers", () => {
    it("has LOW, MED, HIGH tiers", () => {
      expect(qualityTiers.LOW).toBeDefined();
      expect(qualityTiers.MED).toBeDefined();
      expect(qualityTiers.HIGH).toBeDefined();
    });

    it("LOW tier disables expensive features", () => {
      expect(qualityTiers.LOW.shadows).toBe(false);
      expect(qualityTiers.LOW.blur).toBe(false);
      expect(qualityTiers.LOW.particles).toBe(false);
    });

    it("HIGH tier enables all features", () => {
      expect(qualityTiers.HIGH.shadows).toBe(true);
      expect(qualityTiers.HIGH.blur).toBe(true);
      expect(qualityTiers.HIGH.particles).toBe(true);
    });
  });
});
