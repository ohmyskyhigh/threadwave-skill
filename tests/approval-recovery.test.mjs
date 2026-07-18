import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { OPERATION_SKILLS } from '../scripts/suite-policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

test('manual action skills require dry-run, exact approval, one dispatch, and no unknown retry', () => {
  for (const skill of ['twitter-post', 'twitter-reply']) {
    const content = fs.readFileSync(path.join(root, 'skills', skill, 'SKILL.md'), 'utf8');
    assert.match(content, /--dry-run --json/);
    assert.match(content, /explicit approval/i);
    assert.match(content, /dispatch exactly once|Dispatch Once/i);
    assert.match(content, /Never retry an unknown/i);
    assert.match(content, /schema_version=tw_cli_harness_v1/);
  }
});

test('daily agent checks existing work before creating a plan', () => {
  const procedure = fs.readFileSync(path.join(root, 'skills', 'twitter-agent', 'references', 'daily-run.md'), 'utf8');
  assert.ok(procedure.indexOf('tw plan review list --json') < procedure.indexOf('tw plan create --json'));
  assert.match(procedure, /Never create a second plan/);
  assert.match(procedure, /exact `scheduled_task_ref`/);
});

test('every operation skill delegates preflight and issue reporting to the authority skill', () => {
  for (const skill of OPERATION_SKILLS) {
    const content = fs.readFileSync(path.join(root, 'skills', skill, 'SKILL.md'), 'utf8');
    assert.match(content, /Mandatory Preflight And Init Flow/);
    assert.match(content, /threadwave-preflight/);
    assert.match(content, /issue-report-only mode/);
  }
});
