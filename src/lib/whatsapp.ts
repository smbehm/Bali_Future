import { normalizePhoneForWhatsApp } from './phone';

/** Organization WhatsApp (E.164 without +): +1 415 717 0016 */
export const BALI_FUTURE_WHATSAPP_DIGITS = '14157170016';

export function buildWaMeUrl(phoneDigits: string, message: string): string {
  const text = encodeURIComponent(message);
  return `https://wa.me/${phoneDigits}?text=${text}`;
}

/**
 * Opens one or more wa.me links. First opens in the same user-gesture tick (better for mobile);
 * additional chats are staggered so pop-up blockers are less likely to block everything.
 */
export function openWhatsAppChatsFromUserGesture(urls: string[]): void {
  if (urls.length === 0) return;

  const first = urls[0];
  window.open(first, '_blank', 'noopener,noreferrer');

  for (let i = 1; i < urls.length; i += 1) {
    const url = urls[i];
    window.setTimeout(() => {
      window.open(url, '_blank', 'noopener,noreferrer');
    }, 380 * i);
  }
}

export function donationOrgWhatsAppMessage(params: {
  donorName: string;
  donorEmail: string;
  donorPhone: string;
  amount: number;
  donationTypeLabel: string;
  categoryLabel: string;
  timestamp: string;
}): string {
  return [
    'New donation — Bali Future',
    '',
    `Name: ${params.donorName}`,
    `Email: ${params.donorEmail}`,
    `Phone: ${params.donorPhone}`,
    `Amount: $${params.amount}`,
    `Type: ${params.donationTypeLabel}`,
    `Category: ${params.categoryLabel}`,
    `Submitted: ${params.timestamp}`,
  ].join('\n');
}

export function donationDonorConfirmationMessage(amount: number): string {
  return `Thank you for supporting Bali Future. Your $${amount} donation helps children receive education, food, and care.`;
}

export function volunteerOrgWhatsAppMessage(params: {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  availability: string;
  skills: string;
  message: string;
  timestamp: string;
}): string {
  return [
    'New volunteer application — Bali Future',
    '',
    `Name: ${params.fullName}`,
    `Email: ${params.email}`,
    `Phone: ${params.phone || '—'}`,
    `Country: ${params.country || '—'}`,
    `Availability: ${params.availability || '—'}`,
    `Skills: ${params.skills || '—'}`,
    `Message: ${params.message || '—'}`,
    `Submitted: ${params.timestamp}`,
  ].join('\n');
}

export function volunteerApplicantConfirmationMessage(name: string): string {
  return `Hi ${name}, thank you for applying to volunteer with Bali Future! We've received your application and will follow up soon.`;
}

export function buildDonationWhatsAppUrls(params: {
  donorPhoneRaw: string;
  orgMessage: string;
  donorConfirmationMessage: string;
}): string[] {
  const donorDigits = normalizePhoneForWhatsApp(params.donorPhoneRaw);
  const orgUrl = buildWaMeUrl(BALI_FUTURE_WHATSAPP_DIGITS, params.orgMessage);

  if (!donorDigits) {
    return [orgUrl];
  }

  const selfUrl = buildWaMeUrl(donorDigits, params.donorConfirmationMessage);
  return [orgUrl, selfUrl];
}

export function buildVolunteerWhatsAppUrls(params: {
  applicantPhoneRaw: string;
  orgMessage: string;
  applicantConfirmationMessage: string;
}): string[] {
  const applicantDigits = normalizePhoneForWhatsApp(params.applicantPhoneRaw);
  const orgUrl = buildWaMeUrl(BALI_FUTURE_WHATSAPP_DIGITS, params.orgMessage);

  if (!applicantDigits) {
    return [orgUrl];
  }

  const selfUrl = buildWaMeUrl(applicantDigits, params.applicantConfirmationMessage);
  return [orgUrl, selfUrl];
}
