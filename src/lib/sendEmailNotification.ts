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
  /** Optional confirmation to the donor/applicant */
  donor?: {
    to: string;
    subject: string;
    html: string;
  } | null;
};

/**
 * Dev: POST /api/send-email (Vite middleware). Production: add a matching host route if needed.
 */
export async function sendEmailNotification(payload: SendEmailRequestBody): Promise<void> {
  console.log('Sending email notification...', payload);

  let res: Response;
  try {
    res = await fetch('/api/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error('[sendEmailNotification] fetch threw:', e);
    return;
  }

  const bodyText = await res.text();
  console.log('[sendEmailNotification] fetch response status:', res.status);
  console.log('[sendEmailNotification] fetch response body:', bodyText);
}
