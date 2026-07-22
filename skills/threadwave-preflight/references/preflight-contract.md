# Mandatory Preflight Contract

Run this full flow before the first `tw` command of each new ThreadWave task or agent session and after any readiness invalidation. The originating operation skill and request must survive the handoff unchanged. A successful result may be reused only for the same unchanged task in the same agent session under the rules below.

## 1. Preserve Intent And Select The Operation

Record in working memory only:

- originating skill name;
- exact user intent;
- exact post/reply text and target when present;
- whether this is a new task, an unchanged review continuation, or a readiness gate.

Unless the user requested preflight directly, require the originating skill to be a release-index roster member other than the skills named by `roles.preflight` and `roles.update`. Never rely on a remembered operation-skill list. Never rewrite or translate exact user content.

Choose `en` or `zh-CN` from explicit preference, latest message, conversation language, then English.

## 2. Reuse Same-Task Readiness Or Run A Full Check

Keep a successful preflight result in conversation working memory only. Do not write a cache file, persist a receipt, or reuse it in another agent session.

Reuse that result and skip sections 3 through 7 only when all of these remain true:

- this is the same agent session, originating skill, selected mode, and user-initiated task;
- the originating skill's required command families and exact commands are unchanged;
- the current message is an approval, rejection, skip, edit, redisplay, or continuation of the same active workflow and its exact refs/scopes;
- no readiness invalidation listed below occurred after the successful result.

An ordinary strategy, plan, task, source, draft, or exact-action review decision is a review gate, not a readiness gate. Do not rerun `threadwave-update`, `tw preflight`, or `tw capabilities` for that decision alone.

Discard the reusable result and run the full check when any of these occurs:

- a new ThreadWave task or agent session starts;
- the originating skill, selected mode, user-initiated task, or required capability scope changes;
- a skill or CLI install/update occurs;
- setup, login, subscription/payment, Chrome extension/relay, X sign-in/session, or another readiness action occurs;
- any `tw` command reports readiness, compatibility, install, auth, subscription, relay, or X-session failure;
- the agent cannot confirm that the pending refs/scopes belong to the same unchanged task.

If reuse is allowed, return the prior `ready` result to the originating skill and continue the exact pending workflow without invoking another preflight command.

## 3. Invoke The Update Authority

Activate `threadwave-update` by skill name and pass only this request: verify all required ThreadWave skills and return its structured result. Do not locate another skill through a relative file path.

If `threadwave-update` is unavailable, stop before `tw` with `twitter_skill_set_incomplete` and direct the user to `https://www.threadwave.xyz/cli/setup/agent.md`.

Require the returned result to have:

- `schema_version=threadwave-skill-update-v1`;
- `latest_confirmed=true`;
- every release-index roster skill listed;
- `ok=true` and `state=ready`.

On missing or outdated skills, preserve the originating request and route to the setup guide. On an unconfirmed GitHub release index, stop with `twitter_skill_update_unconfirmed`; do not claim latest and do not continue to `tw`.

Do not invoke update in issue-report-only mode. That mode only renders already-sanitized diagnostic metadata.

## 4. Run The Recurring CLI Preflight

Use the host agent's process or command-execution capability to invoke the ThreadWave executable directly with these arguments:

```text
tw preflight --format json
```

Do not use `command -v`, `which`, `where`, Bash, PowerShell, CMD, or another shell-specific discovery command. If the host reports that `tw` cannot be found or executed, preserve the request, direct the user to `https://www.threadwave.xyz/cli/setup/agent.md`, and pause. If the host cannot execute local processes at all, stop with `twitter_automation_cli_unconfirmed`; do not guess readiness.

Require top-level `schema_version=tw-cli-v1`, `data.contract_version=threadwave-preflight-v1`, `data.cli_version>=1.0.4`, and exactly one `data.action`. Read `data.install_mode`.

- `packaged`: do not run a worktree command.
- `dev`: run `tw worktree tag --format json`; add `--expected <tag>` only when trusted workspace instructions provide it. Stop on `worktree_tag_missing` or `worktree_tag_mismatch`.
- Other or missing: stop with `twitter_automation_install_mode_unknown` and generate a report.

Follow only the one returned action:

- `continue`: proceed to compatibility checks.
- `reinstall`: preserve the request and route to the returned official setup URL.
- `update`: run the returned safe update command, then rerun preflight once.
- `login`: run the returned `tw login` command in a persistent process call. Wait until it opens ThreadWave sign-in, keep it running, and only then pause for the user's sign-in. Rerun preflight after the command completes.
- `complete_subscription`: run the returned `tw subscribe` command in a persistent process call. Wait until its browser journey opens Stripe checkout, keep it running, and only then pause for the user's payment. Rerun preflight after the command completes. Never combine sign-in and checkout into one pause or create a second checkout.
- `setup`: run `tw setup --format json` once and follow only its returned action. Automatically run only a returned command with `safe_to_run=true`; pause for every user-confirmation or wait action. Then rerun preflight once.
- `retry_later`: network/backend verification is unavailable. Never report this as authentication failure; retry once later, then stop.

After one action, rerun preflight once. If the same unresolved state repeats, run `tw doctor --format json` once, require `schemaVersion=threadwave-doctor-v1`, stop with `twitter_automation_setup_unresolved`, and generate a report. Never expose doctor paths in output or reports.

## 5. Check CLI Compatibility

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

## 6. Confirm Recurring Readiness

Step 4 must finish with `data.state=ready` and `data.action.id=continue`. That result is the recurring access/setup gate for first install, return use, and dormant sessions. At every browser gate, the agent launches the returned safe command or URL first and pauses only after the corresponding page is open. Treat Chrome permission, ThreadWave sign-in, subscription/payment, and X sign-in as normal user gates; never automate the user's interaction or bypass installer, signature, notarization, publisher, or Web Store trust failures.

Run the full preflight after install, after access, after setup, and at the start of each later ThreadWave task or agent session. Within the same unchanged task, reuse the successful result across review decisions and workflow continuation until a readiness invalidation in section 2 occurs.

## 7. Apply The Originating Capability Gate

Use only `cli.required_command_families` and `cli.required_commands` from the originating skill's validated local manifest. Do not maintain a separate operation-skill or command mapping in this contract.

Capability failure is `twitter_automation_capability_unavailable`. Generate a report only for skill/CLI drift, not a normal account or user gate.

## 8. Return Without Expanding Authority

Return `ready` plus every confirmed roster skill version to the originating skill. Resume the original request without asking the user to repeat it.

Never treat skill update, setup, login, payment, preflight success, or the broad request as approval for strategy, plans, drafts, posting, replying, or scheduler mutation.
