---
name: threadwave-preflight
description: "Run the mandatory readiness gate for every ThreadWave Twitter/X workflow: require the update skill, confirm every release-index roster skill's individual version through GitHub, verify the tw CLI and supported contracts, check the Chrome extension/setup relay, preserve the original request, and generate bilingual copy/paste issue reports. Use before twitter-automation, twitter-agent, twitter-post, or twitter-reply, and for ThreadWave setup, readiness, dependency, repair, or issue-report requests. 中文：用于所有 ThreadWave 推特工作流的强制预检，检查发布索引中各技能版本、tw CLI、Chrome 扩展、安装状态、依赖、修复和中英文问题报告。"
---

# ThreadWave Preflight

Own the single mandatory preflight, setup, recovery, and issue-report contract. Every operation skill in the release-index roster calls this peer by name before any `tw` command.

## Mandatory Flow

Read [references/preflight-contract.md](references/preflight-contract.md) completely and follow it from step 1 on every invocation, including a resumed approval or user gate.

The one-way dependency is:

```text
twitter operation skill -> threadwave-preflight -> threadwave-update
```

Never call an operation skill during preflight. Return readiness to the originating skill after checks pass. Never call `threadwave-update` again when running issue-report-only mode.

## Setup Ownership

When any required skill, CLI, or Chrome extension module is missing or outdated, preserve the original request and direct the user to:

`https://www.threadwave.xyz/cli/setup/agent.md`

Do not download skills, the CLI, or the extension directly. Setup success is not approval for strategy, content, posting, replying, or another X mutation.

## Language

Support English and Simplified Chinese requests. Choose explicit user preference first, then the latest message, then conversation language, defaulting to English. Keep skill names, commands, JSON keys, refs, schemas, and stable error codes in English. Never translate or normalize exact post/reply content.

## Issue Report

Read [references/issue-report-contract.md](references/issue-report-contract.md) for an explicit report request or a report-worthy failure. Build the report directly from its allowlisted Markdown template using the current agent's text-generation capability. Do not require a local runtime or script. Always state that nothing was sent.

Issue-report-only mode accepts already-sanitized diagnostic metadata from another skill, skips the update/preflight loop, renders the report, and stops.

## Return Format

```text
State: <ready | waiting for you | blocked>
Completed: <verified checks or safe repairs>
Versions: <every roster skill's confirmed version>
Preflight: <skills / updates / CLI / setup / selected capability>
Problem: <stable code and localized meaning>
Waiting for you: <one user-owned action>
Next: <return to the originating skill or one setup action>
Issue report: <copy/paste report; nothing sent>
```
