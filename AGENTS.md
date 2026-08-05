# ThreadWave Skill Suite Workspace Guide

## Objective

This repository contains independently versioned, flat-installable peer skills plus optional host plugin bundles. The public Twitter/X operation skills delegate readiness to the preflight skill named by `roles.preflight`; that skill delegates version checks to the update skill named by `roles.update` and routes sanitized failures to the support skill named by `roles.support`. Missing skill, CLI, and extension modules are handled by `https://www.threadwave.xyz/cli/setup/agent.md`. The public operation names stay generic and searchable; ThreadWave branding belongs in the infrastructure skills, plugin metadata, descriptions, and workflow content.

## Required Suite

The system is runnable when every skill in the `required_skills` roster of `release-index.json` is installed at a version from its `minimum_supported_version` through `latest_version`, and the latest-version check is confirmed. Never hardcode the roster in documentation, scripts, or tests — derive it from the release index (runtime) or `suite-manifest.json` (repository/CI) and keep the two in sync.

The dependency flow is one-way: operation skill -> preflight role skill -> update role skill, with failed workflows routed from preflight to the support role skill. Do not create a circular dependency. The update skill never invokes preflight or `tw`; it only compares local manifests with the GitHub release index. The support skill never resumes workflows or invokes operation skills. Every operation skill invokes preflight before its workflow. A missing, incompatible, ahead-of-public, or update-unconfirmed peer blocks every operation before `tw` is invoked. A supported older peer is non-blocking: preflight offers one choice to continue with the installed versions or approve an automatic update through the canonical setup guide, and a skipped unchanged offer is not repeated until the next agent session.

## Authority

1. Current user instructions and system/developer rules.
2. This file for repository workflow.
3. `release-index.json` as the single public authority: installation roster, suite roles (`roles.preflight` / `roles.update` / `roles.support`), each skill's latest version, and immutable artifact URLs with SHA-256 checksums.
4. Each skill's local `skill-manifest.json` for its installed version, role, dependencies, and CLI capability requirements; user setup validates installs against these.
5. `skills/threadwave-preflight/**` for the single preflight, setup, recovery, and sanitized failure-handoff contract.
6. `skills/threadwave-update/**` for the single GitHub update-check contract.
7. `skills/threadwave-error-support/**` for final report-worthiness, public solution search, and issue-report generation.
8. Each operation skill's `SKILL.md` for its workflow and approval boundary.
9. `suite-manifest.json` for repository validation and optional bundle packaging only; installed flat skills and user setup must not depend on it.

The active ThreadWave CLI implementation and its source-of-truth docs live in the sibling `threadwave-chrome-extension` repository. Do not silently invent commands, output fields, update endpoints, or approval paths. Update this suite only after checking the current CLI contract.

Product positioning, pricing, credits, and public copy defaults live in the sibling Vault at `../threadwave-obsidian-vault/01-Product/Product-Definition.json` and `Product-Definition.md`.

## Substantial Change Gate

The Vault owns substantial skill workflow, public behavior, compatibility-policy, setup/preflight, and cross-repository contract decisions. Update or confirm its Product, System, or Skills component contract before implementing such a change, and update `04-Files/Skills/` when source/test ownership changes. `release-index.json`, manifests, and published artifacts remain authority for installed/runtime versions and checksums. Behavior-preserving refactors, tests-only changes, formatting, validation cleanup, and generated mirror refreshes are excluded unless compatibility or policy changes.

## Change Rules

- Keep every roster skill as a flat peer. Skill references use skill names, not relative paths into another skill.
- Keep the preflight contract only in the preflight role skill, the update contract only in the update role skill, and the error-support contract only in the support role skill.
- Keep individual skill versions independent. Do not require versions to be equal; compare each installed manifest with its own `minimum_supported_version` and `latest_version` in `release-index.json`.
- Keep optional host plugin bundles atomic, but support flat installation of all roster skill folders.
- Keep all user-facing flows available in English and Simplified Chinese.
- Keep command names, JSON keys, refs, and stable error codes in English.
- Never translate, rewrite, or normalize exact tweet/reply content.
- Never add automatic issue submission without explicit user consent and a separately approved API contract.
- Never retire the legacy `twitter-harness` skill from this repository.
- Never hardcode the skill roster outside `suite-manifest.json` (repository/CI declaration) and `release-index.json` (public authority); scripts and tests must derive it.
- Release-index checks must use process execution with `curl` on macOS/Linux or `Invoke-WebRequest` on Windows. Never use Web search, browser search, URL-read, Firecrawl, crawl, or scrape tools for the release index. Installed skill folders still must not bundle runtime scripts; root `scripts/**` are maintainer-only.
- Treat every bundle or skill version bump as subject to the Release Synchronization Gate below. A commit or push is not a completed version release.
- Do not commit or push unless the user's immediately preceding message explicitly requests it.

## Release Synchronization Gate

A new version is complete only when the exact code on `origin/main`, the Git tag, the public GitHub release, and every published package describe the same release. Never leave `main` advertising an artifact URL that returns 404 or a checksum that does not match its public asset.

### Required Invariants

- `suite-manifest.json` `bundle_version`, `package.json` `version`, and `.codex-plugin/plugin.json` `version` are identical strict SemVer.
- The release tag is exactly `suite-v<bundle_version>` and targets the exact commit that becomes `origin/main`.
- Derive the skill roster from `suite-manifest.json`; never maintain a separate release list.
- Every roster skill's `skill-manifest.json` version equals its own `latest_version` in `release-index.json`.
- Every indexed artifact URL uses the current suite tag and the filename `<skill-name>-<latest_version>.tgz`.
- Every indexed SHA-256 equals the bytes of both the locally generated archive and the public GitHub release asset.
- The release contains one archive for every roster skill plus `threadwave-skill-<bundle_version>.tgz`. Do not omit unchanged skills: the release is an atomic installable suite.
- The GitHub release is public, non-draft, non-prerelease, and marked Latest only after `origin/main` points at the tagged release commit.

### Mandatory Release Order

1. During release preparation, update the intended bundle and individual skill versions without changing unrelated skills.
2. Run `npm run artifacts:index`, then `npm run check`, then `npm run package`. This explicitly stages the candidate `release-index.json`; ordinary `npm run artifacts` writes only `dist/release-index.candidate.json` and must never promote the public index by itself.
3. Commit the final candidate on a non-public preparation branch and run the local validation commands against that exact SHA before requesting release authorization. If any release input changes afterward, discard the staged release and repeat the local validation.
4. Create a draft GitHub release named `suite-v<bundle_version>` targeting that exact commit. Upload every roster artifact from `dist/skills/` and the matching suite bundle from `dist/`.
5. Download the draft assets into a fresh temporary directory. Verify the complete derived asset set, every indexed SHA-256, and the suite bundle against the local build. Do not publish a partial or mismatched draft.
6. Publish the verified release without marking it Latest, then fast-forward or push that exact tagged commit to `main`, then mark the release Latest. Keep the interval between publication and the `main` update bounded to this release operation so the public index never points forward to missing assets.
7. During the authorized release, rerun `npm run release:static` and `npm run package`, then perform a final unauthenticated download of every URL in `release-index.json`. Require HTTP success and matching SHA-256, and confirm the public suite bundle matches the local package. Do not rerun functionality tests during release; those belong to the candidate validation in step 3.
8. Confirm `origin/main`, the release tag target, and the release target commit are identical. Only then report the version release complete.

If a version commit is already on `main` but its release or assets are missing, treat this as a release-blocking incident. Do not advance versions again or claim setup is healthy. Publish and verify the exact missing release when authorized; otherwise report the mismatch and the required release action.

GitHub writes still require user authority. A request to edit or plan a version does not authorize commit, push, or release publication. If the user requests a version commit/push but has not authorized the matching public release, stop before updating `main` and ask for release authorization rather than creating an out-of-sync public index.

## Validation

Node.js 22 or newer is required. Use npm.

```bash
npm run artifacts
npm run artifacts:index  # release preparation only
npm run check
npm run package
```

After edits, run syntax/structure validation and the relevant tests. For a version release, these local commands are necessary but not sufficient; the Release Synchronization Gate must also pass.

## Session Hygiene

Every Codex session that changes this repository must add one `.changelog/objective_with_underscores-YYYYMMDD_HHMMSS.md` file with:

1. Objective
2. Final Changes
3. Final Result

Never include credentials, raw prompts, user content, handles, target URLs/status IDs, private paths, or browser/session payloads in changelogs.
