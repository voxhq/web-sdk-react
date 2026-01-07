import { VoxProvider, VoxWidget, VoxNoteList, useVox } from "@voxhq/web-sdk-react";
import { useToken } from "./use-token";

// ============================================================================
// 1. Demo Controls
// Use Case: Simulating your host application (e.g., EHR/EMR) controlling the session.
// ============================================================================

function DemoControls({ sessionId }: { sessionId: string }) {
  // Access SDK state and methods via the hook
  const { start, stop } = useVox();

  const handleStateChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const state = e.target.value;

    // Trigger SDK actions based on your app's business logic
    if (state === "in_appointment") {
      start();
    } else {
      stop();
    }
  };

  return (
    <div className="rounded-xl border bg-background p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between">
        <div className="text-sm font-medium">Appointment Controls</div>
        <span className="rounded bg-gray-100 px-2 py-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          Host App Logic
        </span>
      </div>

      <div className="space-y-4">
        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Session Path <span className="font-normal text-gray-400">(set at token creation)</span>
          </label>
          <input
            value={sessionId}
            readOnly
            className="w-full rounded-lg border bg-background px-3 py-2 text-sm font-mono text-muted-foreground outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs text-muted-foreground">
            Current State
          </label>
          <select
            onChange={handleStateChange}
            defaultValue="checked_in"
            className="w-full appearance-none rounded-lg border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500"
          >
            <option value="checked_in">Checked In (Idle)</option>
            <option value="in_appointment">In Appointment (Recording)</option>
            <option value="checking_out">Checking Out (Stopped)</option>
          </select>
          <p className="mt-2 text-xs text-muted-foreground">
            * Selecting "In Appointment" calls <code>vox.start()</code>
          </p>
        </div>
      </div>
    </div>
  );
}

// ============================================================================
// 2. Data Display
// Use Case: Rendering real-time notes from the SDK stream.
// ============================================================================

function NotesPanel() {
  const { notes } = useVox();
  
  return (
    <VoxNoteList notes={notes} />
  );
}

// ============================================================================
// 3. Authenticated Session
// Use Case: Wraps the app with the VoxProvider once we have a token.
// ============================================================================

function VoxSession({ token, sessionId }: { token: string, sessionId: string }) {
  const baseUrl = import.meta.env.VITE_VOX_BASE_URL as string | undefined;

  return (
    <VoxProvider token={token} baseUrl={baseUrl}>
      <div className="grid gap-8 md:grid-cols-2">
        {/* LEFT: Inputs & Controls */}
        <div>
          <DemoControls sessionId={sessionId} />
          
          <div className="mt-6 rounded-xl border border-blue-100 bg-blue-50/50 p-5">
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wide text-blue-600">
              SDK Component: Widget
            </h3>
            {/* The Widget handles its own visualization state */}
            <VoxWidget
              bars={7}
              showPreview={false}
              className="w-full"
            />
          </div>
        </div>

        {/* RIGHT: Outputs */}
        <div>
          <NotesPanel />
        </div>
      </div>
    </VoxProvider>
  );
}

// ============================================================================
// 4. Main App Entry
// Use Case: Handles Token Loading -> Error Handling -> Session Initialization
// ============================================================================

function Header() {
  return (
    <header className="mb-8 border-b pb-4">
      <h1 className="text-2xl font-semibold">Vox Web SDK React Example</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Demonstration of <code className="font-mono">@voxhq/web-sdk-react</code>
      </p>
    </header>
  );
}

export default function App() {
  // In production, your backend should generate this token
  const tokenState = useToken();

  return (
    <div className="mx-auto max-w-5xl p-6 font-sans min-h-screen bg-gray-50/30">
      <Header />

      {/* Loading State */}
      {tokenState.status === "loading" && (
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent" />
          Connecting to token server...
        </div>
      )}

      {/* Error State */}
      {tokenState.status === "error" && (
        <div className="max-w-xl rounded-xl border border-red-200 bg-red-50 p-4">
          <h2 className="mb-2 text-lg font-semibold text-red-600">Configuration Error</h2>
          <p className="mb-4 text-sm">{tokenState.message}</p>
          <div className="rounded bg-white p-3 font-mono text-xs shadow-sm">
            VOX_API_KEY=zpka_...
          </div>
          <p className="mt-2 text-xs text-gray-500">
            Please add your API key to <code>.env.local</code>
          </p>
        </div>
      )}

      {/* Ready State -> Initialize Session */}
      {tokenState.status === "ready" && (
        <VoxSession token={tokenState.token} sessionId={tokenState.sessionId} />
      )}
    </div>
  );
}