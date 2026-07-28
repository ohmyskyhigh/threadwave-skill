#!/usr/bin/env node
// Build per-skill release artifacts and regenerate release-index.json (v2).
//
// The release index is the single remote authority for user setup: it declares
// the required skill roster, suite roles, each skill's current version, and the
// immutable artifact URL + SHA-256 for that exact version. suite-manifest.json
// stays the repository/CI declaration; this script derives the public index
// from it and from each skill's local skill-manifest.json.
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const REPOSITORY = 'ohmyskyhigh/threadwave-skill';
const INDEX_SCHEMA = 'threadwave-skill-release-index-v2';
const SETUP_URL = 'https://www.threadwave.xyz/cli/setup/agent.md';

export function buildReleaseArtifacts(root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')) {
  const suite = readJson(path.join(root, 'suite-manifest.json'));
  const previousIndex = readJson(path.join(root, 'release-index.json'));
  const previousEntries = previousIndex?.required_skills ?? previousIndex?.skills ?? [];
  const previousByName = new Map(previousEntries.map((entry) => [entry?.name, entry]));

  const distDir = path.join(root, 'dist', 'skills');
  fs.rmSync(distDir, { recursive: true, force: true });
  fs.mkdirSync(distDir, { recursive: true });

  const artifactBase = `https://github.com/${REPOSITORY}/releases/download/suite-v${suite.bundle_version}`;
  const roles = {};
  const requiredSkills = [];

  for (const skill of suite.required_skills ?? []) {
    const manifest = readJson(path.join(root, skill.manifest_path));
    if (manifest?.name !== skill.name || !/^\d+\.\d+\.\d+$/.test(manifest?.version ?? '')) {
      throw new Error(`invalid_skill_manifest:${skill.name}`);
    }

    const artifactName = `${skill.name}-${manifest.version}.tgz`;
    const artifactPath = path.join(distDir, artifactName);
    // Portable pipeline: no macOS metadata, no gzip timestamp. The index and
    // its checksums are always regenerated together with the artifacts.
    execFileSync(
      'sh',
      [
        '-c',
        `COPYFILE_DISABLE=1 tar --exclude='.DS_Store' -cf - -C skills ${shellQuote(skill.name)} | gzip -n > ${shellQuote(artifactPath)}`
      ],
      { cwd: root, stdio: ['ignore', 'ignore', 'inherit'] }
    );
    const sha256 = sha256File(artifactPath);

    requiredSkills.push({
      name: skill.name,
      latest_version: manifest.version,
      minimum_supported_version: previousByName.get(skill.name)?.minimum_supported_version ?? manifest.version,
      artifact_url: `${artifactBase}/${artifactName}`,
      sha256
    });

    if (['preflight', 'update', 'support'].includes(manifest.role)) {
      roles[manifest.role] = skill.name;
    }
  }

  if (!roles.preflight || !roles.update || !roles.support) {
    throw new Error('suite must declare one preflight, update, and support skill via manifest roles');
  }

  const index = {
    schema_version: INDEX_SCHEMA,
    repository: REPOSITORY,
    bundle_version: suite.bundle_version,
    agent_skills_installer: suite.agent_skills_installer,
    setup_url: SETUP_URL,
    roles: { preflight: roles.preflight, update: roles.update, support: roles.support },
    required_skills: requiredSkills
  };
  fs.writeFileSync(path.join(root, 'release-index.json'), `${JSON.stringify(index, null, 2)}\n`);

  return {
    schema_version: INDEX_SCHEMA,
    bundle_version: suite.bundle_version,
    artifact_base: artifactBase,
    artifacts: requiredSkills.map((entry) => path.join('dist', 'skills', path.basename(entry.artifact_url))),
    note: 'release-index.json regenerated; upload dist/skills/*.tgz to the matching GitHub release before announcing the version'
  };
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function sha256File(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function shellQuote(value) {
  return `'${String(value).replace(/'/g, `'\\''`)}'`;
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    const result = buildReleaseArtifacts();
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`artifact_build_failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
