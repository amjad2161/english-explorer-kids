import { motion } from "framer-motion";
import { useEffect, useMemo, useState, useRef } from "react";
import owlPixar from "@/assets/owl-pixar.png";

interface Interactive3DMascotProps {
  mood?: "idle" | "wave" | "celebrate" | "surprised" | "sad";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const sizeMap = { sm: 130, md: 200, lg: 280 };

/* ── Pixel classification ── */
const isLikelyCheckerGray = (r: number, g: number, b: number) => {
  const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
  const avg = (r + g + b) / 3;
  return maxDiff < 18 && avg > 120 && avg < 250;
};

const isNearWhite = (r: number, g: number, b: number) => {
  return r > 230 && g > 230 && b > 230;
};

/* ── Flood-fill background removal + edge feathering ── */
const cleanOwlImage = (img: HTMLImageElement): string | null => {
  const canvas = document.createElement("canvas");
  const w = img.naturalWidth;
  const h = img.naturalHeight;
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, w, h);
  const { data } = imageData;
  const total = w * h;
  const visited = new Uint8Array(total);
  const isBg = new Uint8Array(total);
  const queue: number[] = [];

  // Seed from edges
  const tryPush = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const idx = y * w + x;
    if (visited[idx]) return;
    const p = idx * 4;
    const a = data[p + 3];
    if (a < 10) {
      visited[idx] = 1;
      isBg[idx] = 1;
      queue.push(idx);
      return;
    }
    const r = data[p], g = data[p + 1], b = data[p + 2];
    if (isLikelyCheckerGray(r, g, b) || isNearWhite(r, g, b)) {
      visited[idx] = 1;
      isBg[idx] = 1;
      queue.push(idx);
    }
  };

  for (let x = 0; x < w; x++) { tryPush(x, 0); tryPush(x, h - 1); }
  for (let y = 0; y < h; y++) { tryPush(0, y); tryPush(w - 1, y); }

  while (queue.length) {
    const idx = queue.pop()!;
    const x = idx % w;
    const y = (idx - x) / w;
    data[idx * 4 + 3] = 0; // fully transparent
    tryPush(x + 1, y);
    tryPush(x - 1, y);
    tryPush(x, y + 1);
    tryPush(x, y - 1);
  }

  // Edge feathering: soften alpha on pixels adjacent to removed background
  // This creates a smooth anti-aliased edge instead of harsh cutout
  const alphaClone = new Uint8Array(total);
  for (let i = 0; i < total; i++) alphaClone[i] = data[i * 4 + 3];

  for (let y = 1; y < h - 1; y++) {
    for (let x = 1; x < w - 1; x++) {
      const idx = y * w + x;
      if (alphaClone[idx] === 0) continue; // already transparent

      // Count transparent neighbors (including diagonals)
      let bgNeighbors = 0;
      const neighbors = [
        (y - 1) * w + (x - 1), (y - 1) * w + x, (y - 1) * w + (x + 1),
        y * w + (x - 1),                          y * w + (x + 1),
        (y + 1) * w + (x - 1), (y + 1) * w + x, (y + 1) * w + (x + 1),
      ];
      for (const n of neighbors) {
        if (isBg[n]) bgNeighbors++;
      }

      if (bgNeighbors > 0) {
        // Feather: reduce alpha based on how many bg neighbors
        const feather = Math.max(0, 1 - bgNeighbors / 5);
        data[idx * 4 + 3] = Math.round(alphaClone[idx] * feather);
      }
    }
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
};

/* ── Cached clean image (shared across instances) ── */
let cachedCleanSrc: string | null = null;
let cleaningPromise: Promise<string> | null = null;

const getCleanSrc = (): Promise<string> => {
  if (cachedCleanSrc) return Promise.resolve(cachedCleanSrc);
  if (cleaningPromise) return cleaningPromise;

  cleaningPromise = new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.src = owlPixar;
    img.onload = () => {
      const cleaned = cleanOwlImage(img);
      cachedCleanSrc = cleaned || owlPixar;
      resolve(cachedCleanSrc);
    };
    img.onerror = () => {
      cachedCleanSrc = owlPixar;
      resolve(owlPixar);
    };
  });

  return cleaningPromise;
};

const Interactive3DMascot = ({ mood = "idle", size = "md", onClick }: Interactive3DMascotProps) => {
  const dim = sizeMap[size];
  const [src, setSrc] = useState(owlPixar);

  useEffect(() => {
    getCleanSrc().then(setSrc);
  }, []);

  const animateByMood = useMemo(
    () =>
      mood === "wave"
        ? { y: [0, -8, 0, -6, 0], rotate: [0, -4, 4, -3, 0], scale: [1, 1.02, 1, 1.02, 1] }
        : mood === "celebrate"
        ? { y: [0, -12, 0, -10, 0], rotate: [0, -6, 6, -4, 0], scale: [1, 1.05, 1, 1.03, 1] }
        : mood === "surprised"
        ? { y: [0, -5, 0], scale: [1, 1.06, 1], rotate: [0, 1.5, -1.5, 0] }
        : mood === "sad"
        ? { y: [0, 2, 0], rotate: [0, -1, 0], scale: [1, 0.985, 1] }
        : { y: [0, -5, 0], rotate: [0, -1.5, 1.5, 0], scale: [1, 1.015, 1] },
    [mood],
  );

  // Mood-specific drop-shadow for cinematic depth
  const shadowByMood =
    mood === "celebrate"
      ? "drop-shadow(0 8px 20px hsl(var(--sunshine) / 0.3)) drop-shadow(0 2px 6px hsl(var(--foreground) / 0.15))"
      : mood === "wave"
      ? "drop-shadow(0 6px 18px hsl(var(--primary) / 0.2)) drop-shadow(0 2px 6px hsl(var(--foreground) / 0.12))"
      : mood === "sad"
      ? "drop-shadow(0 4px 12px hsl(var(--foreground) / 0.25))"
      : "drop-shadow(0 6px 16px hsl(var(--foreground) / 0.18)) drop-shadow(0 2px 4px hsl(var(--foreground) / 0.08))";

  return (
    <motion.button
      type="button"
      onClick={onClick}
      className="relative inline-flex items-center justify-center p-0 border-0 bg-transparent"
      style={{ width: dim, height: dim }}
      whileTap={{ scale: 0.96 }}
      aria-label="Interactive Owl Mascot"
    >
      <motion.img
        src={src}
        alt="Pixar style owl mascot"
        draggable={false}
        className="w-full h-full object-contain select-none pointer-events-none"
        style={{ filter: shadowByMood }}
        animate={animateByMood}
        transition={{
          duration:
            mood === "idle" ? 3.2
            : mood === "wave" ? 1.6
            : mood === "celebrate" ? 1.2
            : mood === "sad" ? 3.8
            : 0.95,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.button>
  );
};

export default Interactive3DMascot;
