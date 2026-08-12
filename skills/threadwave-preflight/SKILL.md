---
name: threadwave-preflight
license: MIT-0
description: "Run the mandatory readiness gate for every ThreadWave Twitter/X workflow: require the update skill, confirm every release-index roster skill's individual version through GitHub, offer supported-version continuation, run approved skill and CLI updates as separate component-scoped flows through the canonical setup guide, verify the tw CLI and supported contracts, check the Chrome extension/setup relay, preserve the original request, and route sanitized failures to threadwave-error-support. Use before twitter-automation, twitter-agent, twitter-post, or twitter-reply, and for ThreadWave setup, update, readiness, dependency, or repair requests. 中文：用于所有 ThreadWave 推特工作流的强制预检，检查发布索引中的技能版本、允许继续使用受支持版本、通过官方设置指南按组件分别更新 skill 和 CLI、检查 Chrome 扩展与依赖，并将净化后的故障转交给 threadwave-error-support。"
---

# ThreadWave Preflight

Own the single mandatory preflight, setup, and recovery contract. Every operation skill in the release-index roster calls this peer by name before any `tw` command. `threadwave-error-support` owns post-failure classification, solution search, and report generation.

## Mandatory Flow

Read [references/preflight-contract.md](references/preflight-contract.md) completely. Run its full flow at the start of each new ThreadWave task or agent session and after any readiness invalidation. Reuse its successful result for an unchanged review or workflow continuation in the same session; a review decision alone is not a new preflight boundary.

Select and retain the contract's platform invocation adapter before the first CLI readiness call. A Windows packaged install uses the absolute system `cmd.exe` and canonical managed `tw.cmd` only for the fixed readiness templates; it never invokes a version-directory `tw.exe` or inserts user content into `cmd.exe /c`.

On a native Windows Codex host, run those fixed readiness templates through an already-available non-sandboxed local process capability from the first call. Do not probe inside the sandbox or ask the user to approve or choose this execution boundary. This is not administrator or UAC elevation, and it never widens the closed command mapping.

The one-way dependency is:

```text
twitter operation skill -> threadwave-preflight -> threadwave-update
failed workflow -> threadwave-preflight -> threadwave-error-support
```

Never call an operation skill during preflight. Return readiness to the originating skill after checks pass. Never call `threadwave-update` again when routing issue-report-only mode.

## Setup Ownership

When a required skill, CLI, or Chrome extension module is missing or incompatible, preserve the original request and use:

`https://www.threadwave.xyz/cli/setup/agent.md`

A supported older skill or CLI is non-blocking. Offer one localized choice only when the user has not already decided in this agent session for the exact same offered versions: continue with the installed versions, or update now. Continue only after the originating capability gate passes.

Scope the guide to the affected component. A missing, incompatible, or approved skill update uses `skills_only` and never runs a CLI installer, `tw update`, `tw setup`, daemon repair, or native-host registration. A CLI-only update uses `cli_only` and never fetches or installs skills. When both are pending, use `skills_and_cli` and complete the CLI path before the skill path. Reserve `full_setup` for initial setup or missing/unknown core runtime readiness.

When the user approves the update, fetch the fixed guide through process execution, follow only the selected current-host scope yourself, rerun full preflight once, and resume the preserved request. Do not send the user to a browser, ask them to paste the guide, or ask them to type terminal commands. Pause only for the guide's user-owned Chrome, sign-in, payment, or X gates. Setup or update success is not approval for strategy, content, posting, replying, or another X mutation.

## Language

Support English and Simplified Chinese requests. Choose explicit user preference first, then the latest message, then conversation language, defaulting to English. Keep skill names, commands, JSON keys, refs, schemas, and stable error codes in English. Never translate or normalize exact post/reply content.

## Error Support Handoff

Direct error, solution-search, and report requests activate `threadwave-error-support` without preflight. For a potentially report-worthy workflow failure, stop the workflow and pass only the sanitized handoff fields defined by the preflight contract.

Issue-report-only mode remains only as a compatibility route: it accepts already-sanitized diagnostic metadata, skips the update/preflight loop, and hands the payload to one separate `threadwave-error-support` task. If task creation is unavailable, return one pasteable handoff. Do not classify, search, render the report, retry, or resume the failed workflow here.

## Return Format

```text
State: <ready | waiting for you | blocked>
Completed: <verified checks or safe repairs>
Versions: <every roster skill's confirmed version>
Preflight: <skills / updates / CLI / setup / selected capability>
Problem: <stable code and localized meaning>
Waiting for you: <one user-owned action>
Next: <return to the originating skill or one setup action>
Error support: <separate task created | pasteable handoff | not needed>
```
