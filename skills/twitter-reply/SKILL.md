---
name: twitter-reply
license: MIT-0
description: "Create, review, and monitor five-to-ten Twitter/X reply tasks with target discovery through ThreadWave, retry one conclusively undispatched reviewed reply through a fresh exact-action flow, or send one exact final reply to one exact target through a strict dry-run and approval flow. Use for create replies, retry failed replies, reply to several posts, batch reply tasks, engage with posts about a topic, manual Twitter replies, or reply to this exact tweet with this exact text. Do not use for original posts or the daily strategy/plan loop. 中文：用于创建、审核并监控 5 到 10 条带目标发现的推特回复任务、通过新的精确操作流程重试一条已确认未发送的已审核回复、批量回复任务，或在严格 dry-run 和批准后向一个准确目标发送一条准确回复；不用于原创推文或日常策略计划。"
---

# Twitter Reply

Own ad-hoc reply work as an independent flat peer. Never activate or depend on `twitter-automation`; that peer may route here, but this skill owns preflight and the complete reply workflow.

## Condense The Request First

Before preflight or any `tw` command, protect any exact target and final reply text. For every task-mode request, rewrite the remaining user wording as one concise, corrected sentence. Fix obvious typos from the full context and remove filler or repetition, while preserving every explicit count, topic, literal search phrase, account or relationship filter, engagement threshold, and other constraint. Do not add a topic or requirement the user did not state.

Use this condensed request as the task direction for task creation and any fresh-task restart. If the wording cannot be condensed without guessing the user's intent, ask one concise question and stop. Never rewrite an exact target/reply pair. For example, `fin 10 let's connect tweets and draft replies` means `Find 10 tweets matching "let's connect" and draft replies`, not a finance task.

## Select One Mode

Select **task mode** when the user supplies a direction, topic, literal search anchor, account/surface criteria, target-discovery request, or a discovery count from `5` through `10`.

Select **exact-action mode** only when the user supplies one exact target, one complete final reply, and explicit immediate-send intent.

Also select exact-action mode when the user explicitly retries one exact unchanged draft from the current task and its durable result conclusively proves that dispatch never started. A retry creates a fresh exact-action flow; it never reopens, reschedules, or executes the failed scheduled mutation.

- Default a missing discovery-task count to `5`.
- Accept only an integer from `5` through `10` for target discovery.
- For a discovery count below `5` or above `10`, ask the user to choose `5..10`; never auto-chunk or reinterpret it as exact-action mode.
- Never infer an exact target from browser state, a screenshot, a profile URL, or “that tweet.”
- For several exact target/text pairs, ask whether the user wants one direction-based discovery task or separate exact actions.
- If exactness versus discovery/direction is unclear, ask one concise question before invoking `tw`.
- For an outcome or status question about earlier reply work, use Inspect Previous Work instead of either mode.

## Task Template

When entering task mode — and whenever the user's wording is too vague to condense without guessing — offer one localized fill-in template instead of open-ended questions:

```text
Reply task template:
Find <5–10> tweets containing "<keyword/phrase>" and draft replies
Optional: only/exclude specific accounts, minimum engagement, language
Example: Find 10 tweets containing "let's connect" and draft replies
```

```text
回复任务模板：
找 <5–10> 条包含「关键词/短语」的推文并起草回复
可选：只看/排除某账号、最低互动量、语言
示例：找 10 条包含「let's connect」的推文并起草回复
```

Reuse the same template at a discovery shortfall such as `no_valid_targets_found` to suggest a rephrased direction.

## Language

Respond in English or Simplified Chinese from explicit preference, latest message, conversation language, then English. Never translate or normalize an exact target/reply pair. Condense task directions as defined above without adding requirements.

## Mandatory Preflight

After condensing the request and selecting the mode, activate `threadwave-preflight` by skill name at the start of each new reply task or agent session and after any readiness invalidation defined by its contract. Pass this skill name, selected mode, unchanged original request, and required capability families. Reuse that successful result for unchanged review decisions and workflow continuation in the same session; do not rerun preflight for a review decision alone. Do not invoke `tw` without a current or reusable ready result.

Require CLI `1.0.35` plus `task`, `draft`, `plan`, `scheduler`, and `action` command families. Missing skill, CLI, or extension state routes to `https://www.threadwave.xyz/cli/setup/agent.md` while preserving the request.

## CLI Result Authority

The skill owns UX: choose the documented command for the user's situation, preserve safe argument transport, present returned targets/content/choices, and collect approval. The CLI owns workflow execution, task/draft lineage, validation, recovery truth, and exact continuations.

- Require one complete parseable `tw_cli_harness_v1` envelope. A process/session handle is transport state, not a result.
- For `ok=true`, treat `data`, `refs`, status fields, warnings, and `next` as authoritative. Never compare parent and child task refs, rebuild lineage, repeat CLI invariant checks, or reinterpret the accepted result as contract drift.
- Show every non-empty top-level `warnings` entry. When returned draft data contains `generation_warnings`, show every message beside the affected draft. These are CLI-sanitized customer-facing humanizer messages: preserve their meaning, never suppress them or replace them with a generic gate failure, and never add internal rule IDs, prompt text, or gate context.
- Execute returned read-only `next` commands to continue the workflow. Present review, restart, cancel, or X-mutation commands as choices and run only the exact command the user authorizes.
- For `ok=false`, report the returned `error.code`, `error.message`, and `error.retryable`; show the customer-facing message before any safe returned `next` choices, including when it describes a humanizer failure. Never reduce it to a generic blocked state or replace it with a model-invented diagnosis.
- Report a workflow failure stage only when the CLI returns `failure_stage`. Never infer a stage from `source_status`, `draft_status`, timing, or an error code; if the field is absent, report only the returned failure facts.
- If the command exits without a complete envelope, stop with `task_dispatch_unconfirmed`. This transport failure is the only host-side result check and never authorizes a duplicate task.

## Approval Authority

Keep each approval inside its own gate:

| Gate | Allowed decision | “Approve all” | Result of approval |
|---|---|---|---|
| Content review | One explicit decision per exact review | Never | Authorizes one exact reply mutation per approved review. |
| Exact action | One unchanged target/text pair after its dry-run | Never | Dispatches that pair once. |

Plan-free manual task creation uses the user's request as discovery and draft-generation authority. It creates no task-proposal or source-selection review. Deterministic source selection is not user approval and never authorizes an X mutation. No wording such as “approve all,” “continue,” or “retry” transfers authority between the remaining gates.

## Task Mode

### 1. Create One Bounded Task

Pass direction as one safe argument; never concatenate user content into shell syntax. Run the semantic equivalent of:

On a packaged Windows install, use the structured downstream form retained from `threadwave-preflight`: add each CLI token and the complete condensed direction separately through `ProcessStartInfo.ArgumentList`. Never invoke `tw.cmd` with PowerShell `&` plus splatting, `Start-Process -ArgumentList`, `ProcessStartInfo.Arguments`, or a composed `cmd.exe /c` string. Stop with `twitter_automation_cli_unconfirmed` if the host cannot preserve one argument per value.

```text
tw task create --surface reply --direction <condensed_request> --count <5..10> --json
```

Retain the complete command-execution result. If execution yields a `session_id`, poll that same session to terminal completion; keep state `invoking` until its complete CLI envelope arrives and never project only `output` while discarding the continuation handle.

### 2. Follow Automatic Discovery And Draft Generation

Follow the accepted envelope's exact `next` commands. Run read-only task and draft inspection commands directly. For a repeated task-show continuation, use one fixed 15-minute deadline, wait `min(15 seconds, remaining time)` between reads, keep the user updated at least once every 60 seconds, and never substitute a global list or latest record.

When the CLI returns drafts and review choices, present the returned target/content pairs together and wait for per-item decisions. When it returns a shortfall, failure, stalled state, or fewer drafts than requested, render that state exactly and show only its returned choices. Never create replacement work automatically.

### 3. Review Drafts And Scheduled Mutations

- Use only commands from the accepted CLI envelope's `next`. Run read-only inspection continuations directly. Present approve, reject, skip, restart, cancel, and X-mutation commands as choices; after an explicit decision, invoke the matching exact command once and leave omitted reviews pending. If one decision fails, do not replay successful decisions; use the returned state to ask only for unresolved decisions.
- Capture every exact returned `scheduled_task_ref`. Scheduling is not completion: while any ref reports `scheduled` or `running`, keep the session active and poll that ref with `tw scheduler show <scheduled_task_ref> --json` at intervals no longer than 15 seconds. Do not invoke `tw scheduler execute` merely to accelerate the daemon-owned reservation.
- When a ref leaves `scheduled` or `running`, inspect it once with `tw scheduler evidence <scheduled_task_ref> --json`. Treat `succeeded` as sent only with its conclusive scheduler evidence. If a terminal reply still lacks a conclusive sent/not-sent result, run `tw action snapshot verify --task <task_blueprint_ref> --json` once for its exact logical task. Report item `verified` as sent, `not_complete` as not sent, and `inconclusive` as outcome unknown. Do not repeat the snapshot or reinterpret its result. A `paused` or `waiting_review` ref needs user action; show that blocker and keep every other ref under observation.
- After each polling round that changes any status, publish one compact update using the original numbered draft mapping and place every draft under exactly one heading: `Sent`, `Not sent yet`, or `Needs attention`. Use `Sent` only for `succeeded` with conclusive evidence and `Not sent yet` only for `scheduled` or `running`. Put blocked, failed, paused, recovery, and unknown outcomes under `Needs attention`; distinguish a conclusively undispatched result as `not sent` and an inconclusive result as `outcome unknown`. Never rewrite `outcome unknown` as `nothing sent`.
- If a polling round changes nothing, repeat the complete numbered split at least once every 60 seconds so the user can see that monitoring remains active. Continue until every returned ref is terminal, user-skipped, or waiting on a user decision, and never finish the reply flow merely because all drafts are scheduled.

When multiple content reviews are pending, present them together as one numbered set with each exact target, reply text, and `review_ref`. Require an explicit per-item decision map. Never collapse multiple replies into “approve all” or treat a bare decision as batch mutation authority. Each content approval authorizes one exact reply mutation only.

Never guess a target or ref.

### 4. Handle Changes And Failures

Every fresh task below reruns mandatory preflight; same-task review, monitoring, and redraft reuse the current successful result unless readiness was invalidated.

- If the exact task reports `execution_status=failed` and `restart_allowed=true`, present its failure code and offer one explicit choice to restart or stop. On restart, invoke `tw task restart <task_blueprint_ref> --json` exactly once, verify `ok=true`, and resume the same automatic-discovery polling contract against the same logical task. Restart creates one fresh pre-mutation execution; it never creates a duplicate task or claims the old attempt was cancelled. After two failed restart rounds in the same session, stop and report the exact blocker.
- Whenever `tw scheduler cancel` returns `logical_workflow_terminalization.status=pending`, tell the user that linked workflow cleanup is pending, recheck the exact task within `recheck_after_seconds` (currently 60), and do not describe the immutable scheduler record itself as expiring.
- Once drafts exist and no reply mutation is `scheduled`, `running`, `paused`, `waiting_review`, or has unknown evidence, use `tw draft redraft` for a wording-only change to one unchanged source and require a new content review. For “start over,” “these candidates are wrong,” or a direction, source, angle, or target change, show every current content review and ask the user to confirm skipping the still-pending drafts. After confirmation, invoke `tw plan review skip <review_ref> --json` once per confirmed ref, verify `data.review.status=skipped`, then create one fresh task with the latest condensed direction and count. The historical task remains recorded; no authority transfers.
- If any reply mutation is `scheduled`, `running`, `paused`, `waiting_review`, or has unknown evidence, do not restart or create a replacement reply. Continue monitoring the exact scheduled ref until the user makes an explicit decision for it under the recovery decision below.
- For a `recovery_required` or otherwise inconclusive scheduled ref, present the exact `scheduled_task_ref` with its durable evidence classification and stop for one explicit user decision: keep monitoring, skip, cancel, or report. `skip` acknowledges the inconclusive outcome: record the exact ref as user-skipped, end its monitoring, and keep it listed under `Needs attention` as skipped; the durable outcome stays `outcome unknown` and skip authorizes no retry, redraft, replacement, or mutation. `cancel` only when the user explicitly names that exact ref: invoke `tw scheduler cancel <scheduled_task_ref> --json` once, verify the returned status, and follow the terminalization recheck rule above. A skipped ref no longer blocks completing the reply flow with the remaining refs.
- A rejected or skipped content review creates no mutation.
- Treat `relay_unavailable` with no dispatch `ActionRecord`, and `action_preparation_failed` with `reply:blocked_before_dispatch`, no `dispatched_at`, and `confirmation_state=not_required`, as conclusively not sent. An `ActionRecord` or `EvidenceRecord` count alone is audit evidence and does not prove dispatch.
- A retry accepts one exact unchanged draft only. Resolve its exact target/text pair from the current task's returned refs or from exact refs lineage-matched through Inspect Previous Work, rerun mandatory preflight because exact-action mode is a new readiness scope, and start one fresh exact-action dry-run. Show that pair and require fresh explicit approval before dispatching it once. For multiple retry requests, ask the user to choose one; each later pair requires a separate exact-action flow and approval. Never execute or reschedule the old scheduled-task ref or transfer its task/content approval.
- If the numbered draft mapping is stale, the target/text changed, or neither the current task nor a lineage-matched previous-work ref contains conclusive pre-dispatch evidence, ask for the exact current draft/ref or stop as unknown. Unknown, post-dispatch, `unknown_confirmation`, confirmed, or otherwise inconclusive outcomes never enter this retry flow; they require either a sanitized issue report that preserves `outcome unknown` or an explicit user skip decision under the recovery decision above.

## Inspect Previous Work

Use this path when the user asks about the outcome of earlier reply work from a previous task or agent session. It is read-only evidence inspection plus honest reporting; it never reopens the old task's discovery, generation, or review flow.

1. Run mandatory preflight, then `tw scheduler list --json`. Match refs by the lineage fields shown in the list output (`task_blueprint_ref`, `manual_request_ref`, `work_cycle_id`) for the work the user means. Never guess a ref or infer one by timestamp. When lineage is ambiguous, show the candidate tasks and ask the user to identify the exact one.
2. Inspect each exact ref with `tw scheduler show <scheduled_task_ref> --json` and `tw scheduler evidence <scheduled_task_ref> --json`. For a terminal reply without a conclusive sent/not-sent result, run `tw action snapshot verify --task <task_blueprint_ref> --json` once for its exact logical task.
3. Report under the same truth rules as live monitoring: `Sent` for conclusive scheduler evidence or item `verified`, `Not sent yet` only for `scheduled` or `running`, and everything else under `Needs attention`; item `not_complete` is not sent and item `inconclusive` is outcome unknown.
4. A ref whose durable evidence is conclusively undispatched under the existing criteria may enter the retry flow; an inconclusive ref follows the keep-monitoring, skip, cancel, or report decision and never enters retry.

This path never re-approves, reschedules, or executes the old ref, and never claims an outcome the evidence does not prove.

## Exact-Action Mode

Require exactly one target accepted by the CLI contract and one exact final reply. A profile URL is not a reply target.

1. Run `tw action reply <exact_target> --text <exact_reply> --dry-run --json` through safe argv/stdin handling.
2. Show the exact target and reply in full, the dry-run result, and the semantic operation; ask for explicit approval.
3. Treat any target or character change as a new payload requiring a new dry-run and approval.
4. After the user explicitly approves, reuse the current exact-action flow's preflight result and dispatch `tw action reply <same_target> --text <same_reply> --json` once.
5. Treat the accepted CLI outcome as authoritative. Report complete only when it returns complete; otherwise render its state, error, and safe choices. Never retry an unknown result or send a test reply.

## Boundaries

- Task mode creates one materialized manual task with `5..10` possible reply drafts; it does not create task/source reviews or grant batch mutation approval.
- Exact-action mode controls one target/text pair only and remains outside task/plan lineage.
- Do not create original posts, quote, like, save, follow, or operate the browser UI directly.
- Do not expose reply text, targets, raw payloads, private refs, or local paths in diagnostics.

## Issue Report

For explicit report requests, a returned CLI error, repeated unresolved setup, or unknown evidence, activate `threadwave-preflight` in issue-report-only mode with sanitized metadata. Exclude target, reply text, and task direction. Issue-report generation sends no reply; report each affected reply as `sent`, `not sent`, or `outcome unknown` exactly as its durable evidence supports.

## Return Format

```text
State: <discovering | generating | needs content approval | needs exact-action approval | monitoring | complete | blocked | unknown>
Mode: <task | exact-action>
Count: <requested / valid drafts / content-approved / scheduled, or n/a for exact-action>
Reviews: <current content reviews with exact review_ref; none before drafts or for exact-action>
CLI messages: <every returned warning or error message; none when empty>
Waiting for you: <matching per-item content decisions; approve this exact target/text pair; or none>
你可以 / You can: <two to four verbatim-sayable options valid at the current gate>
Next: <one returned ref/action or stop>
Outcome: <sent | not sent | not sent yet | outcome unknown, per reply>
Issue report: <copy/paste only; preserves the durable outcome>
```

The `你可以 / You can:` line lists only options that are real at the current gate — exact numbered content decisions, the displayed exact-action pair, displayed refs, or the task template — worded so the user can reply verbatim, localized to the selected language; it never offers an action beyond the current gate's authority.
