import assert from 'node:assert/strict';
import test from 'node:test';
import { buildIssueReport, renderIssueReportMarkdown } from '../scripts/generate-issue-report.mjs';
import { shouldGenerateIssueReport } from '../scripts/suite-policy.mjs';

test('issue report is allowlisted, redacted, and never marked sent', () => {
  const report = buildIssueReport({
    locale: 'zh-CN',
    skill: 'twitter-reply',
    suite_version: '0.3.0',
    cli_version: '1.0.0',
    install_mode: 'dev',
    platform: 'darwin',
    category: 'mutation_proof_unknown',
    stage: 'evidence',
    summary: 'Bearer topsecret failed for @private at https://x.com/private/status/1234567890123456789 in /Users/alice/project; reply=do not leak this',
    error_codes: ['provider_result_unknown'],
    checks: [{ id: 'mutation_evidence', state: 'unknown', code: 'provider_result_unknown' }],
    commands: [{ command: 'tw action reply https://x.com/private/status/1234567890123456789 --text "do not leak this" --json', status: 'unknown', exit_code: 1 }],
    next_step: 'Check token=abc and /home/alice/private'
  }, new Date('2026-07-17T12:00:00.000Z'));
  const serialized = JSON.stringify(report);
  for (const secret of ['topsecret', '@private', '1234567890123456789', '/Users/alice', '/home/alice', 'do not leak this', 'token=abc']) {
    assert.ok(!serialized.includes(secret), `report leaked ${secret}`);
  }
  assert.equal(report.submission.sent, false);
  assert.equal(report.submission.mode, 'copy_paste');
  assert.match(report.report_id, /^twir_[a-f0-9]{16}$/);
  assert.match(renderIssueReportMarkdown(report), /尚未发送/);
});

test('expected user gates do not generate failure reports', () => {
  assert.equal(shouldGenerateIssueReport({ category: 'suite_incomplete', gate: 'skill_suite' }), false);
  assert.equal(shouldGenerateIssueReport({ category: 'setup_unresolved', gate: 'payment' }), false);
  assert.equal(shouldGenerateIssueReport({ category: 'unexpected_failure', gate: 'approval' }), false);
  assert.equal(shouldGenerateIssueReport({ category: 'cli_contract_drift' }), true);
  assert.equal(shouldGenerateIssueReport({ explicitRequest: true, gate: 'payment' }), true);
});
