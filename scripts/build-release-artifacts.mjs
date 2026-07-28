#!/usr/bin/env node
// Build per-skill release artifacts and a candidate release index (v2).
//
// The release index is the single remote authority for user setup: it declares
// the required skill roster, suite roles, each skill's current version, and the
// immutable artifact URL + SHA-256 for that exact version. suite-manifest.json
// stays the repository/CI declaration; this script derives the public index
// from it and from each skill's local skill-manifest.json.
import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { gzipSync } from 'node:zlib';

const REPOSITORY = 'ohmyskyhigh/threadwave-skill';
const INDEX_SCHEMA = 'threadwave-skill-release-index-v2';
const SETUP_URL = 'https://www.threadwave.xyz/cli/setup/agent.md';

export function buildReleaseArtifacts(
  root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..'),
  options = {}
) {
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
    fs.writeFileSync(artifactPath, buildSkillArchive(path.join(root, 'skills', skill.name), skill.name));
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
  const candidateIndexPath = path.join(root, 'dist', 'release-index.candidate.json');
  fs.writeFileSync(candidateIndexPath, `${JSON.stringify(index, null, 2)}\n`);
  if (options.writeIndex === true) {
    fs.writeFileSync(path.join(root, 'release-index.json'), `${JSON.stringify(index, null, 2)}\n`);
  }

  return {
    schema_version: INDEX_SCHEMA,
    bundle_version: suite.bundle_version,
    artifact_base: artifactBase,
    candidate_index: path.relative(root, candidateIndexPath),
    wrote_public_index: options.writeIndex === true,
    artifacts: requiredSkills.map((entry) => path.join('dist', 'skills', path.basename(entry.artifact_url))),
    note: options.writeIndex === true
      ? 'release-index.json staged for the release candidate; do not push it to main before every public asset is verified'
      : 'candidate index generated under dist; the public release-index.json was not changed'
  };
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function sha256File(file) {
  return crypto.createHash('sha256').update(fs.readFileSync(file)).digest('hex');
}

function buildSkillArchive(skillRoot, skillName) {
  const blocks = [];
  appendTarEntry(blocks, skillRoot, skillName);
  blocks.push(Buffer.alloc(1024));
  // Stored deflate blocks plus a fixed header keep gzip bytes stable across platforms.
  const archive = gzipSync(Buffer.concat(blocks), { level: 0, mtime: 0 });
  archive.fill(0, 4, 8);
  archive[9] = 255;
  return archive;
}

function appendTarEntry(blocks, source, archiveName) {
  const stat = fs.lstatSync(source);
  if (stat.isDirectory()) {
    blocks.push(tarHeader(archiveName, '5', 0, 0o755));
    const entries = fs.readdirSync(source, { withFileTypes: true })
      .filter((entry) => entry.name !== '.DS_Store')
      .sort((left, right) => left.name < right.name ? -1 : left.name > right.name ? 1 : 0);
    for (const entry of entries) {
      appendTarEntry(blocks, path.join(source, entry.name), `${archiveName}/${entry.name}`);
    }
    return;
  }
  if (!stat.isFile()) throw new Error(`unsupported_archive_entry:${archiveName}`);
  const content = fs.readFileSync(source);
  blocks.push(tarHeader(archiveName, '0', content.length, 0o644), content);
  const padding = (512 - (content.length % 512)) % 512;
  if (padding) blocks.push(Buffer.alloc(padding));
}

function tarHeader(archiveName, type, size, mode) {
  const header = Buffer.alloc(512);
  const [name, prefix] = splitTarPath(archiveName);
  writeTarString(header, 0, 100, name);
  writeTarOctal(header, 100, 8, mode);
  writeTarOctal(header, 108, 8, 0);
  writeTarOctal(header, 116, 8, 0);
  writeTarOctal(header, 124, 12, size);
  writeTarOctal(header, 136, 12, 0);
  header.fill(0x20, 148, 156);
  header.write(type, 156, 1, 'ascii');
  writeTarString(header, 257, 6, 'ustar');
  writeTarString(header, 263, 2, '00');
  writeTarString(header, 265, 32, 'root');
  writeTarString(header, 297, 32, 'root');
  writeTarOctal(header, 329, 8, 0);
  writeTarOctal(header, 337, 8, 0);
  writeTarString(header, 345, 155, prefix);
  const checksum = [...header].reduce((sum, byte) => sum + byte, 0).toString(8).padStart(6, '0');
  header.write(checksum, 148, 6, 'ascii');
  header[154] = 0;
  header[155] = 0x20;
  return header;
}

function splitTarPath(value) {
  if (Buffer.byteLength(value) <= 100) return [value, ''];
  for (let separator = value.lastIndexOf('/'); separator > 0; separator = value.lastIndexOf('/', separator - 1)) {
    const prefix = value.slice(0, separator);
    const name = value.slice(separator + 1);
    if (Buffer.byteLength(prefix) <= 155 && Buffer.byteLength(name) <= 100) return [name, prefix];
  }
  throw new Error(`archive_path_too_long:${value}`);
}

function writeTarString(buffer, offset, length, value) {
  const encoded = Buffer.from(value);
  if (encoded.length > length) throw new Error(`archive_field_too_long:${value}`);
  encoded.copy(buffer, offset);
}

function writeTarOctal(buffer, offset, length, value) {
  const encoded = value.toString(8).padStart(length - 1, '0');
  if (encoded.length >= length) throw new Error(`archive_number_too_large:${value}`);
  buffer.write(encoded, offset, length - 1, 'ascii');
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    const unknown = process.argv.slice(2).filter((arg) => arg !== '--write-index');
    if (unknown.length) throw new Error(`unknown_argument:${unknown.join(',')}`);
    const result = buildReleaseArtifacts(undefined, { writeIndex: process.argv.includes('--write-index') });
    process.stdout.write(`${JSON.stringify(result, null, 2)}\n`);
  } catch (error) {
    process.stderr.write(`artifact_build_failed: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exitCode = 1;
  }
}
