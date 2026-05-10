/** Digits-only international number for https://wa.me/<digits> (no +). */
export function normalizePhoneForWhatsApp(raw: string): string | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;

  let digits = trimmed.replace(/\D/g, '');
  if (digits.startsWith('00')) {
    digits = digits.slice(2);
  }

  if (digits.length === 10) {
    digits = `1${digits}`;
  }

  if (digits.length < 10 || digits.length > 15) {
    return null;
  }

  return digits;
}

export function isValidPhoneForWhatsApp(raw: string): boolean {
  return normalizePhoneForWhatsApp(raw) !== null;
}
