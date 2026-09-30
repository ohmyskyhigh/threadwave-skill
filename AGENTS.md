# ThreadWave Skill Suite Workspace Guide

## Approved development contract

The 2026-09-24 approved single-skill proposal is staged in `../threadwave-obsidian-vault/70-Staging/ThreadWave-Home-Screen.md`. Source exposes only `skills/threadwave/SKILL.md`, with internal post, reply, snapshot, notification and support resources. Daily planning is unavailable. Preserve existing review, recovery and reporting boundaries.

CLI readiness and update discovery are authoritative. Notifications are advisory `{type, body}` entries. Load only the requested workflow or matching handler. No routine agent-side index fetch, peer roster check or update prompt. Actual authorized installation follows the canonical `https://www.threadwave.xyz/cli/setup/agent.md` guide. No installation backups; preserve local configuration, authentication and durable user work.

`suite-manifest.json` declares the candidate roster and atomic package version. `skill-manifest.json` declares installed version plus common and selected-workflow capability requirements. `release-index.json` remains the public artifact authority and may stay legacy while the candidate develops. Never overwrite public metadata to make source validation pass. Build fresh candidate data explicitly and package it in the isolated candidate tree.

Keep English and Simplified Chinese UX, exact user-authored content, CLI-owned refs/continuations, scoped install authority and truthful support receipts. Installed resources contain no runtime scripts. Never modify active user skill/plugin installations as part of source development.

## Authority and change rules

Current user/system instructions precede repository rules. The Vault owns Product -> UX -> UI -> System -> Components -> Files intent; runtime code, manifests and public artifacts own executable facts. Read the owning CLI contract before changing commands. Track substantial approved work in staging and source/test paths in `06-Files/Skills/`.

Do not commit, push, publish, or change public release metadata without the required current authorization. Preserve unrelated changes. Use Node 22 and existing npm checks. Update registered Vault mirrors through its synchronization tool.

The retained release procedure below does not authorize publication. The user clarified on 2026-09-24 that local administrator `threadwave-release` tooling is outside this update; leave it unchanged and do not make its source migration an implementation blocker.

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

1. Start an end-user skill-source release only with exact `THREADWAVE_RELEASE: skills`. Changes limited to maintainer documentation, changelogs, tests, evals, or scripts use a normal PR and do not release the suite.
2. From the dirty source tree, create a `codex/` branch without changing versions, run `npm run check` once, commit and push the intended source, and open one PR targeting `main`.
3. Pause for manual review. A later explicit merge instruction in the same task authorizes only that recorded PR. Reject any changed PR head or reviewed tree.
4. Merge the approved PR, fast-forward local `main`, then run `release-gate.mjs prepare-skills-version --pr <number>`. It patch-bumps the suite and only the changed runtime skills, synchronizes `release-index.json`, and builds the atomic artifacts and suite bundle once.
5. Create one deterministic local release-metadata commit on `main` without pushing it. Run the candidate preflight once against that clean commit; it verifies the existing build instead of rebuilding it.
6. Create and upload the complete draft release, publish without Latest, push the exact release-metadata commit to `main`, then mark it Latest.
7. Run `verify-public --scope skills` once. It uses authenticated GitHub identity checks and anonymously downloads each indexed asset and the suite bundle once. Do not download draft assets, rerun local validation or packaging, or add a manual recheck.

If a version commit is already on `main` but its release or assets are missing, treat this as a release-blocking incident. Do not advance versions again or claim setup is healthy. Publish and verify the exact missing release when authorized; otherwise report the mismatch and the required release action.

GitHub writes still require user authority. A request to edit or plan a version does not authorize commit, push, or release publication. If the user requests a version commit/push but has not authorized the matching public release, stop before updating `main` and ask for release authorization rather than creating an out-of-sync public index.

## Validation

Node.js 22 or newer is required. Use npm.

```bash
npm run check  # once before the source PR
node ~/.agents/skills/threadwave-release/scripts/release-gate.mjs prepare-skills-version --pr <number>  # after merge
node ~/.agents/skills/threadwave-release/scripts/release-gate.mjs preflight --scope skills
```

After edits, run syntax/structure validation and the relevant tests. For a version release, these local commands are necessary but not sufficient; the Release Synchronization Gate must also pass.

## Session Hygiene

Every Codex session that changes this repository must add one `.changelog/objective_with_underscores-YYYYMMDD_HHMMSS.md` file with:

1. Objective
2. Final Changes
3. Final Result

Never include credentials, raw prompts, user content, handles, target URLs/status IDs, private paths, or browser/session payloads in changelogs.
