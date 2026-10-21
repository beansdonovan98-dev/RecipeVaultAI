import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { THEME_OPTIONS } from '../constants/themes.ts';
import { FONT_OPTIONS } from '../constants/appearance.ts';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

/**
 * PostgreSQL's POSIX regex implementation caps repetition counts at 255.
 * A pattern like {1,400} fails at runtime with "invalid repetition count(s)",
 * which is easy to miss because it only fires when that branch runs.
 */
const REPETITION = /\{(\d+)(?:,(\d*))?\}/g;

for (const file of ['supabase/schema.sql', 'supabase/settings.sql', 'supabase/presence.sql']) {
  test(`${file} uses only valid regex repetition counts`, () => {
    const sql = readFileSync(join(ROOT, file), 'utf8');
    for (const match of sql.matchAll(REPETITION)) {
      const upper = match[2] === undefined || match[2] === '' ? Number(match[1]) : Number(match[2]);
      assert.ok(upper <= 255, `${file} contains {${match[0].slice(1, -1)}}; PostgreSQL allows at most 255`);
    }
  });
}

function sharedAllowlist(sql, key) {
  const match = sql.match(new RegExp(`v_key = '${key}' and v_value not in \\(([^)]*)\\)`));
  if (!match) {
    return null;
  }
  return new Set([...match[1].matchAll(/'([^']+)'/g)].map((entry) => entry[1]));
}

/**
 * The room rejects any value the SQL allowlist does not know about. Keep the
 * app's option lists and the shared-settings function in lockstep.
 */
for (const file of ['supabase/schema.sql', 'supabase/settings.sql']) {
  test(`${file} accepts every theme and font option`, () => {
    const sql = readFileSync(join(ROOT, file), 'utf8');

    const themes = sharedAllowlist(sql, 'app_theme_key');
    assert.ok(themes, `${file} is missing the app_theme_key allowlist`);
    for (const option of THEME_OPTIONS) {
      assert.ok(themes.has(option.id), `${file} rejects theme "${option.id}"`);
    }

    const fonts = sharedAllowlist(sql, 'app_font_key');
    assert.ok(fonts, `${file} is missing the app_font_key allowlist`);
    for (const option of FONT_OPTIONS) {
      assert.ok(fonts.has(option.id), `${file} rejects font "${option.id}"`);
    }
  });
}
