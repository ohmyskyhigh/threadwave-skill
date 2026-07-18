# ThreadWave Skill Suite Workspace Guide

## Objective

This repository contains independently versioned, flat-installable peer skills plus optional host plugin bundles. The public Twitter/X operation skills delegate readiness to the preflight skill named by `roles.preflight`; that skill delegates version checks to the update skill named by `roles.update`. Missing skill, CLI, and extension modules are handled by `https://www.threadwave.xyz/cli/setup/agent.md`. The public operation names stay generic and searchable; ThreadWave branding belongs in the two infrastructure skills, plugin metadata, descriptions, and workflow content.

## Required Suite

The system is runnable only when every skill in the `required_skills` roster of `release-index.json` is installed and confirmed current. Never hardcode the roster in documentation, scripts, or tests — derive it from the release index (runtime) or `suite-manifest.json` (repository/CI) and keep the two in sync.

The dependency flow is one-way: operation skill -> preflight role skill -> update role skill. Do not create a circular dependency. The update skill never invokes preflight or `tw`; it only compares local manifests with the GitHub release index. Every operation skill invokes preflight before its workflow. A missing, incompatible, outdated, or update-unconfirmed peer blocks every operation before `tw` is invoked.

## Authority

1. Current user instructions and system/developer rules.
2. This file for repository workflow.
3. `release-index.json` as the single public authority: installation roster, suite roles (`roles.preflight` / `roles.update`), each skill's latest version, and immutable artifact URLs with SHA-256 checksums.
4. Each skill's local `skill-manifest.json` for its installed version, role, dependencies, and CLI capability requirements; user setup validates installs against these.
5. `skills/threadwave-preflight/**` for the single preflight, setup, recovery, and issue-report contract.
6. `skills/threadwave-update/**` for the single GitHub update-check contract.
7. Each operation skill's `SKILL.md` for its workflow and approval boundary.
8. `suite-manifest.json` for repository validation and optional bundle packaging only; installed flat skills and user setup must not depend on it.

The active ThreadWave CLI implementation and its source-of-truth docs live in the sibling `threadwave-chrome-extension` repository. Do not silently invent commands, output fields, update endpoints, or approval paths. Update this suite only after checking the current CLI contract.

Product positioning, pricing, credits, and public copy defaults live in the knowledge vault: `/Users/runkunmiao/FunStuff/threadwave/threadwave-obsidian-vault/threadwave-product-source-of-truth.json` (human guide: `threadwave-product-source-of-truth.md` in the same folder). Check it before restating product or pricing claims in skill copy.

## Change Rules

- Keep every roster skill as a flat peer. Skill references use skill names, not relative paths into another skill.
- Keep the preflight contract only in the preflight role skill and the update contract only in the update role skill.
- Keep individual skill versions independent. Do not require versions to be equal; compare each installed manifest with its own `latest_version` in `release-index.json`.
- Keep optional host plugin bundles atomic, but support flat installation of all roster skill folders.
- Keep all user-facing flows available in English and Simplified Chinese.
- Keep command names, JSON keys, refs, and stable error codes in English.
- Never translate, rewrite, or normalize exact tweet/reply content.
- Never add automatic issue submission without explicit user consent and a separately approved API contract.
- Never retire the legacy `twitter-harness` skill from this repository.
- Never hardcode the skill roster outside `suite-manifest.json` (repository/CI declaration) and `release-index.json` (public authority); scripts and tests must derive it.
- Installed skill folders must not require Node.js, Python, `curl`, or shell-specific runtime scripts. Use host agent URL-read, skill/file-read, process execution, and text-generation capabilities. Root `scripts/**` are maintainer-only and must never be required after installation.
- After any skill version bump, run `npm run artifacts` so `release-index.json` artifact URLs and SHA-256 checksums are regenerated with the tarballs, then publish `dist/skills/*.tgz` to the matching GitHub release.
- Do not commit or push unless the user's immediately preceding message explicitly requests it.

## Validation

Node.js 22 or newer is required. Use npm.

```bash
npm run check
npm run package
npm run artifacts
```

After edits, run syntax/structure validation and the relevant tests.

## Session Hygiene

Every Codex session that changes this repository must add one `.changelog/objective_with_underscores-YYYYMMDD_HHMMSS.md` file with:

1. Objective
2. Final Changes
3. Final Result

Never include credentials, raw prompts, user content, handles, target URLs/status IDs, private paths, or browser/session payloads in changelogs.
