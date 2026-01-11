import type { Note, SessionStatus } from "@voxhq/web-sdk";
import type { VoxState } from "./types";

// Internal Action Types
export type VoxAction =
  | { type: "RESET"; notes?: Note[] }
  | { type: "START_RECORDING" }
  | { type: "RECORDING_STARTED" }
  | { type: "STOP_RECORDING" }
  | { type: "UPDATE_NOTES"; notes: Note[] }
  | { type: "UPDATE_STATUS"; status: SessionStatus }
  | { type: "ERROR"; error: Error };

export const initialState: VoxState = { status: "idle", notes: [] };

/**
 * Reducer for managing the Vox session lifecycle.
 */
export function voxReducer(state: VoxState, action: VoxAction): VoxState {
  switch (action.type) {
    case "RESET":
      return { status: "idle", notes: action.notes || [] };

    case "START_RECORDING":
      // Optimistic transition to "starting"
      return { status: "starting", notes: state.notes };

    case "RECORDING_STARTED":
      // Confirmation from SDK that mic is open
      return { status: "recording", notes: state.notes };

    case "STOP_RECORDING":
      // When stopping, we immediately assume "writing" until backend says otherwise
      return { status: "writing", notes: state.notes };

    case "UPDATE_NOTES":
      // Data updates preserve the current status.
      // Recovery logic: If we were 'failed' but got new data, reset to 'idle' or 'ready'.
      if (state.status === "failed") {
        return { status: "idle", notes: action.notes };
      }
      return { ...state, notes: action.notes };

    case "UPDATE_STATUS":
      // This prevents the race condition where backend says "writing" while we are still "recording".
      if (state.status === "recording" || state.status === "starting" || state.status === "idle" || state.notes.length === 0) {
        return state;
      }

      // // Map backend status strings to our clean FSM
      const s = action.status;
      if (s === "completed") {
        return { status: "ready", notes: state.notes };
      }
      if (s === "writing" || s === "processing") {
        return { status: "writing", notes: state.notes };
      }
      return state;

    case "ERROR":
      return { status: "failed", error: action.error, notes: state.notes };

    default:
      return state;
  }
}