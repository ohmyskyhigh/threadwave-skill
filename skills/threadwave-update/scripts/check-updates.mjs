#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

export const REQUIRED_SKILLS = Object.freeze([
  'threadwave-preflight',
  'threadwave-update',
  'twitter-automation',
  'twitter-agent',
  'twitter-post',
  'twitter-reply'
]);

const MANIFEST_SCHEMA = 'threadwave-skill-manifest-v1';
const INDEX_SCHEMA = 'threadwave-skill-release-index-v1';
const RESULT_SCHEMA = 'threadwave-skill-update-v1';
const REPOSITORY = 'ohmyskyhigh/threadwave-skill';
const INDEX_URL = 'https://raw.githubusercontent.com/ohmyskyhigh/threadwave-skill/main/release-index.json';
const SETUP_URL = 'https://www.threadwave.xyz/cli/setup/agent.md';

export async function checkUpdates({
  updateSkillRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
  fetchImpl = globalThis.fetch,
  timeoutMs = 8000
} = {}) {
  const skillsRoot = path.dirname(updateSkillRoot);
  const failures = [];
  const localManifests = new Map();

  for (const name of REQUIRED_SKILLS) {
    const skillRoot = path.join(skillsRoot, name);
    const skillPath = path.join(skillRoot, 'SKILL.md');
    const manifestPath = path.join(skillRoot, 'skill-manifest.json');
    if (!fs.existsSync(skillPath) || !fs.existsSync(manifestPath)) {
      failures.push(`missing_skill:${name}`);
      continue;
    }

    let manifest;
    try {
      manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    } catch {
      failures.push(`invalid_skill_manifest:${name}`);
      continue;
    }

    const frontmatterName = readFrontmatterName(fs.readFileSync(skillPath, 'utf8'));
    if (frontmatterName !== name) failures.push(`skill_name_mismatch:${name}`);
    if (manifest.schema_version !== MANIFEST_SCHEMA) failures.push(`skill_manifest_schema_mismatch:${name}`);
    if (manifest.name !== name) failures.push(`skill_manifest_name_mismatch:${name}`);
    if (!isSemver(manifest.version)) failures.push(`skill_version_invalid:${name}`);
    if (manifest.update?.release_index_url !== INDEX_URL) failures.push(`release_index_source_mismatch:${name}`);
    localManifests.set(name, manifest);
  }

  for (const [name, manifest] of localManifests) {
    const dependencies = manifest.dependencies?.required_skills;
    if (!Array.isArray(dependencies)) {
      failures.push(`skill_dependencies_invalid:${name}`);
      continue;
    }
    for (const dependency of dependencies) {
      if (!REQUIRED_SKILLS.includes(dependency?.name) || !isSemver(dependency?.minimum_version)) {
        failures.push(`skill_dependency_invalid:${name}`);
        continue;
      }
      const installed = localManifests.get(dependency.name);
      if (installed && compareSemver(installed.version, dependency.minimum_version) < 0) {
        failures.push(`skill_dependency_incompatible:${name}:${dependency.name}`);
      }
    }
  }

  const remote = await fetchReleaseIndex(fetchImpl, timeoutMs);
  if (!remote.ok) failures.push(remote.code);

  const latestByName = remote.ok
    ? new Map(remote.index.skills.map((skill) => [skill.name, skill]))
    : new Map();

  if (remote.ok) {
    const declared = [...latestByName.keys()].sort();
    if (JSON.stringify(declared) !== JSON.stringify([...REQUIRED_SKILLS].sort())) {
      failures.push('release_index_skill_set_mismatch');
    }
  }

  const skills = REQUIRED_SKILLS.map((name) => {
    const local = localManifests.get(name);
    const latest = latestByName.get(name);
    if (!local) return { name, state: 'missing' };
    if (!remote.ok || !latest || !isSemver(latest.latest_version) || !isSemver(latest.minimum_supported_version)) {
      if (remote.ok) failures.push(`release_index_entry_invalid:${name}`);
      return { name, local_version: local.version, latest_version: null, state: 'update_unconfirmed' };
    }
    if (compareSemver(local.version, latest.minimum_supported_version) < 0) {
      failures.push(`skill_unsupported:${name}`);
    }
    if (local.version !== latest.latest_version) {
      failures.push(`skill_update_required:${name}`);
      return { name, local_version: local.version, latest_version: latest.latest_version, state: 'update_required' };
    }
    return { name, local_version: local.version, latest_version: latest.latest_version, state: 'current' };
  });

  const uniqueFailures = [...new Set(failures)];
  return {
    schema_version: RESULT_SCHEMA,
    ok: uniqueFailures.length === 0,
    state: uniqueFailures.length === 0
      ? 'ready'
      : uniqueFailures.some((failure) => failure.startsWith('skill_update_required:'))
        ? 'update_required'
        : 'blocked',
    latest_confirmed: remote.ok,
    source: {
      provider: 'github_raw',
      repository: REPOSITORY,
      branch: 'main'
    },
    skills,
    failures: uniqueFailures,
    setup_url: SETUP_URL
  };
}

export function compareSemver(left, right) {
  if (!isSemver(left) || !isSemver(right)) return -1;
  const a = left.split('.').map(Number);
  const b = right.split('.').map(Number);
  for (let index = 0; index < 3; index += 1) {
    if (a[index] !== b[index]) return a[index] > b[index] ? 1 : -1;
  }
  return 0;
}

async function fetchReleaseIndex(fetchImpl, timeoutMs) {
  if (typeof fetchImpl !== 'function') return { ok: false, code: 'release_index_fetch_unavailable' };
  try {
    const response = await fetchImpl(INDEX_URL, {
      headers: { accept: 'application/json', 'user-agent': 'threadwave-update-skill' },
      signal: AbortSignal.timeout(timeoutMs)
    });
    if (!response?.ok) return { ok: false, code: `release_index_http_${response?.status ?? 'unknown'}` };
    const index = await response.json();
    if (
      index?.schema_version !== INDEX_SCHEMA ||
      index?.repository !== REPOSITORY ||
      index?.setup_url !== SETUP_URL ||
      !Array.isArray(index?.skills)
    ) {
      return { ok: false, code: 'release_index_invalid' };
    }
    return { ok: true, index };
  } catch {
    return { ok: false, code: 'release_index_request_failed' };
  }
}

function readFrontmatterName(content) {
  const match = content.match(/^---\r?\n([\s\S]*?)\r?\n---/);
  return match?.[1].match(/^name:\s*["']?([^"'\s]+)["']?\s*$/m)?.[1] ?? null;
}

function isSemver(value) {
  return /^\d+\.\d+\.\d+$/.test(String(value));
}

async function main() {
  const result = await checkUpdates();
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  if (!result.ok) process.exitCode = 2;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  main().catch((error) => {
    process.stderr.write(`threadwave_update_failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  });
}
