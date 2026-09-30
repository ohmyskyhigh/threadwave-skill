#!/usr/bin/env node
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { compareSemver } from './suite-policy.mjs';

export function setSkillVersion(root, skillName, nextVersion) {
  if (!/^\d+\.\d+\.\d+$/.test(String(nextVersion))) throw new Error('invalid_semver');

  if (skillName !== 'threadwave') throw new Error('only_threadwave_is_versioned');
  const files = ['skills/threadwave/skill-manifest.json', 'suite-manifest.json', '.codex-plugin/plugin.json', 'package.json'];
  const values = files.map((file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8')));
  if (compareSemver(nextVersion, values[0].version) <= 0) throw new Error('version_must_increase');
  for (const [index, value] of values.entries()) {
    value[index === 1 ? 'bundle_version' : 'version'] = nextVersion;
    fs.writeFileSync(path.join(root, files[index]), `${JSON.stringify(value, null, 2)}\n`);
  }
  return { skill: skillName, version: nextVersion, updated: files,
    next_step: 'Build and validate candidate artifacts; public release-index.json remains unchanged until authorized publication.' };

}

function main() {
  const [skillName, nextVersion, ...flags] = process.argv.slice(2);
  if (!skillName || !nextVersion) {
    throw new Error('usage: npm run version:skill -- <skill-name> <version>');
  }
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
  if (flags.length) throw new Error('unsupported_version_flag');
  const result = setSkillVersion(root, skillName, nextVersion);
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
