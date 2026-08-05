import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { evaluateCapabilities, operationSkillNames } from '../scripts/suite-policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const suite = JSON.parse(fs.readFileSync(path.join(root, 'suite-manifest.json'), 'utf8'));
const releaseIndex = JSON.parse(fs.readFileSync(path.join(root, 'release-index.json'), 'utf8'));
const skillManifest = (name) => JSON.parse(fs.readFileSync(path.join(root, 'skills', name, 'skill-manifest.json'), 'utf8'));
const operationSkills = operationSkillNames(suite, releaseIndex);
const operationManifests = operationSkills.map(skillManifest);
const replySkill = fs.readFileSync(path.join(root, 'skills', 'twitter-reply', 'SKILL.md'), 'utf8');
const replyEvals = JSON.parse(fs.readFileSync(path.join(root, 'skills', 'twitter-reply', 'evals', 'evals.json'), 'utf8'));

function capabilities() {
  return {
    schema_version: 'tw-cli-v1',
    data: {
      cli_version: '1.0.21',
      cli_schema_versions: ['tw-cli-v1'],
      harness_schema_versions: ['tw-harness-v1'],
      required_upgrades: [],
      feature_gates: { production_x_actions: true, dry_run_only: false },
      command_families: [
        { name: 'capabilities', status: 'available', commands: ['tw capabilities --format json'] },
        { name: 'doctor', status: 'available', commands: ['tw doctor --format json'] },
        { name: 'setup', status: 'available', commands: ['tw setup --json'] },
        { name: 'context', status: 'available', commands: ['tw context resume --format json'] },
        { name: 'strategy', status: 'available', commands: [] },
        { name: 'plan', status: 'available', commands: [
          'tw plan review show <review_ref> --json',
          'tw plan review approve <review_ref> --json',
          'tw plan review reject <review_ref> --json',
          'tw plan review skip <review_ref> --json'
        ] },
        { name: 'task', status: 'available', commands: [
          'tw task create --surface <tweet|reply|quote> --direction <text> --count <1|5..10 reply; 1..5 otherwise> --json',
          'tw task show <task_blueprint_ref> --json',
          'tw task review show <review_ref> --json',
          'tw task review approve <review_ref> --json',
          'tw task review reject <review_ref> --json',
          'tw task review skip <review_ref> --json',
          'tw task retask --task <task_blueprint_ref> --direction <text> --json',
          'tw task retask --batch <batch_ref> --direction <text> --json'
        ] },
        { name: 'draft', status: 'available', commands: [
          'tw draft show <artifact_ref> --json',
          'tw draft redraft <artifact_ref> --feedback <text> --json'
        ] },
        { name: 'scheduler', status: 'available', commands: [
          'tw scheduler show <scheduled_task_ref> --json',
          'tw scheduler evidence <scheduled_task_ref> --json'
        ] },
        { name: 'action', status: 'available', commands: [
          'tw action tweet --text <text> --json',
          'tw action reply <tweet_url_or_ref> --text <text> --json'
        ] }
      ]
    }
  };
}

test('each workflow accepts the supported CLI contract', () => {
  for (const manifest of operationManifests) {
    assert.deepEqual(evaluateCapabilities(manifest, capabilities()), []);
  }
});

test('missing task review command is detected before workflow creation', () => {
  const value = capabilities();
  const task = value.data.command_families.find((family) => family.name === 'task');
  task.commands = task.commands.filter((command) => !command.startsWith('tw task review approve'));
  const taskOwners = operationManifests.filter((manifest) => manifest.cli.required_commands
    .some((command) => command.startsWith('tw task create --surface')));
  assert.ok(taskOwners.length > 0);
  for (const manifest of taskOwners) {
    assert.ok(evaluateCapabilities(manifest, value).some((failure) => failure.startsWith('required_command_missing:')));
  }
});

test('manual task peers require exact task projection lookup', () => {
  const value = capabilities();
  const task = value.data.command_families.find((family) => family.name === 'task');
  task.commands = task.commands.filter((command) => !command.startsWith('tw task show'));
  for (const skill of ['twitter-post', 'twitter-reply']) {
    assert.ok(evaluateCapabilities(skillManifest(skill), value).some((failure) => failure.startsWith('required_command_missing:')));
  }
});

test('task skills reject the pre-1.0.21 CLI version while the router remains compatible', () => {
  const value = capabilities();
  value.data.cli_version = '1.0.20';
  const taskOwners = operationManifests.filter((manifest) => manifest.cli.minimum_version === '1.0.21');
  const routers = operationManifests.filter((manifest) => manifest.role === 'operation-router');
  assert.ok(taskOwners.length > 0);
  assert.equal(routers.length, 1);
  for (const manifest of taskOwners) {
    assert.ok(evaluateCapabilities(manifest, value).includes('cli_version_too_old'));
  }
  assert.deepEqual(evaluateCapabilities(routers[0], value), []);
});

test('reply discovery defaults to five and accepts only five through ten targets', () => {
  assert.match(replySkill, /Default a missing discovery-task count to `5`/);
  assert.match(replySkill, /Accept only an integer from `5` through `10`/);
  assert.match(replySkill, /never auto-chunk/);
  assert.match(replyEvals.evals.find((entry) => entry.id === 2).expected_output, /5 through 10/);
  assert.match(replyEvals.evals.find((entry) => entry.id === 4).expectations.join(' '), /count 10/);
  assert.match(replyEvals.evals.find((entry) => entry.id === 11).expectations.join(' '), /count 11/);
});

test('reply batches keep safe siblings only for the precise no-safe marker', () => {
  const partial = replyEvals.evals.find((entry) => entry.id === 23);
  const generic = replyEvals.evals.find((entry) => entry.id === 24);
  assert.ok(partial);
  assert.ok(generic);
  assert.match(partial.expected_output, /5 requested, 4 valid, and 1 skipped/i);
  assert.match(partial.expectations.join(' '), /exact no-safe-draft terminal marker/i);
  assert.match(generic.expected_output, /generic candidate_invalid does not prove a safe-filter skip/i);
  assert.match(generic.expectations.join(' '), /does not classify generic candidate_invalid/i);
});

test('schema drift and required upgrades are blocking compatibility failures', () => {
  const value = capabilities();
  value.schema_version = 'tw-cli-v2';
  value.data.required_upgrades = ['upgrade_cli'];
  const failures = evaluateCapabilities(operationManifests.find((manifest) => manifest.role === 'daily-operation'), value);
  assert.ok(failures.includes('unsupported_cli_schema'));
  assert.ok(failures.includes('required_upgrade'));
});
