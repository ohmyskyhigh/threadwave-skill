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

Keep a skipped update offer separately in conversation working memory. It applies across ThreadWave tasks for the rest of the same agent session only while the exact offered skill and CLI local/latest version map is unchanged. Never persist it. Clear it when the agent session ends, any offered version changes, or an install/update occurs. Keep an unconfirmed-index continuation choice the same way: conversation working memory only, applied across ThreadWave tasks for the rest of the same agent session, and re-asked in a new agent session while the index stays unconfirmed. Keep a required-update continuation choice under the same rules: conversation working memory only, rest of the same agent session, re-asked in a new agent session. A new task still runs full preflight and its own capability gate; a required capability or minimum-version failure makes updating mandatory even when the same optional offer was skipped earlier.

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
- the selected CLI invocation adapter, install mode, canonical launcher path, active CLI version, or capabilities result changes;
- setup, login, subscription/payment, Chrome extension/relay, X sign-in/session, or another readiness action occurs;
- any `tw` command reports readiness, compatibility, install, auth, subscription, relay, or X-session failure;
- the agent cannot confirm that the pending refs/scopes belong to the same unchanged task.

If reuse is allowed, return the prior `ready` result to the originating skill and continue the exact pending workflow without invoking another preflight command.

## 3. Invoke The Update Authority

Activate `threadwave-update` by skill name and pass only this request: verify all required ThreadWave skills and return its structured result. Do not locate another skill through a relative file path.

If `threadwave-update` is unavailable, stop before `tw` with `twitter_skill_set_incomplete` and offer the guide's `skills_only` flow from `https://www.threadwave.xyz/cli/setup/agent.md` after approval. Do not run a CLI installer or touch CLI/runtime state while repairing the skill suite.

Require the returned result to have:

- `schema_version=threadwave-skill-update-v1`;
- `latest_confirmed=true`;
- every release-index roster skill listed, each present with a valid local manifest; each local version's relation to its own `minimum_supported_version` and `latest_version` reported per entry, with out-of-range versions routed to the choice below instead of an automatic stop;
- `ok=true` and `state=ready`, with every non-current skill listed in `updates` under its own entry state (`update_available`, `unsupported`, or `unrecognized`).

When `updates` is nonempty, preserve the version map and continue the read-only preflight checks; do not block or send the user to the guide. On missing or invalid skills, preserve the request and offer the approved `skills_only` setup-guide flow in section 5; do not offer continuation or invoke `tw` — the skill set is incomplete. After that scoped install, rerun full preflight once. On below-minimum or ahead-of-public skills, fold them into the single update choice in section 5 with continuation available whenever the remaining checks pass. On an unconfirmed GitHub release index after the update skill's retry, do not claim latest; show exactly one localized choice:

```text
Could not confirm the latest ThreadWave versions. Choose:
1. Continue
2. Stop
```

```text
无法确认 ThreadWave 最新版本。请选择：
1. 继续
2. 停止
```

Continue proceeds to the remaining read-only checks in sections 4 through 7 with the version map unconfirmed; keep the choice in conversation working memory for the rest of the same agent session and never persist it. A new agent session reruns the update check and asks again while the index stays unconfirmed. Stop returns `twitter_skill_update_unconfirmed` to the originating skill as blocked.

Do not invoke update in issue-report-only mode. That compatibility mode only routes already-sanitized diagnostic metadata to `threadwave-error-support`.

## 4. Select The CLI Invocation Adapter And Run Preflight

Use the host agent's structured process or command-execution capability. Select exactly one adapter before the first CLI readiness call and retain it in conversation working memory:

- `windows_managed_cmd`: the default for Windows end-user and packaged installs. Resolve `%SystemRoot%\System32\cmd.exe` and `%LOCALAPPDATA%\ThreadWave\bin\tw.cmd` from the host process environment and require both paths to be absolute. The command processor must be the absolute System32 `cmd.exe`; the launcher must be the canonical managed `tw.cmd`. Never use `ComSpec`, PATH discovery, or another command processor. Never invoke a version-directory `tw.exe`, including `cli\versions\**\tw.exe`.
- `direct_process`: use for macOS/Linux and for a trusted Windows development workspace identified by current workspace instructions. Invoke the selected executable with a structured argument array, not a shell command string. Windows development worktree checks remain direct-process calls.

On a native Windows Codex host, run every fixed `windows_managed_cmd` readiness operation through the host's already-available non-sandboxed local process capability from the first call. The Codex sandbox can block the backend or loopback daemon and misclassify a healthy installation as `network_unavailable`, so do not run a sandboxed probe first and do not ask the user to approve or choose this execution boundary. Non-sandboxed execution here is not administrator or UAC elevation and remains limited to the closed fixed mapping below. If host policy does not already provide non-sandboxed local process execution, stop with `twitter_automation_cli_unconfirmed`; never fall back to sandboxed execution or ask the user to change sandbox settings.

If the host cannot execute local processes at all, stop with `twitter_automation_cli_unconfirmed`; do not guess readiness. Do not use `command -v`, `which`, `where`, or a shell-specific discovery command.

For `windows_managed_cmd`, add only `THREADWAVE_MANAGED_LAUNCHER=<canonical absolute tw.cmd path>` as adapter-specific child-process state. Spawn the absolute System32 `cmd.exe` with `/d /v:off /s /c` and exactly one of these fixed command strings:

| Operation | Fixed command after `/c` |
| --- | --- |
| recurring preflight | `call "%THREADWAVE_MANAGED_LAUNCHER%" preflight --format json` |
| capabilities | `call "%THREADWAVE_MANAGED_LAUNCHER%" capabilities --format json` |
| login | `call "%THREADWAVE_MANAGED_LAUNCHER%" login` |
| subscription | `call "%THREADWAVE_MANAGED_LAUNCHER%" subscribe` |
| setup | `call "%THREADWAVE_MANAGED_LAUNCHER%" setup --format json` |
| doctor | `call "%THREADWAVE_MANAGED_LAUNCHER%" doctor --format json` |

This is a closed local mapping owned by preflight. Validate a returned action's id, type, safety flag, and expected fixed operation, then execute the local fixed template; never pass a raw returned `command` string into `/c`. Never interpolate user-authored content, model output, targets, URLs, refs, paths, or arbitrary CLI text into a fixed command string.

Invoke recurring preflight through the selected adapter using the logical arguments `preflight --format json`.

Require top-level `schema_version=tw-cli-v1`, `data.contract_version=threadwave-preflight-v1`, `data.cli_version>=1.0.32`, and exactly one `data.action`. Read `data.install_mode` and require it to agree with the selected adapter:

- Windows `packaged` requires `windows_managed_cmd` and does not run a worktree command.
- Windows `dev` requires a trusted-workspace `direct_process` selection. Run `tw worktree tag --format json` as a structured direct-process call; add `--expected <tag>` only when trusted workspace instructions provide it. Stop on `worktree_tag_missing` or `worktree_tag_mismatch`.
- macOS/Linux use `direct_process` for either supported install mode; run the worktree command only for `dev`.
- Other, missing, or adapter-mismatched state stops with `twitter_automation_install_mode_unknown` and routes a sanitized support handoff.

Follow only the one returned action:

- `continue`: proceed to compatibility checks.
- `reinstall`: record `cli_reinstall_required`, preserve the request, skip the remaining CLI compatibility checks, and use the required scoped update in section 5; continuation follows the required-update failure escape in section 5.
- `update`: record `cli_update_available`, do not run the command yet, and proceed to compatibility checks so the user can make one informed update decision.
- `login`: run the adapter's fixed `login` operation in a persistent process call. Wait until it opens ThreadWave sign-in, keep it running, and only then pause for the user's sign-in. Rerun preflight after the command completes.
- `complete_subscription`: run the adapter's fixed `subscription` operation in a persistent process call. Wait until its browser journey opens Stripe checkout, keep it running, and only then pause for the user's payment. Rerun preflight after the command completes. Never combine sign-in and checkout into one pause or create a second checkout.
- `setup`: run the adapter's fixed `setup` operation once and follow only its returned action. Automatically run only a validated action with `safe_to_run=true` that maps to a fixed local readiness operation; pause for every user-confirmation or wait action. Then rerun preflight once.
- `retry_later`: network/backend verification is unavailable. Never report this as authentication failure; retry once later, then stop.

After one login, subscription, or setup action, rerun preflight once through the same adapter. If the same unresolved state repeats, run the adapter's fixed `doctor` operation once and require `schemaVersion=threadwave-doctor-v1`; never expose doctor paths in output or handoffs. Then follow the setup retry rounds below instead of stopping immediately.

### Setup Retry Rounds

Count setup rounds in conversation working memory only: one action plus one preflight recheck is one round. While fewer than three rounds have completed in this agent session, show exactly one localized choice:

```text
Setup is still incomplete after diagnosis. Choose:
1. Run the setup step again (round <N> of 3)
2. Stop and generate a report
```

```text
诊断后设置仍未完成。请选择：
1. 再跑一轮设置（第 <N> 轮，共 3 轮）
2. 停止并生成报告
```

A retry starts one fresh round through the same adapter: run the returned action's fixed operation once, rerun preflight once, and if the same unresolved state repeats, run `doctor` once more and present this choice again with the updated round count. After three completed rounds, or immediately when the user chooses stop, stop with `twitter_automation_setup_unresolved` and route a sanitized support handoff. A new agent session starts the round count fresh.

Setup recovery must preserve the CLI agent session returned by the initial setup result. Follow its validated resume action through the same adapter without reconstructing it through a different executable or browser binding.

The shell adapter is limited to the fixed readiness operations above. Downstream operation skills must retain structured argument or input boundaries and must never convert tweet/reply text, targets, URLs, refs, feedback, or other user values into a `cmd.exe /c` command string.

## 5. Check CLI Compatibility

Invoke capabilities through the same selected adapter using the logical arguments:

```text
capabilities --format json
```

Read the originating skill's local `skill-manifest.json` as a sibling skill manifest, not through a hard-coded path. Require:

- top-level `schema_version=tw-cli-v1`;
- advertised CLI schemas include `tw-cli-v1`;
- advertised harness schemas include `tw-harness-v1`;
- `data.cli_version` is at least the originating manifest's `cli.minimum_version`;
- every required command family is `available`;
- every exact required command is advertised or confirmed by matching command help;
- `data.required_upgrades` is empty for continuation, unless the user holds a session-scoped continuation choice from the required-update failure escape below.

When `data.required_upgrades` is nonempty, record `cli_upgrade_required`; the approved scoped setup-guide flow is required first. Contract drift is `twitter_automation_cli_contract_drift` and is report-worthy. If the guide flow fails, follow the required-update failure escape below.

### Resolve One Update Choice

Keep one user decision while executing each affected component separately. Treat a nonempty `updates` map — whether its entries are `update_available`, below-minimum, or ahead-of-public — or a required skill repair from section 3 as `skills_pending`. Treat `cli_update_available`, `cli_reinstall_required`, or `cli_upgrade_required` as `cli_pending`. If the current request already explicitly says to update, that is approval; run the scoped update without asking again. If the user already chose to continue in this agent session and the exact offered version map is unchanged, do not ask again. Otherwise, when the pending updates are optional, show exactly one localized choice:

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

Offer continuation only when every installed skill is present and valid and the current CLI passes this section's minimum-version, schema, family, command, and `required_upgrades` checks. Choosing continuation waives only that exact optional version offer for the rest of the same agent session; keep the choice in conversation working memory and proceed automatically. Remind again in the next agent session or immediately if the offered version map changes.

For an approved or required update, select exactly one guide mode from the preserved state:

- `skills_only` when `skills_pending` is true and `cli_pending` is false;
- `cli_only` when `cli_pending` is true and `skills_pending` is false;
- `skills_and_cli` when both are true.

Never widen a scoped update. `skills_only` must not run a CLI installer, `tw update`, `tw setup`, daemon repair, extension repair, or native-host registration. `cli_only` must not fetch the skill release index or invoke the Agent Skills installer. `skills_and_cli` runs the CLI path first and the skill path second; if the CLI path fails, stop before touching skills. Version-only updates never use `full_setup`; that mode is reserved for initial setup or missing/unknown core runtime readiness.

For an approved or required update, retrieve the guide itself through process execution. Choose the one fixed command for the current OS and run it yourself:

```bash
# macOS or Linux
curl -fsSL --max-time 30 -H 'Cache-Control: no-cache' https://www.threadwave.xyz/cli/setup/agent.md
```

```powershell
# Windows PowerShell 5.1 or 7
(Invoke-WebRequest -UseBasicParsing -Uri 'https://www.threadwave.xyz/cli/setup/agent.md' -Headers @{"Cache-Control"="no-cache"} -TimeoutSec 30).Content
```

Require the response to identify `Guide ID: twitter-cli-setup` and `Canonical page: https://www.threadwave.xyz/cli/setup`. Do not use Web search, browser navigation, URL-read, a cached copy, or a user-pasted copy to retrieve the guide. Follow only the selected mode for the current agent host: `skills_only` runs the skill prerequisites in §3 and §8 only; `cli_only` runs the CLI prerequisites in §3 and §4 through §7, then stops before §8; `skills_and_cli` completes the CLI path before §8. Run the guide's terminal commands yourself and pause only for its user-owned Chrome, sign-in, payment, or X gates. If retrieval, validation, trust, or installation fails, record the failure in conversation working memory and follow the required-update failure escape below; never invent a fallback.

Use the locale already selected in section 1 as the guide's setup language; do not add a redundant language-choice pause.

After the selected scoped update succeeds, discard the prior readiness result, rerun the full preflight once, and resume the exact preserved originating request without asking the user to repeat it.

### Required Update Failure Escape

Keep a per-session count of setup-guide flow failures for a required update, upgrade, or reinstall in conversation working memory only. On the first failure, stop with the exact failure and offer to retry the guide flow. On the second failure in the same agent session, show exactly one localized choice:

```text
The required ThreadWave update could not be completed. Choose:
1. Continue with the current version (unsupported)
2. Stop
```

```text
必需的 ThreadWave 更新未能完成。请选择：
1. 继续使用当前版本（不受支持）
2. 停止
```

Continue waives the update or reinstall requirement for the rest of the same agent session: proceed with the installed CLI through the remaining checks and the preserved request. Never persist the choice; a new agent session runs the required-update flow again and asks again after two failures. Continue does not suppress real failures: any later readiness, compatibility, install, auth, relay, or X-session error from a `tw` command still invalidates readiness and stops the workflow. Stop returns the matching stable code (`twitter_automation_cli_contract_drift` or `twitter_automation_setup_unresolved`) to the originating skill as blocked, and the report-worthy classification still applies.

## 6. Confirm Recurring Readiness

Normally step 4 must finish with `data.state=ready` and `data.action.id=continue`. The only version exception is `data.state=update_required` with `data.action.id=update`: when the installed CLI passes section 5 and the user skipped that exact offered version map in the current agent session, treat only the update notice as waived. A required update or reinstall stays mandatory until its guide flow succeeds or the user chooses continuation under the required-update failure escape in section 5. Any other preflight action remains mandatory, and any later readiness, auth, subscription, relay, setup, or X-session error invalidates the current readiness result. At every browser gate, the agent launches the returned safe command or URL first and pauses only after the corresponding page is open. Treat Chrome permission, ThreadWave sign-in, subscription/payment, and X sign-in as normal user gates; never automate the user's interaction or bypass installer, signature, notarization, publisher, or Web Store trust failures.

Run the full preflight after install, after access, after setup, and at the start of each later ThreadWave task or agent session. Within the same unchanged task, reuse the successful result across review decisions and workflow continuation until a readiness invalidation in section 2 occurs.

## 7. Apply The Originating Capability Gate

Use only `cli.required_command_families` and `cli.required_commands` from the originating skill's validated local manifest. Do not maintain a separate operation-skill or command mapping in this contract.

Capability failure is `twitter_automation_capability_unavailable`. Route a support handoff only for skill/CLI drift, not a normal account or user gate.

## 8. Return Without Expanding Authority

Return `ready` plus every confirmed roster skill version to the originating skill. When the user continued past an unconfirmed release index, state that the version map is unconfirmed alongside the `ready` result. Resume the original request without asking the user to repeat it.

Never treat skill update, setup, login, payment, preflight success, or the broad request as approval for strategy, plans, drafts, posting, replying, or scheduler mutation.

## 9. Route Sanitized Failures Without Owning Support

For a potentially report-worthy failure or issue-report-only compatibility request:

1. Stop the originating workflow before any retry or mutation.
2. Build `schema=threadwave-error-support-handoff-v1` using only locale, source skill, stable category/stage/error codes, version maps, update state, CLI version, install mode, platform family, allowlisted check states, command templates without user values, one sanitized summary, and one proposed user-controlled next step.
3. Exclude user content, targets, URLs, handles, raw prompts, conversation history, secrets, private paths, environment values, raw logs, stack traces, DOM, GraphQL, browser state, backend payloads, and transport JSON.
4. If host task creation is available and authority permits it, create at most one separate task for this failure and activate `threadwave-error-support` there. Reuse that task if the same failure is routed again.
5. Otherwise return one pasteable handoff and ask the user to start a separate support task.

Do not decide final report-worthiness, search GitHub, render a report, submit anything, or resume the source workflow.
