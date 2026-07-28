---
name: twitter-post
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

## Language

Respond in English or Simplified Chinese from explicit preference, latest message, conversation language, then English. Never translate or normalize exact post text. Preserve task direction without adding requirements.

## Mandatory Preflight

Activate `threadwave-preflight` by skill name at the start of each new post task or agent session and after any readiness invalidation defined by its contract. Pass this skill name, selected mode, unchanged request, and required capability families. Reuse that successful result for unchanged review decisions and workflow continuation in the same session; do not rerun preflight for a review decision alone. Do not invoke `tw` without a current or reusable ready result.

Require CLI `1.0.21` plus `task`, `draft`, `plan`, `scheduler`, and `action` command families. Missing skill, CLI, or extension state routes to `https://www.threadwave.xyz/cli/setup/agent.md` while preserving the request.

## Task Mode

### 1. Create One Bounded Proposal

Pass direction as one safe argument; never concatenate user content into shell syntax. Run the semantic equivalent of:

```text
tw task create --surface tweet --direction <exact_user_direction> --count <1..5> --json
```

Require `schema_version=tw_cli_harness_v1`, `ok=true`, and returned `manual_request_ref`, `task_blueprint_proposal_ref`, and `review_ref`. Task creation authorizes no X mutation and must not claim that drafts or scheduled posts already exist.

### 2. Review The Task Proposal

Inspect only the returned review ref with `tw task review show <review_ref> --json`. Present the surface, direction, count, acquisition route, and safe scope. Stop for explicit approval.

After approval, invoke `tw task review approve <same_review_ref> --json` once under the reusable same-task preflight result. Reject or skip only after an explicit matching user decision. Never transfer approval to a changed direction, count, ref, or proposal hash.

Capture every exact `task_blueprint_ref` returned by that approval. Start one fixed 180-second deadline, immediately inspect each with `tw task show <task_blueprint_ref> --json`, and repeat only while its `source_status=awaiting_selection`; before each retry, wait `min(15 seconds, remaining time)` so the deadline receives one final read. Never use `tw task review list`, a global review list, or a latest review to discover this task's source reviews.

When `source_status=source_reviews_created`, follow only `source_review_refs_by_status.pending`. If `pending` is empty but `approved` or `archived` is nonempty, that task has no source decision waiting. If all three buckets are empty, treat the response as CLI contract drift and stop. Handle `no_valid_targets_found` as a shortfall and follow CLI-returned refs directly for any other terminal source status.

### 3. Follow Returned Workflow Refs

Use only refs and next actions returned by the CLI:

- inspect and decide any manual `task_proposal` or `source_selection` review through `tw task review`;
- inspect generated artifacts through `tw draft show <artifact_ref> --json`;
- inspect each content review through `tw plan review show <review_ref> --json`;
- approve, reject, or skip each content review independently;
- inspect each returned scheduled mutation through `tw scheduler show` and `tw scheduler evidence`.

Do not guess the next review, artifact, target, or scheduled task. Do not collapse multiple draft reviews into “approve all.” Each content approval can authorize only one exact scheduled X mutation.

### 4. Handle Changes And Shortfalls

- Direction/source/angle change: use one explicit `tw task retask --task` or `--batch` request after showing the exact scope.
- Same-lineage wording change: use `tw draft redraft` with exact feedback, then require a new content review.
- Fewer valid outputs than requested: report actual valid count; never invent or duplicate items.
- Unknown scheduler or mutation evidence: stop without retry and request a sanitized issue report.

## Exact-Action Mode

Require one exact final post. Do not improve, translate, shorten, expand, normalize whitespace, fix spelling, add hashtags, or change punctuation.

1. Run `tw action tweet --text <exact_text> --dry-run --json` through safe argv/stdin handling.
2. Show the exact text in full, the dry-run result, and the semantic operation; ask for explicit approval.
3. Treat any character change as a new payload requiring a new dry-run and approval.
4. After approval, reuse the same-task preflight result and dispatch `tw action tweet --text <same_exact_text> --json` once.
5. Require `ok=true`, an `action_ref`, and conclusive evidence before reporting complete. Never retry an unknown result or send a second post as verification.

## Boundaries

- Task mode creates one proposal with `1..5` independent possible draft items; it does not grant batch mutation approval.
- Exact-action mode controls one post only and remains outside task/plan lineage.
- Do not reply, quote, like, save, follow, or operate the browser UI directly.
- Do not expose user content, raw payloads, private refs, or local paths in diagnostics.

## Issue Report

For explicit report requests, CLI drift, repeated unresolved setup, or unknown evidence, activate `threadwave-preflight` in issue-report-only mode with sanitized metadata. Exclude post text and task direction. State that nothing was sent.

## Return Format

```text
State: <needs task approval | needs source approval | needs content approval | scheduled | complete | blocked | unknown>
Mode: <task | exact action>
Count: <requested / valid / approved / scheduled>
Review: <one exact current review>
Waiting for you: <one decision or setup action>
Next: <one returned ref/action or stop>
Issue report: <copy/paste only; nothing sent>
```
