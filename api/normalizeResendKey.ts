/**
 * Resend keys are often broken by Vercel/UI copy-paste: wrapped in quotes, "Bearer " prefix,
 * line breaks, or BOM. Resend returns HTTP 401 for a malformed or wrong key.
 */
export function normalizeResendApiKey(raw: string | undefined): string {
  if (raw === undefined || raw === null) return '';
  let s = String(raw).trim().replace(/^\uFEFF/, '');
  // Strip wrapping quotes (single pass each end; repeat for nested quotes)
  for (let i = 0; i < 2; i++) {
    s = s.replace(/^["']+|["']+$/g, '');
  }
  if (s.toLowerCase().startsWith('bearer ')) {
    s = s.slice(7).trim();
  }
  s = s.replace(/\s+/g, '');
  // Vercel / copy-paste artifacts
  s = s.replace(/^resend_api_key=/i, '');
  return s;
}
