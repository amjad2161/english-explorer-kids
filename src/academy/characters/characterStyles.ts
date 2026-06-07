import type { CharacterId } from "../types";

export interface CharacterStyle {
  primary: string;
  secondary: string;
  accent: string;
  scale: number;
  kind: "human" | "robot" | "owl" | "creature";
}

export const characterStyles: Record<CharacterId, CharacterStyle> = {
  adam: { primary: "#4a90d9", secondary: "#f5f5f5", accent: "#e74c3c", scale: 1, kind: "human" },
  sara: { primary: "#e84393", secondary: "#ffeaa7", accent: "#6c5ce7", scale: 0.95, kind: "human" },
  cosmo: { primary: "#6c5ce7", secondary: "#a29bfe", accent: "#fdcb6e", scale: 1.1, kind: "creature" },
  pixel: { primary: "#00cec9", secondary: "#2d3436", accent: "#ffeaa7", scale: 0.85, kind: "robot" },
  leo: { primary: "#f39c12", secondary: "#d35400", accent: "#27ae60", scale: 1.05, kind: "creature" },
  hadar: { primary: "#ff9f43", secondary: "#fff3cd", accent: "#2ed573", scale: 1, kind: "human" },
  oz: { primary: "#636e72", secondary: "#b2bec3", accent: "#74b9ff", scale: 0.9, kind: "human" },
  silverOwl: { primary: "#dfe6e9", secondary: "#b2bec3", accent: "#fdcb6e", scale: 1.2, kind: "owl" },
  blackOwl: { primary: "#2d3436", secondary: "#636e72", accent: "#a29bfe", scale: 1.15, kind: "owl" },
  desertChild: { primary: "#e17055", secondary: "#fab1a0", accent: "#ffeaa7", scale: 0.88, kind: "human" },
  maia: { primary: "#00b894", secondary: "#55efc4", accent: "#fd79a8", scale: 0.92, kind: "human" },
  amal: { primary: "#a29bfe", secondary: "#dfe6e9", accent: "#fd79a8", scale: 0.98, kind: "human" },
};
