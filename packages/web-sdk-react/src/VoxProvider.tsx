import React, { useEffect, useReducer, useMemo, useCallback, useState } from "react";
import { initializeVox, type VoxClient } from "@voxhq/web-sdk";
import { VoxContext } from "./VoxContext";
import { voxReducer, initialState } from "./stateMachine";
import type { VoxProviderProps, VoxContextValue } from "./types";

/**
 * Extracts the sessionId from a JWT token.
 */
function getSessionIdFromToken(token: string): string | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    const decoded = JSON.parse(atob(payload));
    return decoded.sid || decoded.sessionId || null;
  } catch {
    return null;
  }
}

/**
 * VoxProvider
 * * Top-level provider that manages the VoxClient lifecycle, authentication, 
 * and session state. Wrap your application or session-specific feature with this.
 */
export function VoxProvider(props: VoxProviderProps) {
  const { token, baseUrl, children } = props;
  
  // Extract sessionId from token
  const sessionId = getSessionIdFromToken(token) ?? "";
  const [state, dispatch] = useReducer(voxReducer, initialState);
  const [client, setClient] = useState<VoxClient | null>(null);

  // --- Initialization ---

  // Initialize Client when auth changes
  useEffect(() => {
    const c = initializeVox(token, baseUrl ? { baseUrl } : undefined);
    setClient(c);
    
    return () => {
      try {
        c.stop();
      } catch (e) { /* ignore */ }
      c.close();
      setClient(null);
    };
  }, [token, baseUrl]);

  // Reset internal state when session ID changes
  useEffect(() => {
    dispatch({ type: "RESET" });
  }, [sessionId, token]);

  // --- Actions ---

  const start = useCallback(async () => {
    if (!client) return;
    
    // 1. Transition to 'starting'
    dispatch({ type: "START_RECORDING" });

    try {
      client.start(sessionId);
      // 2. Confirmation transition to 'recording'
      dispatch({ type: "RECORDING_STARTED" });
    } catch (err: any) {
      dispatch({ type: "ERROR", error: err });
    }
  }, [client, sessionId]);

  const stop = useCallback(() => {
    if (!client) return;
    dispatch({ type: "STOP_RECORDING" });
    client.stop();
  }, [client]);

  const toggle = useCallback(() => {
    // Check strict status to determine action
    if (state.status === "recording" || state.status === "starting") {
      stop();
    } else {
      start();
    }
  }, [state.status, start, stop]);

  const getAnalyzerBandLevels = useCallback((bands: number) => {
    if (!client) return new Float32Array(bands);
    return client.getAnalyzerBandLevels(bands);
  }, [client]);

  // --- Subscriptions ---

  useEffect(() => {
    if (!client) return;

    // Reset before subscribing to new session data
    dispatch({ type: "RESET" });

    const unsubscribe = [
      client.on('notes', (ns) => dispatch({ type: "UPDATE_NOTES", notes: ns })),
      client.on('error', (e) => dispatch({ type: "ERROR", error: e })),
      client.on('status', (s) => dispatch({ type: "UPDATE_STATUS", status: s })),
    ];

    return () => unsubscribe.forEach(u => u());
  }, [client, sessionId]);

  // --- Context Value ---

  const value = useMemo<VoxContextValue>(() => {
    // Derived conveniences for the public API
    const isRecording = state.status === "recording" || state.status === "starting";
    const error = state.status === "failed" ? state.error : undefined;

    return {
      client,
      sessionId,
      
      // State
      status: state.status, // "idle" | "recording" | "writing" | "ready" | "failed"
      notes: state.notes,
      isRecording,
      error,

      // Actions
      start,
      stop,
      toggle,
      getAnalyzerBandLevels
    };
  }, [client, sessionId, state, start, stop, toggle]);

  return <VoxContext.Provider value={value}>{children}</VoxContext.Provider>;
}