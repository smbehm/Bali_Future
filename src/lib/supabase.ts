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

const supabaseUrl = readViteEnv('VITE_SUPABASE_URL');
const supabaseAnonKey = readViteEnv('VITE_SUPABASE_ANON_KEY');

if (!supabaseUrl || !supabaseAnonKey) {
  console.error(
    '[Supabase] VITE_SUPABASE_URL and/or VITE_SUPABASE_ANON_KEY is missing or empty after trim(). ' +
      'Vite only exposes variables prefixed with VITE_; they must be set before `vite build` (e.g. Vercel project env).',
  );
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
