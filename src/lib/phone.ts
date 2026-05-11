/** Normalize to digits-only international form for validation (typically 10–15 digits). */
export function normalizeInternationalPhoneDigits(raw: string): string | null {
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

export function isValidContactPhone(raw: string): boolean {
  return normalizeInternationalPhoneDigits(raw) !== null;
}
