import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
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

test('the v2 release index is the complete runtime roster and independent version authority', () => {
  assert.equal(releaseIndex.schema_version, 'threadwave-skill-release-index-v2');
  assert.equal(releaseIndex.bundle_version, suite.bundle_version);
  assert.deepEqual(releaseIndex.agent_skills_installer, suite.agent_skills_installer);
  assert.equal(releaseIndex.agent_skills_installer.package, 'skills');
  assert.match(releaseIndex.agent_skills_installer.version, /^\d+\.\d+\.\d+$/);
  assert.equal(releaseIndex.agent_skills_installer.registry, 'https://registry.npmjs.org');
  assert.deepEqual(roster, suite.required_skills.map((entry) => entry.name));
  assert.ok(roster.includes(releaseIndex.roles.preflight));
  assert.ok(roster.includes(releaseIndex.roles.update));
  assert.ok(roster.includes(releaseIndex.roles.support));

  for (const entry of releaseIndex.required_skills) {
    const declaration = suite.required_skills.find((skill) => skill.name === entry.name);
    const manifest = readJson(declaration.manifest_path);
    assert.equal(manifest.version, entry.latest_version);
    assert.match(entry.minimum_supported_version, /^\d+\.\d+\.\d+$/);
    assert.match(entry.artifact_url, new RegExp(`/suite-v${suite.bundle_version}/${entry.name}-${entry.latest_version}\\.tgz$`));
    assert.match(entry.sha256, /^[0-9a-f]{64}$/);
  }
});

test('the installed update skill is agent-native and has no bundled runtime checker', () => {
  const updateRoot = path.join(root, 'skills', releaseIndex.roles.update);
  const skill = fs.readFileSync(path.join(updateRoot, 'SKILL.md'), 'utf8');
  assert.match(skill, /curl -fsSL --max-time 30/);
  assert.match(skill, /Invoke-WebRequest -UseBasicParsing/);
  assert.match(skill, /skill catalog and file-read capability/);
  assert.match(skill, /cache_bust=\$\(date -u \+%s\)000/);
  assert.match(skill, /\[DateTimeOffset\]'1970-01-01T00:00:00Z'/);
  assert.doesNotMatch(skill, /ToUnixTimeMilliseconds/);
  assert.match(skill, /Web search, browser search, URL-read, Firecrawl, crawl, scrape/);
  assert.match(skill, /Never fetch the unversioned base URL/);
  assert.match(skill, /twitter_skill_update_unconfirmed/);
  assert.equal(fs.existsSync(path.join(updateRoot, 'scripts')), false);
});

test('the update contract refuses to guess when remote or local reads are unavailable', () => {
  const skill = fs.readFileSync(path.join(root, 'skills', releaseIndex.roles.update, 'SKILL.md'), 'utf8');
  assert.match(skill, /If process execution, `curl` on macOS\/Linux, `Invoke-WebRequest` on Windows, or local skill\/file-read capability is unavailable/);
  assert.match(skill, /Never substitute a guessed command, runtime, path, web tool, or cached memory of the roster/);
  assert.match(skill, /Release index unavailable or invalid: return `twitter_skill_update_unconfirmed`/);
});

test('the version command updates only the selected local manifest and release index', () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'threadwave-version-bump-'));
  fs.mkdirSync(path.join(temporaryRoot, 'skills', 'twitter-agent'), { recursive: true });
  fs.copyFileSync(path.join(root, 'release-index.json'), path.join(temporaryRoot, 'release-index.json'));
  fs.copyFileSync(
    path.join(root, 'skills', 'twitter-agent', 'skill-manifest.json'),
    path.join(temporaryRoot, 'skills', 'twitter-agent', 'skill-manifest.json')
  );
  const agent = releaseIndex.required_skills.find((skill) => skill.name === 'twitter-agent');
  const post = releaseIndex.required_skills.find((skill) => skill.name === 'twitter-post');
  const [major, minor, patch] = agent.latest_version.split('.').map(Number);
  const nextVersion = `${major}.${minor}.${patch + 1}`;
  const result = setSkillVersion(temporaryRoot, 'twitter-agent', nextVersion);
  const manifest = JSON.parse(fs.readFileSync(path.join(temporaryRoot, 'skills', 'twitter-agent', 'skill-manifest.json'), 'utf8'));
  const index = JSON.parse(fs.readFileSync(path.join(temporaryRoot, 'release-index.json'), 'utf8'));
  assert.equal(result.version, nextVersion);
  assert.equal(manifest.version, nextVersion);
  assert.equal(index.required_skills.find((skill) => skill.name === 'twitter-agent').latest_version, nextVersion);
  assert.equal(index.required_skills.find((skill) => skill.name === 'twitter-post').latest_version, post.latest_version);
});
