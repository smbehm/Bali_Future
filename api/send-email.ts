/**
 * Vercel Serverless Function — same contract as Vite dev middleware in vite.config.ts.
 * Without this route, production returns 404 for POST /api/send-email and Resend is never called.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { dispatchNotifyPayload } from '../server/notifyDispatcher';

function sendJson(res: ServerResponse, status: number, data: unknown) {
  res.statusCode = status;
  res.setHeader('Content-Type', 'application/json');
  res.end(JSON.stringify(data));
}

type VercelApiRequest = IncomingMessage & {
  method?: string;
  body?: unknown;
};

export default async function handler(req: VercelApiRequest, res: ServerResponse): Promise<void> {
  if (req.method !== 'POST') {
    sendJson(res, 405, { error: 'Method not allowed' });
    return;
  }

  const apiKey = process.env.RESEND_API_KEY;
  const keyLoaded = Boolean(apiKey?.trim());
  console.log('[api/send-email] Vercel handler', {
    method: req.method,
    RESEND_API_KEY_loaded: keyLoaded,
    key_prefix: keyLoaded ? `${apiKey!.slice(0, 8)}…` : '(missing)',
  });

  if (!apiKey?.trim()) {
    sendJson(res, 503, { error: 'RESEND_API_KEY is not configured' });
    return;
  }

  try {
    const body =
      typeof req.body === 'string' ? JSON.parse(req.body) : req.body;
    console.log(
      '[api/send-email] payload kind:',
      body && typeof body === 'object' && body !== null && 'kind' in body
        ? (body as { kind: unknown }).kind
        : '(none)'
    );
    await dispatchNotifyPayload(apiKey, body);
    sendJson(res, 200, { ok: true });
    console.log('[api/send-email] success');
  } catch (e) {
    console.error('[api/send-email] error', e);
    sendJson(res, 500, { error: e instanceof Error ? e.message : String(e) });
  }
}
