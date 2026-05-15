import type { IncomingMessage } from 'node:http';
import react from '@vitejs/plugin-react';
import { defineConfig, loadEnv } from 'vite';
import type { Plugin } from 'vite';

function readReqBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    let out = '';
    req.setEncoding('utf8');
    req.on('data', (chunk: string) => {
      out += chunk;
    });
    req.on('end', () => resolve(out));
    req.on('error', reject);
  });
}

function escapeHtml(s: string) {
  return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function isNewEmailPayload(obj: unknown): obj is {
  organization: { subject: string; html: string };
  donor?: { to: string; subject: string; html: string } | null;
} {
  if (typeof obj !== 'object' || obj === null) return false;
  const o = obj as { organization?: unknown };
  if (!o.organization || typeof o.organization !== 'object') return false;
  const org = o.organization as { subject?: unknown; html?: unknown };
  return typeof org.subject === 'string' && typeof org.html === 'string';
}

async function postResend(
  apiKey: string,
  from: string,
  recipient: string,
  subject: string,
  html: string,
): Promise<{ ok: boolean; status: number; body: string; to: string }> {
  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [recipient],
      subject,
      html,
    }),
  });
  const body = await resendRes.text();
  console.log('Resend API response status:', resendRes.status);
  console.log('Resend API response body:', body);
  return { ok: resendRes.ok, status: resendRes.status, body, to: recipient };
}

function legacyOrganizationEmail(
  form: string,
  data: Record<string, unknown>,
): { subject: string; html: string } {
  if (form === 'newsletter') {
    const email = String(data.email ?? '');
    return {
      subject: `New newsletter subscriber — ${email}`,
      html: `<p style="font-family:system-ui,sans-serif;font-size:15px;">Email: ${escapeHtml(email)}</p>`,
    };
  }
  const payloadStr = JSON.stringify({ form, data }, null, 2);
  return {
    subject: `[Bali Future] ${form} (legacy payload)`,
    html: `<pre style="font-family:system-ui,sans-serif;font-size:13px;">${escapeHtml(payloadStr)}</pre>`,
  };
}

function sendEmailDevApi(env: Record<string, string>): Plugin {
  return {
    name: 'send-email-dev-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const pathname = req.url?.split('?')[0] ?? '';
        if (pathname !== '/api/send-email') {
          next();
          return;
        }

        if (req.method !== 'POST') {
          res.statusCode = 405;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Method Not Allowed' }));
          return;
        }

        console.log('Email endpoint hit');

        const key = (env.RESEND_API_KEY ?? '').trim();
        const hasKey = Boolean(key);
        console.log('RESEND_API_KEY loaded:', hasKey ? 'true' : 'false');

        let clientPayload: unknown;
        try {
          const raw = await readReqBody(req);
          clientPayload = raw ? JSON.parse(raw) : {};
        } catch (e) {
          console.error('[send-email middleware] Invalid JSON body', e);
          res.statusCode = 400;
          res.setHeader('Content-Type', 'application/json');
          res.end(JSON.stringify({ error: 'Invalid JSON' }));
          return;
        }

        if (!hasKey) {
          const body = JSON.stringify({
            skipped: true,
            reason: 'RESEND_API_KEY not set (add to .env.local for local Resend calls)',
          });
          console.log('Resend API response status: (skipped — no API key)');
          console.log('Resend API response body:', body);
          res.statusCode = 200;
          res.setHeader('Content-Type', 'application/json');
          res.end(body);
          return;
        }

        const from = env.RESEND_FROM_EMAIL?.trim() || 'Bali Future <onboarding@resend.dev>';
        const orgTo = env.INTAKE_EMAIL_TO?.trim() || '';
        if (!orgTo) {
          const errBody = JSON.stringify({ error: 'INTAKE_EMAIL_TO not set in env' });
          console.log('Resend API response status: (skipped — no recipient)');
          console.log('Resend API response body:', errBody);
          res.statusCode = 500;
          res.setHeader('Content-Type', 'application/json');
          res.end(errBody);
          return;
        }

        const results: Array<{ target: string; status: number; body: string; ok: boolean }> = [];

        if (isNewEmailPayload(clientPayload)) {
          const org = clientPayload.organization;
          const r0 = await postResend(key, from, orgTo, org.subject, org.html);
          results.push({ target: 'organization', status: r0.status, body: r0.body, ok: r0.ok });

          const donor = clientPayload.donor;
          if (donor && typeof donor.to === 'string' && donor.to.includes('@')) {
            const dTo = donor.to.trim();
            const r1 = await postResend(key, from, dTo, donor.subject, donor.html);
            results.push({ target: 'donor', status: r1.status, body: r1.body, ok: r1.ok });
          }
        } else {
          const pl = clientPayload as { form?: string; data?: Record<string, unknown> };
          const form = typeof pl.form === 'string' ? pl.form : 'unknown';
          const data =
            pl.data && typeof pl.data === 'object' && pl.data !== null
              ? (pl.data as Record<string, unknown>)
              : {};
          const { subject, html } = legacyOrganizationEmail(form, data);
          const r0 = await postResend(key, from, orgTo, subject, html);
          results.push({ target: 'organization', status: r0.status, body: r0.body, ok: r0.ok });
        }

        const allOk = results.length > 0 && results.every((x) => x.ok);
        res.statusCode = allOk ? 200 : results.some((x) => x.ok) ? 207 : 502;
        res.setHeader('Content-Type', 'application/json');
        res.end(JSON.stringify({ results }));
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    plugins: [react(), sendEmailDevApi(env)],
    server: {
      headers: { 'Cache-Control': 'no-store' },
    },
    optimizeDeps: {
      exclude: ['lucide-react'],
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules/framer-motion')) return 'motion';
            if (id.includes('node_modules/@supabase')) return 'supabase';
            if (id.includes('node_modules/three')) return 'three';
          },
        },
      },
    },
  };
});
