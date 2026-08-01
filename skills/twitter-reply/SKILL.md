---
name: twitter-reply
description: "Create, review, and monitor five-to-ten Twitter/X reply tasks with target discovery through ThreadWave, retry one conclusively undispatched reviewed reply through a fresh exact-action flow, or send one exact final reply to one exact target through a strict dry-run and approval flow. Use for create replies, retry failed replies, reply to several posts, batch reply tasks, engage with posts about a topic, manual Twitter replies, or reply to this exact tweet with this exact text. Do not use for original posts or the daily strategy/plan loop. 中文：用于创建、审核并监控 5 到 10 条带目标发现的推特回复任务、通过新的精确操作流程重试一条已确认未发送的已审核回复、批量回复任务，或在严格 dry-run 和批准后向一个准确目标发送一条准确回复；不用于原创推文或日常策略计划。"
---

# Twitter Reply

Own ad-hoc reply work as an independent flat peer. Never activate or depend on `twitter-automation`; that peer may route here, but this skill owns preflight and the complete reply workflow.

## Condense The Request First

Before preflight or any `tw` command, protect any exact target and final reply text. For every task-mode request, rewrite the remaining user wording as one concise, corrected sentence. Fix obvious typos from the full context and remove filler or repetition, while preserving every explicit count, topic, literal search phrase, account or relationship filter, engagement threshold, and other constraint. Do not add a topic or requirement the user did not state.

Use this condensed request as the task direction for proposal creation and any fresh-task restart. If the wording cannot be condensed without guessing the user's intent, ask one concise question and stop. Never rewrite an exact target/reply pair. For example, `fin 10 let's connect tweets and draft replies` means `Find 10 tweets matching "let's connect" and draft replies`, not a finance task.

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

## Language

Respond in English or Simplified Chinese from explicit preference, latest message, conversation language, then English. Never translate or normalize an exact target/reply pair. Condense task directions as defined above without adding requirements.

## Mandatory Preflight

After condensing the request and selecting the mode, activate `threadwave-preflight` by skill name at the start of each new reply task or agent session and after any readiness invalidation defined by its contract. Pass this skill name, selected mode, unchanged original request, and required capability families. Reuse that successful result for unchanged review decisions and workflow continuation in the same session; do not rerun preflight for a review decision alone. Do not invoke `tw` without a current or reusable ready result.

Require CLI `1.0.21` plus `task`, `draft`, `plan`, `scheduler`, and `action` command families. Missing skill, CLI, or extension state routes to `https://www.threadwave.xyz/cli/setup/agent.md` while preserving the request.

## Approval Authority

Keep each approval inside its own gate:

| Gate | Allowed decision | “Approve all” | Result of approval |
|---|---|---|---|
| Task proposal | One exact `approve`, `reject`, or `skip` | Never | Starts discovery or source-free generation; no X mutation. |
| Source selection | Matching per-item `approve`, `reject`, or `skip` decisions | Only every still-pending source review in the complete unchanged set displayed immediately before the decision | Generates drafts from the approved sources; no X mutation. |
| Content review | One explicit decision per exact review | Never | Authorizes one exact reply mutation per approved review. |
| Exact action | One unchanged target/text pair after its dry-run | Never | Dispatches that pair once. |

No wording such as “approve all,” “continue,” or “retry” transfers authority between rows.

## Task Mode

### 1. Create One Bounded Proposal

Pass direction as one safe argument; never concatenate user content into shell syntax. Run the semantic equivalent of:

```text
tw task create --surface reply --direction <condensed_request> --count <5..10> --json
```

Require `schema_version=tw_cli_harness_v1`, `ok=true`, and returned `manual_request_ref`, `task_blueprint_proposal_ref`, and `review_ref`. Task creation authorizes no discovery, generation, or X mutation until its exact review gate passes.

### 2. Review The Task Proposal

Inspect only the returned review ref with `tw task review show <review_ref> --json`. Present the reply surface, direction, requested count, acquisition route, and safe target-selection scope. Stop for one explicit `approve`, `reject`, or `skip` decision. For `reject` or `skip`, invoke the matching `tw task review reject|skip <same_review_ref> --json` command once, verify the matching `data.review.status`, and stop; only approval continues.

After the user explicitly approves the displayed task proposal, invoke `tw task review approve <same_review_ref> --json` exactly once under the reusable same-task preflight result. Never transfer approval to a changed direction, count, ref, proposal hash, or target policy.

Retain the complete command-execution result. If the execution yields a `session_id`, poll that same session to terminal completion; never project only `output` and discard the continuation handle. Require one complete parseable `tw_cli_harness_v1` envelope before using approval refs.

If the terminal approval output is blank, partial, or unparseable, treat the result as indeterminate and do not invoke approval again. Run `tw task review show <same_review_ref> --json` once as a read-only recovery. Continue only when it returns `ok=true`, `data.review.status=approved`, a non-empty `refs.task_blueprint_refs`, and one matching `records[].model_type=TaskBlueprint` entry for every returned ref. This recovery contract is required in addition to the general CLI minimum; if the fields are absent, stop as CLI contract drift instead of falling back. A `task_blueprint_proposal_ref` is never a `task_blueprint_ref`, even though their text prefixes overlap. Never substitute the proposal ref, use `tw task review list`, search a global/latest task, or infer a ref by timestamp.

Capture every exact `task_blueprint_ref` from either the complete approval envelope or that exact recovery read. Start one fixed 180-second deadline, immediately inspect each with `tw task show <task_blueprint_ref> --json`, and repeat only while its `source_status=awaiting_selection`; before each retry, wait `min(15 seconds, remaining time)` so the deadline receives one final read. Never use `tw task review list`, a global review list, or a latest review to discover this task's source reviews.

When `source_status=source_reviews_created`, follow only `source_review_refs_by_status.pending`. If `pending` is empty but `approved` or `archived` is nonempty, that task has no source decision waiting. If all three buckets are empty, treat the response as CLI contract drift and stop. Handle `no_valid_targets_found` as a shortfall and follow CLI-returned refs directly for any other terminal source status.

### 3. Review Every Discovered Source

Follow only CLI-returned source-selection refs. Inspect every ref with `tw task review show <review_ref> --json`, then present the complete pending target list from the current discovery batch together as one numbered set. Include each exact `review_ref` and its safe public source context so the user can compare every candidate without asking to reveal them one at a time.

Accept a numbered decision map such as `1 approve, 2 reject, 3 skip`. Reuse the same-task preflight result and invoke the matching `tw task review approve|reject|skip <review_ref> --json` command exactly once for each explicitly decided ref; leave omitted refs pending. After the complete target list has been displayed, also accept an explicit “approve all” as approval for every still-pending source review in that exact unchanged displayed set, invoking approve once per pending ref. If any decision fails partway, do not replay successful decisions: redisplay the exact set with current statuses and ask only for unresolved decisions. If the set is stale, changed, incomplete, or was not displayed in the immediately preceding review gate, display the current complete list and ask again.

Target-list “approve all” authorizes draft generation from those exact sources only. Never apply it to a task proposal, generated reply/content review, scheduled mutation, undisplayed target, or changed ref.

Source approval authorizes draft generation for that exact source only. It never authorizes a reply mutation. From each successful source-approval envelope, follow only `data.automatic_generation.artifact_refs` and `data.automatic_generation.review_refs`; if expected continuation refs are absent, stop as CLI contract drift rather than guessing. When fewer valid sources exist than requested, report the actual count and continue only with the valid reviewed sources.

### 4. Review Drafts And Scheduled Mutations

- Inspect generated artifacts through `tw draft show <artifact_ref> --json`.
- Inspect each content review through `tw plan review show <review_ref> --json`.
- Invoke the matching `tw plan review approve|reject|skip <review_ref> --json` command exactly once for each explicitly decided content review and leave omitted refs pending. If one decision fails, do not replay successful decisions; refresh current statuses and ask only for unresolved decisions.
- Capture every exact returned `scheduled_task_ref`. Scheduling is not completion: while any ref reports `scheduled` or `running`, keep the session active and poll that ref with `tw scheduler show <scheduled_task_ref> --json` at intervals no longer than 15 seconds. Do not invoke `tw scheduler execute` merely to accelerate the daemon-owned reservation.
- When a ref leaves `scheduled` or `running`, inspect it once with `tw scheduler evidence <scheduled_task_ref> --json`. Treat `succeeded` as sent only with its conclusive scheduler evidence. Classify `failed`, `recovery_required`, `past_due`, `cancelled`, `retask_superseded`, and `scheduled_mutation_revoked` from that durable evidence without assuming whether dispatch started. A `paused` or `waiting_review` ref needs user action; show that blocker and keep every other ref under observation.
- After each polling round that changes any status, publish one compact update using the original numbered draft mapping and place every draft under exactly one heading: `Sent`, `Not sent yet`, or `Needs attention`. Use `Sent` only for `succeeded` with conclusive evidence and `Not sent yet` only for `scheduled` or `running`. Put blocked, failed, paused, recovery, and unknown outcomes under `Needs attention`; distinguish a conclusively undispatched result as `not sent` and an inconclusive result as `outcome unknown`. Never rewrite `outcome unknown` as `nothing sent`.
- If a polling round changes nothing, repeat the complete numbered split at least once every 60 seconds so the user can see that monitoring remains active. Continue until every returned ref is terminal or needs user action, and never finish the reply flow merely because all drafts are scheduled.

When multiple content reviews are pending, present them together as one numbered set with each exact target, reply text, and `review_ref`. Require an explicit per-item decision map. Never collapse multiple replies into “approve all” or treat a bare decision as batch mutation authority. Each content approval authorizes one exact reply mutation only.

Never guess a target or ref.

### 5. Handle Changes And Failures

Every fresh task below reruns mandatory preflight; same-task review, monitoring, and redraft reuse the current successful result unless readiness was invalidated.

- If the task proposal is still pending, an explicit redo or changed direction authorizes skipping that exact proposal review. Invoke `tw task review skip <same_review_ref> --json` once, verify `data.review.status=skipped`, then create one fresh task and present its new proposal; no old authority transfers.
- If an approved task still reports `source_status=awaiting_selection` and has no source reviews, do not create a duplicate task or claim the old discovery was cancelled. Continue the fixed task-show deadline until source reviews or a terminal state appears; if no supported closure becomes available, stop and report the exact blocker.
- When `source_status=source_reviews_created` and no source is approved, treat “redo,” “redraft,” “start over,” “these candidates are wrong,” or a direction/source/angle change as a candidate-stage restart. Do not use `tw task retask` or `tw draft redraft`. The explicit restart instruction authorizes skipping every still-pending source review returned by that task. Invoke `tw task review skip <review_ref> --json` once per pending ref, inspect each with `tw task review show <review_ref> --json`, require `data.review.status=skipped`, and remove it from the active review set without deleting history. Then create one fresh task with `tw task create --surface reply --direction <latest_condensed_request> --count <same_count_unless_user_changed_it> --json` and stop for its new approval.
- If any source is approved and no reply mutation is `scheduled`, `running`, `paused`, `waiting_review`, or has unknown evidence, never use source-review skips to claim the task was cancelled. For a wording-only change to the same approved source, use `tw draft redraft` and require a new content review. For a direction, source, angle, or target change, show every current content review and ask the user to confirm skipping the still-pending old drafts. After confirmation, invoke `tw plan review skip <review_ref> --json` once per confirmed ref, verify `data.review.status=skipped`, then create a fresh task; the historical task remains recorded.
- If any reply mutation is `scheduled`, `running`, `paused`, `waiting_review`, or has unknown evidence, do not restart or create a replacement reply. Continue monitoring the exact scheduled ref or stop for the required user/recovery action.
- A rejected source creates no draft or mutation.
- Treat `relay_unavailable` with no dispatch `ActionRecord`, and `action_preparation_failed` with `reply:blocked_before_dispatch`, no `dispatched_at`, and `confirmation_state=not_required`, as conclusively not sent. An `ActionRecord` or `EvidenceRecord` count alone is audit evidence and does not prove dispatch.
- A retry accepts one exact unchanged draft only. Resolve its exact target/text pair from the current task's returned refs, rerun mandatory preflight because exact-action mode is a new readiness scope, and start one fresh exact-action dry-run. Show that pair and require fresh explicit approval before dispatching it once. For multiple retry requests, ask the user to choose one; each later pair requires a separate exact-action flow and approval. Never execute or reschedule the old scheduled-task ref or transfer its task/content approval.
- If the numbered draft mapping is stale, the target/text changed, or the current task does not already contain conclusive pre-dispatch evidence, ask for the exact current draft/ref or stop as unknown. Unknown, post-dispatch, `unknown_confirmation`, confirmed, or otherwise inconclusive outcomes never enter this retry flow and require a sanitized issue report that preserves `outcome unknown`.

## Exact-Action Mode

Require exactly one target accepted by the CLI contract and one exact final reply. A profile URL is not a reply target.

1. Run `tw action reply <exact_target> --text <exact_reply> --dry-run --json` through safe argv/stdin handling.
2. Show the exact target and reply in full, the dry-run result, and the semantic operation; ask for explicit approval.
3. Treat any target or character change as a new payload requiring a new dry-run and approval.
4. After the user explicitly approves, reuse the current exact-action flow's preflight result and dispatch `tw action reply <same_target> --text <same_reply> --json` once.
5. Require `ok=true`, an `action_ref`, and conclusive evidence before reporting complete. Never retry an unknown result or send a test reply.

## Boundaries

- Task mode creates one proposal with `5..10` independent possible reply items; it does not grant batch mutation approval.
- Exact-action mode controls one target/text pair only and remains outside task/plan lineage.
- Do not create original posts, quote, like, save, follow, or operate the browser UI directly.
- Do not expose reply text, targets, raw payloads, private refs, or local paths in diagnostics.

## Issue Report

For explicit report requests, CLI drift, repeated unresolved setup, or unknown evidence, activate `threadwave-preflight` in issue-report-only mode with sanitized metadata. Exclude target, reply text, and task direction. Issue-report generation sends no reply; report each affected reply as `sent`, `not sent`, or `outcome unknown` exactly as its durable evidence supports.

## Return Format

```text
State: <needs task approval | needs source approval | needs content approval | needs exact-action approval | monitoring | complete | blocked | unknown>
Mode: <task | exact-action>
Count: <requested / valid sources / source-approved / content-approved / scheduled, or n/a for exact-action>
Reviews: <current task, source, or content reviews with exact review_ref; none for exact-action>
Waiting for you: <matching per-item decisions; approve all for the exact displayed source set only; approve this exact target/text pair; or none>
Next: <one returned ref/action or stop>
Outcome: <sent | not sent | not sent yet | outcome unknown, per reply>
Issue report: <copy/paste only; preserves the durable outcome>
```
