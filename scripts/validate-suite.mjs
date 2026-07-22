#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { operationSkillNames, parseSkillFrontmatter, rosterNames, verifySuiteFiles } from './suite-policy.mjs';

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
  const roster = rosterNames(suite);
  const manifests = new Map();

  if (suite.schema_version !== 'threadwave-skill-suite-v2') errors.push('suite manifest schema mismatch');
  if (!/^\d+\.\d+\.\d+$/.test(suite.bundle_version ?? '')) errors.push('bundle version is not strict semver');
  if (plugin.version !== suite.bundle_version) errors.push('plugin and bundle versions differ');
  if (pkg.version !== suite.bundle_version) errors.push('package and bundle versions differ');
  if (plugin.skills !== './skills/') errors.push('plugin skills path must be ./skills/');
  if (releaseIndex.schema_version !== 'threadwave-skill-release-index-v2') errors.push('release index schema mismatch');
  if (releaseIndex.repository !== 'ohmyskyhigh/threadwave-skill') errors.push('release index repository mismatch');
  if (releaseIndex.bundle_version !== suite.bundle_version) errors.push('release index and bundle versions differ');
  if (suite.agent_skills_installer?.package !== 'skills') errors.push('Agent Skills installer package mismatch');
  if (!/^\d+\.\d+\.\d+$/.test(suite.agent_skills_installer?.version ?? '')) errors.push('Agent Skills installer version is not strict semver');
  if (suite.agent_skills_installer?.registry !== 'https://registry.npmjs.org') errors.push('Agent Skills installer registry mismatch');
  if (JSON.stringify(releaseIndex.agent_skills_installer) !== JSON.stringify(suite.agent_skills_installer)) {
    errors.push('release index Agent Skills installer differs from suite manifest');
  }
  if (releaseIndex.setup_url !== 'https://www.threadwave.xyz/cli/setup/agent.md') errors.push('release index setup URL mismatch');
  if (!roster.includes(releaseIndex.roles?.preflight)) errors.push('release index preflight role must name a roster skill');
  if (!roster.includes(releaseIndex.roles?.update)) errors.push('release index update role must name a roster skill');
  for (const entry of releaseIndex.required_skills ?? []) {
    if (!/^https:\/\//.test(entry?.artifact_url ?? '')) errors.push(`release index artifact URL invalid:${entry?.name}`);
    if (!/^[0-9a-f]{64}$/.test(entry?.sha256 ?? '')) errors.push(`release index artifact sha256 invalid:${entry?.name}`);
  }
  if (reportSchema.title !== 'ThreadWave Issue Report v2') errors.push('issue report schema is missing or invalid');
  if (reportSchema.properties?.skill?.pattern !== '^[a-z0-9]+(?:-[a-z0-9]+)*$') {
    errors.push('issue report skill name must use the flat-skill name pattern');
  }
  if (reportSchema.$defs?.versionMap?.additionalProperties?.$ref !== '#/$defs/version') {
    errors.push('issue report version maps must support the runtime roster');
  }
  if (suite.setup_route?.url !== 'https://www.threadwave.xyz/cli/setup/agent.md') errors.push('setup route URL mismatch');
  if (suite.setup_route?.installed_skill !== false) errors.push('web setup guide must not be installed as a local skill');
  if (suite.update_policy?.owner_skill !== releaseIndex.roles?.update) errors.push('update owner skill must match the release index update role');
  if (suite.update_policy?.release_index_url !== 'https://raw.githubusercontent.com/ohmyskyhigh/threadwave-skill/main/release-index.json') {
    errors.push('release index URL mismatch');
  }
  errors.push(...verifySuiteFiles(root, suite, releaseIndex));

  for (const skillName of roster) {
    const skillRoot = path.join(root, 'skills', skillName);
    const skillPath = path.join(skillRoot, 'SKILL.md');
    const declaration = (suite.required_skills ?? []).find((skill) => skill.name === skillName);
    const manifest = declaration?.manifest_path ? readJson(declaration.manifest_path) : {};
    manifests.set(skillName, manifest);
    if (declaration?.path !== `skills/${skillName}/SKILL.md`) errors.push(`${skillName}: skill must be a flat peer folder`);
    if (declaration?.manifest_path !== `skills/${skillName}/skill-manifest.json`) errors.push(`${skillName}: manifest must be a flat peer file`);
    if (fs.existsSync(path.join(skillRoot, 'scripts'))) errors.push(`${skillName}: installed runtime scripts are forbidden`);
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

  for (const skillName of operationSkillNames(suite, releaseIndex)) {
    const content = fs.readFileSync(path.join(root, 'skills', skillName, 'SKILL.md'), 'utf8');
    if (!content.includes(releaseIndex.roles.preflight)) errors.push(`${skillName}: must delegate to ${releaseIndex.roles.preflight}`);
  }

  const operationNames = operationSkillNames(suite, releaseIndex);
  const routerNames = operationNames.filter((name) => manifests.get(name)?.role === 'operation-router');
  if (routerNames.length !== 1) errors.push('suite must contain exactly one operation-router peer');
  const routerName = routerNames[0];
  if (routerName) {
    const routerManifest = manifests.get(routerName);
    const forbiddenFamilies = new Set(['task', 'draft', 'plan', 'scheduler', 'action']);
    for (const family of routerManifest?.cli?.required_command_families ?? []) {
      if (forbiddenFamilies.has(family)) errors.push(`${routerName}: router must not require operation family:${family}`);
    }
    if ((routerManifest?.cli?.required_commands ?? []).length > 0) errors.push(`${routerName}: router must not require operation commands`);
    if (fs.existsSync(path.join(root, 'skills', routerName, 'skills'))) errors.push(`${routerName}: nested skills are forbidden`);

    const routerContent = fs.readFileSync(path.join(root, 'skills', routerName, 'SKILL.md'), 'utf8');
    for (const peerName of operationNames.filter((name) => name !== routerName)) {
      if (!routerContent.includes(peerName)) errors.push(`${routerName}: missing peer route:${peerName}`);
      const dependencies = manifests.get(peerName)?.dependencies?.required_skills ?? [];
      if (dependencies.some((dependency) => dependency?.name === routerName)) {
        errors.push(`${peerName}: operation peers must not depend on ${routerName}`);
      }
    }
  }

  for (const surface of ['tweet', 'reply']) {
    const owners = operationNames.filter((name) => fs
      .readFileSync(path.join(root, 'skills', name, 'SKILL.md'), 'utf8')
      .includes(`tw task create --surface ${surface}`));
    if (owners.length !== 1) errors.push(`task surface ${surface} must have exactly one skill owner`);
  }

  const preflightRoot = path.join(root, 'skills', releaseIndex.roles.preflight);
  for (const relative of ['references/preflight-contract.md', 'references/issue-report-contract.md']) {
    if (!fs.existsSync(path.join(preflightRoot, relative))) errors.push(`${releaseIndex.roles.preflight}: missing ${relative}`);
  }
  const updateRoot = path.join(root, 'skills', releaseIndex.roles.update);
  const updateSkill = fs.readFileSync(path.join(updateRoot, 'SKILL.md'), 'utf8');
  if (!/curl -fsSL --max-time 30/.test(updateSkill) || !/Invoke-WebRequest -UseBasicParsing/.test(updateSkill)) {
    errors.push(`${releaseIndex.roles.update}: direct cross-platform release-index commands missing`);
  }
  if (!/Web search, browser search, URL-read, Firecrawl, crawl, scrape/.test(updateSkill)) {
    errors.push(`${releaseIndex.roles.update}: web/search tool prohibition missing`);
  }
  if (!/skill catalog and file-read capability/.test(updateSkill)) {
    errors.push(`${releaseIndex.roles.update}: agent-native local read contract missing`);
  }
  if (/\btw\s+(?:doctor|capabilities|setup|action|strategy|plan|task|draft|scheduler)\b/.test(updateSkill)) {
    errors.push(`${releaseIndex.roles.update}: must not invoke tw`);
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
    const suite = JSON.parse(fs.readFileSync(path.join(path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'), 'suite-manifest.json'), 'utf8'));
    process.stdout.write(`Suite validation passed: ${rosterNames(suite).length} independently versioned bilingual flat peer skills with centralized preflight and updates.\n`);
  }
}
