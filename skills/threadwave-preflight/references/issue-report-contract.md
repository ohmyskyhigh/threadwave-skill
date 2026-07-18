# Issue Report Contract

`threadwave-preflight` is the single issue-report authority for all six skills. Every operation and update skill may hand sanitized diagnostic metadata to this skill in issue-report-only mode.

## Generate A Report When

- the user explicitly asks;
- page-guided skill installation/update completed but a skill remains missing or outdated;
- the GitHub release index check fails on a later invocation after one transient failure;
- a supported CLI schema or command drifts;
- one safe repair fails or repeats;
- mutation evidence is unknown or inconclusive;
- an unexpected internal failure remains after bounded diagnosis.

Do not report a normal Chrome permission, authentication, subscription/payment, X login, content approval, pacing, or other documented user gate.

## Render

Pass allowlisted metadata only to this skill's local renderer:

```bash
node <threadwave-preflight-directory>/scripts/generate-issue-report.mjs
```

The stdin JSON may contain locale, current skill, installed/latest version maps, update state, short CLI/platform metadata, stable category/stage/codes, allowlisted check results, command templates, a sanitized summary, and one next step.

Present the generated Markdown in a fenced block. State that it has not been sent. Never upload it, open a GitHub issue, or contact anyone automatically.

## Never Include

- post/reply text, target URL, status ID, ref, or handle;
- tokens, cookies, authorization, CSRF, checkout/callback values, or secrets;
- raw DOM, GraphQL, browser, daemon, backend, setup, action, or evidence payloads;
- raw prompts or conversation history;
- usernames, home directories, private paths, keys, environment values, or unsanitized stack traces.

A future API may accept the same sanitized payload only after the user sees it and explicitly consents. Do not infer that behavior.
