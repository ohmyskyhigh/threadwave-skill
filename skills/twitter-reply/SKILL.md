---
name: twitter-reply
description: "Create, review, and monitor five-to-ten Twitter/X reply tasks with target discovery through ThreadWave, retry one conclusively undispatched reviewed reply through a fresh exact-action flow, or send one exact final reply to one exact target through a strict dry-run and approval flow. Use for create replies, retry failed replies, reply to several posts, batch reply tasks, engage with posts about a topic, manual Twitter replies, or reply to this exact tweet with this exact text. Do not use for original posts or the daily strategy/plan loop. 中文：用于创建、审核并监控 5 到 10 条带目标发现的推特回复任务、通过新的精确操作流程重试一条已确认未发送的已审核回复、批量回复任务，或在严格 dry-run 和批准后向一个准确目标发送一条准确回复；不用于原创推文或日常策略计划。"
---

# Twitter Reply

Own ad-hoc reply work as an independent flat peer. Never activate or depend on `twitter-automation`; that peer may route here, but this skill owns preflight and the complete reply workflow.

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

Respond in English or Simplified Chinese from explicit preference, latest message, conversation language, then English. Never translate or normalize an exact target/reply pair. Preserve task direction without adding requirements.

## Mandatory Preflight

Activate `threadwave-preflight` by skill name at the start of each new reply task or agent session and after any readiness invalidation defined by its contract. Pass this skill name, selected mode, unchanged request, and required capability families. Reuse that successful result for unchanged review decisions and workflow continuation in the same session; do not rerun preflight for a review decision alone. Do not invoke `tw` without a current or reusable ready result.

Require CLI `1.0.21` plus `task`, `draft`, `plan`, `scheduler`, and `action` command families. Missing skill, CLI, or extension state routes to `https://www.threadwave.xyz/cli/setup/agent.md` while preserving the request.

## Task Mode

### 1. Create One Bounded Proposal

Pass direction as one safe argument; never concatenate user content into shell syntax. Run the semantic equivalent of:

```text
tw task create --surface reply --direction <exact_user_direction> --count <5..10> --json
```

Require `schema_version=tw_cli_harness_v1`, `ok=true`, and returned `manual_request_ref`, `task_blueprint_proposal_ref`, and `review_ref`. Task creation authorizes no discovery, generation, or X mutation until its exact review gate passes.

### 2. Review The Task Proposal

Inspect only the returned review ref with `tw task review show <review_ref> --json`. Present the reply surface, direction, requested count, acquisition route, and safe target-selection scope. Stop for explicit approval.

After approval, invoke `tw task review approve <same_review_ref> --json` once under the reusable same-task preflight result. Never transfer approval to a changed direction, count, ref, proposal hash, or target policy.

Capture every exact `task_blueprint_ref` returned by that approval. Start one fixed 180-second deadline, immediately inspect each with `tw task show <task_blueprint_ref> --json`, and repeat only while its `source_status=awaiting_selection`; before each retry, wait `min(15 seconds, remaining time)` so the deadline receives one final read. Never use `tw task review list`, a global review list, or a latest review to discover this task's source reviews.

When `source_status=source_reviews_created`, follow only `source_review_refs_by_status.pending`. If `pending` is empty but `approved` or `archived` is nonempty, that task has no source decision waiting. If all three buckets are empty, treat the response as CLI contract drift and stop. Handle `no_valid_targets_found` as a shortfall and follow CLI-returned refs directly for any other terminal source status.

### 3. Review Every Discovered Source

Follow only CLI-returned source-selection refs. Inspect every ref with `tw task review show`, then present the complete pending target list from the current discovery batch together as one numbered set. Include each exact `review_ref` and its safe public source context so the user can compare every candidate without asking to reveal them one at a time.

Accept a numbered decision map such as `1 approve, 2 reject, 3 skip`. After the complete target list has been displayed, also accept an explicit “approve all” as approval for every still-pending source review in that exact unchanged displayed set. Reuse the same-task preflight result, then invoke `tw task review approve <review_ref> --json` once per displayed ref and require every result to succeed. If the set is stale, changed, incomplete, or was not displayed in the immediately preceding review gate, display the current complete list and ask again. Leave every omitted item pending for per-item decision maps.

Target-list “approve all” authorizes draft generation from those exact sources only. Never apply it to a task proposal, generated reply/content review, scheduled mutation, undisplayed target, or changed ref.

Source approval authorizes draft generation for that exact source only. It never authorizes a reply mutation. When fewer valid sources exist than requested, report the actual count and continue only with the valid reviewed sources.

### 4. Review Drafts And Scheduled Mutations

- Inspect generated artifacts through `tw draft show <artifact_ref> --json`.
- Inspect each content review through `tw plan review show <review_ref> --json`.
- Approve, reject, or skip each content review independently.
- Capture every exact returned `scheduled_task_ref`. Scheduling is not completion: while any ref reports `scheduled` or `running`, keep the session active and poll that ref with `tw scheduler show <scheduled_task_ref> --json` at intervals no longer than 15 seconds. Do not invoke `tw scheduler execute` merely to accelerate the daemon-owned reservation.
- When a ref leaves `scheduled` or `running`, inspect it once with `tw scheduler evidence <scheduled_task_ref> --json`. Treat `succeeded` as sent only with its conclusive scheduler evidence. Classify `failed`, `recovery_required`, `past_due`, `cancelled`, `retask_superseded`, and `scheduled_mutation_revoked` from that durable evidence without assuming whether dispatch started. A `paused` or `waiting_review` ref needs user action; show that blocker and keep every other ref under observation.
- Continue until every returned ref is terminal or needs user action. Provide brief progress updates while watching, but never finish the reply flow merely because all drafts are scheduled.

When multiple content reviews are pending, present them together as one numbered set with each exact target, reply text, and `review_ref`. Require an explicit per-item decision map. Never collapse multiple replies into “approve all” or treat a bare decision as batch mutation authority. Each content approval authorizes one exact reply mutation only.

Never guess a target or ref.

### 5. Handle Changes And Failures

- Before any source approval, treat “redo,” “redraft,” “start over,” “these candidates are wrong,” or a direction/source/angle change as a restart of the current manual reply task. Do not use `tw task retask` or `tw draft redraft` for this candidate-stage restart.
- Follow only the current task's CLI-returned pending source-review refs. The user's explicit restart instruction authorizes closing that exact discovery batch: invoke `tw task review skip <review_ref> --json` once per still-pending source review and require every result to succeed. Inspect each skipped ref with `tw task review show <review_ref> --json`, require `status=skipped`, then remove it from the skill's active review set so it never appears again under `Reviews`, `Waiting for you`, or `Next`. Keep the durable historical record; removal means it is no longer active or pending, not deletion from append-only history. This is cancellation of pending review authority, not batch content or mutation approval.
- Reuse the same-task preflight result, then create one fresh task with `tw task create --surface reply --direction <latest_exact_user_direction> --count <same_count_unless_user_changed_it> --json`. Present the new proposal and stop for its new approval; no old approval, source, draft, or review authority transfers.
- If any source is already approved or any reply mutation is scheduled, do not claim the old task was cancelled through review skips. Show the exact later-stage scope and use the supported retask/recovery path.
- Same-source wording change: use `tw draft redraft`, then require a new content review.
- Rejected source: create no draft or mutation for that source.
- Treat `relay_unavailable` with no dispatch `ActionRecord`, and `action_preparation_failed` with `reply:blocked_before_dispatch`, no `dispatched_at`, and `confirmation_state=not_required`, as conclusively not sent. An `ActionRecord` or `EvidenceRecord` count alone is audit evidence and does not prove dispatch.
- When the user says `retry` and identifies one or more exact drafts from the current unchanged displayed set, resolve each exact target/text pair only from the current task's returned refs. Rerun mandatory preflight because the prior readiness was invalidated, then start one fresh exact-action dry-run per pair. Show each exact pair and dry-run result and require fresh explicit approval before dispatching it once. Do not execute or reschedule the old scheduled-task ref, and do not transfer its task/content approval as fresh mutation approval.
- If the numbered draft mapping is stale, the target/text changed, or the current task does not already contain conclusive pre-dispatch evidence, ask for the exact current draft/ref or stop as unknown. Unknown, post-dispatch, `unknown_confirmation`, confirmed, or otherwise inconclusive outcomes never enter this retry flow and require a sanitized issue report.

## Exact-Action Mode

Require exactly one target accepted by the CLI contract and one exact final reply. A profile URL is not a reply target.

1. Run `tw action reply <exact_target> --text <exact_reply> --dry-run --json` through safe argv/stdin handling.
2. Show the exact target and reply in full, the dry-run result, and the semantic operation; ask for explicit approval.
3. Treat any target or character change as a new payload requiring a new dry-run and approval.
4. After approval, reuse the same-task preflight result and dispatch `tw action reply <same_target> --text <same_reply> --json` once.
5. Require `ok=true`, an `action_ref`, and conclusive evidence before reporting complete. Never retry an unknown result or send a test reply.

## Boundaries

- Task mode creates one proposal with `5..10` independent possible reply items; it does not grant batch mutation approval.
- Exact-action mode controls one target/text pair only and remains outside task/plan lineage.
- Do not create original posts, quote, like, save, follow, or operate the browser UI directly.
- Do not expose reply text, targets, raw payloads, private refs, or local paths in diagnostics.

## Issue Report

For explicit report requests, CLI drift, repeated unresolved setup, or unknown evidence, activate `threadwave-preflight` in issue-report-only mode with sanitized metadata. Exclude target, reply text, and task direction. State that nothing was sent.

## Return Format

```text
State: <needs task approval | needs source approval | needs content approval | monitoring | complete | blocked | unknown>
Mode: <task | exact action>
Count: <requested / valid sources / approved / scheduled>
Reviews: <all current source or content reviews, numbered with exact review_ref>
Waiting for you: <per-item decisions, or approve all for the exact displayed source-target list only; omitted per-item reviews remain pending>
Next: <one returned ref/action or stop>
Issue report: <copy/paste only; nothing sent>
```
