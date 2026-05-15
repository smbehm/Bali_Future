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

export default async function handler(request: Request): Promise<Response> {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      },
    });
  }

  if (request.method !== 'POST') {
    return Response.json({ error: 'Method Not Allowed' }, { status: 405 });
  }

  const key = (process.env.RESEND_API_KEY ?? '').trim();
  const orgTo = (process.env.INTAKE_EMAIL_TO ?? '').trim();
  const from = (process.env.RESEND_FROM_EMAIL ?? '').trim() || 'Bali Future <onboarding@resend.dev>';

  if (!key) {
    return Response.json(
      { skipped: true, reason: 'RESEND_API_KEY not set' },
      { status: 200 },
    );
  }

  if (!orgTo) {
    return Response.json({ error: 'INTAKE_EMAIL_TO not set in env' }, { status: 500 });
  }

  let clientPayload: unknown;
  try {
    clientPayload = await request.json();
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 });
  }

  const results: Array<{ target: string; status: number; ok: boolean }> = [];

  if (isNewEmailPayload(clientPayload)) {
    const org = clientPayload.organization;
    const r0 = await postResend(key, from, orgTo, org.subject, org.html);
    results.push({ target: 'organization', status: r0.status, ok: r0.ok });

    const donor = clientPayload.donor;
    if (donor && typeof donor.to === 'string' && donor.to.includes('@')) {
      const r1 = await postResend(key, from, donor.to.trim(), donor.subject, donor.html);
      results.push({ target: 'donor', status: r1.status, ok: r1.ok });
    }
  } else {
    const pl = clientPayload as { form?: string; data?: Record<string, unknown> };
    const payloadStr = JSON.stringify(pl, null, 2);
    const r0 = await postResend(
      key,
      from,
      orgTo,
      '[Bali Future] Form notification',
      `<pre>${escapeHtml(payloadStr)}</pre>`,
    );
    results.push({ target: 'organization', status: r0.status, ok: r0.ok });
  }

  const allOk = results.length > 0 && results.every((x) => x.ok);
  const status = allOk ? 200 : results.some((x) => x.ok) ? 207 : 502;
  return Response.json({ results }, { status });
}
