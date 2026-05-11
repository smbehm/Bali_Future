/** Human-readable Supabase / PostgREST error for UI. */
export function formatPostgrestLikeError(err: unknown): string {
  if (err && typeof err === 'object') {
    const e = err as {
      message?: string;
      details?: string;
      hint?: string;
      code?: string;
    };
    const parts = [
      e.message,
      e.details,
      e.hint,
      e.code ? `code: ${e.code}` : '',
    ].filter((s): s is string => Boolean(s && String(s).trim()));
    if (parts.length) return parts.join(' — ');
  }
  return 'Something went wrong. Check your connection and try again.';
}
