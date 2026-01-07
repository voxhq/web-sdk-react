import React from "react";
import { useVoxVisualizer } from "../hooks/useVoxVisualizer";
import { cn } from "../cn";

export interface BarVisualizerProps {
  /** Number of bars to render */
  bars?: number;
  /** Width of the visualizer in pixels */
  size?: number;
  /** Gap between bars in pixels */
  gap?: number;
  /** Bar color (CSS color or Tailwind class) */
  className?: string;
}

/**
 * Animated bar visualizer that responds to recording state.
 * Uses the useVoxVisualizer hook for animation data.
 */
export function BarVisualizer({
  bars: barCount = 5,
  size = 24,
  gap = 2,
  className,
}: BarVisualizerProps) {
  const bars = useVoxVisualizer(barCount);

  const barWidth = (size - gap * (barCount - 1)) / barCount;

  return (
    <div
      className={cn("flex items-center justify-center", className)}
      style={{ width: size, height: size, gap }}
    >
      {bars.map((height, i) => (
        <div
          key={i}
          className="bg-current rounded-full transition-[height] duration-75"
          style={{
            width: barWidth,
            height: Math.max(4, height * size), // min 4px height
          }}
        />
      ))}
    </div>
  );
}

