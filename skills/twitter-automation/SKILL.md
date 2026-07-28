---
name: twitter-automation
description: "Route high-level Twitter/X automation setup, readiness, and ambiguous workflow requests to independent flat peer skills after ThreadWave checks. Use for set up Twitter automation, check Twitter agent readiness, repair automation, or choose between daily agent, post, and reply workflows. Do not use when the request already clearly asks to create/post tweets, create/send replies, or run the daily agent; activate twitter-post, twitter-reply, or twitter-agent directly. 中文：用于推特自动化安装、就绪检查、修复和模糊工作流路由；明确的发推、回复或日常代理请求应直接使用对应的平级技能。"
---

# Twitter Automation

Act only as the optional high-level router for the flat ThreadWave Twitter skill suite. Never contain, copy, proxy, or execute the workflows owned by `twitter-post`, `twitter-reply`, or `twitter-agent`.

## Flat Peer Contract

Treat these as independent installed siblings:

```text
twitter-automation -> routes to twitter-post
                   -> routes to twitter-reply
                   -> routes to twitter-agent
```

Every destination skill can activate directly. None depends on this skill. Route by skill name only; never use a relative path, nested skill folder, import, or copied procedure.

## Language

Respond in English or Simplified Chinese from explicit preference, latest message, conversation language, then English. Preserve the original request and exact user content without translation or normalization.

## Routing Flow

Classify only the workflow owner:

- setup, dependency, CLI, extension, readiness, or repair: remain here;
- ad-hoc tweet creation, one-to-five tweet tasks, or one exact post: `twitter-post`;
- ad-hoc reply creation, five-to-ten discovery reply tasks, target discovery, or one exact reply: `twitter-reply`;
- daily growth, strategy, plan, scheduled daily work, reviews, or outcomes: `twitter-agent`.

When the request already has a clear destination, activate that peer with the unchanged request and stop this router flow. Do not run router preflight first; the destination peer owns its mandatory preflight.

If a destination peer is unavailable, preserve the request and direct the user to `https://www.threadwave.xyz/cli/setup/agent.md`. Never emulate the missing peer.

## Setup And Readiness Flow

For setup/readiness requests only, activate `threadwave-preflight` by skill name. Require every release-index roster skill, the supported CLI contract, and Chrome extension setup to be confirmed ready.

If any module is missing, outdated, or unconfirmed, show one localized action and route to `https://www.threadwave.xyz/cli/setup/agent.md`. Setup completion grants no approval for strategy, content, posting, replying, or another X mutation.

## Hard Boundaries

- Never invoke `tw task`, `tw draft`, `tw plan`, `tw scheduler`, or `tw action`.
- Never generate, review, approve, post, reply, or schedule content.
- Never keep operating after a peer handoff.
- Never ask the user to repeat content already supplied.
- Never treat a broad automation request as X mutation approval.

## Issue Report

For a report-worthy setup/readiness failure or explicit report request, activate `threadwave-preflight` in issue-report-only mode with sanitized metadata. State that the copy/paste report was not sent.

## Return Format

```text
State: <routed | ready | waiting for you | blocked>
Owner: <twitter-post | twitter-reply | twitter-agent | twitter-automation>
Completed: <routing or readiness checks only>
Waiting for you: <one setup action, if any>
Next: <destination skill or setup guide>
Issue report: <copy/paste only; nothing sent>
```
