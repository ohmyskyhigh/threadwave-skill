import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { validateSuite } from '../scripts/validate-suite.mjs';
import { verifySuiteFiles } from '../scripts/suite-policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('the repository is one valid four-skill suite', () => {
  assert.deepEqual(validateSuite(root), []);
});

test('a partial installation blocks the entire suite', () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'threadwave-skill-test-'));
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'suite-manifest.json'), 'utf8'));
  for (const skill of manifest.required_skills.filter((item) => item.name !== 'twitter-reply')) {
    const destination = path.join(temporaryRoot, skill.path);
    fs.mkdirSync(path.dirname(destination), { recursive: true });
    fs.copyFileSync(path.join(root, skill.path), destination);
  }
  const problems = verifySuiteFiles(temporaryRoot, manifest);
  assert.ok(problems.includes('missing_skill:twitter-reply'));
});

test('public skill identifiers are generic and SEO-readable', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'suite-manifest.json'), 'utf8'));
  assert.deepEqual(manifest.required_skills.map((skill) => skill.name), [
    'twitter-automation',
    'twitter-agent',
    'twitter-post',
    'twitter-reply'
  ]);
  assert.ok(manifest.required_skills.every((skill) => !skill.name.includes('threadwave')));
});

test('missing skill suite, tw, or extension routes to the canonical agent setup guide', () => {
  const manifest = JSON.parse(fs.readFileSync(path.join(root, 'suite-manifest.json'), 'utf8'));
  assert.equal(manifest.cli.missing_cli_setup_url, 'https://www.threadwave.xyz/cli/setup/agent.md');
  assert.deepEqual(manifest.setup_route, {
    owner: 'web_setup_guide',
    url: 'https://www.threadwave.xyz/cli/setup/agent.md',
    human_url: 'https://www.threadwave.xyz/cli/setup',
    agent_guide_url: 'https://www.threadwave.xyz/cli/setup/agent.md',
    installed_skill: false,
    handles_missing: ['skill_suite', 'cli', 'extension'],
    requires_user_action: true,
    resume_check: 'tw setup --dry-run --format json'
  });
  const preflight = fs.readFileSync(path.join(root, 'references', 'preflight-contract.md'), 'utf8');
  assert.match(preflight, /required skill file is missing[\s\S]*https:\/\/www\.threadwave\.xyz\/cli\/setup\/agent\.md/);
  assert.match(preflight, /If missing,[\s\S]*https:\/\/www\.threadwave\.xyz\/cli\/setup\/agent\.md/);
  assert.match(preflight, /identifies the Chrome extension as missing[\s\S]*https:\/\/www\.threadwave\.xyz\/cli\/setup\/agent\.md/);
  assert.doesNotMatch(preflight, /cos\.accelerate|release_manifest_url|manual_extension_fallback/);

  assert.equal(fs.existsSync(path.join(root, 'skills', 'twitter-cli-setup', 'SKILL.md')), false);
  assert.match(preflight, /not a locally installed `twitter-cli-setup` skill/);

  for (const skill of manifest.required_skills) {
    const content = fs.readFileSync(path.join(root, skill.path), 'utf8');
    assert.match(content, /https:\/\/www\.threadwave\.xyz\/cli\/setup\/agent\.md/);
  }
});
