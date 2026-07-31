# Mandatory Preflight Contract

Run this full flow before the first `tw` command of each new ThreadWave task or agent session and after any readiness invalidation. The originating operation skill and request must survive the handoff unchanged. A successful result may be reused only for the same unchanged task in the same agent session under the rules below.

## 1. Preserve Intent And Select The Operation

Record in working memory only:

- originating skill name;
- exact user intent;
- exact post/reply text and target when present;
- whether this is a new task, an unchanged review continuation, or a readiness gate.

Unless the user requested preflight directly, require the originating skill to be a release-index roster member other than the skills named by `roles.preflight`, `roles.update`, and `roles.support`. Never rely on a remembered operation-skill list. Never rewrite or translate exact user content.

Choose `en` or `zh-CN` from explicit preference, latest message, conversation language, then English.

## 2. Reuse Same-Task Readiness Or Run A Full Check

Keep a successful preflight result in conversation working memory only. Do not write a cache file, persist a receipt, or reuse it in another agent session.

Keep a skipped update offer separately in conversation working memory. It applies across ThreadWave tasks for the rest of the same agent session only while the exact offered skill and CLI local/latest version map is unchanged. Never persist it. Clear it when the agent session ends, any offered version changes, or an install/update occurs. A new task still runs full preflight and its own capability gate; a required capability or minimum-version failure makes updating mandatory even when the same optional offer was skipped earlier.

Reuse that result and skip sections 3 through 7 only when all of these remain true:

- this is the same agent session, originating skill, selected mode, and user-initiated task;
- the originating skill's required command families and exact commands are unchanged;
- the current message is an approval, rejection, skip, edit, redisplay, or continuation of the same active workflow and its exact refs/scopes;
- no readiness invalidation listed below occurred after the successful result.

An ordinary strategy, plan, task, source, draft, or exact-action review decision is a review gate, not a readiness gate. Do not rerun `threadwave-update`, `tw preflight`, or `tw capabilities` for that decision alone.

Discard the reusable result and run the full check when any of these occurs:

- a new ThreadWave task or agent session starts;
- the originating skill, selected mode, user-initiated task, or required capability scope changes;
- a skill or CLI install/update occurs; choosing to continue with an unchanged supported version does not invalidate readiness by itself;
- setup, login, subscription/payment, Chrome extension/relay, X sign-in/session, or another readiness action occurs;
- any `tw` command reports readiness, compatibility, install, auth, subscription, relay, or X-session failure;
- the agent cannot confirm that the pending refs/scopes belong to the same unchanged task.

If reuse is allowed, return the prior `ready` result to the originating skill and continue the exact pending workflow without invoking another preflight command.

## 3. Invoke The Update Authority

Activate `threadwave-update` by skill name and pass only this request: verify all required ThreadWave skills and return its structured result. Do not locate another skill through a relative file path.

If `threadwave-update` is unavailable, stop before `tw` with `twitter_skill_set_incomplete` and offer to run `https://www.threadwave.xyz/cli/setup/agent.md` after approval.

Require the returned result to have:

- `schema_version=threadwave-skill-update-v1`;
- `latest_confirmed=true`;
- every release-index roster skill listed;
- each local version between its own `minimum_supported_version` and `latest_version`, inclusive;
- `ok=true` and `state=ready`, with supported older peers listed in `updates` and their entry state set to `update_available`.

When `updates` is nonempty, preserve the version map and continue the read-only preflight checks; do not block or send the user to the guide. On missing, invalid, below-minimum, or ahead-of-public skills, preserve the request and offer the approved setup-guide flow in section 5; do not offer continuation. On an unconfirmed GitHub release index, stop with `twitter_skill_update_unconfirmed`; do not claim latest and do not continue to `tw`.

Do not invoke update in issue-report-only mode. That compatibility mode only routes already-sanitized diagnostic metadata to `threadwave-error-support`.

## 4. Run The Recurring CLI Preflight

Use the host agent's process or command-execution capability to invoke the ThreadWave executable directly with these arguments:

```text
tw preflight --format json
```

Do not use `command -v`, `which`, `where`, Bash, PowerShell, CMD, or another shell-specific discovery command. If the host reports that `tw` cannot be found or executed, preserve the request and offer the approved setup-guide flow in section 5; continuation is unavailable. If the host cannot execute local processes at all, stop with `twitter_automation_cli_unconfirmed`; do not guess readiness.

Require top-level `schema_version=tw-cli-v1`, `data.contract_version=threadwave-preflight-v1`, `data.cli_version>=1.0.4`, and exactly one `data.action`. Read `data.install_mode`.

- `packaged`: do not run a worktree command.
- `dev`: run `tw worktree tag --format json`; add `--expected <tag>` only when trusted workspace instructions provide it. Stop on `worktree_tag_missing` or `worktree_tag_mismatch`.
- Other or missing: stop with `twitter_automation_install_mode_unknown` and route a sanitized support handoff.

Follow only the one returned action:

- `continue`: proceed to compatibility checks.
- `reinstall`: preserve the request and offer the approved setup-guide flow in section 5; continuation is unavailable.
- `update`: record `cli_update_available`, do not run the command yet, and proceed to compatibility checks so the user can make one informed update decision.
- `login`: run the returned `tw login` command in a persistent process call. Wait until it opens ThreadWave sign-in, keep it running, and only then pause for the user's sign-in. Rerun preflight after the command completes.
- `complete_subscription`: run the returned `tw subscribe` command in a persistent process call. Wait until its browser journey opens Stripe checkout, keep it running, and only then pause for the user's payment. Rerun preflight after the command completes. Never combine sign-in and checkout into one pause or create a second checkout.
- `setup`: run `tw setup --format json` once and follow only its returned action. Automatically run only a returned command with `safe_to_run=true`; pause for every user-confirmation or wait action. Then rerun preflight once.
- `retry_later`: network/backend verification is unavailable. Never report this as authentication failure; retry once later, then stop.

After one login, subscription, or setup action, rerun preflight once. If the same unresolved state repeats, run `tw doctor --format json` once, require `schemaVersion=threadwave-doctor-v1`, stop with `twitter_automation_setup_unresolved`, and route a sanitized support handoff. Never expose doctor paths in output or handoffs.

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
- `data.required_upgrades` is empty for continuation.

When `data.required_upgrades` is nonempty, continuation is unavailable and the approved setup-guide flow is required. Contract drift is `twitter_automation_cli_contract_drift` and is report-worthy.

### Resolve One Update Choice

Combine every supported skill update and `cli_update_available` into one decision. If the current request already explicitly says to update, that is approval; run the update without asking again. If the user already chose to continue in this agent session and the exact offered version map is unchanged, do not ask again. Otherwise show exactly one localized choice:

```text
ThreadWave updates are available. Choose:
1. Continue with installed versions
2. Update now
```

```text
ThreadWave 有可用更新。请选择：
1. 继续使用已安装版本
2. 立即更新
```

Offer continuation only when every installed skill is supported and the current CLI passes this section's minimum-version, schema, family, command, and `required_upgrades` checks. Choosing continuation waives only that exact optional version offer for the rest of the same agent session; keep the choice in conversation working memory and proceed automatically. Remind again in the next agent session or immediately if the offered version map changes.

For an approved or required update, retrieve the guide itself through process execution. Choose the one fixed command for the current OS and run it yourself:

```bash
# macOS or Linux
curl -fsSL --max-time 30 -H 'Cache-Control: no-cache' https://www.threadwave.xyz/cli/setup/agent.md
```

```powershell
# Windows PowerShell 5.1 or 7
(Invoke-WebRequest -UseBasicParsing -Uri 'https://www.threadwave.xyz/cli/setup/agent.md' -Headers @{"Cache-Control"="no-cache"} -TimeoutSec 30).Content
```

Require the response to identify `Guide ID: twitter-cli-setup` and `Canonical page: https://www.threadwave.xyz/cli/setup`. Do not use Web search, browser navigation, URL-read, a cached copy, or a user-pasted copy to retrieve the guide. Follow the fetched guide for the current agent host, run its terminal commands yourself, and pause only for its user-owned Chrome, sign-in, payment, or X gates. If retrieval, validation, trust, or installation fails, stop; never invent a fallback.

Use the locale already selected in section 1 as the guide's setup language; do not add a redundant language-choice pause.

After the guide updates the CLI and every indexed skill, discard the prior readiness result, rerun the full preflight once, and resume the exact preserved originating request without asking the user to repeat it.

## 6. Confirm Recurring Readiness

Normally step 4 must finish with `data.state=ready` and `data.action.id=continue`. The only version exception is `data.state=update_required` with `data.action.id=update`: when the installed CLI passes section 5 and the user skipped that exact offered version map in the current agent session, treat only the update notice as waived. Any other preflight action remains mandatory, and any later readiness, auth, subscription, relay, setup, or X-session error invalidates the current readiness result. At every browser gate, the agent launches the returned safe command or URL first and pauses only after the corresponding page is open. Treat Chrome permission, ThreadWave sign-in, subscription/payment, and X sign-in as normal user gates; never automate the user's interaction or bypass installer, signature, notarization, publisher, or Web Store trust failures.

Run the full preflight after install, after access, after setup, and at the start of each later ThreadWave task or agent session. Within the same unchanged task, reuse the successful result across review decisions and workflow continuation until a readiness invalidation in section 2 occurs.

## 7. Apply The Originating Capability Gate

Use only `cli.required_command_families` and `cli.required_commands` from the originating skill's validated local manifest. Do not maintain a separate operation-skill or command mapping in this contract.

Capability failure is `twitter_automation_capability_unavailable`. Route a support handoff only for skill/CLI drift, not a normal account or user gate.

## 8. Return Without Expanding Authority

Return `ready` plus every confirmed roster skill version to the originating skill. Resume the original request without asking the user to repeat it.

Never treat skill update, setup, login, payment, preflight success, or the broad request as approval for strategy, plans, drafts, posting, replying, or scheduler mutation.

## 9. Route Sanitized Failures Without Owning Support

For a potentially report-worthy failure or issue-report-only compatibility request:

1. Stop the originating workflow before any retry or mutation.
2. Build `schema=threadwave-error-support-handoff-v1` using only locale, source skill, stable category/stage/error codes, version maps, update state, CLI version, install mode, platform family, allowlisted check states, command templates without user values, one sanitized summary, and one proposed user-controlled next step.
3. Exclude user content, targets, URLs, handles, raw prompts, conversation history, secrets, private paths, environment values, raw logs, stack traces, DOM, GraphQL, browser state, backend payloads, and transport JSON.
4. If host task creation is available and authority permits it, create at most one separate task for this failure and activate `threadwave-error-support` there. Reuse that task if the same failure is routed again.
5. Otherwise return one pasteable handoff and ask the user to start a separate support task.

Do not decide final report-worthiness, search GitHub, render a report, submit anything, or resume the source workflow.
