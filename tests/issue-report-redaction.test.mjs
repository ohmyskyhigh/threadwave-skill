import assert from 'node:assert/strict';
import test from 'node:test';
import { buildIssueReport, renderIssueReportMarkdown } from '../skills/threadwave-preflight/scripts/generate-issue-report.mjs';
import { shouldGenerateIssueReport } from '../scripts/suite-policy.mjs';

test('issue report includes individual versions, stays redacted, and is never sent', () => {
  const report = buildIssueReport({
    locale: 'zh-CN',
    skill: 'twitter-reply',
    installed_skill_versions: { 'threadwave-preflight': '0.1.0', 'twitter-reply': '0.4.0' },
    latest_skill_versions: { 'threadwave-preflight': '0.1.0', 'twitter-reply': '0.4.1' },
    update_state: 'update_required',
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
  assert.equal(report.schema_version, 'threadwave-issue-report-v2');
  assert.equal(report.installed_skill_versions['twitter-reply'], '0.4.0');
  assert.equal(report.latest_skill_versions['twitter-reply'], '0.4.1');
  assert.equal(report.submission.sent, false);
  assert.match(renderIssueReportMarkdown(report), /尚未发送/);
});

test('expected user gates do not generate failure reports', () => {
  assert.equal(shouldGenerateIssueReport({ category: 'skill_set_incomplete', gate: 'skill_suite' }), false);
  assert.equal(shouldGenerateIssueReport({ category: 'setup_unresolved', gate: 'payment' }), false);
  assert.equal(shouldGenerateIssueReport({ category: 'unexpected_failure', gate: 'approval' }), false);
  assert.equal(shouldGenerateIssueReport({ category: 'cli_contract_drift' }), true);
  assert.equal(shouldGenerateIssueReport({ explicitRequest: true, gate: 'payment' }), true);
});
