import fs from 'node:fs';
import path from 'node:path';

export const REQUIRED_SKILLS = Object.freeze([
  'twitter-automation',
  'twitter-agent',
  'twitter-post',
  'twitter-reply'
]);

export const REPORTABLE_CATEGORIES = new Set([
  'suite_incomplete',
  'version_mismatch',
  'cli_contract_drift',
  'setup_unresolved',
  'repair_failed',
  'mutation_proof_unknown',
  'unexpected_failure'
]);

export const NORMAL_USER_GATES = new Set([
  'skill_suite',
  'chrome',
  'extension',
  'auth',
  'payment',
  'x_login',
  'approval',
  'subscription_required',
  'mutation_cooldown_active',
  'snapshot_cooldown_active'
]);

export function parseSkillFrontmatter(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  if (!match) return null;
  const yaml = match[1];
  return {
    name: scalar(yaml, 'name'),
    description: scalar(yaml, 'description'),
    version: yaml.match(/^\s{2}version:\s*["']?([^"'\s]+)["']?\s*$/m)?.[1]
  };
}

export function verifySuiteFiles(root, manifest) {
  const problems = [];
  const expected = [...REQUIRED_SKILLS].sort();
  const declared = (manifest.required_skills ?? []).map((item) => item.name).sort();
  if (JSON.stringify(declared) !== JSON.stringify(expected)) {
    problems.push('required_skill_set_mismatch');
  }

  for (const skill of manifest.required_skills ?? []) {
    const skillPath = path.join(root, skill.path);
    if (!fs.existsSync(skillPath)) {
      problems.push(`missing_skill:${skill.name}`);
      continue;
    }
    const frontmatter = parseSkillFrontmatter(fs.readFileSync(skillPath, 'utf8'));
    if (!frontmatter) problems.push(`missing_frontmatter:${skill.name}`);
    if (frontmatter?.name !== skill.name) problems.push(`skill_name_mismatch:${skill.name}`);
    if (frontmatter?.version !== manifest.suite_version) problems.push(`skill_version_mismatch:${skill.name}`);
  }
  return problems;
}

export function evaluateCapabilities(manifest, skillName, envelope, { confirmedCommands = [] } = {}) {
  const failures = [];
  if (envelope?.schema_version !== manifest.contracts.cli_schema) failures.push('unsupported_cli_schema');
  const data = envelope?.data;
  if (!data || typeof data !== 'object') return [...failures, 'capabilities_data_missing'];
  if (!Array.isArray(data.cli_schema_versions) || !data.cli_schema_versions.includes(manifest.contracts.cli_schema)) {
    failures.push('cli_schema_not_advertised');
  }
  if (!Array.isArray(data.harness_schema_versions) || !data.harness_schema_versions.includes(manifest.contracts.harness_schema)) {
    failures.push('harness_schema_not_advertised');
  }
  if (compareSemver(data.cli_version, manifest.cli.minimum_version) < 0) failures.push('cli_version_too_old');
  if (Array.isArray(data.required_upgrades) && data.required_upgrades.length > 0) failures.push('required_upgrade');

  const selected = manifest.required_skills.find((item) => item.name === skillName);
  if (!selected) return [...failures, 'selected_skill_unknown'];
  const families = new Map((data.command_families ?? []).map((family) => [family.name, family]));
  for (const required of selected.required_command_families ?? []) {
    if (families.get(required)?.status !== 'available') failures.push(`command_family_unavailable:${required}`);
  }
  const advertised = [...families.values()].flatMap((family) => family.commands ?? []);
  for (const command of selected.required_commands ?? []) {
    if (!advertised.includes(command) && !confirmedCommands.includes(command)) {
      failures.push(`required_command_missing:${command.split(' --')[0]}`);
    }
  }
  return failures;
}

export function chooseLocale({ explicit, latestMessage = '', conversation = '' } = {}) {
  if (explicit === 'zh-CN' || explicit === 'en') return explicit;
  if (containsCjk(latestMessage)) return 'zh-CN';
  if (/[A-Za-z]/.test(latestMessage)) return 'en';
  if (containsCjk(conversation)) return 'zh-CN';
  return 'en';
}

export function shouldGenerateIssueReport({ explicitRequest = false, category, gate } = {}) {
  if (explicitRequest) return true;
  if (gate && NORMAL_USER_GATES.has(gate)) return false;
  return REPORTABLE_CATEGORIES.has(category);
}

export function compareSemver(left, right) {
  if (!/^\d+\.\d+\.\d+$/.test(String(left)) || !/^\d+\.\d+\.\d+$/.test(String(right))) return -1;
  const a = String(left).split('.').map(Number);
  const b = String(right).split('.').map(Number);
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] > b[index] ? 1 : -1;
  }
  return 0;
}

function scalar(yaml, key) {
  return yaml.match(new RegExp(`^${key}:\\s*["']?(.+?)["']?\\s*$`, 'm'))?.[1];
}

function containsCjk(value) {
  return /[\u3400-\u9fff]/u.test(String(value));
}
