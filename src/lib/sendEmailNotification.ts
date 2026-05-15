import { supabaseAnonKey, supabaseUrl } from './supabase';

/** Escape text for safe inclusion in HTML email bodies. */
export function escapeForEmailHtml(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

export function linesToEmailHtml(lines: string[]): string {
  return lines
    .map((line) => `<p style="margin:0 0 10px 0;font-family:system-ui,sans-serif;font-size:15px;line-height:1.5;color:#1e293b;">${escapeForEmailHtml(line)}</p>`)
    .join('');
}

/** Sent to POST /api/send-email — organization uses INTAKE_EMAIL_TO on the server. */
export type SendEmailRequestBody = {
  organization: {
    subject: string;
    html: string;
  };
  donor?: {
    to: string;
    subject: string;
    html: string;
  } | null;
};

type ResendResultRow = { target: string; ok: boolean; status: number; detail?: string };

export type EmailNotificationResult = {
  ok: boolean;
  status: number;
  endpoint: string;
  error?: string;
  results?: ResendResultRow[];
  skipped?: boolean;
};

function formatEmailFailure(result: EmailNotificationResult): string {
  if (result.error) return result.error;
  const failed = result.results?.filter((r) => !r.ok) ?? [];
  if (failed.length > 0) {
    return failed.map((r) => `${r.target}: HTTP ${r.status}${r.detail ? ` — ${r.detail}` : ''}`).join('; ');
  }
  return `Email service returned HTTP ${result.status}`;
}

/** User-visible message when email fails after DB insert succeeded. */
export function formatEmailWarning(result: EmailNotificationResult): string {
  return `Your submission was saved, but we could not send email notification (${formatEmailFailure(result)}).`;
}

async function postEmailEndpoint(
  endpoint: string,
  payload: SendEmailRequestBody,
  headers: Record<string, string>,
): Promise<EmailNotificationResult> {
  console.log('[sendEmailNotification] POST', endpoint, {
    organizationSubject: payload.organization.subject,
    hasDonor: Boolean(payload.donor?.to),
  });

  let res: Response;
  try {
    res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    console.error('[sendEmailNotification] fetch failed', { endpoint, message });
    return { ok: false, status: 0, endpoint, error: message };
  }

  const bodyText = await res.text();
  console.log('[sendEmailNotification] response', {
    endpoint,
    status: res.status,
    body: bodyText.slice(0, 500),
  });

  let parsed: unknown;
  try {
    parsed = bodyText ? JSON.parse(bodyText) : {};
  } catch {
    parsed = { raw: bodyText };
  }

  const data = parsed as {
    skipped?: boolean;
    reason?: string;
    error?: string;
    results?: ResendResultRow[];
  };

  if (data.skipped) {
    return {
      ok: false,
      status: res.status,
      endpoint,
      skipped: true,
      error: data.reason ?? 'Email service skipped (API key not configured on server)',
    };
  }

  if (data.error && !data.results) {
    return {
      ok: false,
      status: res.status,
      endpoint,
      error: data.error,
    };
  }

  const results = data.results ?? [];
  const allOk = res.ok && (results.length === 0 || results.every((r) => r.ok));

  if (!allOk) {
    return {
      ok: false,
      status: res.status,
      endpoint,
      results,
      error: formatEmailFailure({ ok: false, status: res.status, endpoint, results }),
    };
  }

  return { ok: true, status: res.status, endpoint, results };
}

/**
 * Production: Vercel serverless `/api/send-email` (Resend + INTAKE_EMAIL_TO).
 * Fallback: Supabase Edge Function when Vercel route is missing (404).
 */
export async function sendEmailNotification(payload: SendEmailRequestBody): Promise<EmailNotificationResult> {
  const vercel = await postEmailEndpoint('/api/send-email', payload, {});

  if (vercel.ok || vercel.status !== 404) {
    return vercel;
  }

  if (supabaseUrl && supabaseAnonKey) {
    const edgeUrl = `${supabaseUrl.replace(/\/$/, '')}/functions/v1/send-email`;
    console.warn('[sendEmailNotification] /api/send-email returned 404, trying Supabase Edge Function');
    return postEmailEndpoint(edgeUrl, payload, {
      Authorization: `Bearer ${supabaseAnonKey}`,
      apikey: supabaseAnonKey,
    });
  }

  return {
    ...vercel,
    error: vercel.error ?? 'Email API route not found and Supabase fallback is not configured',
  };
}
