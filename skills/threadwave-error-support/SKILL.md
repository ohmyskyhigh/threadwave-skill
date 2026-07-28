---
name: threadwave-error-support
description: "Find and report ThreadWave failures safely. Use this skill whenever a user reports a ThreadWave error, blocker, repeated repair failure, unknown mutation result, asks whether a failure is a bug, asks for a known solution, or wants a Markdown issue report. It classifies report-worthy failures, searches the public ThreadWave error repository without requiring a GitHub account, and renders a sanitized bilingual copy/paste report when needed. 中文：当用户遇到 ThreadWave 错误、阻塞、重复修复失败、未知执行结果，或要求查找解决方案、判断是否应报告、生成问题报告时，使用此技能。"
---

# ThreadWave Error Support

Own the complete post-failure support path: decide whether the failure is report-worthy, search public known errors, and generate a safe report when the problem remains unresolved.

## Mandatory Contract

Read [references/error-support-contract.md](references/error-support-contract.md) completely before handling a failure or report request. Follow its classification, search, validation, redaction, and output rules as one flow.

This skill is independent of ThreadWave workflow execution. Never invoke an operation skill, resume the failed workflow, apply a retrieved fix, or mutate GitHub.

## Task Boundary

Prefer a dedicated support task containing only the sanitized handoff defined by the contract. A direct user request in a new task is already a valid support task.

If the originating host cannot create a separate task, ask the user to start one with the sanitized handoff block. Do not silently continue support inside the failed workflow task.

## Setup Boundary

If this required skill or another roster skill is missing or outdated, preserve only the sanitized failure fields and direct the user to:

`https://www.threadwave.xyz/cli/setup/agent.md`

Do not install skills, the CLI, or the extension directly.

## Language

Use the user's explicit language preference, then the latest message, then the conversation language, defaulting to English. Support English and Simplified Chinese. Keep skill names, schemas, error codes, labels, and commands in English.

## Return Format

```text
State: <solution found | workaround found | known open error | report ready | not report-worthy>
Problem: <stable code and localized summary>
Search: <matched | no match | unavailable>
Sources: <zero to three canonical GitHub issue links>
Next: <one safe user-controlled action>
Issue report: <sanitized Markdown when needed; nothing sent>
```

Always say whether search completed and whether a report was generated. Never imply that a report was submitted.
