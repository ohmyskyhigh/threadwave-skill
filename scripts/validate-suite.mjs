#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { REQUIRED_SKILLS, parseSkillFrontmatter, verifySuiteFiles } from './suite-policy.mjs';

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

  const manifest = readJson('suite-manifest.json');
  const plugin = readJson('.codex-plugin/plugin.json');
  const pkg = readJson('package.json');
  const reportSchema = readJson('schemas/threadwave-issue-report-v1.schema.json');
  if (manifest.schema_version !== 'threadwave-skill-suite-v1') errors.push('suite manifest schema mismatch');
  if (!/^\d+\.\d+\.\d+$/.test(manifest.suite_version ?? '')) errors.push('suite version is not strict semver');
  if (String(plugin.version ?? '').split('+', 1)[0] !== manifest.suite_version) errors.push('plugin base version and suite version differ');
  if (pkg.version !== manifest.suite_version) errors.push('package and suite versions differ');
  if (plugin.skills !== './skills/') errors.push('plugin skills path must be ./skills/');
  if (reportSchema.title !== 'ThreadWave Issue Report v1') errors.push('issue report schema is missing or invalid');
  if (JSON.stringify(reportSchema.properties?.skill?.enum) !== JSON.stringify(REQUIRED_SKILLS)) {
    errors.push('issue report skill enum must match the required suite');
  }
  if (manifest.setup_route?.owner !== 'web_setup_guide') errors.push('setup route must be owned by the web guide');
  if (manifest.setup_route?.url !== 'https://www.threadwave.xyz/cli/setup/agent.md') errors.push('setup route URL mismatch');
  if (manifest.setup_route?.human_url !== 'https://www.threadwave.xyz/cli/setup') errors.push('human setup page URL mismatch');
  if (manifest.setup_route?.agent_guide_url !== 'https://www.threadwave.xyz/cli/setup/agent.md') errors.push('agent setup guide URL mismatch');
  if (manifest.setup_route?.installed_skill !== false) errors.push('setup guide must not be installed as a local skill');
  if (JSON.stringify(manifest.setup_route?.handles_missing) !== JSON.stringify(['skill_suite', 'cli', 'extension'])) {
    errors.push('setup route must handle missing skill suite, CLI, and extension');
  }
  if ('manual_extension_fallback' in manifest) errors.push('direct extension fallback must not be embedded in the suite');
  errors.push(...verifySuiteFiles(root, manifest));

  for (const skillName of REQUIRED_SKILLS) {
    const skillRoot = path.join(root, 'skills', skillName);
    const skillPath = path.join(skillRoot, 'SKILL.md');
    if (!fs.existsSync(skillPath)) continue;
    const content = fs.readFileSync(skillPath, 'utf8');
    const frontmatter = parseSkillFrontmatter(content);
    if (!frontmatter?.description || !/[\u3400-\u9fff]/u.test(frontmatter.description)) errors.push(`${skillName}: description must include Simplified Chinese triggers`);
    if (!content.includes('Mandatory Preflight')) errors.push(`${skillName}: mandatory preflight section missing`);
    if (!content.includes('Issue Report')) errors.push(`${skillName}: issue report section missing`);
    if (content.split(/\r?\n/).length > 500) errors.push(`${skillName}: SKILL.md exceeds 500 lines`);

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
  return errors;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const errors = validateSuite();
  if (errors.length) {
    process.stderr.write(`${errors.map((error) => `ERROR ${error}`).join('\n')}\n`);
    process.exitCode = 1;
  } else {
    process.stdout.write(`Suite validation passed: ${REQUIRED_SKILLS.length} same-version bilingual skills, shared contracts, agents, and evals.\n`);
  }
}
