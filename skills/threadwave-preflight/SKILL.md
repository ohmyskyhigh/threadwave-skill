---
name: threadwave-preflight
description: "Run the mandatory readiness gate for every ThreadWave Twitter/X workflow: require the update skill, confirm every release-index roster skill's individual version through GitHub, offer supported-version continuation, run approved CLI/skill updates through the canonical setup guide, verify the tw CLI and supported contracts, check the Chrome extension/setup relay, preserve the original request, and route sanitized failures to threadwave-error-support. Use before twitter-automation, twitter-agent, twitter-post, or twitter-reply, and for ThreadWave setup, update, readiness, dependency, or repair requests. 中文：用于所有 ThreadWave 推特工作流的强制预检，检查发布索引中的技能版本、允许继续使用受支持版本、在批准后通过官方设置指南自动更新 CLI 和技能、检查 Chrome 扩展与依赖，并将净化后的故障转交给 threadwave-error-support。"
---

# ThreadWave Preflight

Own the single mandatory preflight, setup, and recovery contract. Every operation skill in the release-index roster calls this peer by name before any `tw` command. `threadwave-error-support` owns post-failure classification, solution search, and report generation.

## Mandatory Flow

Read [references/preflight-contract.md](references/preflight-contract.md) completely. Run its full flow at the start of each new ThreadWave task or agent session and after any readiness invalidation. Reuse its successful result for an unchanged review or workflow continuation in the same session; a review decision alone is not a new preflight boundary.

The one-way dependency is:

```text
twitter operation skill -> threadwave-preflight -> threadwave-update
failed workflow -> threadwave-preflight -> threadwave-error-support
```

Never call an operation skill during preflight. Return readiness to the originating skill after checks pass. Never call `threadwave-update` again when routing issue-report-only mode.

## Setup Ownership

When any required skill, CLI, or Chrome extension module is missing or incompatible, preserve the original request and use:

`https://www.threadwave.xyz/cli/setup/agent.md`

A supported older skill or CLI is non-blocking. Offer one localized choice only when the user has not already decided in this agent session for the exact same offered versions: continue with the installed versions, or update now. Continue only after the originating capability gate passes.

When the user approves the update, fetch the fixed guide through process execution, follow its current-host update flow yourself, rerun full preflight once, and resume the preserved request. Do not send the user to a browser, ask them to paste the guide, or ask them to type terminal commands. Pause only for the guide's user-owned Chrome, sign-in, payment, or X gates. Setup or update success is not approval for strategy, content, posting, replying, or another X mutation.

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
