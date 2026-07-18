# Issue Report Contract

`threadwave-preflight` is the single issue-report authority for every suite skill. Every operation and update skill may hand sanitized diagnostic metadata to this skill in issue-report-only mode.

## Generate A Report When

- the user explicitly asks;
- page-guided skill installation/update completed but a skill remains missing or outdated;
- the GitHub release index check fails on a later invocation after one transient failure;
- a supported CLI schema or command drifts;
- one safe repair fails or repeats;
- mutation evidence is unknown or inconclusive;
- an unexpected internal failure remains after bounded diagnosis.

Do not report a normal Chrome permission, authentication, subscription/payment, X login, content approval, pacing, or other documented user gate.

## Render Without A Runtime

Build the report directly as Markdown. Do not invoke Node.js, Python, `curl`, Bash, PowerShell, CMD, or a bundled script. Include only fields from this allowlist:

- report schema: `threadwave-issue-report-v2`;
- generated timestamp when the host supplies one safely;
- locale and active skill name;
- installed/latest skill version maps from the validated update result;
- update state, short CLI version, install mode, and platform family;
- stable category, stage, error codes, check states, and command templates without user values;
- one sanitized summary and one recommended next step;
- `submission.mode=copy_paste`, `submission.sent=false`, and `user_consent_required=true`.

Use this output shape:

```text
# ThreadWave Issue Report | ThreadWave 问题报告

- Schema: threadwave-issue-report-v2
- Skill: <allowlisted skill name>
- Update state: <confirmed | update_required | unconfirmed>

## Skill versions
<installed/latest versions only>

## Summary
<sanitized diagnostic summary>

## Error codes
<stable codes only>

## Checks
<allowlisted state and code only>

## Recommended next step
<one sanitized action>

## Privacy and submission
Sensitive and user-content fields were excluded. This report has not been sent; it is for copy/paste only.
```

Present the generated Markdown in a fenced block. State that it has not been sent. Never upload it, open a GitHub issue, or contact anyone automatically.

## Never Include

- post/reply text, target URL, status ID, ref, or handle;
- tokens, cookies, authorization, CSRF, checkout/callback values, or secrets;
- raw DOM, GraphQL, browser, daemon, backend, setup, action, or evidence payloads;
- raw prompts or conversation history;
- usernames, home directories, private paths, keys, environment values, or unsanitized stack traces.

A future API may accept the same sanitized payload only after the user sees it and explicitly consents. Do not infer that behavior.
