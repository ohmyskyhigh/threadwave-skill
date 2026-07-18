---
name: twitter-reply
description: "Create and review one-to-five Twitter/X reply tasks with target discovery through ThreadWave, or send one exact final reply to one exact target through a strict dry-run and approval flow. Use for create replies, reply to several posts, batch reply tasks, engage with posts about a topic, manual Twitter replies, or reply to this exact tweet with this exact text. Do not use for original posts or the daily strategy/plan loop. 中文：用于创建并审核 1 到 5 条带目标发现的推特回复任务、批量回复任务，或在严格 dry-run 和批准后向一个准确目标发送一条准确回复；不用于原创推文或日常策略计划。"
---

# Twitter Reply

Own ad-hoc reply work as an independent flat peer. Never activate or depend on `twitter-automation`; that peer may route here, but this skill owns preflight and the complete reply workflow.

## Select One Mode

Select **task mode** when the user supplies a direction, topic, literal search anchor, account/surface criteria, target-discovery request, or a count from `1` through `5`. Any count above one selects task mode.

Select **exact-action mode** only when the user supplies one exact target, one complete final reply, and explicit immediate-send intent.

- Default a missing task count to `1`.
- Accept only an integer from `1` through `5`.
- For a count above `5`, ask the user to split it explicitly; never create multiple proposals automatically.
- Never infer an exact target from browser state, a screenshot, a profile URL, or “that tweet.”
- For several exact target/text pairs, ask whether the user wants one direction-based discovery task or separate exact actions.
- If exactness versus discovery/direction is unclear, ask one concise question before invoking `tw`.

## Language

Respond in English or Simplified Chinese from explicit preference, latest message, conversation language, then English. Never translate or normalize an exact target/reply pair. Preserve task direction without adding requirements.

## Mandatory Preflight

Activate `threadwave-preflight` by skill name on every invocation and after every user gate. Pass this skill name, selected mode, unchanged request, and required capability families. Do not invoke `tw` until every roster skill, CLI contract, and Chrome setup check returns ready.

Require CLI `1.0.1` plus `task`, `draft`, `plan`, `scheduler`, and `action` command families. Missing skill, CLI, or extension state routes to `https://www.threadwave.xyz/cli/setup/agent.md` while preserving the request.

## Task Mode

### 1. Create One Bounded Proposal

Pass direction as one safe argument; never concatenate user content into shell syntax. Run the semantic equivalent of:

```text
tw task create --surface reply --direction <exact_user_direction> --count <1..5> --json
```

Require `schema_version=tw_cli_harness_v1`, `ok=true`, and returned `manual_request_ref`, `task_blueprint_proposal_ref`, and `review_ref`. Task creation authorizes no discovery, generation, or X mutation until its exact review gate passes.

### 2. Review The Task Proposal

Inspect only the returned review ref with `tw task review show <review_ref> --json`. Present the reply surface, direction, requested count, acquisition route, and safe target-selection scope. Stop for explicit approval.

After approval, rerun preflight and invoke `tw task review approve <same_review_ref> --json` once. Never transfer approval to a changed direction, count, ref, proposal hash, or target policy.

### 3. Review Every Discovered Source

Follow only CLI-returned source-selection refs. Inspect each with `tw task review show`, show its safe public source context, and require an independent approve/reject/skip decision.

Source approval authorizes draft generation for that exact source only. It never authorizes a reply mutation. When fewer valid sources exist than requested, report the actual count and continue only with the valid reviewed sources.

### 4. Review Drafts And Scheduled Mutations

- Inspect generated artifacts through `tw draft show <artifact_ref> --json`.
- Inspect each content review through `tw plan review show <review_ref> --json`.
- Approve, reject, or skip each content review independently.
- Inspect each returned scheduled mutation through `tw scheduler show` and `tw scheduler evidence`.

Never guess a target or ref. Never collapse multiple replies into “approve all.” Each content approval authorizes one exact reply mutation only.

### 5. Handle Changes And Failures

- Direction/source/angle change: use one explicit `tw task retask --task` or `--batch` request after showing exact scope.
- Same-source wording change: use `tw draft redraft`, then require a new content review.
- Rejected source: create no draft or mutation for that source.
- Unknown scheduler or mutation evidence: stop without retry and request a sanitized issue report.

## Exact-Action Mode

Require exactly one target accepted by the CLI contract and one exact final reply. A profile URL is not a reply target.

1. Run `tw action reply <exact_target> --text <exact_reply> --dry-run --json` through safe argv/stdin handling.
2. Show the exact target and reply in full, the dry-run result, and the semantic operation; ask for explicit approval.
3. Treat any target or character change as a new payload requiring a new dry-run and approval.
4. After approval, rerun preflight and dispatch `tw action reply <same_target> --text <same_reply> --json` once.
5. Require `ok=true`, an `action_ref`, and conclusive evidence before reporting complete. Never retry an unknown result or send a test reply.

## Boundaries

- Task mode creates one proposal with `1..5` independent possible reply items; it does not grant batch mutation approval.
- Exact-action mode controls one target/text pair only and remains outside task/plan lineage.
- Do not create original posts, quote, like, save, follow, or operate the browser UI directly.
- Do not expose reply text, targets, raw payloads, private refs, or local paths in diagnostics.

## Issue Report

For explicit report requests, CLI drift, repeated unresolved setup, or unknown evidence, activate `threadwave-preflight` in issue-report-only mode with sanitized metadata. Exclude target, reply text, and task direction. State that nothing was sent.

## Return Format

```text
State: <needs task approval | needs source approval | needs content approval | scheduled | complete | blocked | unknown>
Mode: <task | exact action>
Count: <requested / valid sources / approved / scheduled>
Review: <one exact current review>
Waiting for you: <one decision or setup action>
Next: <one returned ref/action or stop>
Issue report: <copy/paste only; nothing sent>
```
