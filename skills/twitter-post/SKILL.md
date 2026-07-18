---
name: twitter-post
description: "Publish one exact user-supplied Twitter/X post through a mandatory dry-run, exact-content review, explicit approval, one dispatch, and evidence check using ThreadWave. Use for post a tweet, send a tweet, publish on Twitter/X, tweet this exact text, or manual tweet tasks—not drafting, scheduling, or batch posting. 中文：用于发送一条用户提供准确原文的推文、发布 Twitter/X 帖子、手动发推；必须先 dry-run、原文审核、明确批准，再执行一次。不要用于写草稿、排期或批量发帖。"
---

# Twitter Post

Publish exactly one user-supplied post now through the direct manual action boundary. This skill does not draft, schedule, batch, or create plan lineage.

## Required Input

Require the exact final post text. If it is missing or the user provided only a topic, goal, outline, link, or “something like this,” ask only for the final exact text or route a drafting request to `twitter-agent`.

Do not improve, translate, shorten, expand, normalize whitespace, fix spelling, add hashtags, add a link, or change punctuation unless the user explicitly supplies replacement final text.

Treat any replacement as a new payload requiring a new dry-run and approval.

## Language

Choose `en` or `zh-CN` through `threadwave-preflight`: explicit user preference, latest message, conversation language, then English.

The interface language may differ from the post language. Never translate the post because the interface locale changed.

## Mandatory Preflight And Init Flow

Activate `threadwave-preflight` by skill name every time, including after approval or a recoverable pause. Pass the unchanged exact post in working memory and the `twitter-post` capability requirements. Do not invoke `tw` until preflight returns `ready` with every roster skill version confirmed latest.

The selected capability gate requires the `action` family, production X actions enabled, and `tw action tweet` with `--dry-run`. If `threadwave-preflight` is unavailable, or it reports a missing/outdated skill, CLI, or extension module, preserve the exact post and direct the user to `https://www.threadwave.xyz/cli/setup/agent.md`; resume only after preflight verifies ready.

Preserve the original exact text across preflight in working memory. Never place it in an issue report, log, changelog, or diagnostic summary.

## Exact-Action Procedure

### 1. Dry-Run

Pass the text as one exact argument using the execution environment's safe argv/stdin mechanism; never concatenate user text into an executable shell expression.

Run the semantic equivalent of:

```bash
tw action tweet --text <exact_text> --dry-run --json
```

Require `schema_version=tw_cli_harness_v1`. A dry-run must not append mutation/evidence records or claim that the post was sent, queued, or scheduled.

If pacing or another gate defers the action, report the returned retry time/status and `queued=false`; do not promise automatic delivery.

### 2. Exact Review

Show:

- operation: one new post;
- the exact post text in full, preserving whitespace and characters;
- the account binding only when already verified and safe to display;
- the dry-run gate result;
- the exact semantic command with text represented as `<approved exact text>`.

Then stop and ask for explicit approval. “Set up Twitter,” “run automation,” “looks good generally,” payment completion, or approval of a different draft/review does not count.

### 3. Approval Validity

Approval is valid only for the immediately displayed operation and byte-for-byte-equivalent text. If the user changes even one character, clarifies a different account, or asks for another post, invalidate the approval and return to dry-run.

### 4. Dispatch Once

After explicit approval, rerun mandatory preflight. If ready and the payload is unchanged, run the same command once without `--dry-run`:

```bash
tw action tweet --text <same_exact_text> --json
```

Never retry an unknown account-impacting result. Never send a second post as “verification.”

### 5. Evidence

Require `schema_version=tw_cli_harness_v1`, `ok=true`, an `action_ref`, and conclusive evidence for the mutation before reporting complete. Summarize the safe outcome; do not expose raw records or payloads.

If evidence says blocked, failed, deferred, or unknown, use that exact state. Unknown or inconclusive mutation proof is report-worthy and must stop without retry.

## Boundaries

- One invocation controls one exact post.
- The manual action remains outside strategy, plan, task, draft, and scheduler lineage.
- Do not claim a `review_ref`, scheduled task, or writing-memory promotion was created.
- Do not call `twitter-reply`, quote, like, save, follow, or any batch action from this skill.
- Do not post from the browser UI directly; use only the installed `tw` command after preflight.

## Issue Report

For an explicit report request or report-worthy failure, activate `threadwave-preflight` in issue-report-only mode with sanitized diagnostic metadata. Do not include the exact post in the handoff.

Generate a redacted copy/paste report for suite/CLI drift, a repeated unresolved non-user setup failure, or unknown/inconclusive mutation evidence. Never include the post text, account handle, target URL/status ID, raw command with text, or raw action/evidence payload.

Do not report normal approval, auth, payment, X-login, or pacing waits. Always state that nothing was sent.

## Return Format

Before approval:

```text
State: needs approval
Preflight: <ready checks>
Review: one post with the exact original text
Waiting for you: approve or replace the exact text
If you approve, I will run: tw action tweet --text <approved exact text> --json
```

After execution:

```text
State: <complete | blocked | unknown>
Completed: <only what evidence proves>
Problem: <stable code and localized meaning, if any>
Next: <retry time, user gate, or stop>
Issue report: <generated for copy/paste; nothing sent>
```
