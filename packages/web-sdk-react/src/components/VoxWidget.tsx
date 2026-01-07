import React, { useState } from "react";
import { useVoxContext } from "../VoxContext";
import { VoxWidgetProps, VoxStatus } from "../types";
import { BarVisualizer } from "./BarVisualizer";

import { 
  Mic, 
  Loader2, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronDown 
} from "lucide-react";

// Helper for consistent icon sizing
// Lucide icons accept a `size` prop (default 24px) and `className`
const ICON_SIZE = 24;

const DEFAULT_CONFIG: Record<VoxStatus, { 
  bg: string; 
  text: string; 
  btnText: string; 
  btnHover: string; 
  defaultLabel: string; 

  icon: React.ReactNode;
}> = {
  idle: {
    bg: "bg-slate-600",
    text: "text-slate-100",
    btnText: "text-slate-600",
    btnHover: "hover:bg-slate-100",
    defaultLabel: "Ready to take notes",
  
    icon: <Mic size={ICON_SIZE} />
  },
  starting: {
    bg: "bg-amber-500",
    text: "text-white/90",
    btnText: "text-amber-600",
    btnHover: "hover:bg-amber-50",
    defaultLabel: "Connecting...",
  
    // Loader2 is the standard spinner in Lucide
    icon: <Loader2 size={ICON_SIZE} className="animate-spin" />
  },
  recording: {
    bg: "bg-rose-600",
    text: "text-rose-100",
    btnText: "text-rose-600",
    btnHover: "hover:bg-rose-50",
    defaultLabel: "Capturing notes",
  
    icon: <BarVisualizer size={ICON_SIZE} bars={5} />
  },
  writing: {
    bg: "bg-indigo-600",
    text: "text-indigo-100",
    btnText: "text-indigo-600",
    btnHover: "hover:bg-indigo-50",
    defaultLabel: "Finalizing notes...",
    
    icon: <Sparkles size={ICON_SIZE} className="animate-bounce" />
  },
  ready: {
    bg: "bg-emerald-600",
    text: "text-emerald-100",
    btnText: "text-emerald-600",
    btnHover: "hover:bg-emerald-50",
    defaultLabel: "Notes ready",
  
    icon: <CheckCircle2 size={ICON_SIZE} />
  },
  failed: {
    bg: "bg-red-700",
    text: "text-red-100",
    btnText: "text-red-700",
    btnHover: "hover:bg-red-50",
    defaultLabel: "Connection error",
    icon: <AlertTriangle size={ICON_SIZE} />
  },
};

export function VoxWidget(props: VoxWidgetProps) {
  const { 
    showPreview = true, 
    labels = {}, 
    className = "",
    renderControls,
    renderPreview
  } = props;

  const [isExpanded, setIsExpanded] = useState(false);
  
  // Consume Context
  const { status, notes, toggle, error, isRecording } = useVoxContext();

  // Derived Configuration
  const theme = DEFAULT_CONFIG[status] || DEFAULT_CONFIG.idle;
  
  // Use custom label from props, or fallback to default
  const displayLabel = labels[status] || theme.defaultLabel;
  const displayTitle = displayLabel; 

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggle();
  };

  return (
    <div className={`w-full font-sans ${className}`}>
      <div
        className={`
          relative overflow-hidden text-white shadow-lg cursor-pointer
          transition-all duration-500 ease-in-out
          ${theme.bg}
          ${isExpanded ? "rounded-3xl" : "rounded-[2rem]"}
        `}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        {/* --- Header Area --- */}
        <div className="flex items-center justify-between px-8 py-4">
          
          {/* LEFT SIDE: Icon + Text Group */}
          <div className="flex items-center gap-4"> {/* Added gap-4 for spacing */}
            
            {/* 1. The Dynamic Icon */}
            <div className="text-white/90">
               {theme.icon}
            </div>

            {/* 2. The Text Column */}
            <div className="flex flex-col">
              <span className="font-bold text-lg leading-tight">
                {displayTitle}
              </span>
            </div>
          </div>

          {/* RIGHT SIDE: Chevron */}
          <ChevronDown size={ICON_SIZE} className={`transition-transform duration-500 ${
            isExpanded ? "rotate-180" : "rotate-0"
          }`} />
        </div>

        {/* --- Expanded Content Area --- */}
        <div
          className={`grid transition-[grid-template-rows] duration-500 ease-in-out ${
            isExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <div className={`px-8 pb-8 ${theme.text} leading-relaxed`}>
              
              {/* Error State */}
              {status === 'failed' && error && (
                <div className="mb-4 p-3 bg-white/20 rounded-lg text-sm border border-white/10">
                  <strong>Error:</strong> {error.message || "An unknown error occurred."}
                </div>
              )}

              {/* Preview Area (Render Prop or Default) */}
              {showPreview && (
                <div className="mb-6 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-white/20">
                  {renderPreview ? (
                    // 1. Custom Preview from Props
                    renderPreview(JSON.stringify(notes)) 
                  ) : (
                    // 2. Default List Preview
                    notes && notes.length > 0 ? (
                      <ul className="list-disc pl-5 space-y-2">
                        {notes.map((note, i) => (
                           // Note: Using 'any' cast temporarily if Note type is strict but content varies
                           // Ideally use note.content || note.text
                          <li key={i} className="text-sm">
                            {(note as any).text || (note as any).content || "New Note"}
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <div className="py-2 opacity-70 italic text-sm">
                         {status === 'recording' 
                           ? "Listening for speech..." 
                           : "No notes available."}
                      </div>
                    )
                  )}
                </div>
              )}

              {/* Controls Area (Render Prop or Default) */}
              <div className="mt-2 flex justify-center">
                {renderControls ? (
                  renderControls({ toggle, isRecording, state: status })
                ) : (
                  <div className="scale-150 transform p-4">
                    {theme.icon}
                  </div>
                )}
              </div>
              
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}