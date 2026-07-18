import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { evaluateCapabilities } from '../scripts/suite-policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const skillManifest = (name) => JSON.parse(fs.readFileSync(path.join(root, 'skills', name, 'skill-manifest.json'), 'utf8'));

function capabilities() {
  return {
    schema_version: 'tw-cli-v1',
    data: {
      cli_version: '1.0.0',
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
        { name: 'plan', status: 'available', commands: [] },
        { name: 'task', status: 'available', commands: [] },
        { name: 'draft', status: 'available', commands: [] },
        { name: 'scheduler', status: 'available', commands: [] },
        { name: 'action', status: 'available', commands: ['tw action reply <tweet_url_or_ref> --text <text> --json'] }
      ]
    }
  };
}

test('each workflow accepts the supported CLI contract', () => {
  assert.deepEqual(evaluateCapabilities(skillManifest('twitter-automation'), capabilities()), []);
  assert.deepEqual(evaluateCapabilities(skillManifest('twitter-agent'), capabilities()), []);
  assert.deepEqual(evaluateCapabilities(skillManifest('twitter-reply'), capabilities()), []);
  assert.deepEqual(evaluateCapabilities(skillManifest('twitter-post'), capabilities(), {
    confirmedCommands: ['tw action tweet --text <text> --json']
  }), []);
});

test('missing exact action command is detected before mutation', () => {
  assert.ok(evaluateCapabilities(skillManifest('twitter-post'), capabilities()).some((failure) => failure.startsWith('required_command_missing:')));
});

test('schema drift and required upgrades are blocking compatibility failures', () => {
  const value = capabilities();
  value.schema_version = 'tw-cli-v2';
  value.data.required_upgrades = ['upgrade_cli'];
  const failures = evaluateCapabilities(skillManifest('twitter-agent'), value);
  assert.ok(failures.includes('unsupported_cli_schema'));
  assert.ok(failures.includes('required_upgrade'));
});
