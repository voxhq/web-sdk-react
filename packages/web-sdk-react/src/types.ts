import type { Note, VoxClient } from "@voxhq/web-sdk";
import React from "react";

// --- State Definitions ---

/**
 * The high-level status of the Vox session.
 * - `idle`: Session is initialized but inactive.
 * - `starting`: Recording is initializing (optimistic state).
 * - `recording`: Microphone is active and capturing audio.
 * - `writing`: Audio processing or note generation is in progress.
 * - `ready`: Processing is complete and notes are available.
 * - `failed`: An error occurred during the session.
 */
export type VoxStatus = "idle" | "starting" | "recording" | "writing" | "ready" | "failed";

/**
 * The internal state machine for the VoxProvider.
 */
export type VoxState =
  | { status: "idle"; notes: Note[] }
  | { status: "starting"; notes: Note[] }
  | { status: "recording"; notes: Note[] }
  | { status: "writing"; notes: Note[] }
  | { status: "ready"; notes: Note[] }
  | { status: "failed"; error: Error; notes: Note[] };

// --- Context & Props ---

export type VoxContextValue = {
  /** The initialized SDK client instance. */
  client: VoxClient | null;
  /** The current session ID. */
  sessionId: string;

  /** The list of notes for the current session. */
  notes: Note[];
  /** The current status of the session workflow. */
  status: VoxStatus;
  /** Returns true if status is 'starting' or 'recording'. */
  isRecording: boolean;
  /** Present only if the session is in the 'failed' state. */
  error?: Error;

  /** Start the recording session. */
  start: () => Promise<void>;
  /** Stop the recording session and trigger note generation. */
  stop: () => void;
  /** Toggles between start/stop based on current state. */
  toggle: () => void;
  /** Get the current analyzer band levels. */
  getAnalyzerBandLevels: (bands: number) => Float32Array;
};

export type VoxProviderProps = {
  /** Your VoxDenta API Token. */
  token: string;
  /** Optional override for the API endpoint (useful for on-prem or staging). */
  baseUrl?: string;

  /**
   * Optional callback to determine which note is "primary" (e.g. for preview widgets).
   * If omitted, the first note is usually considered primary.
   */
  selectPrimaryNote?: (notes: Note[]) => Note | undefined;

  children: React.ReactNode;
};

// --- Component Props ---

export type VoxWidgetProps = {
  /** Whether to show the live note preview text. Defaults to true. */
  showPreview?: boolean;
  /** Custom labels for the various UI states. */
  labels?: Partial<Record<VoxStatus, string>>;

  className?: string;

  /** Optional render prop to fully replace the control buttons. */
  renderControls?: (ctx: { toggle: () => void; isRecording: boolean; state: VoxStatus }) => React.ReactNode;
  /** Optional render prop to customize the note preview area. */
  renderPreview?: (content: string) => React.ReactNode;
};

export type VoxNoteListProps = React.HTMLAttributes<HTMLDivElement> & {
  notes: Note[];

  /** ID of the currently selected note (Controlled). */
  selectedId?: string;
  /** ID of the initially selected note (Uncontrolled). */
  defaultSelectedId?: string;
  /** Callback fired when a note is selected. */
  onSelectId?: (id: string) => void;

  /** Whether to show the markdown preview panel. Defaults to true. */
  showPreview?: boolean;

  /** Title for the list column. */
  listTitle?: string;
  /** Title for the preview column. Defaults to active note name. */
  previewTitle?: string;
};