import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { validateSuite } from '../scripts/validate-suite.mjs';
import { rosterNames, verifySuiteFiles } from '../scripts/suite-policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('the repository is one valid flat-peer skill release', () => {
  assert.deepEqual(validateSuite(root), []);
});

test('a partial flat installation blocks every operation', () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'threadwave-skill-test-'));
  const suite = JSON.parse(fs.readFileSync(path.join(root, 'suite-manifest.json'), 'utf8'));
  const releaseIndex = JSON.parse(fs.readFileSync(path.join(root, 'release-index.json'), 'utf8'));
  for (const skill of suite.required_skills.filter((item) => item.name !== releaseIndex.roles.update)) {
    for (const relative of [skill.path, skill.manifest_path]) {
      const destination = path.join(temporaryRoot, relative);
      fs.mkdirSync(path.dirname(destination), { recursive: true });
      fs.copyFileSync(path.join(root, relative), destination);
    }
  }
  const problems = verifySuiteFiles(temporaryRoot, suite, releaseIndex);
  assert.ok(problems.includes(`missing_skill:${releaseIndex.roles.update}`));
});

test('every roster skill is a flat peer with its own version matching the release index', () => {
  const suite = JSON.parse(fs.readFileSync(path.join(root, 'suite-manifest.json'), 'utf8'));
  const releaseIndex = JSON.parse(fs.readFileSync(path.join(root, 'release-index.json'), 'utf8'));
  assert.deepEqual(rosterNames(suite), releaseIndex.required_skills.map((skill) => skill.name));
  for (const skill of suite.required_skills) {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, skill.manifest_path), 'utf8'));
    assert.equal(manifest.version, releaseIndex.required_skills.find((entry) => entry.name === skill.name).latest_version);
    assert.equal(fs.existsSync(path.join(root, skill.manifest_path)), true);
    const content = fs.readFileSync(path.join(root, skill.path), 'utf8');
    assert.doesNotMatch(content, /\.\.\//);
  }
});

test('preflight and update each have one non-overlapping authority', () => {
  const releaseIndex = JSON.parse(fs.readFileSync(path.join(root, 'release-index.json'), 'utf8'));
  const preflight = fs.readFileSync(path.join(root, 'skills', releaseIndex.roles.preflight, 'SKILL.md'), 'utf8');
  const update = fs.readFileSync(path.join(root, 'skills', releaseIndex.roles.update, 'SKILL.md'), 'utf8');
  assert.match(preflight, /threadwave-preflight -> threadwave-update/);
  assert.match(preflight, /references\/preflight-contract\.md/);
  assert.match(preflight, /references\/issue-report-contract\.md/);
  assert.match(update, /release-index\.json/);
  assert.match(update, /Never invoke `tw`/);
  assert.equal(fs.existsSync(path.join(root, 'skills', releaseIndex.roles.preflight, 'scripts')), false);
  assert.equal(fs.existsSync(path.join(root, 'skills', releaseIndex.roles.update, 'scripts')), false);
  assert.equal(fs.existsSync(path.join(root, 'references', 'preflight-contract.md')), false);
});

test('missing skill, CLI, or extension routes to the canonical setup guide', () => {
  const suite = JSON.parse(fs.readFileSync(path.join(root, 'suite-manifest.json'), 'utf8'));
  assert.equal(suite.setup_route.agent_guide_url, 'https://www.threadwave.xyz/cli/setup/agent.md');
  assert.deepEqual(suite.setup_route.handles_missing, ['skill_suite', 'cli', 'extension']);
  for (const skill of suite.required_skills) {
    const content = fs.readFileSync(path.join(root, skill.path), 'utf8');
    assert.match(content, /https:\/\/www\.threadwave\.xyz\/cli\/setup\/agent\.md/);
  }
  assert.equal(fs.existsSync(path.join(root, 'skills', 'twitter-cli-setup', 'SKILL.md')), false);
});
