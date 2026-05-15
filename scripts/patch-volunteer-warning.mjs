import { readFileSync, writeFileSync } from 'node:fs';

const path = 'src/sections/Volunteer.tsx';
const c = readFileSync(path, 'utf8');
const insert = `              {submitWarning ? (
                <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
                  {submitWarning}
                </p>
              ) : null}
`;
const out = c.replace(
  /(Your application is in our hands\. We will be in touch within 48 hours to start your journey together\.<\/p>\r?\n)(            <\/div>)/,
  `$1${insert}$2`,
);
if (out === c) {
  console.error('patch did not apply');
  process.exit(1);
}
writeFileSync(path, out);
console.log('patched Volunteer submitWarning UI');
