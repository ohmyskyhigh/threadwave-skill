# CLI invocation and readiness

Use the host agent's structured process or command-execution capability. Select exactly one adapter before the first CLI readiness call and retain it in conversation working memory:

- `windows_managed_cmd`: the default for Windows end-user and packaged installs. Resolve `%SystemRoot%\System32\cmd.exe` and `%LOCALAPPDATA%\ThreadWave\bin\tw.cmd` from the host process environment and require both paths to be absolute. The command processor must be the absolute System32 `cmd.exe`; the launcher must be the canonical managed `tw.cmd`. Never use `ComSpec`, PATH discovery, or another command processor. Never invoke a version-directory `tw.exe`, including `cli\versions\**\tw.exe`.
- `direct_process`: use for macOS/Linux and for a trusted Windows development workspace identified by current workspace instructions. Invoke the selected executable with a structured argument array, not a shell command string. Windows development worktree checks remain direct-process calls.

On a native Windows Codex host, run every fixed `windows_managed_cmd` readiness operation through the host's already-available non-sandboxed local process capability from the first call. The Codex sandbox can block the backend or loopback daemon and misclassify a healthy installation as `network_unavailable`, so do not run a sandboxed probe first and do not ask the user to approve or choose this execution boundary. Non-sandboxed execution here is not administrator or UAC elevation and remains limited to the closed fixed mapping below. If host policy does not already provide non-sandboxed local process execution, stop with `twitter_automation_cli_unconfirmed`; never fall back to sandboxed execution or ask the user to change sandbox settings.

If the host cannot execute local processes at all, stop with `twitter_automation_cli_unconfirmed`; do not guess readiness. Do not use `command -v`, `which`, `where`, or a shell-specific discovery command.

For `windows_managed_cmd`, add only `THREADWAVE_MANAGED_LAUNCHER=<canonical absolute tw.cmd path>` as adapter-specific child-process state. Spawn the absolute System32 `cmd.exe` with `/d /v:off /s /c` and exactly one of these fixed command strings:

| Operation | Fixed command after `/c` |
| --- | --- |
| recurring preflight | `call "%THREADWAVE_MANAGED_LAUNCHER%" preflight --format json` |
| forced preflight after invalidation | `call "%THREADWAVE_MANAGED_LAUNCHER%" preflight --force --format json` |
| capabilities | `call "%THREADWAVE_MANAGED_LAUNCHER%" capabilities --format json` |
| greeting balance | `call "%THREADWAVE_MANAGED_LAUNCHER%" credits --format json` |
| login | `call "%THREADWAVE_MANAGED_LAUNCHER%" login` |
| subscription | `call "%THREADWAVE_MANAGED_LAUNCHER%" subscribe` |
| setup | `call "%THREADWAVE_MANAGED_LAUNCHER%" setup --format json` |
| doctor | `call "%THREADWAVE_MANAGED_LAUNCHER%" doctor --format json` |
| repair local integration | `call "%THREADWAVE_MANAGED_LAUNCHER%" install` |

This is a closed local mapping owned by this adapter. Validate a returned action's id, type, safety flag, and expected fixed operation, then execute the local fixed template; never pass a raw returned `command` string into `/c`. Never interpolate user-authored content, model output, targets, URLs, refs, paths, or arbitrary CLI text into a fixed command string.

Invoke recurring preflight through the selected adapter using the logical arguments `preflight --format json`. After an invalidation or an install, access, or setup change, use the entry resource recheck rule; do not assume the active CLI supports `--force`.

Require top-level `schema_version=tw-cli-v1`, `data.contract_version=threadwave-preflight-v1`, `data.cli_version at least the manifest minimum`, and exactly one `data.action`. For a receipt-aware result, require `data.readiness_reuse.idle_timeout_seconds=43200` and its capability projection. A supported CLI may omit both fields; treat that invocation as legacy full-check mode, never claim durable reuse, use regular preflight for every invalidation, never invoke `--force`, and use the compatibility fallback in the canonical setup guide. Read `data.install_mode` and require it to agree with the selected adapter:

- Windows `packaged` requires `windows_managed_cmd` and does not run a worktree command.
- Windows `dev` requires a trusted-workspace `direct_process` selection. Run `tw worktree tag --format json` as a structured direct-process call; add `--expected <tag>` only when trusted workspace instructions provide it. Stop on `worktree_tag_missing` or `worktree_tag_mismatch`.
- macOS/Linux use `direct_process` for either supported install mode; run the worktree command only for `dev`.
- Other, missing, or adapter-mismatched state stops with `twitter_automation_install_mode_unknown` and routes a sanitized support handoff.

Follow the returned readiness action for normal setup. This is not a restriction on read-only diagnosis or documented evidence-based repairs:

- `continue`: proceed to compatibility checks.
- `reinstall`: record `cli_reinstall_required`, preserve the request, skip the remaining CLI compatibility checks, and use the required scoped update in the canonical setup guide; continuation follows the required-update failure escape in the canonical setup guide.
- `update`: record `cli_update_available`, do not run the command yet, and proceed to compatibility checks so the user can make one informed update decision.
- `login`: run the adapter's fixed `login` operation in a persistent process call. Wait until it opens ThreadWave sign-in, keep it running, and only then pause for the user's sign-in. Run the entry resource preflight recheck after the command completes.
- `complete_subscription`: run the adapter's fixed `subscription` operation in a persistent process call. Wait until its browser journey opens Stripe checkout, keep it running, and only then pause for the user's payment. Run the entry resource preflight recheck after the command completes. Never combine sign-in and checkout into one pause or create a second checkout.
- `setup`: run the adapter's fixed `setup` operation and validate its returned action against the installed CLI contract. Automatically run an authorized repair marked `safe_to_run=true` using a known operation and safe arguments. Read-only waits may continue while progressing; pause for a genuine user-confirmation action. Then run the entry resource preflight recheck.
- `install_local_integration` or `diagnose_install`: validate the action and use the corresponding fixed `install` or `doctor` operation. Keep installer integrity failures on the official reinstall path; never patch the binary.
- `retry_later`: network/backend verification is unavailable. Preserve that classification, respect returned delays, and use evidence-based diagnosis below; do not misreport authentication failure or loop unchanged requests.

After one login, subscription, or setup action, run the entry resource preflight recheck once through the same adapter. If the same unresolved state repeats, run the adapter's fixed `doctor` operation once and require `schemaVersion=threadwave-doctor-v1`; never expose doctor paths in output or handoffs. Then use evidence-based setup recovery below.

### Evidence-Based Setup Recovery

An unresolved setup state is a reason to diagnose, not to ask the user to repeat the same step. Use current doctor checks and the shared diagnosis/repair contract in `support.md` to select a documented repair within the original scope. Perform safe authorized repairs and verify the affected check without a new approval for each round. Preserve the current CLI agent session and active work; do not kill processes, reset bindings, or delete state to force readiness.

Continue when there is measurable progress or a distinct evidence-backed approach. Stop repeating an unchanged action when the same failure and evidence recur. Return `twitter_automation_setup_unresolved` with the verified blocker when no useful safe next step remains; route support in this conversation. User gates and changed scope still require the matching decision. Keep attempted checks and their outcomes in conversation working memory only.

Setup recovery must preserve the CLI agent session returned by the initial setup result. Follow its validated resume action through the same adapter without reconstructing it through a different executable or browser binding.

The fixed shell templates cover readiness operations. Supported diagnostic commands discovered through CLI help/capabilities use the same trusted launcher and the structured downstream transport below; they do not need successful workflow readiness and are not limited to a returned `next` list. Downstream skills must retain structured argument or input boundaries and must never convert tweet/reply text, targets, URLs, refs, feedback, or other user values into a manually composed `cmd.exe /c` command string.

For a packaged Windows downstream operation, reuse the resolved absolute System32 `cmd.exe` and canonical managed `tw.cmd`, but do not reuse the fixed readiness command strings. On a PowerShell/.NET host, create `ProcessStartInfo` with the absolute `cmd.exe` as `FileName` and `UseShellExecute=false`, then call `ArgumentList.Add(...)` once for each value in this exact order: `/d`, `/v:off`, `/s`, `/c`, the absolute managed-launcher path, and each logical CLI token. Materialize every dynamic value as data in a variable and add it exactly once; do not add quote or escape characters yourself. The user direction, post/reply text, target, ref, or feedback must remain one `ArgumentList` entry even when it contains whitespace, quotation marks, or shell metacharacters.

Do not invoke the managed launcher with the PowerShell call operator and splatting such as `& $launcherPath @args`. Do not use `Start-Process -ArgumentList`, `ProcessStartInfo.Arguments`, `Invoke-Expression`, a manually joined argument string, or a version-directory `tw.exe`. Those forms reconstruct shell text and can split or reinterpret a dynamic value. If the host lacks `ProcessStartInfo.ArgumentList` or an equivalent true per-argument child-process API, stop with `twitter_automation_cli_unconfirmed`; never fall back to a string-based invocation.


When supported, add `--skill-version <installed_manifest_version>` before `preflight`. Validate that version as three numeric components before using it in a Windows fixed template. Never interpolate notification body fields into commands. Reuse returned data.capabilities; only use a separate capabilities call when absent or option support is unknown. The CLI owns its readiness receipt; never inspect it. A new workflow calls regular preflight once; review-only continuations reuse the result. Recheck after setup or readiness invalidation. Never force an unknown or changed executable.

After ready preflight, prepend `--agent-session <returned_agent_session_id>` to every operation command, including snapshots, task creation, task wait, reviews and scheduler inspection. Logical command examples omit that shared prefix for readability; the actual invocation must include it. Keep the ID as an argument, not shell text, and do not generate a new ID.
