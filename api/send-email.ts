export const config = { runtime: 'edge' };

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

function normalizeFromAddress(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return 'Bali Future <onboarding@resend.dev>';
  if (trimmed.includes('<')) return trimmed;
  return `Bali Future <${trimmed}>`;
}

function corsHeaders(request: Request): Record<string, string> {
  const origin = request.headers.get('Origin');
  return {
    'Access-Control-Allow-Origin': origin ?? '*',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
}

async function postResend(
  apiKey: string,
  from: string,
  recipient: string,
  subject: string,
  html: string,
): Promise<{ ok: boolean; status: number; body: string }> {
  const resendRes = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ from, to: [recipient], subject, html }),
  });
  const body = await resendRes.text();
  return { ok: resendRes.ok, status: resendRes.status, body };
}

function jsonResponse(request: Request, data: unknown, status: number): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      ...corsHeaders(request),
    },
  });
}

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: corsHeaders(request),
    });
  }

  if (request.method !== 'POST') {
    return jsonResponse(request, { error: 'Method Not Allowed' }, 405);
  }

  const key = (process.env.RESEND_API_KEY ?? '').trim();
  const orgTo = (process.env.INTAKE_EMAIL_TO ?? '').trim();
  const from = normalizeFromAddress(process.env.RESEND_FROM_EMAIL ?? '');

  if (!key) {
    console.error('[api/send-email] RESEND_API_KEY is not set');
    return jsonResponse(request, { skipped: true, reason: 'RESEND_API_KEY not set' }, 503);
  }

  if (!orgTo) {
    console.error('[api/send-email] INTAKE_EMAIL_TO is not set');
    return jsonResponse(request, { error: 'INTAKE_EMAIL_TO not set in env' }, 500);
  }

  let clientPayload: unknown;
  try {
    clientPayload = await request.json();
  } catch {
    return jsonResponse(request, { error: 'Invalid JSON' }, 400);
  }

  const results: Array<{ target: string; status: number; ok: boolean; detail?: string }> = [];

  if (isNewEmailPayload(clientPayload)) {
    const org = clientPayload.organization;
    const r0 = await postResend(key, from, orgTo, org.subject, org.html);
    if (!r0.ok) {
      console.error('[api/send-email] Resend organization failed', r0.status, r0.body);
    }
    results.push({
      target: 'organization',
      status: r0.status,
      ok: r0.ok,
      detail: r0.ok ? undefined : r0.body,
    });

    const donor = clientPayload.donor;
    if (donor && typeof donor.to === 'string' && donor.to.includes('@')) {
      const r1 = await postResend(key, from, donor.to.trim(), donor.subject, donor.html);
      if (!r1.ok) {
        console.error('[api/send-email] Resend donor failed', r1.status, r1.body);
      }
      results.push({
        target: 'donor',
        status: r1.status,
        ok: r1.ok,
        detail: r1.ok ? undefined : r1.body,
      });
    }
  } else {
    const payloadStr = JSON.stringify(clientPayload, null, 2);
    const r0 = await postResend(
      key,
      from,
      orgTo,
      '[Bali Future] Form notification',
      `<pre>${escapeHtml(payloadStr)}</pre>`,
    );
    results.push({
      target: 'organization',
      status: r0.status,
      ok: r0.ok,
      detail: r0.ok ? undefined : r0.body,
    });
  }

  const allOk = results.length > 0 && results.every((x) => x.ok);
  const status = allOk ? 200 : results.some((x) => x.ok) ? 207 : 502;
  return jsonResponse(request, { results }, status);
}
