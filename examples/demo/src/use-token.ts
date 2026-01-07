import { useState, useEffect } from "react";

// ============================================================================
// Types
// ============================================================================

type TokenState =
  | { status: "loading" }
  | { status: "error"; message: string }
  | { status: "ready"; token: string; sessionId: string };

// ============================================================================
// Utilities
// ============================================================================

function decodeToken(token: string): Record<string, unknown> | null {
  try {
    const [, payload] = token.split(".");
    if (!payload) return null;
    return JSON.parse(atob(payload));
  } catch {
    return null;
  }
}

function getTokenExpiry(token: string): number | null {
  const decoded = decodeToken(token);
  if (!decoded) return null;
  return decoded.exp ? (decoded.exp as number) * 1000 : null;
}

async function fetchToken(): Promise<{ token: string; sessionId: string }> {
  const response = await fetch("/api/token", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  });

  if (!response.ok) {
    const data = await response.json().catch(() => ({ error: response.statusText }));
    throw new Error(data.error || `Failed to generate token: ${response.statusText}`);
  }

  const data = await response.json();
  const token = data.token;
  const sessionId = data.sessionId;

  return { token, sessionId };
}

// ============================================================================
// Hook
// ============================================================================

/**
 * Hook that fetches and auto-refreshes tokens from the Vite dev server.
 * Returns a discriminated union: "loading" | "error" | "ready"
 */
export function useToken(): TokenState {
  const [state, setState] = useState<TokenState>({ status: "loading" });

  // Initial token fetch
  useEffect(() => {
    fetchToken()
      .then(({ token, sessionId }) => setState({ status: "ready", token, sessionId }))
      .catch((err) => setState({ status: "error", message: err.message }));
  }, []);

  // Auto-refresh token before expiry
  useEffect(() => {
    if (state.status !== "ready") return;

    const exp = getTokenExpiry(state.token);
    if (!exp) return;

    const msUntilRefresh = exp - Date.now() - 60_000; // 1 min before expiry
    if (msUntilRefresh <= 0) return;

    const timer = setTimeout(async () => {
      try {
        const { token, sessionId } = await fetchToken();
        setState({ status: "ready", token, sessionId });
      } catch (err) {
        console.error("Failed to refresh token:", err);
      }
    }, msUntilRefresh);

    return () => clearTimeout(timer);
  }, [state]);

  return state;
}
