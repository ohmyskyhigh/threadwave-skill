---
name: twitter-post
license: MIT-0
description: "Create and review one-to-five Twitter/X post tasks through ThreadWave, or publish one exact final user-supplied post through a strict dry-run and approval flow. Use for create tweets, write several posts, batch tweet tasks, post about a topic, manual tweet work, post this exact text, send a tweet, or publish on Twitter/X. Do not use for replies or the daily strategy/plan loop. 中文：用于创建并审核 1 到 5 条推文任务、批量发推任务，或在严格 dry-run 和批准后发布一条用户提供的准确原文；不用于回复或日常策略计划。"
---

# Twitter Post

Own ad-hoc tweet work as an independent flat peer. Never activate or depend on `twitter-automation`; that peer may route here, but this skill owns preflight and the complete post workflow.

## Select One Mode

Select **task mode** when the user supplies a topic, direction, desired result, drafting request, or a count from `1` through `5`. Any count above one selects task mode.

Select **exact-action mode** only when the user supplies one complete final post and explicitly wants that exact text published now.

- Default a missing task count to `1`.
- Accept only an integer from `1` through `5`.
- For a count above `5`, ask the user to split it explicitly; never create multiple proposals automatically.
- For several exact final texts, ask whether the user wants one direction-based task or separate exact actions. Never silently turn exact payloads into generative directions.
- If exactness versus direction is unclear, ask one concise question before invoking `tw`.

## Task Template

When entering task mode — and whenever the request is too vague to form a direction — offer one localized fill-in template instead of open-ended questions:

```text
Post task template:
Topic/direction: <what to write about>, count <1–5>
Optional: tone, audience, must-include or must-avoid points
Example: Topic: why small teams should automate release notes, count 3
```

```text
发推任务模板：
主题/方向：<要写什么>，条数 <1–5>
可选：语气、受众、必须包含/避开的点
示例：主题：为什么小团队应该自动化 release notes，3 条
```

Reuse the same template at a shortfall or after a rejected proposal when the user wants to rephrase.

## Language

Respond in English or Simplified Chinese from explicit preference, latest message, conversation language, then English. Never translate or normalize exact post text. Preserve task direction without adding requirements.

## Mandatory Preflight

Activate `threadwave-preflight` by skill name at the start of each new post task. Pass this skill name, selected mode, unchanged request, and required capability families. It checks skill updates for this task, then uses regular CLI preflight, which reuses readiness until 12 hours of inactivity and runs the full check only when stale or invalidated. Do not rerun preflight for a review decision alone. Do not invoke `tw` without a current ready result.

Require CLI `1.0.35` plus `task`, `draft`, `plan`, `scheduler`, and `action` command families. Missing skill, CLI, or extension state routes to `https://www.threadwave.xyz/cli/setup/agent.md` while preserving the request.

## CLI Result Authority

The skill owns UX: choose the documented command for the user's situation, preserve safe argument transport, present returned content and choices, and collect approval. The CLI owns workflow execution, task/draft lineage, validation, recovery truth, and exact continuations.

- Require one complete parseable `tw_cli_harness_v1` envelope. A process/session handle is transport state, not a result.
- For `ok=true`, treat `data`, `refs`, status fields, warnings, and `next` as authoritative. Never compare parent and child task refs, rebuild lineage, repeat CLI invariant checks, or reinterpret the accepted result as contract drift.
- Execute returned read-only `next` commands to continue the workflow. Present review, restart, cancel, or X-mutation commands as choices and run only the exact command the user authorizes.
- For `ok=false`, report the returned `error.code`, `error.message`, and `error.retryable`; present only safe returned `next` choices. Do not replace a CLI error with a model-invented diagnosis.
- Report a workflow failure stage only when the CLI returns `failure_stage`. Never infer a stage from `source_status`, `draft_status`, timing, or an error code; if the field is absent, report only the returned failure facts.
- If the command exits without a complete envelope, stop with `task_dispatch_unconfirmed`. This transport failure is the only host-side result check and never authorizes a duplicate task.

## Task Mode

### 1. Create One Bounded Task

Treat direction as data, never shell syntax:

- A host with a true argument-array child-process API may pass the unchanged direction once through `--direction`.
- Codex and any host that exposes only a shell/PTY command string must create one private temporary directory, write the unchanged direction as UTF-8 through a filesystem tool rather than shell interpolation, and pass only its safe file path through `--direction-file`. Restrict the temporary directory/file to the current user where the host supports permissions.
- Keep that file until the command reaches a terminal result, including when the executor yields a `session_id`, then remove the temporary directory. Never place the direction in a heredoc, shell variable, manually quoted command, or PTY `write_stdin` sequence.

Run the semantic equivalent of:

```text
tw task create --surface tweet --direction-file <private_utf8_path> --count <1..5> --json
```

`--direction` and `--direction-file` are mutually exclusive and normalize to the same trimmed `1..4000` character value. On `task_direction_input_invalid`, surface the returned reason immediately: no daemon/backend task was accepted, so do not retry by switching to inline shell text.

Retain the complete command-execution result. If execution yields a `session_id`, poll that same session to terminal completion; keep state `invoking` until its complete CLI envelope arrives and never project only `output` while discarding the continuation handle.

### 2. Follow Automatic Source Acquisition And Draft Generation

Follow the accepted envelope's exact `next` commands. Run read-only task and draft inspection commands directly. For a repeated task-show continuation, use one fixed 15-minute deadline, wait `min(15 seconds, remaining time)` between reads, and never substitute a global list or latest record.

When the CLI returns drafts and review choices, present the returned content together and wait for per-item decisions. When it returns a shortfall, failure, stalled state, or fewer drafts than requested, render that state exactly and show only its returned choices. Never create replacement work automatically.

### 3. Review Drafts And Scheduled Mutations

Use only commands from the accepted CLI envelope's `next`. Run read-only inspection continuations directly. Present approve, reject, skip, restart, cancel, and X-mutation commands as choices; after an explicit decision, invoke the matching exact command once and leave omitted reviews pending.

Do not guess the next review, artifact, target, or scheduled task. Do not collapse multiple draft reviews into “approve all.” Each content approval can authorize only one exact scheduled X mutation.

### 4. Handle Changes And Shortfalls

- Direction/source/angle change: use one explicit `tw task retask --task` or `--batch` request after showing the exact scope.
- Same-lineage wording change: use `tw draft redraft` with exact feedback, then require a new content review.
- Fewer valid outputs than requested: report actual valid count; never invent or duplicate items.
- Task stalled past the fixed task-show deadline: present the exact `task_blueprint_ref` and offer one explicit user choice — restart via `tw task restart <task_blueprint_ref> --json` once (verify `ok=true` and the returned fresh execution state, then resume the fixed task-show deadline against the same ref; restart is a fresh pre-mutation execution, never a duplicate task or a claim that the old discovery was cancelled), or stop and report the exact blocker. A failed restart invocation or a ref that keeps stalling counts as one failed round; after two failed rounds in the same session, stop and report the blocker.
- Unknown scheduler or mutation evidence: stop without retry. Present the exact ref and its durable classification and stop for one explicit user decision: keep monitoring, skip (acknowledge `outcome unknown` and end monitoring; authorizes no retry or replacement), cancel that exact user-named `scheduled_task_ref` via `tw scheduler cancel` once with returned-status verification, or request a sanitized issue report.

## Exact-Action Mode

Require one exact final post. Do not improve, translate, shorten, expand, normalize whitespace, fix spelling, add hashtags, or change punctuation.

1. Run `tw action tweet --text <exact_text> --dry-run --json` through safe argv/stdin handling.
2. Show the exact text in full, the dry-run result, and the semantic operation; ask for explicit approval.
3. Treat any character change as a new payload requiring a new dry-run and approval.
4. After approval, reuse the current ready result and dispatch `tw action tweet --text <same_exact_text> --json` once.
5. Treat the accepted CLI outcome as authoritative. Report complete only when it returns complete; otherwise render its state, error, and safe choices. Never retry an unknown result or send a second post as verification.

## Boundaries

### Local Media In Exact-Action Mode

Local media is supported only for one manual original post: exact non-empty text plus 1–4 ordered PNG/JPEG files (up to 5 MiB each) or one MP4 (up to 512 MiB). Files must be readable, absolute local regular files, not symlinks. Do not put media into task/draft/scheduler payloads, reply or quote actions. Do not download URLs, generate, edit, mix images/video, transcode, or substitute unsupported GIF/MOV files in this flow.

1. After the normal preflight, inspect `tw capabilities --format json`. Require `data.browser_relay.local_media_upload=true` and both media commands in the `action` family; otherwise stop and present setup/update as the next choice. Do not infer media support from the CLI version alone.
2. Pass text and paths as separate argv values. Run `tw action tweet --text <exact_text> --media <absolute_paths...> --dry-run --json`. This validates files without opening X or writing action records.
3. Show the exact text, ordered media previews when the host can display them, and the returned `data.media_manifest` (basenames, type, size, SHA-256) plus `data.artifact_hash`. A URL or filename is not evidence that you inspected the media. If previews are unavailable, say so and have the user verify the files. Ask for explicit approval of that exact text and those exact ordered files.
4. After approval, dispatch `tw action tweet --text <same_exact_text> --media <same_absolute_paths...> --expected-artifact-hash <reviewed_artifact_hash> --json` once. Use the CLI-returned hash unchanged; never compute, infer, or replace it yourself. Changes to text, bytes, image order, mode or count require a new dry-run and approval. Renaming identical bytes alone does not change identity.
5. Report sent only for `data.status=confirmed`, with the returned `data.status_url` and matching expected/observed media kind/count. Unknown proof or a missing terminal envelope never authorizes a second upload or send. Use only read-only verification choices until the user makes an explicit recovery decision.

中文：本流程仅支持一条手动原创推文：准确原文加 1–4 张有序 PNG/JPEG（每张最多 5 MiB），或一个 MP4（最多 512 MiB）。先检查媒体能力，再 dry-run；展示原文、可用预览、文件顺序和返回的哈希，获得明确批准后带同一哈希发送一次。文字、文件内容、顺序或数量变化须重新审核；结果未知时不得重传或重发。任务、定时、回复、引用、远程链接和转码不在本流程内。

### Shared Boundaries

- Task mode creates one materialized manual task with `1..5` possible post drafts; it creates no task-proposal or source-selection review and grants no batch mutation approval.
- Exact-action mode controls one post only and remains outside task/plan lineage.
- Do not reply, quote, like, save, follow, or operate the browser UI directly.
- Do not expose user content, raw payloads, private refs, or local paths in diagnostics.

## Issue Report

For explicit report requests, a returned CLI error, repeated unresolved setup, or unknown evidence, activate `threadwave-preflight` in issue-report-only mode with sanitized metadata. Exclude post text and task direction. State that nothing was sent.

## Return Format

```text
State: <invoking | discovering | generating | needs content approval | scheduled | complete | blocked | unknown>
Mode: <task | exact action>
Count: <requested / valid / approved / scheduled>
Reviews: <current content reviews with exact review_ref; none before drafts or for exact action>
Waiting for you: <matching per-item content decisions; one exact-action approval; or setup action>
你可以 / You can: <two to four verbatim-sayable options valid at the current gate>
Next: <one returned ref/action or stop>
Issue report: <copy/paste only; nothing sent>
```

The `你可以 / You can:` line lists only options that are real at the current gate — exact numbered decisions, displayed refs, or the task template — worded so the user can reply verbatim, localized to the selected language; it never offers an action beyond the current gate's authority.
