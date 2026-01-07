# Vox Web SDK React – Example App

This example app demonstrates how to use **`@voxhq/web-sdk-react`** to record audio and receive AI-generated notes using Vox.

---

## Prerequisites

- Node.js 18+
- pnpm (recommended)
- A Vox API key

---

## Quick Start

### 1. Install dependencies

From the repo root:

```bash
pnpm install
```

### 2. Configure your API key

Create a file at `examples/demo/.env.local`:

```bash
VOX_API_KEY=your_api_key_here
```

> **Note:** The `VOX_API_KEY` (without `VITE_` prefix) stays server-side only and is never exposed to the browser.

### 3. Run the example app

```bash
pnpm --filter demo dev
```

Open the local URL printed in the terminal (https://localhost:5173).

That's it! The app will automatically generate session tokens using your API key.

---

## How it works

### Token generation

The example app includes a Vite plugin (`vite-token-proxy.ts`) that:

1. Reads `VOX_API_KEY` from `.env.local` (server-side only)
2. Exposes a `/api/token` endpoint on the dev server
3. Generates short-lived session tokens with random session IDs
4. Auto-refreshes tokens before they expire

This mirrors how you'd handle token generation in production — on your backend, not in the browser.

### Session Path

Each token includes a `sessionId` (session path) that groups all audio recordings and generated notes for a single session. The example app generates random session paths like:

```
/user_abc123/appt_def456
```

The hierarchical structure enables flexible querying later:

- `/user_abc123` — All notes for a specific user
- `/user_abc123/appt_def456` — Notes for a specific appointment

Choose a path structure that aligns with your business logic (e.g., `/org_acme/user_123/meeting_456`).

---

## Using the demo UI

- **Session Path** — The session ID embedded in the current token (read-only)
- **Appointment State** — Simulates check-in flow; "In Appointment" starts recording
- **VoxWidget** — Recording controls with audio visualizer
- **Notes Panel** — Displays AI-generated notes rendered as Markdown

---

## Security note

⚠️ **Do not expose your API key in browser code.**

- The `VOX_API_KEY` environment variable stays on the Vite dev server
- In production, mint session tokens on your backend and send the token to the client
- Tokens are short-lived and scoped to a single session

---

## What this example demonstrates

- `VoxProvider` — Token-based session orchestration
- `VoxWidget` — Recording controls, visualizer, and state
- `VoxNoteList` — Rendering generated notes with GitHub Markdown
- `useVox` — Hook for programmatic control
- Server-side token generation pattern

---

## Manual token generation (alternative)

If you prefer to generate tokens manually instead of using the Vite plugin:

```bash
curl --request POST \
  --url https://connect.voxdenta.com/auth/token \
  --header 'x-api-key: <YOUR_API_KEY>' \
  --header 'Content-Type: application/json' \
  --data '{
    "sessionId": "/user_123/appt_456"
  }'
```

Then set `VITE_VOX_TOKEN` in `.env.local` with the returned token. Note that tokens expire, so you'll need to regenerate them periodically.

---

If you have questions or run into issues, please open an issue in the repository.
