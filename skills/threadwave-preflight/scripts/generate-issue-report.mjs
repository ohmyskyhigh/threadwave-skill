#!/usr/bin/env node
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const SKILLS = Object.freeze([
  'threadwave-preflight',
  'threadwave-update',
  'twitter-automation',
  'twitter-agent',
  'twitter-post',
  'twitter-reply'
]);
const SKILL_SET = new Set(SKILLS);
const CATEGORIES = new Set([
  'skill_set_incomplete',
  'skill_update_required',
  'skill_update_unconfirmed',
  'cli_missing',
  'cli_contract_drift',
  'setup_unresolved',
  'repair_failed',
  'mutation_proof_unknown',
  'unexpected_failure'
]);
const STAGES = new Set([
  'skill_integrity',
  'github_update_check',
  'doctor',
  'worktree',
  'capabilities',
  'setup_dry_run',
  'setup_repair',
  'capability_gate',
  'workflow',
  'evidence'
]);
const STATES = new Set(['passed', 'failed', 'blocked', 'unknown', 'not_run']);
const UPDATE_STATES = new Set(['confirmed', 'update_required', 'unconfirmed']);
const EXCLUDED_FIELDS = Object.freeze([
  'tweet_or_reply_text',
  'target_url_status_id_or_handle',
  'tokens_cookies_auth_or_csrf',
  'checkout_or_callback_url',
  'raw_dom_graphql_browser_or_daemon_payload',
  'raw_prompt_or_conversation_history',
  'username_home_or_private_path',
  'private_key_or_environment_value'
]);

export function buildIssueReport(input = {}, now = new Date()) {
  const locale = input.locale === 'zh-CN' ? 'zh-CN' : 'en';
  const safe = {
    schema_version: 'threadwave-issue-report-v2',
    created_at: validDate(input.created_at) ?? now.toISOString(),
    locale,
    skill: SKILL_SET.has(input.skill) ? input.skill : 'threadwave-preflight',
    installed_skill_versions: safeVersions(input.installed_skill_versions),
    latest_skill_versions: safeVersions(input.latest_skill_versions),
    update_state: UPDATE_STATES.has(input.update_state) ? input.update_state : 'unconfirmed',
    ...(shortVersion(input.cli_version) ? { cli_version: shortVersion(input.cli_version) } : {}),
    install_mode: ['packaged', 'dev'].includes(input.install_mode) ? input.install_mode : 'unknown',
    ...(safePlatform(input.platform) ? { platform: safePlatform(input.platform) } : {}),
    category: CATEGORIES.has(input.category) ? input.category : 'unexpected_failure',
    stage: STAGES.has(input.stage) ? input.stage : 'workflow',
    summary: sanitizeText(input.summary || localized(locale, 'No diagnostic summary was provided.', '未提供诊断摘要。'), 500),
    error_codes: safeCodes(input.error_codes, 12),
    checks: safeChecks(input.checks),
    commands: safeCommands(input.commands),
    next_step: sanitizeText(input.next_step || localized(locale, 'Maintainer review is required.', '需要维护者检查。'), 500),
    privacy: { redacted: true, excluded_fields: [...EXCLUDED_FIELDS] },
    submission: { mode: 'copy_paste', sent: false, user_consent_required: true }
  };
  safe.report_id = `twir_${crypto.createHash('sha256').update(JSON.stringify(safe)).digest('hex').slice(0, 16)}`;
  return orderReport(safe);
}

export function renderIssueReportMarkdown(report) {
  const zh = report.locale === 'zh-CN';
  const label = (en, cn) => zh ? cn : en;
  const versionLines = SKILLS.flatMap((name) => {
    const local = report.installed_skill_versions[name];
    const latest = report.latest_skill_versions[name];
    if (!local && !latest) return [];
    return [`- \`${name}\`: ${local ?? 'missing'} / ${latest ?? 'unconfirmed'}`];
  });
  return [
    `# ${label('ThreadWave Issue Report', 'ThreadWave 问题报告')}`,
    '',
    `- ${label('Report ID', '报告 ID')}: \`${report.report_id}\``,
    `- ${label('Schema', '结构版本')}: \`${report.schema_version}\``,
    `- ${label('Created', '生成时间')}: \`${report.created_at}\``,
    `- ${label('Skill', '技能')}: \`${report.skill}\``,
    `- ${label('Update state', '更新状态')}: \`${report.update_state}\``,
    ...(report.cli_version ? [`- CLI ${label('version', '版本')}: \`${report.cli_version}\``] : []),
    `- ${label('Install mode', '安装模式')}: \`${report.install_mode}\``,
    ...(report.platform ? [`- ${label('Platform', '平台')}: \`${report.platform}\``] : []),
    `- ${label('Category', '问题分类')}: \`${report.category}\``,
    `- ${label('Stage', '阶段')}: \`${report.stage}\``,
    '',
    `## ${label('Skill versions (installed / latest)', '技能版本（已安装 / 最新）')}`,
    '',
    ...(versionLines.length ? versionLines : [`- ${label('None confirmed', '未确认')}`]),
    '',
    `## ${label('Summary', '摘要')}`,
    '',
    report.summary,
    '',
    `## ${label('Error codes', '错误代码')}`,
    '',
    ...(report.error_codes.length ? report.error_codes.map((code) => `- \`${code}\``) : [`- ${label('None recorded', '未记录')}`]),
    '',
    `## ${label('Checks', '检查项')}`,
    '',
    ...(report.checks.length ? report.checks.map((check) => `- \`${check.id}\`: ${check.state}${check.code ? ` (\`${check.code}\`)` : ''}`) : [`- ${label('None recorded', '未记录')}`]),
    '',
    `## ${label('Commands', '命令')}`,
    '',
    ...(report.commands.length ? report.commands.map((command) => `- \`${command.command}\`: ${command.status}${Number.isInteger(command.exit_code) ? ` (exit ${command.exit_code})` : ''}`) : [`- ${label('None recorded', '未记录')}`]),
    '',
    `## ${label('Recommended next step', '建议下一步')}`,
    '',
    report.next_step,
    '',
    `## ${label('Privacy and submission', '隐私与提交状态')}`,
    '',
    label(
      'Sensitive and user-content fields were excluded. This report has not been sent; it is for copy/paste only.',
      '敏感信息和用户内容已排除。此报告尚未发送，仅供复制粘贴。'
    )
  ].join('\n');
}

function safeVersions(value) {
  const result = {};
  if (!value || typeof value !== 'object' || Array.isArray(value)) return result;
  for (const name of SKILLS) {
    if (/^\d+\.\d+\.\d+$/.test(String(value[name] ?? ''))) result[name] = String(value[name]);
  }
  return result;
}

function safeChecks(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 30).map((item) => ({
    id: safeCode(item?.id, 'unknown_check'),
    state: STATES.has(item?.state) ? item.state : 'unknown',
    ...(item?.code ? { code: safeCode(item.code, 'unknown') } : {})
  }));
}

function safeCommands(value) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, 20).map((item) => ({
    command: sanitizeCommand(item?.command),
    status: STATES.has(item?.status) ? item.status : 'unknown',
    ...(Number.isInteger(item?.exit_code) && item.exit_code >= 0 && item.exit_code <= 255 ? { exit_code: item.exit_code } : {})
  }));
}

function safeCodes(value, max) {
  if (!Array.isArray(value)) return [];
  return value.slice(0, max).map((code) => safeCode(code, 'unknown')).filter((code, index, all) => all.indexOf(code) === index);
}

function safeCode(value, fallback) {
  const normalized = String(value ?? '').toLowerCase().replace(/[^a-z0-9_:-]/g, '_').slice(0, 80);
  return normalized || fallback;
}

function sanitizeCommand(value) {
  let command = String(value ?? '').trim().replace(/[\r\n\0]/g, ' ');
  const safeUpdate = command === 'node <threadwave-update-directory>/scripts/check-updates.mjs';
  if (!safeUpdate && !/^(?:tw(?:\s|$)|command -v tw$)/.test(command)) return '[REDACTED_COMMAND]';
  command = command.replace(/--text(?:=|\s+)(?:"[^"]*"|'[^']*'|\S+)/gi, '--text <redacted>');
  command = command.replace(/https?:\/\/\S+/gi, '<redacted_url>');
  command = command.replace(/(@[A-Za-z0-9_]{1,15}|\b\d{12,}\b)/g, '<redacted_target>');
  command = command.replace(/(?:\/Users|\/home)\/[^\s"']+/g, '<redacted_path>');
  return command.slice(0, 160) || '[REDACTED_COMMAND]';
}

function sanitizeText(value, maxLength) {
  return String(value)
    .replace(/-----BEGIN[\s\S]*?-----END[^-]*-----/g, '[REDACTED_PRIVATE_KEY]')
    .replace(/\b(Bearer)\s+[A-Za-z0-9._~+/=-]+/gi, '$1 [REDACTED]')
    .replace(/\b(token|cookie|authorization|csrf|secret|password|api[_ -]?key)\s*[:=]\s*[^\s,;]+/gi, '$1=[REDACTED]')
    .replace(/\b(tweet|reply|text|content|body|message)\s*[:=]\s*(?:"[^"]*"|'[^']*'|[^,;]+)/gi, '$1=[REDACTED_USER_CONTENT]')
    .replace(/https?:\/\/\S+/gi, '[REDACTED_URL]')
    .replace(/(?:\/Users|\/home)\/[^\s"']+/g, '[REDACTED_PATH]')
    .replace(/[A-Za-z]:\\Users\\[^\s"']+/g, '[REDACTED_PATH]')
    .replace(/(^|\s)@[A-Za-z0-9_]{1,15}\b/g, '$1[REDACTED_HANDLE]')
    .replace(/\b\d{12,}\b/g, '[REDACTED_ID]')
    .replace(/[\u0000-\u001f\u007f]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, maxLength) || '[REDACTED]';
}

function shortVersion(value) {
  return /^[A-Za-z0-9._+-]{1,32}$/.test(String(value ?? '')) ? String(value) : null;
}

function safePlatform(value) {
  return /^[A-Za-z0-9._+-]{1,32}$/.test(String(value ?? '')) ? String(value) : null;
}

function validDate(value) {
  if (typeof value !== 'string' || Number.isNaN(Date.parse(value))) return null;
  return new Date(value).toISOString();
}

function localized(locale, en, zh) {
  return locale === 'zh-CN' ? zh : en;
}

function orderReport(report) {
  const { report_id, ...rest } = report;
  return { schema_version: rest.schema_version, report_id, ...Object.fromEntries(Object.entries(rest).filter(([key]) => key !== 'schema_version')) };
}

async function main() {
  const raw = fs.readFileSync(0, 'utf8').trim();
  if (!raw) throw new Error('Expected a JSON issue-report payload on stdin.');
  const report = buildIssueReport(JSON.parse(raw));
  process.stdout.write(process.argv.includes('--json') ? `${JSON.stringify(report, null, 2)}\n` : `${renderIssueReportMarkdown(report)}\n`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    process.stderr.write(`issue_report_generation_failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
