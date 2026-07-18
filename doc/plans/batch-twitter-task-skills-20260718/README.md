# Batch Twitter Task Skills

**Plan Date**: 2026-07-18
**Status**: Implemented locally; release pending
**Target Milestone**: ThreadWave Skill Suite v0.6.0 (artifacts built, not published)

## Overview

Align the public Twitter skills with the existing ThreadWave manual-task workflow. `twitter-automation`, `twitter-post`, `twitter-reply`, and `twitter-agent` remain independent flat peer skills. `twitter-automation` is only an optional entry router; it delegates to the three operation peers and never contains or implements their workflows.

Main capabilities:

- create `1..5` tweet or reply tasks through `tw task create`;
- let `twitter-post`, `twitter-reply`, and `twitter-agent` activate directly without passing through `twitter-automation`;
- preserve the current exact single-post/reply path through `tw action`;
- keep proposal, source, draft, and mutation approvals separate;
- remove trigger and workflow overlap from `twitter-automation`;
- support English and Simplified Chinese requests throughout.

## Skill Ownership

| Flat peer skill | Owns | Must not own |
|---|---|---|
| `twitter-automation` | Optional entry routing plus setup/readiness requests | Containing peer skills, task creation, drafting, or X mutations |
| `twitter-post` | Independent tweet task batches and one exact immediate post | Depending on `twitter-automation`, reply tasks, daily strategy/plan loop |
| `twitter-reply` | Independent reply task batches and one exact immediate reply | Depending on `twitter-automation`, tweet tasks, daily strategy/plan loop |
| `twitter-agent` | Independent daily strategy, plan, scheduler, and outcome loop | Depending on `twitter-automation`, ad-hoc manual task routing |

## Documentation

| Document | Description |
|---|---|
| [Technical Architecture](./technical-architecture.md) | Ownership, mode selection, CLI flow, approval boundaries, and versioning |
| [Implementation Tasks](./implementation-tasks.md) | Ordered file changes and adversarial verification |

## Quick Summary

**New Components:** No new skill folders or persistent data models. Reuse the existing `tw task`, `tw draft`, `tw plan review`, `tw scheduler`, and `tw action` contracts.

**Task Groups:**

1. Correct the CLI capability advertisement for existing task commands.
2. Enforce flat-peer ownership and narrow `twitter-automation` to setup/readiness/routing.
3. Add task and exact-action modes to `twitter-post` and `twitter-reply`.
4. Update tests, independent versions, release artifacts, and the suite release.

**Key Safety Features:** Count limited to `1..5`; no automatic chunking; task approval never authorizes an X mutation; every generated draft receives an independent content review; unknown mutation results are never retried.

**Existing Infrastructure:** The CLI already implements manual task proposals, source selection, generation, content review, and one scheduled mutation per approved artifact. The skill update should orchestrate those contracts instead of recreating batching.

**Success Metrics:**

- “create 5 tweets” activates `twitter-post`, not `twitter-automation`;
- “do 5 replies” activates `twitter-reply` and creates one count-5 task proposal;
- “run my daily Twitter plan” activates `twitter-agent` directly;
- when `twitter-automation` is activated first, it delegates unchanged intent to exactly one peer and stops;
- no operation skill depends on or lives under `twitter-automation`;
- one exact supplied payload still uses the byte-preserving `tw action` path;
- a count above 5 blocks before a CLI mutation and asks for an explicit split;
- setup/readiness requests remain handled by `twitter-automation`;
- all suite and skill validators pass before release.
