const SEND_EMAIL_PATH = '/api/send-email';

async function postNotify(body: Record<string, unknown>) {
  try {
    console.log('Sending transactional email payload:', body);
    const res = await fetch(SEND_EMAIL_PATH, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    if (!res.ok) {
      const t = await res.text();
      console.warn('Transactional email request failed:', res.status, t, body);
      return;
    }
    console.log('Transactional email request succeeded');
  } catch (e) {
    console.warn('Transactional email request error:', e, body);
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
