# ThreadWave Skill Suite Workspace Guide

## Objective

This repository is one atomic Codex plugin containing four public Twitter/X operation skills. Missing skill-suite, CLI, and extension modules are handled by the web-hosted harness setup protocol at `https://www.threadwave.xyz/cli/setup/agent.md`, not by a locally installed fifth skill. The public skill names stay generic and searchable; ThreadWave branding belongs in plugin metadata, descriptions, and workflow content.

## Required Suite

The plugin is runnable only when these four same-version skills are present:

- `twitter-automation`
- `twitter-agent`
- `twitter-post`
- `twitter-reply`

Every skill must run the shared preflight before its own workflow. A missing or version-mismatched skill blocks the whole suite.

## Authority

1. Current user instructions and system/developer rules.
2. This file for repository workflow.
3. `suite-manifest.json` for suite membership and supported contracts.
4. `references/preflight-contract.md` for initialization and recovery.
5. `references/issue-report-contract.md` and its JSON Schema for diagnostics and privacy.
6. Each skill's `SKILL.md` for its workflow and approval boundary.

The active ThreadWave CLI implementation and its source-of-truth docs live in the sibling `threadwave-chrome-extension` repository. Do not silently invent commands, output fields, update endpoints, or approval paths. Update this suite only after checking the current CLI contract.

## Change Rules

- Keep installation atomic through `.codex-plugin/plugin.json`; do not document copying individual skill folders as an installation path.
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
