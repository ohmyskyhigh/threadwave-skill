# Single Release Index Authority

## Objective

Make `release-index.json` the single remote authority for user setup and skill
updates: installation roster, suite roles, per-skill latest versions, and
immutable per-skill artifacts with SHA-256 checksums. Remove every hardcoded
six-skill roster so the suite can grow without coordinated edits across
scripts, tests, skills, and the web setup guide.

## Final Changes

- `release-index.json`: upgraded to schema `threadwave-skill-release-index-v2`
  with `roles` (`preflight` / `update`) and `required_skills` entries carrying
  `latest_version`, `minimum_supported_version`, `artifact_url`, and `sha256`.
- `scripts/build-release-artifacts.mjs` (new, `npm run artifacts`): packs each
  roster skill into `dist/skills/<name>-<version>.tgz` and regenerates the
  release index with real checksums, preserving each skill's existing
  `minimum_supported_version`.
- `skills/threadwave-update/SKILL.md`: uses agent-host URL-read and
  skill/file-read capabilities to derive the roster and compare versions. The
  installed skill contains no Node.js/MJS checker or shell-specific command.
- `scripts/suite-policy.mjs`, `scripts/validate-suite.mjs`,
  `scripts/set-skill-version.mjs`, `scripts/generate-eval-review.mjs`: roster
  derived from `suite-manifest.json` (repository/CI declaration) and the
  release index; validator also checks index v2 shape, roles, and artifact
  URL/checksum fields.
- All skill `SKILL.md` files, the preflight contract, the issue-report
  contract, and agent prompts: roster-agnostic wording (no fixed skill count).
- Version bumps: `threadwave-preflight` 0.3.0 and `threadwave-update` 0.3.0
  (minimum supported 0.3.0 because prior releases depended on runtime
  scripts), operation skills 0.4.1, and suite bundle 0.5.0.
- Tests updated to derive the roster from the manifests and validate the
  index-driven, runtime-free update and issue-report contracts.
- `threadwave-preflight` now invokes `tw` through the host process capability
  without `command -v`, `which`, `where`, Bash, PowerShell, or CMD discovery.
  Its issue report is rendered directly from an allowlisted Markdown template;
  the bundled MJS report renderer was removed.
- The issue-report schema accepts dynamically discovered skill names and
  version maps, so future roster additions require no third hardcoded list.
- `AGENTS.md`: authority list and change rules updated; artifact rebuild step
  documented after version bumps.

## Final Result

`npm run check` passes (suite validation plus 19/19 tests), every roster skill
folder passes the skill validator, and the preflight/update release artifacts
contain no runtime script directory. `suite-manifest.json` remains a CI/build
file only; user setup fetches `release-index.json` alone. The suite-v0.5.0
artifacts are ready for the matching GitHub release.
