import { Resend } from 'resend';

const FROM = 'Bali Future <donate@balifuture.com>';
const FALLBACK_FROM = 'Bali Future <onboarding@resend.dev>';
const ADMIN = 'donate@balifuture.com';

export type DonationNotifyPayload = {
  kind: 'donation';
  donorEmail: string;
  donorName: string;
  amount: number;
};

export type VolunteerNotifyPayload = {
  kind: 'volunteer';
  email: string;
  full_name: string;
  phone: string;
  country: string;
  skills: string;
  availability: string;
  message: string;
};

export type NewsletterNotifyPayload = {
  kind: 'newsletter';
  email: string;
};

export type NotifyPayload = DonationNotifyPayload | VolunteerNotifyPayload | NewsletterNotifyPayload;

function assertResendResult(label: string, result: { error?: unknown }) {
  if (result.error) {
    throw new Error(`${label}: ${JSON.stringify(result.error)}`);
  }
}

function isUnverifiedDomainError(error: unknown): boolean {
  if (typeof error === 'string') {
    return error.includes('domain is not verified');
  }
  if (error && typeof error === 'object') {
    const maybeMessage = (error as { message?: unknown }).message;
    if (typeof maybeMessage === 'string' && maybeMessage.includes('domain is not verified')) {
      return true;
    }
    try {
      return JSON.stringify(error).includes('domain is not verified');
    } catch {
      return false;
    }
  }
  return false;
}

function logResendApiResponse(label: string, attempt: 'primary' | 'fallback', result: unknown) {
  try {
    console.log(
      `[notify] ${label} (${attempt}) full Resend API response:\n`,
      JSON.stringify(result, null, 2)
    );
  } catch {
    console.log(`[notify] ${label} (${attempt}) full Resend API response (could not JSON.stringify):`, result);
  }
}

async function sendWithFallback(
  resend: Resend,
  label: string,
  args: { from: string; to: string; subject: string; text: string }
) {
  const first = await resend.emails.send(args);
  logResendApiResponse(label, 'primary', first);
  if (!first.error) return;

  if (!isUnverifiedDomainError(first.error) || args.from === FALLBACK_FROM) {
    assertResendResult(label, first);
    return;
  }

  console.warn(`[notify] ${label} retrying with fallback sender`, FALLBACK_FROM);
  const retry = await resend.emails.send({ ...args, from: FALLBACK_FROM });
  logResendApiResponse(label, 'fallback', retry);
  assertResendResult(label, retry);
}

export async function dispatchNotifyPayload(apiKey: string, raw: unknown): Promise<void> {
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not set');
  }
  if (!raw || typeof raw !== 'object') {
    throw new Error('Invalid request body');
  }

  const payload = raw as NotifyPayload;
  const resend = new Resend(apiKey);

  if (payload.kind === 'donation') {
    const amt = typeof payload.amount === 'number' ? payload.amount : Number(payload.amount);
    const donorName = String(payload.donorName ?? '');
    const donorEmail = String(payload.donorEmail ?? '').trim();
    if (!donorEmail) {
      throw new Error('donorEmail is required');
    }

    await sendWithFallback(resend, 'donor thank-you', {
      from: FROM,
      to: donorEmail,
      subject: 'Thank you for supporting Bali Future',
      text: `Thank you for your $${amt} donation to Bali Future!`,
    });

    await sendWithFallback(resend, 'donation admin notify', {
      from: FROM,
      to: ADMIN,
      subject: 'New donation received',
      text: `New donation received: $${amt} from ${donorName}`,
    });
    return;
  }

  if (payload.kind === 'volunteer') {
    const to = String(payload.email ?? '').trim();
    if (!to) {
      throw new Error('email is required');
    }

    const lines = [
      `Name: ${payload.full_name}`,
      `Email: ${payload.email}`,
      `Phone: ${payload.phone || '—'}`,
      `Country: ${payload.country || '—'}`,
      `Availability: ${payload.availability || '—'}`,
      `Skills: ${payload.skills || '—'}`,
      `Message: ${payload.message || '—'}`,
    ].join('\n');

    await sendWithFallback(resend, 'volunteer confirmation', {
      from: FROM,
      to,
      subject: 'We received your volunteer application — Bali Future',
      text:
        "Thank you for applying to volunteer with Bali Future! We've received your application and will be in touch within 48 hours.",
    });

    await sendWithFallback(resend, 'volunteer admin notify', {
      from: FROM,
      to: ADMIN,
      subject: `New volunteer application: ${payload.full_name}`,
      text: `New volunteer application:\n\n${lines}`,
    });
    return;
  }

  if (payload.kind === 'newsletter') {
    const subscriberEmail = String(payload.email ?? '').trim();
    if (!subscriberEmail) {
      throw new Error('email is required');
    }
    const text = `New newsletter subscriber: ${subscriberEmail}`;
    await sendWithFallback(resend, 'newsletter admin notify', {
      from: FROM,
      to: ADMIN,
      subject: 'New newsletter subscriber',
      text,
    });
    return;
  }

  throw new Error('Unknown notification kind');
}
