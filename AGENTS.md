# ThreadWave Skill Suite Workspace Guide

## Objective

This repository contains six independently versioned, flat-installable peer skills plus optional host plugin bundles. Four public Twitter/X operation skills delegate readiness to `threadwave-preflight`; that skill delegates version checks to `threadwave-update`. Missing skill, CLI, and extension modules are handled by `https://www.threadwave.xyz/cli/setup/agent.md`. The public operation names stay generic and searchable; ThreadWave branding belongs in the two infrastructure skills, plugin metadata, descriptions, and workflow content.

## Required Suite

The system is runnable only when these six flat peer skills are installed and confirmed current:

- `threadwave-preflight`
- `threadwave-update`
- `twitter-automation`
- `twitter-agent`
- `twitter-post`
- `twitter-reply`

The dependency flow is one-way: operation skill -> `threadwave-preflight` -> `threadwave-update`. Do not create a circular dependency. `threadwave-update` never invokes preflight or `tw`; it only compares local manifests with the GitHub release index. Every operation skill invokes preflight before its workflow. A missing, incompatible, outdated, or update-unconfirmed peer blocks every operation before `tw` is invoked.

## Authority

1. Current user instructions and system/developer rules.
2. This file for repository workflow.
3. `release-index.json` for the latest public version of each individual skill.
4. Each skill's local `skill-manifest.json` for its installed version, role, dependencies, and CLI capability requirements.
5. `skills/threadwave-preflight/**` for the single preflight, setup, recovery, and issue-report contract.
6. `skills/threadwave-update/**` for the single GitHub update-check contract.
7. Each operation skill's `SKILL.md` for its workflow and approval boundary.
8. `suite-manifest.json` for repository validation and optional bundle packaging only; installed flat skills must not depend on it.

The active ThreadWave CLI implementation and its source-of-truth docs live in the sibling `threadwave-chrome-extension` repository. Do not silently invent commands, output fields, update endpoints, or approval paths. Update this suite only after checking the current CLI contract.

Product positioning, pricing, credits, and public copy defaults live in the knowledge vault: `/Users/runkunmiao/FunStuff/threadwave/threadwave-obsidian-vault/threadwave-product-source-of-truth.json` (human guide: `threadwave-product-source-of-truth.md` in the same folder). Check it before restating product or pricing claims in skill copy.

## Change Rules

- Keep all six skills as flat peers. Skill references use skill names, not relative paths into another skill.
- Keep the preflight contract only in `threadwave-preflight` and the update contract only in `threadwave-update`.
- Keep individual skill versions independent. Do not require versions to be equal; compare each installed manifest with its own `latest_version` in `release-index.json`.
- Keep optional host plugin bundles atomic, but support flat installation of all six sibling skill folders.
- Keep all user-facing flows available in English and Simplified Chinese.
- Keep command names, JSON keys, refs, and stable error codes in English.
- Never translate, rewrite, or normalize exact tweet/reply content.
- Never add automatic issue submission without explicit user consent and a separately approved API contract.
- Never retire the legacy `twitter-harness` skill from this repository.
- Do not commit or push unless the user's immediately preceding message explicitly requests it.

## Validation

Node.js 22 or newer is required. Use npm.

```bash
npm run check
npm run package
```

After edits, run syntax/structure validation and the relevant tests.

## Session Hygiene

Every Codex session that changes this repository must add one `.changelog/objective_with_underscores-YYYYMMDD_HHMMSS.md` file with:

1. Objective
2. Final Changes
3. Final Result

Never include credentials, raw prompts, user content, handles, target URLs/status IDs, private paths, or browser/session payloads in changelogs.
