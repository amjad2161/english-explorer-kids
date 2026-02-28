import { useState, useEffect, useCallback, useRef, memo } from "react";
import { useQualityStore } from "./qualityTier";
import { useSceneDirector } from "./SceneDirector";

/**
 * PerformanceHUD — dev-only overlay showing FPS, memory, draw calls, quality tier.
 * Toggle with Ctrl+Shift+P. Only renders in development.
 */
const PerformanceHUD = memo(() => {
  const [visible, setVisible] = useState(false);
  const [stats, setStats] = useState({
    fps: 0,
    memory: 0,
    tier: "med" as string,
    stage: "forest" as string,
    drawCalls: 0,
    triangles: 0,
  });

  const framesRef = useRef(0);
  const lastTimeRef = useRef(performance.now());
  const rafRef = useRef<number>(0);

  const tier = useQualityStore((s) => s.tier);
  const stage = useSceneDirector((s) => s.activeStage);

  // Toggle with Ctrl+Shift+P
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.ctrlKey && e.shiftKey && e.key === "P") {
        e.preventDefault();
        setVisible((v) => !v);
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, []);

  // FPS counter
  const tick = useCallback(() => {
    framesRef.current++;
    const now = performance.now();
    const elapsed = now - lastTimeRef.current;

    if (elapsed >= 1000) {
      const fps = Math.round((framesRef.current * 1000) / elapsed);
      const memory = (performance as any).memory
        ? Math.round((performance as any).memory.usedJSHeapSize / 1048576)
        : 0;

      // Try reading WebGL info from canvas
      let drawCalls = 0;
      let triangles = 0;
      const canvas = document.querySelector("canvas");
      if (canvas) {
        const gl = canvas.getContext("webgl2") || canvas.getContext("webgl");
        if (gl) {
          const ext = gl.getExtension("WEBGL_debug_renderer_info");
          // Draw calls/triangles not directly available without instrumentation
          // Use approximate from renderer info if available
        }
      }

      setStats({ fps, memory, tier, stage, drawCalls, triangles });
      framesRef.current = 0;
      lastTimeRef.current = now;
    }

    rafRef.current = requestAnimationFrame(tick);
  }, [tier, stage]);

  useEffect(() => {
    if (visible) {
      rafRef.current = requestAnimationFrame(tick);
      return () => cancelAnimationFrame(rafRef.current);
    }
  }, [visible, tick]);

  if (!visible) return null;

  const fpsColor = stats.fps >= 55 ? "#4caf50" : stats.fps >= 30 ? "#ff9800" : "#f44336";

  return (
    <div
      style={{
        position: "fixed",
        top: 8,
        left: 8,
        zIndex: 99999,
        background: "rgba(0,0,0,0.85)",
        color: "#e0e0e0",
        fontFamily: "monospace",
        fontSize: 11,
        padding: "8px 12px",
        borderRadius: 8,
        pointerEvents: "none",
        lineHeight: 1.6,
        minWidth: 160,
        border: "1px solid rgba(255,255,255,0.1)",
        backdropFilter: "blur(8px)",
      }}
    >
      <div style={{ fontWeight: "bold", marginBottom: 4, color: "#90caf9" }}>
        🎬 Cinematic Engine
      </div>
      <div>
        FPS:{" "}
        <span style={{ color: fpsColor, fontWeight: "bold" }}>{stats.fps}</span>
      </div>
      {stats.memory > 0 && <div>Memory: {stats.memory} MB</div>}
      <div>
        Quality:{" "}
        <span style={{ color: "#ffd54f", textTransform: "uppercase" }}>
          {stats.tier}
        </span>
      </div>
      <div>
        Stage:{" "}
        <span style={{ color: "#a5d6a7" }}>{stats.stage}</span>
      </div>
      <div style={{ marginTop: 4, fontSize: 9, color: "#757575" }}>
        Ctrl+Shift+P to toggle
      </div>
    </div>
  );
});

PerformanceHUD.displayName = "PerformanceHUD";

export default PerformanceHUD;
