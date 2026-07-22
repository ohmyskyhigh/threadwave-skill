---
name: twitter-agent
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

Activate `threadwave-preflight` by skill name at the start of each new daily-agent task or agent session and after any readiness invalidation defined by its contract. Pass the originating skill name, the unchanged daily-agent intent, and the required capability families. Reuse that successful result for unchanged pending reviews and workflow continuation in the same session; do not rerun preflight for a review decision alone. Do not invoke any `tw` command without a current or reusable `ready` result with every roster skill version confirmed latest.

The selected capability gate requires `context`, `strategy`, `plan`, `task`, `draft`, and `scheduler`. If `threadwave-preflight` is unavailable, or it reports a missing/outdated skill, CLI, or extension module, preserve this request and direct the user to `https://www.threadwave.xyz/cli/setup/agent.md`; resume here after preflight verifies ready.

After setup is ready, resume the original daily-agent intent; setup readiness is not content approval.

## Context Resume

Run once:

```bash
tw context resume --format json
```

Use the returned selected account binding, active run, open work cycles, pending reviews, pending recovery, and primary next action. If multiple account bindings exist without a selected binding, ask the user to make the intended account visible through setup; never guess an account.

Resolve pending recovery before creating new strategy/plan work. Present pending reviews before creating duplicate proposals.

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

1. pending recovery;
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
Next: <one next workflow step>
If you approve, I will run: <exact decision command>
Issue report: <generated for copy/paste; nothing sent>
```

Do not expose raw envelopes, private refs unrelated to the decision, private paths, handles by default, or raw prompts.
