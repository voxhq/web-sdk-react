import { useEffect, useMemo, useRef } from "react";
import { useVox } from "../hooks/useVox";

interface BarVisualizerProps {
  /** Sets both width and height.
   * @default 24
   */
  size?: number | string;
  /** Number of bars to render */
  bands?: number;
  /** Color class for the bars (default: bg-white) */
  colorClass?: string;
  className?: string;
}

function mouthWeight(i: number, n: number) {
  const x = n <= 1 ? 0 : (i / (n - 1)) * 2 - 1; // -1..+1
  const w = Math.exp(-(x * x) / 0.25);
  return 0.35 + 0.65 * w;
}

export function BarVisualizer({
  size = 24,
  bands = 5,
  colorClass = "bg-white",
  className = "",
}: BarVisualizerProps) {
  const { getAnalyzerBandLevels } = useVox();
  const containerRef = useRef<HTMLDivElement>(null);

  const weights = useMemo(
    () => Array.from({ length: bands }, (_, i) => mouthWeight(i, bands)),
    [bands]
  );

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const bars = container.children as HTMLCollectionOf<HTMLElement>;
    let frameId = 0;
    let alive = true;

    const loop = () => {
      if (!alive) return;

      const levels = getAnalyzerBandLevels(bands);
      const n = Math.min(levels.length, bars.length);

      for (let i = 0; i < n; i++) {
        const v = levels[i] * weights[i];
        bars[i].style.setProperty("--level", String(v));
      }

      frameId = requestAnimationFrame(loop);
    };

    frameId = requestAnimationFrame(loop);

    return () => {
      alive = false;
      cancelAnimationFrame(frameId);
    };
  }, [getAnalyzerBandLevels, bands, weights]);

  return (
    <div
      ref={containerRef}
      className={`flex items-center justify-center gap-[2px] ${className}`}
      style={{ width: size, height: size }}
    >
      {Array.from({ length: bands }).map((_, i) => (
        <div key={i} className="flex-1 h-full min-w-[2px] relative">
          <div
            className={`absolute left-0 right-0 top-1/2 -translate-y-1/2 rounded-full ${colorClass}`}
            style={{
              // base thickness + dynamic growth (centered vertically)
              height: "calc(20% + (var(--level, 0) * 80%))",
              transition: "height 80ms linear",
              willChange: "height",
            }}
          />
        </div>
      ))}
    </div>
  );
}