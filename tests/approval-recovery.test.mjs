import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { operationSkillNames } from '../scripts/suite-policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const suite = JSON.parse(fs.readFileSync(path.join(root, 'suite-manifest.json'), 'utf8'));
const releaseIndex = JSON.parse(fs.readFileSync(path.join(root, 'release-index.json'), 'utf8'));
const manifests = new Map(suite.required_skills.map((skill) => [
  skill.name,
  JSON.parse(fs.readFileSync(path.join(root, skill.manifest_path), 'utf8'))
]));

test('post and reply peers support bounded tasks plus exact single-action safety', () => {
  const manualOperationSkills = operationSkillNames(suite, releaseIndex)
    .filter((skill) => manifests.get(skill)?.role === 'manual-operation');
  assert.equal(manualOperationSkills.length, 2);
  for (const skill of manualOperationSkills) {
    const content = fs.readFileSync(path.join(root, 'skills', skill, 'SKILL.md'), 'utf8');
    assert.match(content, /## Task Mode/);
    assert.match(content, /--count <1\.\.5> --json/);
    assert.match(content, /Do not collapse|Never collapse/i);
    assert.match(content, /one exact scheduled X mutation|one exact reply mutation/i);
    assert.match(content, /## Exact-Action Mode/);
    assert.match(content, /--dry-run --json/);
    assert.match(content, /explicit approval/i);
    assert.match(content, /dispatch .* once/i);
    assert.match(content, /Never retry an unknown|stop without retry/i);
    assert.match(content, /schema_version=tw_cli_harness_v1/);
  }
});

test('automation is a pure router to independent peers', () => {
  const operationSkills = operationSkillNames(suite, releaseIndex);
  const routerName = operationSkills.find((skill) => manifests.get(skill)?.role === 'operation-router');
  assert.ok(routerName);
  const content = fs.readFileSync(path.join(root, 'skills', routerName, 'SKILL.md'), 'utf8');
  assert.match(content, /independent installed siblings/);
  for (const peer of operationSkills.filter((skill) => skill !== routerName)) {
    assert.match(content, new RegExp(`routes to ${peer}`));
  }
  assert.match(content, /Never invoke `tw task`, `tw draft`, `tw plan`, `tw scheduler`, or `tw action`/);
  assert.match(content, /destination peer owns its mandatory preflight/);
});

test('daily agent checks existing work before creating a plan', () => {
  const dailyAgent = operationSkillNames(suite, releaseIndex)
    .find((skill) => manifests.get(skill)?.role === 'daily-operation');
  assert.ok(dailyAgent);
  const procedure = fs.readFileSync(path.join(root, 'skills', dailyAgent, 'references', 'daily-run.md'), 'utf8');
  assert.ok(procedure.indexOf('tw plan review list --json') < procedure.indexOf('tw plan create --json'));
  assert.match(procedure, /Never create a second plan/);
  assert.match(procedure, /exact `scheduled_task_ref`/);
});

test('every operation peer uses the preflight and issue-report authority', () => {
  for (const skill of operationSkillNames(suite, releaseIndex)) {
    const content = fs.readFileSync(path.join(root, 'skills', skill, 'SKILL.md'), 'utf8');
    assert.match(content, /threadwave-preflight/);
    assert.match(content, /issue-report-only mode/);
  }
});
