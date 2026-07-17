# Issue Report Contract

Every suite skill can create a safe report the user can copy and paste to the ThreadWave maintainer.

## Generate A Report When

- the user explicitly asks to report a problem;
- the atomic suite is incomplete or versions differ;
- a supported CLI schema/command has drifted;
- one safe repair was attempted and failed;
- setup repeats the same unresolved non-user action;
- mutation evidence is unknown or inconclusive;
- an unexpected internal failure remains after bounded diagnosis.

Do not generate a report merely because the workflow is waiting for Chrome permission, authentication, subscription/payment, X login, content approval, pacing, or another documented user gate.

## Current Submission Behavior

The current mode is `copy_paste`:

1. Build a `threadwave-issue-report-v1` payload.
2. Sanitize it with `scripts/generate-issue-report.mjs`.
3. Present the Markdown in a fenced block.
4. Tell the user it has not been sent.

Never send, upload, open a GitHub issue, or contact anyone automatically.

A future API may accept the same structured payload and create a GitHub issue only after the user sees the sanitized report and explicitly consents to that submission. Do not add that behavior by inference.

## Safe Input Shape

Give the renderer diagnostic metadata only:

```json
{
  "locale": "en",
  "skill": "twitter-agent",
  "suite_version": "0.3.0",
  "cli_version": "1.0.0",
  "install_mode": "packaged",
  "platform": "darwin",
  "category": "cli_contract_drift",
  "stage": "capabilities",
  "summary": "The installed CLI did not advertise a required command.",
  "error_codes": ["twitter_automation_cli_contract_drift"],
  "checks": [{"id": "required_command", "state": "failed", "code": "command_missing"}],
  "commands": [{"command": "tw capabilities --format json", "status": "passed", "exit_code": 0}],
  "next_step": "Maintainer should compare the suite manifest with the installed CLI contract."
}
```

Prefer command templates over commands containing user values.

## Never Include

- tweet or reply text;
- target URLs, status IDs, or account handles by default;
- tokens, cookies, authorization values, CSRF values, callback state, or checkout URLs;
- raw DOM, GraphQL, browser, daemon, backend, or setup payloads;
- raw prompts, model history, or conversation history;
- usernames, home directories, private paths, private keys, environment values, or secrets;
- unsanitized stack traces or logs.

The renderer uses an allowlist and redaction as a second defense. If uncertain, omit the field.

## Renderer

From the plugin root, pipe the safe JSON payload to:

```bash
node scripts/generate-issue-report.mjs
```

Use `--json` only when a future approved integration needs the structured sanitized payload. The default output is Markdown for copy/paste.
