import type { IncomingMessage, ServerResponse } from 'node:http';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { dispatchNotifyPayload } from './server/notifyDispatcher.ts';

/** Connect augments Node's IncomingMessage with `url` / `method` on the dev server. */
type DevRequest = IncomingMessage & { url?: string; method?: string };

function readRequestBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (chunk: Buffer | string) => {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    });
    req.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')));
    req.on('error', reject);
  });
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [
      react(),
      {
        name: 'resend-send-email-api',
        configureServer(server) {
          server.middlewares.use(async (req, res, next) => {
            const incoming = req as DevRequest;
            const pathOnly = incoming.url?.split('?')[0];
            if (pathOnly !== '/api/send-email' || incoming.method !== 'POST') {
              return next();
            }

            const httpRes = res as ServerResponse;
            console.log('[api/send-email] called', {
              method: incoming.method,
              url: incoming.url,
              hasResendApiKey: Boolean(env.RESEND_API_KEY),
            });

            try {
              const apiKey = env.RESEND_API_KEY;
              if (!apiKey) {
                httpRes.statusCode = 503;
                httpRes.setHeader('Content-Type', 'application/json');
                httpRes.end(JSON.stringify({ error: 'RESEND_API_KEY is not configured' }));
                return;
              }

              const raw = await readRequestBody(incoming);
              console.log('[api/send-email] raw body', raw);
              const body = raw ? JSON.parse(raw) : null;
              await dispatchNotifyPayload(apiKey, body);
              httpRes.statusCode = 200;
              httpRes.setHeader('Content-Type', 'application/json');
              httpRes.end(JSON.stringify({ ok: true }));
              console.log('[api/send-email] success');
            } catch (e) {
              console.error('[api/send-email]', e);
              httpRes.statusCode = 500;
              httpRes.setHeader('Content-Type', 'application/json');
              httpRes.end(JSON.stringify({ error: e instanceof Error ? e.message : String(e) }));
            }
          });
        },
      },
    ],
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
  };
});
