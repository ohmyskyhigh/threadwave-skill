import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillRoot = path.join(root, 'skills', 'threadwave');
const skill = fs.readFileSync(path.join(skillRoot, 'SKILL.md'), 'utf8');
const contract = fs.readFileSync(path.join(skillRoot, 'references', 'cli-invocation.md'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(skillRoot, 'skill-manifest.json'), 'utf8'));
const suite = JSON.parse(fs.readFileSync(path.join(root, 'suite-manifest.json'), 'utf8'));
const evals = JSON.parse(fs.readFileSync(path.join(skillRoot, 'evals', 'evals.json'), 'utf8'));
const replySkill = fs.readFileSync(path.join(skillRoot, 'references/reply.md'), 'utf8');
const replyEvals = JSON.parse(fs.readFileSync(path.join(skillRoot, 'evals/evals.json'), 'utf8'));

test('Windows packaged readiness uses only the canonical fixed command adapter', () => {
  assert.match(skill, /cli-invocation\.md/);
  assert.match(contract, /`windows_managed_cmd`/);
  assert.match(contract, /%SystemRoot%\\System32\\cmd\.exe/);
  assert.match(contract, /%LOCALAPPDATA%\\ThreadWave\\bin\\tw\.cmd/);
  assert.match(contract, /Never use `ComSpec`, PATH discovery/);
  assert.match(contract, /never pass a raw returned `command` string into `\/c`/i);
  assert.match(contract, /never invoke a version-directory `tw\.exe`/i);
  assert.match(contract, /data\.cli_version at least the manifest minimum/);
  assert.doesNotMatch(contract, /invoke the ThreadWave executable directly with these arguments/i);
  assert.doesNotMatch(contract, /Do not use .*PowerShell, CMD/i);
});

test('native Windows Codex readiness starts outside the sandbox without a user choice', () => {
  assert.match(contract, /non-sandboxed local process capability from the first call/i);
  assert.match(contract, /every fixed `windows_managed_cmd` readiness operation.*non-sandboxed local process capability from the first call/i);
  assert.match(contract, /do not run a sandboxed probe first and do not ask the user to approve or choose/i);
  assert.match(contract, /not administrator or UAC elevation/i);
  assert.match(contract, /stop with `twitter_automation_cli_unconfirmed`.*never fall back to sandboxed execution/i);
});

test('the cmd adapter has a closed readiness mapping and excludes dynamic operation values', () => {
  for (const operation of [
    'preflight --format json',
    'capabilities --format json',
    'credits --format json',
    'login',
    'subscribe',
    'setup --format json',
    'doctor --format json'
  ]) {
    assert.match(contract, new RegExp(`%THREADWAVE_MANAGED_LAUNCHER%\" ${operation.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}`));
  }
  assert.match(contract, /Never interpolate user-authored content, model output, targets, URLs, refs/);
  assert.match(contract, /must never convert tweet\/reply text, targets, URLs, refs, feedback, or other user values into a manually composed `cmd\.exe \/c` command string/);
});

test('packaged Windows downstream operations preserve true argument boundaries', () => {
  assert.match(contract, /`ProcessStartInfo\.ArgumentList`/);
  assert.match(contract, /call `ArgumentList\.Add\(\.\.\.\)` once for each value/);
  assert.match(contract, /direction, post\/reply text, target, ref, or feedback must remain one `ArgumentList` entry/);
  assert.match(contract, /Do not invoke the managed launcher with the PowerShell call operator and splatting/);
  assert.match(contract, /Do not use `Start-Process -ArgumentList`, `ProcessStartInfo\.Arguments`, `Invoke-Expression`/);
  assert.match(contract, /stop with `twitter_automation_cli_unconfirmed`/);
  assert.match(replySkill, /cli-invocation\.md/);
});
