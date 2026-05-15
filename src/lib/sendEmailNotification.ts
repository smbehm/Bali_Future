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

/** Sent to POST /api/send-email ΓÇö organization uses INTAKE_EMAIL_TO on the server. */
export type SendEmailRequestBody = {
  organization: {
    subject: string;
    html: string;
  };
  /** Optional confirmation to the donor/applicant */
  donor?: {
    to: string;
    subject: string;
    html: string;
  } | null;
};

/**
 * Dev: POST /api/send-email (Vite middleware). Production: Vercel serverless at /api/send-email.
 */
export async function sendEmailNotification(payload: SendEmailRequestBody): Promise<void> {
  let res: Response;
  try {
    res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    if (import.meta.env.DEV) {
      console.error('[sendEmailNotification] fetch threw:', e);
    }
    return;
  }

  if (!res.ok && import.meta.env.DEV) {
    const bodyText = await res.text();
    console.error('[sendEmailNotification]', res.status, bodyText);
  }
}
