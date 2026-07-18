#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { REQUIRED_SKILLS, compareSemver } from './suite-policy.mjs';

export function setSkillVersion(root, skillName, nextVersion, { minimumSupported = false } = {}) {
  if (!REQUIRED_SKILLS.includes(skillName)) throw new Error(`unknown_skill:${skillName}`);
  if (!/^\d+\.\d+\.\d+$/.test(String(nextVersion))) throw new Error('invalid_semver');

  const manifestPath = path.join(root, 'skills', skillName, 'skill-manifest.json');
  const indexPath = path.join(root, 'release-index.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const index = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
  const release = index.skills.find((item) => item.name === skillName);
  if (!release) throw new Error(`release_index_skill_missing:${skillName}`);
  if (compareSemver(nextVersion, manifest.version) <= 0) throw new Error('version_must_increase');

  manifest.version = nextVersion;
  release.latest_version = nextVersion;
  if (minimumSupported) release.minimum_supported_version = nextVersion;

  fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);
  fs.writeFileSync(indexPath, `${JSON.stringify(index, null, 2)}\n`);
  return {
    skill: skillName,
    version: nextVersion,
    minimum_supported_version: release.minimum_supported_version,
    updated: ['skill-manifest.json', 'release-index.json']
  };
}

function main() {
  const [skillName, nextVersion, ...flags] = process.argv.slice(2);
  if (!skillName || !nextVersion) {
    throw new Error('usage: npm run version:skill -- <skill-name> <version> [--minimum-supported]');
  }
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  const result = setSkillVersion(root, skillName, nextVersion, {
    minimumSupported: flags.includes('--minimum-supported')
  });
  process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    main();
  } catch (error) {
    process.stderr.write(`skill_version_update_failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
