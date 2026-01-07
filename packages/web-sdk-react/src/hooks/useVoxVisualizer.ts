import { useState, useEffect, useRef } from "react";
import { useVox } from "./useVox";

function clamp01(x: number) {
  return Math.max(0, Math.min(1, x));
}

/**
 * useVoxVisualizer
 * * Hook to animate the visualizer bars based on the recording status.
 * * Uses a sine wave + jitter to simulate audio input, and a decay to simulate silence.
 * * TODO: Connect to the actual audio input.
 * @param count - The number of bars to render.
 * @param intervalMs - The interval in milliseconds between updates.
 * @returns An array of numbers representing the height of each bar.
 */
export function useVoxVisualizer(count: number = 5, intervalMs: number = 80) {
  const { isRecording } = useVox();
  
  const [bars, setBars] = useState<number[]>(() => Array.from({ length: count }, () => 0));
  const phaseRef = useRef(0);

  // Resize bars array if count changes
  useEffect(() => {
    setBars((prev) => {
        if (prev.length === count) return prev;
        return Array.from({ length: count }, (_, i) => prev[i] ?? 0);
    });
  }, [count]);

  // The Animation Loop
  useEffect(() => {
    let animationFrameId: number;
    let lastUpdate = 0;
    
    const loop = (timestamp: number) => {
      // Throttle to intervalMs
      if (timestamp - lastUpdate >= intervalMs) {
        lastUpdate = timestamp;
        
        setBars((prev) => {
          const next = new Array<number>(count);
          
          if (isRecording) {
            phaseRef.current += 0.35;
            for (let i = 0; i < count; i++) {
              // Sine wave + Jitter
              const wave = Math.sin(phaseRef.current + i * 0.7) * 0.5 + 0.5;
              const jitter = (Math.random() - 0.5) * 0.15;
              next[i] = clamp01(wave + jitter);
            }
          } else {
            // Decay
            for (let i = 0; i < count; i++) {
              const p = prev[i] ?? 0;
              next[i] = p < 0.01 ? 0 : p * 0.85; 
            }
          }
          return next;
        });
      }

      animationFrameId = requestAnimationFrame(loop);
    };

    animationFrameId = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [isRecording, count, intervalMs]);

  return bars;
}