# Twitter Reply Request Condensing

**Plan Date**: 2026-07-31
**Status**: Draft
**Target Milestone**: Next `twitter-reply` patch

## Overview

Update only the reply skill. At the start of a reply request, the agent will turn loose or typo-filled wording into one short, corrected task direction before calling ThreadWave.

- Correct obvious typos from context.
- Remove filler and repeated wording.
- Preserve every meaningful constraint.
- Do not invent topics, filters, or requirements.
- Keep exact target/reply text unchanged.

`Condensed request` means a single clear sentence describing what reply targets to find and what replies to draft.

## Documentation

| Document | Description |
| --- | --- |
| [Technical Architecture](./technical-architecture.md) | Minimal reply-flow behavior and data flow |
| [Implementation Tasks](./implementation-tasks.md) | Exact skill edits and checks |

## Quick Summary

**New Components:** None. This is one instruction added to the existing `twitter-reply` skill.

**Task Groups:**

1. Add request condensation to `twitter-reply`.
2. Add a few focused evals and validate the skill.

**Key Safety Feature:** Condense task-mode directions only. Never rewrite an exact reply or target.

**Existing Infrastructure:** The existing reply skill already owns task creation, preflight, proposal review, and exact-action handling.

**Success Metrics:** The reported `fin 10 let's connect...` request becomes a generic connection-seeking reply task, not a finance task, and its count and filters remain intact.
