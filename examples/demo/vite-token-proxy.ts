import { loadEnv, type Plugin } from 'vite';

/**
 * Vite plugin that adds a server-side endpoint for token generation.
 * Reads API key from VOX_API_KEY environment variable (no VITE_ prefix = server-only).
 * This keeps the API key entirely on the server - never exposed to the client.
 */
export function tokenProxyPlugin(): Plugin {
  let apiKey: string | undefined;

  return {
    name: 'vox-token-proxy',
    config(_, { mode }) {
      // '' prefix loads ALL env vars, not just VITE_*
      const env = loadEnv(mode, process.cwd(), '');
      apiKey = env.VOX_API_KEY;
    },

    configureServer(server) {
      server.middlewares.use('/api/token', async (req, res, next) => {
        // Only handle POST requests
        if (req.method !== 'POST') {
          return next();
        }
        if (!apiKey) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: 'VOX_API_KEY not configured in .env.local' }));
          return;
        }

        try {
          // Generate a random sessionId
          const sessionId = `/user_${crypto.randomUUID()}/appt_${crypto.randomUUID()}`;

          // Generate token on the server using the env API key
          const response = await fetch('https://connect.voxdenta.com/auth/token', {
            method: 'POST',
            headers: {
              'x-api-key': apiKey,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({ sessionId }),
          });

          if (!response.ok) {
            res.writeHead(response.status, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: `Failed to generate token: ${response.statusText}` }));
            return;
          }

          const data = await response.json() as { accessToken?: string; token?: string };
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ token: data.accessToken || data.token, sessionId }));
        } catch (error) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(
            JSON.stringify({
              error: error instanceof Error ? error.message : 'Internal server error',
            })
          );
        }
      });
    },
  };
}

