#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { OPERATION_SKILLS, REQUIRED_SKILLS, parseSkillFrontmatter, verifySuiteFiles } from './suite-policy.mjs';

export function validateSuite(root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')) {
  const errors = [];
  const readJson = (relative) => {
    try {
      return JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'));
    } catch (error) {
      errors.push(`${relative}: ${error instanceof Error ? error.message : String(error)}`);
      return {};
    }
  };

  const suite = readJson('suite-manifest.json');
  const releaseIndex = readJson('release-index.json');
  const plugin = readJson('.codex-plugin/plugin.json');
  const pkg = readJson('package.json');
  const reportSchema = readJson('schemas/threadwave-issue-report-v2.schema.json');

  if (suite.schema_version !== 'threadwave-skill-suite-v2') errors.push('suite manifest schema mismatch');
  if (!/^\d+\.\d+\.\d+$/.test(suite.bundle_version ?? '')) errors.push('bundle version is not strict semver');
  if (plugin.version !== suite.bundle_version) errors.push('plugin and bundle versions differ');
  if (pkg.version !== suite.bundle_version) errors.push('package and bundle versions differ');
  if (plugin.skills !== './skills/') errors.push('plugin skills path must be ./skills/');
  if (releaseIndex.schema_version !== 'threadwave-skill-release-index-v1') errors.push('release index schema mismatch');
  if (releaseIndex.repository !== 'ohmyskyhigh/threadwave-skill') errors.push('release index repository mismatch');
  if (releaseIndex.setup_url !== 'https://www.threadwave.xyz/cli/setup/agent.md') errors.push('release index setup URL mismatch');
  if (reportSchema.title !== 'ThreadWave Issue Report v2') errors.push('issue report schema is missing or invalid');
  if (JSON.stringify(reportSchema.properties?.skill?.enum) !== JSON.stringify(REQUIRED_SKILLS)) {
    errors.push('issue report skill enum must match the required skills');
  }
  if (suite.setup_route?.url !== 'https://www.threadwave.xyz/cli/setup/agent.md') errors.push('setup route URL mismatch');
  if (suite.setup_route?.installed_skill !== false) errors.push('web setup guide must not be installed as a local skill');
  if (suite.update_policy?.owner_skill !== 'threadwave-update') errors.push('threadwave-update must own update checks');
  if (suite.update_policy?.release_index_url !== 'https://raw.githubusercontent.com/ohmyskyhigh/threadwave-skill/main/release-index.json') {
    errors.push('release index URL mismatch');
  }
  errors.push(...verifySuiteFiles(root, suite, releaseIndex));

  for (const skillName of REQUIRED_SKILLS) {
    const skillRoot = path.join(root, 'skills', skillName);
    const skillPath = path.join(skillRoot, 'SKILL.md');
    if (!fs.existsSync(skillPath)) continue;
    const content = fs.readFileSync(skillPath, 'utf8');
    const frontmatter = parseSkillFrontmatter(content);
    if (!frontmatter?.description || !/[\u3400-\u9fff]/u.test(frontmatter.description)) {
      errors.push(`${skillName}: description must include Simplified Chinese triggers`);
    }
    if (/^metadata:/m.test(content.match(/^---\r?\n([\s\S]*?)\r?\n---/)?.[1] ?? '')) {
      errors.push(`${skillName}: versions belong in skill-manifest.json, not frontmatter metadata`);
    }
    if (content.split(/\r?\n/).length > 500) errors.push(`${skillName}: SKILL.md exceeds 500 lines`);
    if (content.includes('../')) errors.push(`${skillName}: cross-skill relative paths are forbidden`);

    const agentPath = path.join(skillRoot, 'agents', 'openai.yaml');
    if (!fs.existsSync(agentPath) || !fs.readFileSync(agentPath, 'utf8').includes('default_prompt:')) {
      errors.push(`${skillName}: agents/openai.yaml with default_prompt is required`);
    }

    const evalPath = path.join(skillRoot, 'evals', 'evals.json');
    const evals = fs.existsSync(evalPath) ? readJson(path.relative(root, evalPath)) : {};
    if (evals.skill_name !== skillName) errors.push(`${skillName}: eval skill_name mismatch`);
    if (!Array.isArray(evals.evals) || evals.evals.length < 3) errors.push(`${skillName}: at least three evals are required`);
    const prompts = (evals.evals ?? []).map((item) => item.prompt ?? '');
    if (!prompts.some((prompt) => /[A-Za-z]/.test(prompt))) errors.push(`${skillName}: English eval missing`);
    if (!prompts.some((prompt) => /[\u3400-\u9fff]/u.test(prompt))) errors.push(`${skillName}: Simplified Chinese eval missing`);
  }

  for (const skillName of OPERATION_SKILLS) {
    const content = fs.readFileSync(path.join(root, 'skills', skillName, 'SKILL.md'), 'utf8');
    if (!content.includes('threadwave-preflight')) errors.push(`${skillName}: must delegate to threadwave-preflight`);
  }

  const preflightRoot = path.join(root, 'skills', 'threadwave-preflight');
  for (const relative of ['references/preflight-contract.md', 'references/issue-report-contract.md', 'scripts/generate-issue-report.mjs']) {
    if (!fs.existsSync(path.join(preflightRoot, relative))) errors.push(`threadwave-preflight: missing ${relative}`);
  }
  const updateRoot = path.join(root, 'skills', 'threadwave-update');
  const updateSkill = fs.readFileSync(path.join(updateRoot, 'SKILL.md'), 'utf8');
  if (!fs.existsSync(path.join(updateRoot, 'scripts', 'check-updates.mjs'))) errors.push('threadwave-update: update checker missing');
  if (/\btw\s+(?:doctor|capabilities|setup|action|strategy|plan|task|draft|scheduler)\b/.test(updateSkill)) {
    errors.push('threadwave-update: must not invoke tw');
  }
  if (fs.existsSync(path.join(root, 'references', 'preflight-contract.md'))) errors.push('root preflight contract must not exist');
  if (fs.existsSync(path.join(root, 'references', 'issue-report-contract.md'))) errors.push('root issue-report contract must not exist');

  return errors;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const errors = validateSuite();
  if (errors.length) {
    process.stderr.write(`${errors.map((error) => `ERROR ${error}`).join('\n')}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write(`Suite validation passed: ${REQUIRED_SKILLS.length} independently versioned bilingual flat peer skills with centralized preflight and updates.\n`);
  }
}
