---
name: twitter-reply
description: "Send one exact user-supplied reply to one exact Twitter/X post through target validation, mandatory dry-run, exact-content review, explicit approval, one dispatch, and evidence check using ThreadWave. Use for reply to a tweet, respond on Twitter/X, manual Twitter reply, or reply with this exact text—not drafting, engagement campaigns, or batch replies. 中文：用于对一条准确指定的 Twitter/X 帖子发送一条用户提供原文的回复；必须验证目标、dry-run、原文审核、明确批准，再执行一次。不要用于写回复草稿、互动活动或批量回复。"
metadata:
  version: "0.3.0"
  suite: "threadwave-skill"
---

# Twitter Reply

Send exactly one user-supplied reply to exactly one user-supplied X/Twitter target now. This skill does not draft, schedule, discover targets, or run engagement batches.

## Required Input

Require both:

1. one exact X/Twitter status URL, status ID, or sanitized tweet ref accepted by `tw`;
2. the exact final reply text.

If either is missing, ask only for the missing value. Never infer a target from recent conversation, browser state, a handle, a screenshot, or “that tweet.” A profile URL is not a reply target.

Do not improve, translate, shorten, expand, normalize, spell-correct, or change the reply. Replacement target or text creates a new payload that requires a new dry-run and approval.

## Language

Choose `en` or `zh-CN` through shared preflight. Read the matching phrases when composing output:

- English: [../../references/i18n/en.md](../../references/i18n/en.md)
- 简体中文: [../../references/i18n/zh-CN.md](../../references/i18n/zh-CN.md)

Interface locale never changes the exact reply or target.

## Mandatory Preflight And Init Flow

Read [../../references/preflight-contract.md](../../references/preflight-contract.md) completely and run it from step 1 on every invocation, including after approval or a user gate.

The selected capability gate requires the `action` family, production X actions enabled, and `tw action reply` with `--dry-run`. All four local suite skills must be present at one version before any `tw` command. If any skill-suite, CLI, or extension module is missing, preserve the exact target and reply and tell the user to open `https://www.threadwave.xyz/cli/setup/agent.md` to set up the harness agent; resume here only after all modules verify ready.

Preserve target and text across preflight in working memory only. Exclude both from issue reports, changelogs, and diagnostic summaries.

## Exact-Reply Procedure

### 1. Validate The Target Shape

Accept only one target understood by the CLI contract: an `x.com`/`twitter.com` status URL, a status ID, or a sanitized tweet ref. Reject multiple targets, search queries, profile-only URLs, feeds, or inferred browser selections.

Target-shape validation is not proof of content identity. The action dry-run owns browser/content availability checks.

### 2. Dry-Run

Pass target and text as separate exact arguments using safe argv/stdin handling; never concatenate user values into an executable shell expression.

Run the semantic equivalent of:

```bash
tw action reply <exact_target> --text <exact_reply_text> --dry-run --json
```

Require `schema_version=tw_cli_harness_v1`. Dry-run must not append mutation/evidence records or claim the reply was sent, queued, or scheduled.

If pacing defers the action, report the returned retry time/status and `queued=false`. Do not promise automatic delivery.

### 3. Exact Review

Show:

- operation: one reply;
- the exact target supplied by the user;
- the exact reply text in full, preserving whitespace and characters;
- the dry-run gate/content-availability result;
- the semantic command with `<approved exact target>` and `<approved exact reply>` placeholders.

Stop for explicit approval. Approval of a plan, task, draft, another target, payment, setup, or broad engagement automation is not approval for this reply.

### 4. Approval Validity

Approval is valid only for the immediately displayed target/text pair. Any character change, redirected/different target, account clarification, or additional reply invalidates it. Dry-run the new pair and ask again.

### 5. Dispatch Once

After explicit approval, rerun mandatory preflight. If ready and the pair is unchanged, dispatch exactly once without `--dry-run`:

```bash
tw action reply <same_exact_target> --text <same_exact_reply_text> --json
```

Never retry an unknown account-impacting result. Never send a test reply or a second reply as verification.

### 6. Evidence

Require `schema_version=tw_cli_harness_v1`, `ok=true`, an `action_ref`, and conclusive evidence tied to the exact reply operation before reporting complete.

Use returned blocked, failed, deferred, or unknown states exactly. Unknown/inconclusive evidence is report-worthy and must stop without retry.

## Boundaries

- One invocation controls one target/text pair and one possible reply.
- Manual reply remains outside strategy, plan, task, draft, scheduler, and writing-memory lineage.
- Do not claim it created a content review or scheduled task.
- Do not quote, like, save, follow, follow back, post, discover, or batch from this skill.
- Do not reply through direct browser UI; use only installed `tw` after preflight.

## Issue Report

Read [../../references/issue-report-contract.md](../../references/issue-report-contract.md) for explicit reporting or report-worthy failures.

Generate a redacted copy/paste report for suite/CLI drift, repeated unresolved non-user setup failure, or unknown/inconclusive reply evidence. Never include reply text, target URL/status ID/ref, handle, raw command containing user values, or raw browser/action/evidence payload.

Do not report normal approval, auth, payment, X-login, unavailable target content, or pacing waits unless the returned contract itself is inconsistent. Always state that nothing was sent.

## Return Format

Before approval:

```text
State: needs approval
Preflight: <ready checks>
Review: one exact target plus the exact original reply
Waiting for you: approve or replace the target/text pair
If you approve, I will run: tw action reply <approved exact target> --text <approved exact reply> --json
```

After execution:

```text
State: <complete | blocked | unknown>
Completed: <only what evidence proves>
Problem: <stable code and localized meaning, if any>
Next: <retry time, user gate, or stop>
Issue report: <generated for copy/paste; nothing sent>
```
