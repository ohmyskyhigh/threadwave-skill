import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { buildReleaseArtifacts } from '../scripts/build-release-artifacts.mjs';
import { setSkillVersion } from '../scripts/set-skill-version.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const releaseIndex = readJson('release-index.json');
const suite = readJson('suite-manifest.json');
const roster = releaseIndex.required_skills.map((entry) => entry.name);

function readJson(relative) {
  return JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
}

test('artifact builds stage the candidate index without changing the public index', (t) => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'threadwave-skill-release-'));
  t.after(() => fs.rmSync(fixture, { recursive: true, force: true }));
  const oldIndex = {
    schema_version: 'threadwave-skill-release-index-v2',
    bundle_version: '0.1.0',
    required_skills: [],
  };
  fs.writeFileSync(path.join(fixture, 'release-index.json'), `${JSON.stringify(oldIndex)}\n`);
  const roster = [
    { name: 'preflight', role: 'preflight' },
    { name: 'update', role: 'update' },
    { name: 'support', role: 'support' },
  ];
  fs.writeFileSync(path.join(fixture, 'suite-manifest.json'), `${JSON.stringify({
    bundle_version: '0.2.0',
    agent_skills_installer: { package: 'skills', version: '1.5.18', registry: 'https://registry.npmjs.org' },
    required_skills: roster.map(({ name }) => ({ name, manifest_path: `skills/${name}/skill-manifest.json` })),
  })}\n`);
  for (const skill of roster) {
    const directory = path.join(fixture, 'skills', skill.name);
    fs.mkdirSync(directory, { recursive: true });
    fs.writeFileSync(path.join(directory, 'SKILL.md'), `# ${skill.name}\n`);
    fs.writeFileSync(path.join(directory, 'skill-manifest.json'), `${JSON.stringify({
      name: skill.name,
      version: '0.2.0',
      role: skill.role,
    })}\n`);
  }

  const first = buildReleaseArtifacts(fixture);
  const firstIndex = readFixtureJson(fixture, 'dist/release-index.candidate.json');
  const artifact = path.join(fixture, first.artifacts[0]);
  const firstBytes = fs.readFileSync(artifact);
  const skillFile = path.join(fixture, 'skills', 'preflight', 'SKILL.md');
  fs.chmodSync(skillFile, 0o600);
  fs.utimesSync(skillFile, new Date('2025-01-01T00:00:00Z'), new Date('2025-01-01T00:00:00Z'));
  buildReleaseArtifacts(fixture);

  assert.deepEqual(JSON.parse(fs.readFileSync(path.join(fixture, 'release-index.json'), 'utf8')), oldIndex);
  assert.deepEqual(readFixtureJson(fixture, 'dist/release-index.candidate.json'), firstIndex);
  assert.deepEqual(fs.readFileSync(artifact), firstBytes);
  assert.equal(firstIndex.bundle_version, '0.2.0');
});

function readFixtureJson(fixture, relative) {
  return JSON.parse(fs.readFileSync(path.join(fixture, relative), 'utf8'));
}

test('v3 candidate is atomic and leaves the published legacy roster intact', (t) => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'tw-candidate-'));
  t.after(() => fs.rmSync(fixture, { recursive: true, force: true }));
  for (const name of ['skills', '.codex-plugin', 'package.json', 'suite-manifest.json', 'schemas', 'scripts', 'release-index.json']) fs.cpSync(path.join(root, name), path.join(fixture, name), { recursive: true });
  const before = fs.readFileSync(path.join(fixture, 'release-index.json'));
  const result = buildReleaseArtifacts(fixture);
  assert.equal(result.index.schema_version, 'threadwave-skill-release-index-v3');
  assert.equal(result.index.roles, undefined);
  assert.deepEqual(result.index.required_skills.map((entry) => entry.name), ['threadwave']);
  assert.equal(result.index.required_skills[0].latest_version, suite.bundle_version);
  assert.deepEqual(readFixtureJson(fixture, 'dist/plugin-candidate/release-index.json'), result.index);
  assert.deepEqual(fs.readFileSync(path.join(fixture, 'release-index.json')), before);
  const bytes = fs.readFileSync(path.join(fixture, result.artifacts[0]));
  buildReleaseArtifacts(fixture);
  assert.deepEqual(fs.readFileSync(path.join(fixture, result.artifacts[0])), bytes);
  setSkillVersion(fixture, 'threadwave', '0.8.0');
  for (const name of ['skills/threadwave/skill-manifest.json', 'package.json', '.codex-plugin/plugin.json']) assert.equal(readFixtureJson(fixture, name).version, '0.8.0');
  assert.equal(readFixtureJson(fixture, 'suite-manifest.json').bundle_version, '0.8.0');
  assert.deepEqual(fs.readFileSync(path.join(fixture, 'release-index.json')), before);
  assert.throws(() => setSkillVersion(fixture, 'twitter-agent', '0.9.0'), /only_threadwave/);
});

test('notification handler is advisory and scopes installation to explicit authorization', () => {
  const text = fs.readFileSync(path.join(root, 'skills/threadwave/references/notifications/update-available.md'), 'utf8');
  assert.match(text, /once|one short localized reminder/);
  assert.match(text, /No prompt, forced choice, installation, network lookup/);
  assert.match(text, /skills_only, cli_only or skills_and_cli/);
  assert.match(text, /No installation backups/);
  assert.match(text, /Unlink symlinks without deleting their targets/);
  assert.match(text, /Do not rerun mutation commands or replay approvals/);
});

// Inspect actual archive contents; matching source filenames alone is insufficient.
test('individual and complete plugin archives expose only the single entry and matching index', (t) => {
  const fixture = fs.mkdtempSync(path.join(os.tmpdir(), 'tw-archive-check-'));
  t.after(() => fs.rmSync(fixture, { recursive: true, force: true }));
  for (const name of ['skills', '.codex-plugin', 'package.json', 'suite-manifest.json', 'schemas', 'scripts', 'release-index.json']) fs.cpSync(path.join(root, name), path.join(fixture, name), { recursive: true });
  const result = buildReleaseArtifacts(fixture);
  const archive = path.join(fixture, result.artifacts[0]);
  const hash = createHash('sha256').update(fs.readFileSync(archive)).digest('hex');
  assert.equal(hash, result.index.required_skills[0].sha256);
  const individual = execFileSync('tar', ['-tzf', archive], { encoding: 'utf8' }).trim().split('\n');
  assert.deepEqual(individual.filter((name) => name.endsWith('/SKILL.md')), ['threadwave/SKILL.md']);
  assert.equal(individual.some((name) => name.includes('daily-run') || name.includes('twitter-agent')), false);
  const packed = JSON.parse(execFileSync('npm', ['pack', './dist/plugin-candidate', '--pack-destination', 'dist', '--json', '--ignore-scripts'], { cwd: fixture, encoding: 'utf8' }))[0];
  const bundle = path.join(fixture, 'dist', packed.filename);
  const complete = execFileSync('tar', ['-tzf', bundle], { encoding: 'utf8' }).trim().split('\n');
  assert.deepEqual(complete.filter((name) => name.endsWith('/SKILL.md')), ['package/skills/threadwave/SKILL.md']);
  const index = JSON.parse(execFileSync('tar', ['-xOzf', bundle, 'package/release-index.json'], { encoding: 'utf8' }));
  assert.deepEqual(index, result.index);
});
