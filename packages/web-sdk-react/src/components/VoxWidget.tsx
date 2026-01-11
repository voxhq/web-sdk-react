import React, { useState, useEffect } from "react";
import { useVoxContext } from "../VoxContext";
import { VoxWidgetProps, VoxStatus } from "../types";
import { BarVisualizer } from "./BarVisualizer";
import { 
  Mic, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
} from "lucide-react";

const ICON_SIZE = 24;

function Timer() {
  const [seconds, setSeconds] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSeconds(s => s + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = totalSeconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  return (
    <div className="font-mono font-medium text-sm tabular-nums opacity-90">
      {formatTime(seconds)}
    </div>
  );
}

const DEFAULT_CONFIG: Record<VoxStatus, { 
  bg: string; 
  text: string; 
  defaultLabel: string; 
  icon: React.ReactNode;
}> = {
  idle: {
    bg: "bg-slate-600",
    text: "text-slate-100",
    defaultLabel: "Ready to take notes",
    icon: <Mic size={ICON_SIZE} />
  },
  starting: {
    bg: "bg-amber-500",
    text: "text-white/90",
    defaultLabel: "Connecting...",
    icon: <Loader2 size={ICON_SIZE} className="animate-spin" />
  },
  recording: {
    bg: "bg-rose-600",
    text: "text-rose-100",
    defaultLabel: "Capturing notes",
    icon: <BarVisualizer size={ICON_SIZE} />
  },
  writing: {
    bg: "bg-indigo-600",
    text: "text-indigo-100",
    defaultLabel: "Finalizing notes...",
    icon: <Loader2 size={ICON_SIZE} className="animate-spin" />
  },
  ready: {
    bg: "bg-emerald-600",
    text: "text-emerald-100",
    defaultLabel: "Notes ready",
    icon: <CheckCircle2 size={ICON_SIZE} />
  },
  failed: {
    bg: "bg-red-700",
    text: "text-red-100",
    defaultLabel: "Connection error",
    icon: <AlertTriangle size={ICON_SIZE} />
  },
};

export function VoxWidget(props: VoxWidgetProps) {
  const { 
    labels = {}, 
    className = "",
  } = props;

  const { status } = useVoxContext();

  // Fallback to idle config if status is unknown
  const theme = DEFAULT_CONFIG[status as keyof typeof DEFAULT_CONFIG] || DEFAULT_CONFIG.idle;
  
  const displayLabel = labels[status] || theme.defaultLabel;

  return (
    <div className={`w-full font-sans ${className}`}>
      <div
        className={`
          relative overflow-hidden text-white shadow-lg
          transition-colors duration-500 ease-in-out
          ${theme.bg}
          rounded-[2rem]
        `}
      >
                <div className="grid grid-cols-[1fr_auto_1fr] items-center px-8 py-4">
          
          {/* LEFT: Icon (Left aligned) */}
          <div className="flex justify-start">
            <div className="text-white/90">
               {theme.icon}
            </div>
          </div>

          {/* CENTER: Text (Centered) */}
          <div className="flex justify-center">
            <span className="font-bold text-lg leading-tight text-center">
              {displayLabel}
            </span>
          </div>

          {/* RIGHT: Timer (Right aligned) */}
          <div className="flex justify-end min-w-[3rem]">
            {status === 'recording' && (
              <Timer />
            )}
          </div>
          
        </div>
      </div>
    </div>
  );
}