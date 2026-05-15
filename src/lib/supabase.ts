import { createClient } from '@supabase/supabase-js';
import type { PostgrestError } from '@supabase/supabase-js';

/** Human-readable Postgrest/Supabase error for UI + debugging (no secrets). */
export function formatPostgrestError(error: PostgrestError): string {
  return [error.message, error.details, error.hint, error.code ? `code: ${error.code}` : '']
    .filter(Boolean)
    .join(' — ');
}

function readViteEnv(name: 'VITE_SUPABASE_URL' | 'VITE_SUPABASE_ANON_KEY'): string {
  const raw = import.meta.env[name];
  if (raw === undefined || raw === null) return '';
  return String(raw).trim();
}

export const supabaseUrl = readViteEnv('VITE_SUPABASE_URL');
export const supabaseAnonKey = readViteEnv('VITE_SUPABASE_ANON_KEY');

/** True when Vite inlined non-empty Supabase credentials at build time. */
export function isSupabaseConfigured(): boolean {
  return (
    supabaseUrl.length > 0 &&
    supabaseAnonKey.length > 0 &&
    supabaseUrl.startsWith('https://') &&
    supabaseUrl.includes('supabase')
  );
}

export const SUPABASE_CONFIG_ERROR =
  'Form submissions are unavailable: database connection is not configured on this deployment. ' +
  'Ensure VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY are set in Vercel for Production and Preview builds, then redeploy.';

if (!isSupabaseConfigured()) {
  console.error('[Supabase] Client misconfigured at runtime', {
    hasUrl: supabaseUrl.length > 0,
    hasKey: supabaseAnonKey.length > 0,
    urlPrefix: supabaseUrl.slice(0, 30) || '(empty)',
    mode: import.meta.env.MODE,
  });
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
