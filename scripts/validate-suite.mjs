#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseSkillFrontmatter, verifySuiteFiles } from './suite-policy.mjs';

// Source validation is independent of the still-published legacy index. Release
// validation must pass the freshly built candidate explicitly, never stale dist.
export function validateSuite(root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), candidate) {
  const errors = [];
  const read = (file) => {
    try { return JSON.parse(fs.readFileSync(path.join(root, file), 'utf8')); }
    catch { errors.push(`invalid_json:${file}`); return {}; }
  };
  const suite = read('suite-manifest.json');
  const plugin = read('.codex-plugin/plugin.json');
  const pkg = read('package.json');
  const manifest = read('skills/threadwave/skill-manifest.json');
  if (suite.schema_version !== 'threadwave-skill-suite-v3') errors.push('suite_schema');
  if (JSON.stringify(suite.required_skills) !== JSON.stringify([{ name: 'threadwave', path: 'skills/threadwave/SKILL.md', manifest_path: 'skills/threadwave/skill-manifest.json' }])) errors.push('single_entry_roster');
  if (!/^\d+\.\d+\.\d+$/.test(suite.bundle_version ?? '')) errors.push('bundle_version');
  for (const value of [plugin.version, pkg.version, manifest.version]) if (value !== suite.bundle_version) errors.push('atomic_version_mismatch');
  if (plugin.name !== 'threadwave-skill' || plugin.skills !== './skills/') errors.push('plugin_identity');
  if (manifest.name !== 'threadwave' || manifest.schema_version !== 'threadwave-skill-manifest-v2') errors.push('skill_manifest');
  if (manifest.dependencies?.required_skills?.length !== 0) errors.push('peer_dependency');
  if (suite.setup_route?.url !== 'https://www.threadwave.xyz/cli/setup/agent.md' || suite.setup_route?.installed_skill !== false) errors.push('setup_owner');
  if (suite.update_policy?.owner !== 'cli_notifications' || suite.update_policy?.latest_confirmation_required !== false) errors.push('update_owner');
  const skillRoot = path.join(root, 'skills/threadwave');
  const walk = (directory) => {
    if (!fs.existsSync(directory)) { errors.push(`missing:${path.relative(root, directory)}`); return []; }
    return fs.readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
      const file = path.join(directory, entry.name);
      if (entry.isSymbolicLink()) { errors.push(`symlink:${file}`); return []; }
      return entry.isDirectory() ? walk(file) : [file];
    });
  };
  const files = walk(path.join(root, 'skills'));
  const entries = files.filter((file) => path.basename(file) === 'SKILL.md');
  if (entries.length !== 1 || entries[0] !== path.join(skillRoot, 'SKILL.md')) errors.push('discoverable_entry_count');
  for (const file of files) {
    if (/\.(?:mjs|cjs|js|ts|py|sh|ps1)$/.test(file)) errors.push(`installed_runtime_script:${file}`);
    if (!file.endsWith('.md')) continue;
    const content = fs.readFileSync(file, 'utf8');
    for (const match of content.matchAll(/\[[^\]]*\]\(([^)]+)\)/g)) {
      const target = match[1];
      if (/^(?:https?:|#)/.test(target)) continue;
      const resolved = path.resolve(path.dirname(file), target.split('#')[0]);
      if (!resolved.startsWith(skillRoot + path.sep) || !fs.existsSync(resolved)) errors.push(`broken_resource:${target}`);
    }
  }
  if (fs.existsSync(path.join(skillRoot, 'SKILL.md'))) {
    const content = fs.readFileSync(path.join(skillRoot, 'SKILL.md'), 'utf8');
    const fm = parseSkillFrontmatter(content);
    if (fm?.name !== 'threadwave' || fm?.license !== 'MIT-0' || !/[\u3400-\u9fff]/u.test(fm?.description ?? '')) errors.push('entry_frontmatter');
    if (content.split('\n').length > 160) errors.push('entry_too_large');
  }
  for (const file of ['post.md','reply.md','snapshot.md','support.md','notifications.md','notifications/update-available.md','cli-invocation.md','error-support-contract.md']) {
    if (!fs.existsSync(path.join(skillRoot, 'references', file))) errors.push(`missing_resource:${file}`);
  }
  if (!fs.existsSync(path.join(skillRoot, 'agents/openai.yaml'))) errors.push('host_metadata');
  const evals = read('skills/threadwave/evals/evals.json');
  if (evals.skill_name !== 'threadwave' || !Array.isArray(evals.evals) || evals.evals.length < 3) errors.push('evals');
  if (candidate) {
    if (candidate.schema_version !== 'threadwave-skill-release-index-v3' || candidate.repository !== 'ohmyskyhigh/threadwave-skill' || candidate.bundle_version !== suite.bundle_version || candidate.setup_url !== suite.setup_route.url || candidate.roles) errors.push('candidate_identity');
    errors.push(...verifySuiteFiles(root, suite, candidate));
    for (const entry of candidate.required_skills ?? []) {
      const expected = `https://github.com/ohmyskyhigh/threadwave-skill/releases/download/suite-v${suite.bundle_version}/threadwave-${suite.bundle_version}.tgz`;
      if (entry.artifact_url !== expected || !/^[0-9a-f]{64}$/.test(entry.sha256 ?? '')) errors.push('candidate_artifact');
    }
  }
  return errors;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const errors = validateSuite();
  if (errors.length) { process.stderr.write(errors.join('\n') + '\n'); process.exitCode = 1; }
  else process.stdout.write('Source validation passed: one bilingual ThreadWave entry. Public release validation is separate.\n');
}
