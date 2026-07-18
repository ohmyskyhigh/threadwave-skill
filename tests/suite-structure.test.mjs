import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { validateSuite } from '../scripts/validate-suite.mjs';
import { operationSkillNames, rosterNames, verifySuiteFiles } from '../scripts/suite-policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const suite = JSON.parse(fs.readFileSync(path.join(root, 'suite-manifest.json'), 'utf8'));
const releaseIndex = JSON.parse(fs.readFileSync(path.join(root, 'release-index.json'), 'utf8'));

test('the repository is one valid flat-peer skill release', () => {
  assert.deepEqual(validateSuite(root), []);
});

test('a partial flat installation blocks every operation', () => {
  const temporaryRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'threadwave-skill-test-'));
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
  assert.deepEqual(rosterNames(suite), releaseIndex.required_skills.map((skill) => skill.name));
  for (const skill of suite.required_skills) {
    const manifest = JSON.parse(fs.readFileSync(path.join(root, skill.manifest_path), 'utf8'));
    assert.equal(manifest.version, releaseIndex.required_skills.find((entry) => entry.name === skill.name).latest_version);
    assert.equal(fs.existsSync(path.join(root, skill.manifest_path)), true);
    assert.equal(skill.path, `skills/${skill.name}/SKILL.md`);
    assert.equal(skill.manifest_path, `skills/${skill.name}/skill-manifest.json`);
    assert.equal(fs.existsSync(path.join(root, 'skills', skill.name, 'scripts')), false);
    const content = fs.readFileSync(path.join(root, skill.path), 'utf8');
    assert.doesNotMatch(content, /\.\.\//);
  }
});

test('automation routes to external operation peers without owning or containing them', () => {
  const manifests = new Map(suite.required_skills.map((skill) => [
    skill.name,
    JSON.parse(fs.readFileSync(path.join(root, skill.manifest_path), 'utf8'))
  ]));
  const operationSkills = operationSkillNames(suite, releaseIndex);
  const routers = operationSkills
    .map((skill) => manifests.get(skill))
    .filter((manifest) => manifest.role === 'operation-router');
  assert.equal(routers.length, 1);
  const router = routers[0];
  assert.deepEqual(router.cli.required_commands, []);
  assert.ok(router.cli.required_command_families.every((family) => !['task', 'draft', 'plan', 'scheduler', 'action'].includes(family)));
  assert.equal(fs.existsSync(path.join(root, 'skills', router.name, 'skills')), false);

  for (const peer of operationSkills.filter((skill) => skill !== router.name)) {
    assert.equal(manifests.get(peer).dependencies.required_skills.some((dependency) => dependency.name === router.name), false);
  }
});

test('tweet and reply task surfaces each have one independent owner', () => {
  const operationSkills = operationSkillNames(suite, releaseIndex);
  const contentBySkill = new Map(operationSkills.map((skill) => [
    skill,
    fs.readFileSync(path.join(root, 'skills', skill, 'SKILL.md'), 'utf8')
  ]));
  const tweetOwners = operationSkills.filter((skill) => /tw task create --surface tweet/.test(contentBySkill.get(skill)));
  const replyOwners = operationSkills.filter((skill) => /tw task create --surface reply/.test(contentBySkill.get(skill)));
  assert.equal(tweetOwners.length, 1);
  assert.equal(replyOwners.length, 1);
  assert.notEqual(tweetOwners[0], replyOwners[0]);
});

test('preflight and update each have one non-overlapping authority', () => {
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
  assert.equal(suite.setup_route.agent_guide_url, 'https://www.threadwave.xyz/cli/setup/agent.md');
  assert.deepEqual(suite.setup_route.handles_missing, ['skill_suite', 'cli', 'extension']);
  for (const skill of suite.required_skills) {
    const content = fs.readFileSync(path.join(root, skill.path), 'utf8');
    assert.match(content, /https:\/\/www\.threadwave\.xyz\/cli\/setup\/agent\.md/);
  }
  assert.equal(fs.existsSync(path.join(root, 'skills', 'twitter-cli-setup', 'SKILL.md')), false);
});
