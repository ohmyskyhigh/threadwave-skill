---
name: twitter-agent
license: MIT-0
description: "Run a review-gated Twitter/X agent for normal daily growth: initialize strategy, create daily plans, present strategy/plan/task/draft reviews, inspect scheduler state, and summarize outcomes through ThreadWave. Use for Twitter agent, X agent, daily Twitter automation, account growth, content planning, tweet scheduling, draft review, or normal daily run requests. 中文：用于推特代理、Twitter/X 智能体、每日推特自动化、账号增长、内容规划、推文排期、策略审核、计划审核、草稿审核和日常运行。"
---

# Twitter Agent

Run the normal daily, review-gated growth loop. ThreadWave provides strategy, planning, task, draft, scheduler, evidence, and recovery contracts.

## Scope

Use this skill for:

- first strategy initialization when no active strategy exists;
- daily plan creation from the active strategy;
- strategy, plan, task/source, and draft review presentation;
- scheduler inspection and exact scheduled-task management;
- outcome summaries and bounded improvement;
- resuming existing pending reviews before creating new work.

Do not use this workflow for one exact immediate post or reply; those belong to `twitter-post` and `twitter-reply`.

## Language

Choose `en` or `zh-CN` through `threadwave-preflight`: explicit user preference, latest message, conversation language, then English.

Keep commands, JSON keys, refs, review states, and stable error codes in English. Present full review content in its original language; do not silently translate approved content.

## Mandatory Preflight And Init Flow

Activate `threadwave-preflight` by skill name at the start of each new daily-agent task. Pass the originating skill name, the unchanged daily-agent intent, and the required capability families. It checks skill updates for this task, then uses regular CLI preflight, which reuses readiness until 12 hours of inactivity and runs the full check only when stale or invalidated. Do not rerun preflight for a review decision alone. Do not invoke any `tw` command without a current `ready` result with every roster skill version confirmed supported and its latest-version status known or explicitly continued past under the preflight contract's unconfirmed-index choice.

The selected capability gate requires `context`, `strategy`, `plan`, `task`, `draft`, and `scheduler`. If `threadwave-preflight` is unavailable, or it reports a missing, incompatible, or unconfirmed skill, CLI, or extension module, preserve this request and let preflight run `https://www.threadwave.xyz/cli/setup/agent.md` after approval. A supported older skill or CLI follows preflight's non-blocking continue-or-update choice.

After setup is ready, resume the original daily-agent intent; setup readiness is not content approval.

## Context Resume

Run once:

```bash
tw context resume --format json
```

Use the returned selected account binding, active run, open work cycles, pending reviews, pending recovery, and primary next action. Always present the returned primary next action to the user with the matching `你可以 / You can` options. If multiple account bindings exist without a selected binding, ask the user to make the intended account visible through setup; never guess an account.

Present pending recovery through the Pending Recovery section before creating new strategy/plan work. Present pending reviews before creating duplicate proposals.

## Pending Recovery

Pending recovery blocks new strategy/plan work only until the user makes one explicit decision about it. Present the complete `pending_recovery` set once per session as one numbered list with each exact `recovery_ref`, its status, and safe work-cycle context; never expose targets, content, or private refs.

Accept a numbered per-item decision map, or one explicit "skip all" for the exact unchanged displayed set:

- **Investigate**: inspect the linked scheduler ref through `tw scheduler show <scheduled_task_ref> --json` and `tw scheduler evidence <scheduled_task_ref> --json`, then report only what the durable records support.
- **Skip**: resolve each exact displayed `recovery_ref` to exactly one `recovery_required` scheduled task by listing that scheduler status and matching the ref in `tw scheduler show <scheduled_task_ref> --json`. Then invoke `tw scheduler skip <scheduled_task_ref> --json` once and require `data.outcome_acknowledged=true`. For explicit skip-all, do this once per exact unchanged displayed item; if any ref does not resolve uniquely, stop for that item without replaying successful skips. The acknowledgment is durable and removes the recovery from future pending sets. The outcome remains `outcome unknown`, never becomes `not sent`, and skip authorizes no retry, replacement, cancellation, or mutation.
- **Report**: use the Issue Report handoff with sanitized metadata.

Cancel is a separate, narrower action: only when the user explicitly names one exact `scheduled_task_ref` tied to a recovery and asks to cancel it, invoke `tw scheduler cancel <scheduled_task_ref> --json` once, verify the returned status, and follow any returned recheck instruction. Cancelling terminalizes that scheduler record; it does not remove separate `pending_recovery` entries, which still need a decision above.

An undecided pending recovery still blocks new strategy/plan work; a skipped one does not.

## Strategy Initialization

Inspect:

```bash
tw strategy status --json
tw strategy review list --json
```

Route:

- Active strategy and no pending strategy review: continue to daily run.
- Pending strategy review: show that exact review in full and stop for a decision.
- No active strategy and no pending review: run `tw strategy create --mode blank --json`, then show the returned review in full and stop.
- Stale strategy with an explicit improvement route: summarize outcomes and create an improvement proposal; never mutate the active strategy in place.

On explicit approval of the exact displayed strategy:

```bash
tw strategy review approve <review_ref> --json
tw strategy activate --review <review_ref> --json
```

Run activation only when approval returns proof for the same review scope. Reject, skip, or edit only when the user explicitly chooses that decision.

## Daily Run

After an active strategy exists, read [references/daily-run.md](references/daily-run.md) completely and follow it. Process one visible approval boundary at a time.

The normal order is:

1. pending recovery (durably acknowledged refs do not block);
2. pending strategy review;
3. pending plan review;
4. pending task/source review;
5. pending draft/content review;
6. existing scheduler state;
7. a new daily plan only when no unresolved work conflicts.

Never create a second plan to avoid a pending review.

## Approval Model

Automatically perform preflight, context resume, read-only status/list/show commands, strategy proposal creation, plan proposal creation, and bounded outcome summaries when the user requested the matching run.

Pause before every:

- strategy approve/reject/skip/edit;
- plan approve/reject/skip/edit;
- task/source approve/reject/skip/edit;
- draft/content approve/reject/skip/edit;
- pending recovery investigate/skip/report decision, including any recovery skip-all;
- manual scheduler execution or schedule mutation that the user did not explicitly identify.

An approval applies only to the exact displayed `review_ref`, content hash/scope, target, and text. Changed scope invalidates the old approval.

## Scheduler Truth

Use `tw scheduler list --json`, `show`, and `status` to report actual scheduler state. Say `scheduled` only when the returned result contains the exact `scheduled_task_ref` and reservation. Never claim a proposal or approval is already scheduled.

`tw scheduler execute <scheduled_task_ref> --json` requires an explicit ref and user request. It does not bypass review, risk, cooldown, pacing, or evidence gates.

## Issue Report

For an explicit report request or report-worthy failure, activate `threadwave-preflight` in issue-report-only mode with sanitized diagnostic metadata. Do not rerun the workflow or update check during that handoff.

Generate a report for suite/CLI drift, repeated non-user setup failure, unexpected workflow contract failure, or unknown/inconclusive mutation evidence. Do not generate one for pending review, pacing, Chrome/auth/payment/X-login, or another expected user gate.

Always present the sanitized Markdown for copy/paste and state that nothing was sent.

## Return Format

Use localized labels and only applicable lines:

```text
State: <ready | waiting for you | needs approval | blocked | scheduled | complete>
Completed: <verified records or transitions>
Preflight: <suite / CLI / setup / agent capability>
Review: <full exact proposal or draft plus its scope>
Problem: <stable code and localized meaning>
Waiting for you: <one exact decision>
你可以 / You can: <two to four verbatim-sayable options valid at the current gate>
Next: <one next workflow step>
If you approve, I will run: <exact decision command>
Issue report: <generated for copy/paste; nothing sent>
```

The `你可以 / You can:` line lists only options that are real at the current gate — exact numbered decisions, displayed refs, or the returned primary next action — worded so the user can reply verbatim, localized to the selected language; it never offers an action beyond the current gate's authority.

Do not expose raw envelopes, private refs unrelated to the decision, private paths, handles by default, or raw prompts.
