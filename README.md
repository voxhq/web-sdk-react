# @voxhq/web-sdk-react

React bindings for the Vox Web SDK — capture voice and turn it into structured notes in real-time.

## Installation

```bash
npm install @voxhq/web-sdk-react
# or
pnpm add @voxhq/web-sdk-react
```

## Quick Start

```tsx
import { VoxProvider, VoxWidget, useVox } from '@voxhq/web-sdk-react';

function App() {
  // Token should be minted on your backend with a sessionId
  const token = "your-session-token";

  return (
    <VoxProvider token={token}>
      <VoxWidget />
      <NotesDisplay />
    </VoxProvider>
  );
}

function NotesDisplay() {
  const { notes, status } = useVox();
  
  return (
    <div>
      <p>Status: {status}</p>
      {notes.map(note => (
        <div key={note.id}>{note.content}</div>
      ))}
    </div>
  );
}
```

## Components

### `<VoxProvider>`

Wraps your app and manages the Vox client lifecycle.

```tsx
<VoxProvider 
  token={token}      // Required: Session token
>
  {children}
</VoxProvider>
```

### `<VoxWidget>`

Pre-built recording controls with status indicator and visualizer.

```tsx
<VoxWidget
  showPreview={true}   // Show note preview (default: true)
  bars={5}             // Number of visualizer bars (default: 5)
  labels={{            // Custom status labels
    idle: "Ready",
    recording: "Listening...",
  }}
/>
```

### `<VoxNoteList>`

Displays generated notes with Markdown rendering.

```tsx
<VoxNoteList 
  notes={notes}           // From useVox() or custom source
  showPreview={true}      // Show preview panel (default: true)
  listTitle="Notes"       // List panel title
/>
```

### `<BarVisualizer>`

Standalone audio visualizer component.

```tsx
<BarVisualizer 
  bars={5}        // Number of bars
  size={24}       // Size in pixels
/>
```

## Hooks

### `useVox()`

Access Vox state and controls from any component inside `VoxProvider`.

```tsx
const {
  // State
  status,       // "idle" | "starting" | "recording" | "writing" | "ready" | "failed"
  notes,        // Array of generated notes
  isRecording,  // Convenience: true if recording or starting
  error,        // Error object if status is "failed"
  
  // Actions
  start,        // Start recording
  stop,         // Stop recording
  toggle,       // Toggle recording state
} = useVox();
```

### `useVoxVisualizer()`

Get animated bar heights for custom visualizers.

```tsx
const bars = useVoxVisualizer(5, 80); // (barCount, intervalMs)
// bars = [0.2, 0.8, 0.5, 0.9, 0.3] — values 0-1
```

## Token Generation

Tokens must be generated on your backend using your API key:

```bash
curl -X POST https://connect.voxdenta.com/auth/token \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{"sessionId": "/user_123/appt_456"}'
```

The `sessionId` is embedded in the token and determines where audio/notes are stored. Use a hierarchical path for flexible querying later:

- `/user_123` — All notes for a user
- `/user_123/appt_456` — Notes for a specific appointment

**Never expose your API key in client-side code.** Only the short-lived token should be sent to the browser.

## Example App

See [`examples/demo`](./examples/demo) for a complete working example with:

- Vite dev server token generation
- Recording controls
- Note display with Markdown
- Auto token refresh

```bash
cd examples/demo
echo "VOX_API_KEY=your_key_here" > .env.local
pnpm install
pnpm dev
```

## License

MIT
