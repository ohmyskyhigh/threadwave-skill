# Mandatory Preflight Contract

Run this flow before any operation skill invokes `tw`. Complete steps in order. The originating operation skill and request must survive the handoff unchanged.

## 1. Preserve Intent And Select The Operation

Record in working memory only:

- originating skill name;
- exact user intent;
- exact post/reply text and target when present;
- whether this is a resumed approval or user gate.

Unless the user requested preflight directly, require the originating skill to be a release-index roster member other than the skills named by `roles.preflight` and `roles.update`. Never rely on a remembered operation-skill list. Never rewrite or translate exact user content.

Choose `en` or `zh-CN` from explicit preference, latest message, conversation language, then English.

## 2. Invoke The Update Authority

Activate `threadwave-update` by skill name and pass only this request: verify all required ThreadWave skills and return its structured result. Do not locate another skill through a relative file path.

If `threadwave-update` is unavailable, stop before `tw` with `twitter_skill_set_incomplete` and direct the user to `https://www.threadwave.xyz/cli/setup/agent.md`.

Require the returned result to have:

- `schema_version=threadwave-skill-update-v1`;
- `latest_confirmed=true`;
- every release-index roster skill listed;
- `ok=true` and `state=ready`.

On missing or outdated skills, preserve the originating request and route to the setup guide. On an unconfirmed GitHub release index, stop with `twitter_skill_update_unconfirmed`; do not claim latest and do not continue to `tw`.

Do not invoke update in issue-report-only mode. That mode only renders already-sanitized diagnostic metadata.

## 3. Locate The CLI And Diagnose Install Mode

Use the host agent's process or command-execution capability to invoke the ThreadWave executable directly with these arguments:

```text
tw doctor --format json
```

Do not use `command -v`, `which`, `where`, Bash, PowerShell, CMD, or another shell-specific discovery command. If the host reports that `tw` cannot be found or executed, preserve the request, direct the user to `https://www.threadwave.xyz/cli/setup/agent.md`, and pause. If the host cannot execute local processes at all, stop with `twitter_automation_cli_unconfirmed`; do not guess readiness.

Require `schemaVersion=threadwave-doctor-v1` and read `install.mode`.

- `packaged`: do not run a worktree command.
- `dev`: run `tw worktree tag --format json`; add `--expected <tag>` only when trusted workspace instructions provide it. Stop on `worktree_tag_missing` or `worktree_tag_mismatch`.
- Other or missing: stop with `twitter_automation_install_mode_unknown` and generate a report.

Never expose doctor paths in output or reports.

## 4. Check CLI Compatibility

Invoke the executable through the same host capability:

```text
tw capabilities --format json
```

Read the originating skill's local `skill-manifest.json` as a sibling skill manifest, not through a hard-coded path. Require:

- top-level `schema_version=tw-cli-v1`;
- advertised CLI schemas include `tw-cli-v1`;
- advertised harness schemas include `tw-harness-v1`;
- `data.cli_version` is at least the originating manifest's `cli.minimum_version`;
- every required command family is `available`;
- every exact required command is advertised or confirmed by matching command help;
- `data.required_upgrades` is empty.

When CLI upgrades are required, stop and follow only returned upgrade guidance. Contract drift is `twitter_automation_cli_contract_drift` and is report-worthy.

## 5. Probe Setup Without Mutation

Invoke:

```text
tw setup --dry-run --format json
```

Require `schema_version=tw-cli-v1` and `data.contract_version=threadwave-setup-v1`.

- `data.state=ready`: continue.
- Otherwise run `tw setup --format json` once and follow only `data.action`.
- Automatically run a returned command only when `action.type=run_command` and `safe_to_run=true`.
- Pause for `open_url` with `user_confirmation=true` and every `wait_for_user` action.
- Route missing CLI or extension state to `https://www.threadwave.xyz/cli/setup/agent.md`.
- Treat Chrome permission, ThreadWave authentication, subscription/payment, and X login as normal user gates.
- Never bypass installer, signature, notarization, publisher, or Web Store trust failures.

After one safe repair or completed user gate, rerun the dry-run once. Do not loop. If the same non-user action repeats, run doctor once more, stop with `twitter_automation_setup_unresolved`, and generate a report.

## 6. Apply The Originating Capability Gate

Use only `cli.required_command_families` and `cli.required_commands` from the originating skill's validated local manifest. Do not maintain a separate operation-skill or command mapping in this contract.

Capability failure is `twitter_automation_capability_unavailable`. Generate a report only for skill/CLI drift, not a normal account or user gate.

## 7. Return Without Expanding Authority

Return `ready` plus every confirmed roster skill version to the originating skill. Resume the original request without asking the user to repeat it.

Never treat skill update, setup, login, payment, preflight success, or the broad request as approval for strategy, plans, drafts, posting, replying, or scheduler mutation.
