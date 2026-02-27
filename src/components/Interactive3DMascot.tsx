import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
import owlPixar from "@/assets/owl-pixar.png";

interface Interactive3DMascotProps {
  mood?: "idle" | "wave" | "celebrate" | "surprised" | "sad";
  size?: "sm" | "md" | "lg";
  onClick?: () => void;
}

const sizeMap = { sm: 130, md: 200, lg: 280 };

const isLikelyCheckerGray = (r: number, g: number, b: number) => {
  const maxDiff = Math.max(Math.abs(r - g), Math.abs(g - b), Math.abs(r - b));
  const avg = (r + g + b) / 3;
  return maxDiff < 16 && avg > 130 && avg < 245;
};

const removeCheckerBackground = (img: HTMLImageElement) => {
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d");
  if (!ctx) return null;

  ctx.drawImage(img, 0, 0);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const { data, width, height } = imageData;
  const visited = new Uint8Array(width * height);
  const queue: number[] = [];

  const pushIfBg = (x: number, y: number) => {
    if (x < 0 || y < 0 || x >= width || y >= height) return;
    const idx = y * width + x;
    if (visited[idx]) return;
    const p = idx * 4;
    const a = data[p + 3];
    if (a < 10) {
      visited[idx] = 1;
      queue.push(idx);
      return;
    }
    if (isLikelyCheckerGray(data[p], data[p + 1], data[p + 2])) {
      visited[idx] = 1;
      queue.push(idx);
    }
  };

  for (let x = 0; x < width; x++) {
    pushIfBg(x, 0);
    pushIfBg(x, height - 1);
  }
  for (let y = 0; y < height; y++) {
    pushIfBg(0, y);
    pushIfBg(width - 1, y);
  }

  while (queue.length) {
    const idx = queue.pop()!;
    const x = idx % width;
    const y = Math.floor(idx / width);
    const p = idx * 4;
    data[p + 3] = 0;

    pushIfBg(x + 1, y);
    pushIfBg(x - 1, y);
    pushIfBg(x, y + 1);
    pushIfBg(x, y - 1);
  }

  ctx.putImageData(imageData, 0, 0);
  return canvas.toDataURL("image/png");
};

const Interactive3DMascot = ({ mood = "idle", size = "md", onClick }: Interactive3DMascotProps) => {
  const dim = sizeMap[size];
  const [cleanSrc, setCleanSrc] = useState(owlPixar);

  useEffect(() => {
    const img = new Image();
    img.src = owlPixar;
    img.onload = () => {
      const cleaned = removeCheckerBackground(img);
      if (cleaned) setCleanSrc(cleaned);
    };
  }, []);

  const animateByMood = useMemo(
    () =>
      mood === "wave"
        ? { y: [0, -8, 0, -6, 0], rotate: [0, -4, 4, -3, 0], scale: [1, 1.02, 1, 1.02, 1] }
        : mood === "celebrate"
        ? {
            y: [0, -12, 0, -10, 0],
            rotate: [0, -6, 6, -4, 0],
            scale: [1, 1.05, 1, 1.03, 1],
            filter: [
              "drop-shadow(0 10px 28px hsl(var(--foreground) / 0.22))",
              "drop-shadow(0 16px 36px hsl(var(--sunshine) / 0.35))",
              "drop-shadow(0 10px 28px hsl(var(--foreground) / 0.22))",
            ],
          }
        : mood === "surprised"
        ? { y: [0, -5, 0], scale: [1, 1.06, 1], rotate: [0, 1.5, -1.5, 0] }
        : mood === "sad"
        ? { y: [0, 2, 0], rotate: [0, -1, 0], scale: [1, 0.985, 1] }
        : { y: [0, -5, 0], rotate: [0, -1.5, 1.5, 0], scale: [1, 1.015, 1] },
    [mood],
  );

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
        src={cleanSrc}
        alt="Pixar style owl mascot"
        draggable={false}
        className="w-full h-full object-contain select-none pointer-events-none"
        style={{ filter: "drop-shadow(0 10px 28px hsl(var(--foreground) / 0.22))" }}
        animate={animateByMood}
        transition={{
          duration: mood === "idle" ? 3.2 : mood === "wave" ? 1.6 : mood === "celebrate" ? 1.2 : mood === "sad" ? 3.8 : 0.95,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </motion.button>
  );
};

export default Interactive3DMascot;
