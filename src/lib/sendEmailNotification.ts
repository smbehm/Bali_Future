const SEND_EMAIL_PATH = '/api/send-email';

async function postNotify(body: Record<string, unknown>) {
  try {
    console.log('[sendEmailNotification] POST', SEND_EMAIL_PATH, 'payload:', body);
    const res = await fetch(SEND_EMAIL_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const responseText = await res.text();
    console.log('[sendEmailNotification] response status:', res.status, 'body:', responseText);
    if (!res.ok) {
      console.warn('[sendEmailNotification] request failed — check Network tab and Vercel/server logs for /api/send-email', {
        status: res.status,
        responseText,
        payload: body,
      });
      return;
    }
    console.log('[sendEmailNotification] request succeeded');
  } catch (e) {
    console.warn('[sendEmailNotification] fetch error (often means /api/send-email is missing in production):', e, body);
  }
}

export function notifyDonationRecorded(params: { donorEmail: string; donorName: string; amount: number }) {
  return postNotify({
    kind: 'donation',
    donorEmail: params.donorEmail,
    donorName: params.donorName,
    amount: params.amount,
  });
}

export function notifyVolunteerRecorded(params: {
  email: string;
  full_name: string;
  phone: string;
  country: string;
  skills: string;
  availability: string;
  message: string;
}) {
  return postNotify({
    kind: 'volunteer',
    ...params,
  });
}

export function notifyNewsletterSubscriber(params: { email: string }) {
  return postNotify({
    kind: 'newsletter',
    email: params.email,
  });
}
