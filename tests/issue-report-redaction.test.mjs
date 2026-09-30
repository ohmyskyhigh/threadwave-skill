import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { shouldGenerateIssueReport } from '../scripts/suite-policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const releaseIndex = JSON.parse(fs.readFileSync(path.join(root, 'release-index.json'), 'utf8'));
const supportRoot = path.join(root, 'skills/threadwave');

test('the error-support contract permits public retrieval while keeping reports private', () => {
  const contract = fs.readFileSync(path.join(supportRoot, 'references', 'error-support-contract.md'), 'utf8');
  const schema = JSON.parse(fs.readFileSync(path.join(root, 'schemas', 'threadwave-issue-report-v2.schema.json'), 'utf8'));

  assert.match(contract, /Build the report directly as Markdown/);
  assert.match(contract, /local HTTP client such as `curl` or PowerShell/);
  assert.match(contract, /never execute downloaded code or bypass host permissions/);
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

test('authorized reporting keeps factual intake distinct from public copy-paste and honest receipts', () => {
  const contract = fs.readFileSync(path.join(supportRoot, 'references', 'error-support-contract.md'), 'utf8');
  const schema = JSON.parse(fs.readFileSync(path.join(root, 'schemas', 'threadwave-issue-report-v2.schema.json'), 'utf8'));
  const defs = schema.$defs;
  assert.deepEqual(defs.supportReportInput.required, ['agent', 'context']);
  assert.equal(defs.supportReport.additionalProperties, false);
  assert.deepEqual(defs.ReportEnvironment.properties.os.enum, ['Linux', 'Windows', 'macOS', 'unknown']);
  assert.equal(defs.ReportContext.additionalProperties, false);
  assert.ok(defs.ReportContext.properties.received_input);
  assert.equal(defs.ReportContext.properties.suspected_cause, undefined);
  assert.deepEqual(defs.supportReceipt.properties.state.enum, ['submitted', 'stored']);
  for (const phrase of ['tw support report --input', 'obtain reporting consent once', 'same UUID', 'independently observed', 'threadwave-setup-observation-v1', 'stored', 'unsubmitted', 'unconfirmed']) assert.ok(contract.includes(phrase), phrase);
  assert.doesNotMatch(contract, /tw support status/);
});


test('completed delivery shortfalls are reportable without an error-looking envelope', () => {
  const contract = fs.readFileSync(path.join(supportRoot, 'references', 'error-support-contract.md'), 'utf8');
  assert.equal(shouldGenerateIssueReport({ category: 'unexpected_failure' }), true);
  assert.equal(shouldGenerateIssueReport({ category: 'unexpected_failure', gate: 'approval' }), false);
  for (const text of ['requested 5, observed 3, missing 2', 'requested 1, observed 0, missing 1',
    'exit code zero', 'warning-only output', 'error_code`/`error_message` null',
    'A known public issue or a later authorized recovery does not erase',
    'Empty results are normal only for operations that permit emptiness']) assert.ok(contract.includes(text), text);
  for (const name of ['twitter-post', 'twitter-reply']) {
    const content = fs.readFileSync(path.join(root, 'skills/threadwave/references', name === 'twitter-post' ? 'post.md' : 'reply.md'), 'utf8');
    assert.match(content, /A completed delivery shortfall must read \[support.md\]/);
    assert.match(content, /`ok=true` does not prove the requested deliverable was produced/);
    assert.match(content, /still-progressing work retain their existing meaning/);
    assert.match(content, /Drafts awaiting publishing approval already fulfill a draft-only request/);
    assert.match(content, /Record requested versus observed counts.*attach JSONL/);
    assert.doesNotMatch(content, /only host-side result check/);
    const evaluations = JSON.parse(fs.readFileSync(path.join(root, 'skills/threadwave/evals/evals.json'), 'utf8'));
    assert.ok(evaluations.evals.some((entry) => entry.prompt.includes('only three distinct drafts') && entry.expected_output.includes('missing 2')));
  }
});


test('standalone reporting needs neither a repository schema lookup nor a separate export', () => {
  const contract = fs.readFileSync(path.join(supportRoot, 'references', 'error-support-contract.md'), 'utf8');
  assert.match(contract, /not a required installed resource; do not search host directories/);
  assert.match(contract, /do not run a separate export merely to submit a report/);
});
