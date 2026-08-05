import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillRoot = path.join(root, 'skills', 'threadwave-preflight');
const skill = fs.readFileSync(path.join(skillRoot, 'SKILL.md'), 'utf8');
const contract = fs.readFileSync(path.join(skillRoot, 'references', 'preflight-contract.md'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(skillRoot, 'skill-manifest.json'), 'utf8'));
const suite = JSON.parse(fs.readFileSync(path.join(root, 'suite-manifest.json'), 'utf8'));
const evals = JSON.parse(fs.readFileSync(path.join(skillRoot, 'evals', 'evals.json'), 'utf8'));

test('Windows packaged readiness uses only the canonical fixed command adapter', () => {
  assert.match(skill, /platform invocation adapter/i);
  assert.match(contract, /`windows_managed_cmd`/);
  assert.match(contract, /%SystemRoot%\\System32\\cmd\.exe/);
  assert.match(contract, /%LOCALAPPDATA%\\ThreadWave\\bin\\tw\.cmd/);
  assert.match(contract, /Never use `ComSpec`, PATH discovery/);
  assert.match(contract, /never pass a raw returned `command` string into `\/c`/i);
  assert.match(contract, /never invoke a version-directory `tw\.exe`/i);
  assert.match(contract, /data\.cli_version>=1\.0\.32/);
  assert.doesNotMatch(contract, /invoke the ThreadWave executable directly with these arguments/i);
  assert.doesNotMatch(contract, /Do not use .*PowerShell, CMD/i);
});

test('the cmd adapter has a closed readiness mapping and excludes dynamic operation values', () => {
  for (const operation of [
    'preflight --format json',
    'capabilities --format json',
    'login',
    'subscribe',
    'setup --format json',
    'doctor --format json'
  ]) {
    assert.match(contract, new RegExp(`%THREADWAVE_MANAGED_LAUNCHER%\" ${operation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  }
  assert.match(contract, /Never interpolate user-authored content, model output, targets, URLs, refs/);
  assert.match(contract, /must never convert tweet\/reply text, targets, URLs, refs, feedback, or other user values into a `cmd\.exe \/c` command string/);
});

test('preflight version and evaluation cover the Windows packaged boundary', () => {
  assert.equal(manifest.cli.minimum_version, '1.0.32');
  assert.equal(suite.cli.minimum_version, '1.0.32');
  const windowsEval = evals.evals.find((entry) => entry.id === 7);
  assert.ok(windowsEval);
  assert.match(windowsEval.prompt, /Windows packaged/);
  assert.match(windowsEval.expectations.join(' '), /metacharacters.*shell command/i);
});
