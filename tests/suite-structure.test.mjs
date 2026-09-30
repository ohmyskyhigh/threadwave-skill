import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { validateSuite } from '../scripts/validate-suite.mjs';
import { buildReleaseArtifacts } from '../scripts/build-release-artifacts.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const entry = fs.readFileSync(path.join(root, 'skills/threadwave/SKILL.md'), 'utf8');

test('source has one discoverable entry with complete local resources', () => {
  assert.deepEqual(validateSuite(root), []);
  assert.deepEqual(fs.readdirSync(path.join(root, 'skills')), ['threadwave']);
  assert.match(entry, /Daily planning, strategy and daily-growth automation are unavailable/);
  assert.match(entry, /one `tw credits --format json` greeting lookup/);
  assert.match(entry, /No preflight, capability probe, setup, login, browser navigation or task creation merely to show home/);
  assert.equal((entry.match(/^█████/gm) ?? []).length, 1);
  assert.match(entry, /Choose 1–3 or A–G/);
  assert.match(entry, /D asks only for the missing account; F only for missing product\/audience\/benefit/);
});

test('validation rejects extra entries, missing resources and stale candidate identity', (t) => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'tw-single-validation-'));
  t.after(() => fs.rmSync(fixture, { recursive: true, force: true }));
  for (const name of ['skills', '.codex-plugin', 'package.json', 'suite-manifest.json', 'schemas', 'scripts', 'release-index.json']) fs.cpSync(path.join(root, name), path.join(fixture, name), { recursive: true });
  const candidate = buildReleaseArtifacts(fixture).index;
  assert.deepEqual(validateSuite(fixture, candidate), []);
  candidate.bundle_version = '999.0.0';
  assert.ok(validateSuite(fixture, candidate).includes('candidate_identity'));
  fs.mkdirSync(path.join(fixture, 'skills/extra'));
  fs.writeFileSync(path.join(fixture, 'skills/extra/SKILL.md'), '# extra');
  fs.rmSync(path.join(fixture, 'skills/threadwave/references/snapshot.md'));
  const errors = validateSuite(fixture);
  assert.ok(errors.includes('discoverable_entry_count'));
  assert.ok(errors.includes('missing_resource:snapshot.md'));
});
