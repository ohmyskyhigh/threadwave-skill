import fs from 'node:fs';
import path from 'node:path';

export function rosterNames(suite) {
  return (suite?.required_skills ?? []).map((item) => item?.name).filter(Boolean);
}

export function indexRosterNames(releaseIndex) {
  return (releaseIndex?.required_skills ?? []).map((item) => item?.name).filter(Boolean);
}

export function operationSkillNames(suite, releaseIndex) {
  const infrastructure = new Set([
    releaseIndex?.roles?.preflight,
    releaseIndex?.roles?.update,
    releaseIndex?.roles?.support
  ].filter(Boolean));
  return rosterNames(suite).filter((name) => !infrastructure.has(name));
}

export const REPORTABLE_CATEGORIES = new Set([
  'skill_set_incomplete',
  'skill_update_required',
  'skill_update_unconfirmed',
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
  return { name: scalar(yaml, 'name'), description: scalar(yaml, 'description') };
}

export function verifySuiteFiles(root, suite, releaseIndex) {
  const problems = [];
  const expected = rosterNames(suite).sort();
  const released = indexRosterNames(releaseIndex).sort();
  if (JSON.stringify(released) !== JSON.stringify(expected)) problems.push('release_index_skill_set_mismatch');
  const releaseByName = new Map((releaseIndex.required_skills ?? []).map((item) => [item.name, item]));

  for (const skill of suite.required_skills ?? []) {
    const skillPath = path.join(root, skill.path);
    const manifestPath = path.join(root, skill.manifest_path);
    if (!fs.existsSync(skillPath)) {
      problems.push(`missing_skill:${skill.name}`);
      continue;
    }
    if (!fs.existsSync(manifestPath)) {
      problems.push(`missing_skill_manifest:${skill.name}`);
      continue;
    }
    const frontmatter = parseSkillFrontmatter(fs.readFileSync(skillPath, 'utf8'));
    const manifest = readJson(manifestPath);
    const release = releaseByName.get(skill.name);
    if (!frontmatter) problems.push(`missing_frontmatter:${skill.name}`);
    if (frontmatter?.name !== skill.name) problems.push(`skill_name_mismatch:${skill.name}`);
    if (manifest?.schema_version !== 'threadwave-skill-manifest-v1') problems.push(`skill_manifest_schema_mismatch:${skill.name}`);
    if (manifest?.name !== skill.name) problems.push(`skill_manifest_name_mismatch:${skill.name}`);
    if (!isSemver(manifest?.version)) problems.push(`skill_version_invalid:${skill.name}`);
    if (release?.latest_version !== manifest?.version) problems.push(`release_skill_version_mismatch:${skill.name}`);
    if (!isSemver(release?.minimum_supported_version)) problems.push(`release_minimum_version_invalid:${skill.name}`);
    if (manifest?.update?.release_index_url !== 'https://raw.githubusercontent.com/ohmyskyhigh/threadwave-skill/main/release-index.json') {
      problems.push(`release_index_url_mismatch:${skill.name}`);
    }
  }
  return problems;
}

export function evaluateCapabilities(skillManifest, envelope, { confirmedCommands = [] } = {}) {
  const failures = [];
  if (envelope?.schema_version !== skillManifest.contracts?.cli_schema) failures.push('unsupported_cli_schema');
  const data = envelope?.data;
  if (!data || typeof data !== 'object') return [...failures, 'capabilities_data_missing'];
  if (!Array.isArray(data.cli_schema_versions) || !data.cli_schema_versions.includes(skillManifest.contracts.cli_schema)) {
    failures.push('cli_schema_not_advertised');
  }
  if (!Array.isArray(data.harness_schema_versions) || !data.harness_schema_versions.includes(skillManifest.contracts.harness_schema)) {
    failures.push('harness_schema_not_advertised');
  }
  if (compareSemver(data.cli_version, skillManifest.cli.minimum_version) < 0) failures.push('cli_version_too_old');
  if (Array.isArray(data.required_upgrades) && data.required_upgrades.length > 0) failures.push('required_upgrade');

  const families = new Map((data.command_families ?? []).map((family) => [family.name, family]));
  for (const required of skillManifest.cli.required_command_families ?? []) {
    if (families.get(required)?.status !== 'available') failures.push(`command_family_unavailable:${required}`);
  }
  const advertised = [...families.values()].flatMap((family) => family.commands ?? []);
  for (const command of skillManifest.cli.required_commands ?? []) {
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
  if (!isSemver(left) || !isSemver(right)) return -1;
  const a = String(left).split('.').map(Number);
  const b = String(right).split('.').map(Number);
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] > b[index] ? 1 : -1;
  }
  return 0;
}

function readJson(file) {
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return null;
  }
}

function scalar(yaml, key) {
  return yaml.match(new RegExp(`^${key}:\\s*["']?(.+?)["']?\\s*$`, 'm'))?.[1];
}

function isSemver(value) {
  return /^\d+\.\d+\.\d+$/.test(String(value));
}

function containsCjk(value) {
  return /[\u3400-\u9fff]/u.test(String(value));
}
