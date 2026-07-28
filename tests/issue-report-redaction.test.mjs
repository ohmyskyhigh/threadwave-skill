import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { shouldGenerateIssueReport } from '../scripts/suite-policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const releaseIndex = JSON.parse(fs.readFileSync(path.join(root, 'release-index.json'), 'utf8'));
const supportRoot = path.join(root, 'skills', releaseIndex.roles.support);

test('the error-support contract owns runtime-free retrieval and redacted copy/paste reports', () => {
  const contract = fs.readFileSync(path.join(supportRoot, 'references', 'error-support-contract.md'), 'utf8');
  const schema = JSON.parse(fs.readFileSync(path.join(root, 'schemas', 'threadwave-issue-report-v2.schema.json'), 'utf8'));

  assert.match(contract, /Build the report directly as Markdown/);
  assert.match(contract, /Do not invoke Node\.js, Python, `curl`, Bash, PowerShell, CMD, `tw`, or a bundled script/);
  assert.match(contract, /post\/reply text, targets, URLs, handles, raw prompts/);
  assert.match(contract, /tokens, cookies, authorization, CSRF/);
  assert.match(contract, /DOM, GraphQL, browser state, backend payloads/);
  assert.match(contract, /This report has not been sent; it is for copy\/paste only/);
  assert.match(contract, /Never upload a screenshot, open an issue/);
  assert.equal(fs.existsSync(path.join(supportRoot, 'scripts')), false);

  assert.equal(schema.properties.submission.properties.mode.const, 'copy_paste');
  assert.equal(schema.properties.submission.properties.sent.const, false);
  assert.equal(schema.properties.submission.properties.user_consent_required.const, true);
  assert.equal(schema.$defs.versionMap.additionalProperties.$ref, '#/$defs/version');
});

test('expected user gates do not generate failure reports', () => {
  assert.equal(shouldGenerateIssueReport({ category: 'skill_set_incomplete', gate: 'skill_suite' }), false);
  assert.equal(shouldGenerateIssueReport({ category: 'setup_unresolved', gate: 'payment' }), false);
  assert.equal(shouldGenerateIssueReport({ category: 'unexpected_failure', gate: 'approval' }), false);
  assert.equal(shouldGenerateIssueReport({ category: 'cli_contract_drift' }), true);
  assert.equal(shouldGenerateIssueReport({ explicitRequest: true, gate: 'payment' }), true);
});
