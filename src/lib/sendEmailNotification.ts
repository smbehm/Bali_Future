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

export async function sendEmailNotification(payload: SendEmailRequestBody): Promise<void> {
  const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
  const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
  const url = `${supabaseUrl}/functions/v1/send-email`;

  let res: Response;
  try {
    res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${supabaseAnonKey}`,
      },
      body: JSON.stringify(payload),
    });
  } catch (e) {
    console.error('[sendEmailNotification] fetch threw:', e);
    return;
  }

  if (!res.ok) {
    const bodyText = await res.text();
    console.error('[sendEmailNotification] error:', res.status, bodyText);
  }
}
