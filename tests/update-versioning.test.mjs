import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { checkUpdates, REQUIRED_SKILLS } from '../skills/threadwave-update/scripts/check-updates.mjs';
import { setSkillVersion } from '../scripts/set-skill-version.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const releaseIndex = JSON.parse(fs.readFileSync(path.join(root, 'release-index.json'), 'utf8'));

function successfulFetch(counter = { calls: 0 }) {
  return async () => {
    counter.calls += 1;
    return { ok: true, status: 200, json: async () => structuredClone(releaseIndex) };
  };
}

function materializeFlatSkills() {
  const skillsRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'threadwave-flat-skills-'));
  for (const name of REQUIRED_SKILLS) {
    const source = path.join(root, 'skills', name);
    const destination = path.join(skillsRoot, name);
    fs.mkdirSync(destination, { recursive: true });
    fs.copyFileSync(path.join(source, 'SKILL.md'), path.join(destination, 'SKILL.md'));
    fs.copyFileSync(path.join(source, 'skill-manifest.json'), path.join(destination, 'skill-manifest.json'));
  }
  return skillsRoot;
}

test('one GitHub index read confirms six independent current versions', async () => {
  const counter = { calls: 0 };
  const result = await checkUpdates({
    updateSkillRoot: path.join(root, 'skills', 'threadwave-update'),
    fetchImpl: successfulFetch(counter)
  });
  assert.equal(counter.calls, 1);
  assert.equal(result.ok, true);
  assert.equal(result.latest_confirmed, true);
  assert.equal(result.skills.length, 6);
  assert.ok(result.skills.every((skill) => skill.state === 'current'));
});

test('an independently outdated operation skill blocks with its local and latest versions', async () => {
  const skillsRoot = materializeFlatSkills();
  const manifestPath = path.join(skillsRoot, 'twitter-agent', 'skill-manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  manifest.version = '0.3.9';
  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  const result = await checkUpdates({
    updateSkillRoot: path.join(skillsRoot, 'threadwave-update'),
    fetchImpl: successfulFetch()
  });
  assert.equal(result.ok, false);
  assert.equal(result.state, 'update_required');
  assert.ok(result.failures.includes('skill_update_required:twitter-agent'));
  assert.deepEqual(result.skills.find((skill) => skill.name === 'twitter-agent'), {
    name: 'twitter-agent',
    local_version: '0.3.9',
    latest_version: '0.4.0',
    state: 'update_required'
  });
});

test('missing peers and an unavailable GitHub index never report ready or latest', async () => {
  const skillsRoot = materializeFlatSkills();
  fs.rmSync(path.join(skillsRoot, 'twitter-reply'), { recursive: true });
  const result = await checkUpdates({
    updateSkillRoot: path.join(skillsRoot, 'threadwave-update'),
    fetchImpl: async () => { throw new Error('offline'); }
  });
  assert.equal(result.ok, false);
  assert.equal(result.latest_confirmed, false);
  assert.ok(result.failures.includes('missing_skill:twitter-reply'));
  assert.ok(result.failures.includes('release_index_request_failed'));
});

test('the version command updates only the selected local manifest and release index', () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'threadwave-version-bump-'));
  fs.mkdirSync(path.join(temporaryRoot, 'skills', 'twitter-agent'), { recursive: true });
  fs.copyFileSync(path.join(root, 'release-index.json'), path.join(temporaryRoot, 'release-index.json'));
  fs.copyFileSync(
    path.join(root, 'skills', 'twitter-agent', 'skill-manifest.json'),
    path.join(temporaryRoot, 'skills', 'twitter-agent', 'skill-manifest.json')
  );
  const result = setSkillVersion(temporaryRoot, 'twitter-agent', '0.4.1');
  const manifest = JSON.parse(fs.readFileSync(path.join(temporaryRoot, 'skills', 'twitter-agent', 'skill-manifest.json'), 'utf8'));
  const index = JSON.parse(fs.readFileSync(path.join(temporaryRoot, 'release-index.json'), 'utf8'));
  assert.equal(result.version, '0.4.1');
  assert.equal(manifest.version, '0.4.1');
  assert.equal(index.skills.find((skill) => skill.name === 'twitter-agent').latest_version, '0.4.1');
  assert.equal(index.skills.find((skill) => skill.name === 'twitter-post').latest_version, '0.4.0');
});
