/**
 * Local verification: same Supabase inserts as the app (no browser).
 * Reads VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY from .env.local only.
 * Does not print secrets.
 */
import { readFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createClient } from '@supabase/supabase-js';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');

function loadSupabaseFromEnvLocal() {
  const p = join(root, '.env.local');
  if (!existsSync(p)) {
    throw new Error('Missing .env.local — add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to run this check.');
  }
  const raw = readFileSync(p, 'utf8');
  let url = '';
  let key = '';
  for (const line of raw.split('\n')) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith('#')) continue;
    const eq = trimmed.indexOf('=');
    if (eq === -1) continue;
    const name = trimmed.slice(0, eq).trim();
    let val = trimmed.slice(eq + 1).trim();
    if (
      (val.startsWith('"') && val.endsWith('"')) ||
      (val.startsWith("'") && val.endsWith("'"))
    ) {
      val = val.slice(1, -1);
    }
    if (name === 'VITE_SUPABASE_URL') url = val;
    if (name === 'VITE_SUPABASE_ANON_KEY') key = val;
  }
  if (!url || !key) {
    throw new Error('.env.local must define VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY');
  }
  return { url, key };
}

const tag = `local-verify-${Date.now()}`;
const email = `${tag}@example.invalid`;

const { url, key } = loadSupabaseFromEnvLocal();
const supabase = createClient(url, key);

const donationRow = {
  donor_name: 'Local E2E',
  donor_email: email,
  amount: 1,
  type: 'one_time',
  category: 'general',
  message: 'scripts/verify-supabase-forms.mjs',
  is_anonymous: false,
};

const volunteerRow = {
  full_name: 'Local E2E',
  email,
  phone: '',
  country: '',
  skills: '',
  availability: '',
  message: 'scripts/verify-supabase-forms.mjs',
};

const d = await supabase.from('donations').insert(donationRow);
const v = await supabase.from('volunteers').insert(volunteerRow);
const n = await supabase.from('newsletter_subscribers').insert({ email });

const rows = [
  { table: 'donations', error: d.error },
  { table: 'volunteers', error: v.error },
  { table: 'newsletter_subscribers', error: n.error },
];

let failed = false;
for (const { table, error } of rows) {
  if (error) {
    failed = true;
    console.error(`FAIL ${table}:`, error.message ?? error);
  } else {
    console.log(`OK   ${table}`);
  }
}

if (failed) process.exit(1);
console.log('All three inserts succeeded (same API as localhost forms).');
