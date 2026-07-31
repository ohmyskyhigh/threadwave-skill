# Twitter Reply Request Condensing - Technical Architecture

**Plan Date**: 2026-07-31
**Status**: Draft

## Overview

### Problem Statement

`twitter-reply` currently passes the user's task direction through verbatim. Poor wording or an obvious typo can therefore become part of ThreadWave's interpreted intent. In the reported case, `fin` was treated as finance instead of `find`.

### Solution

Before task-mode preflight and task creation, have `twitter-reply` produce one condensed request:

1. Read the complete request.
2. Correct obvious contextual typos.
3. Remove filler and repetition.
4. Preserve count, topic, literal search phrase, account/relationship filters, and engagement thresholds.
5. Use the condensed sentence as the ThreadWave task direction.

If producing the sentence requires inventing intent, ask one short question instead. This is the existing fallback for unclear reply requests, not a new ambiguity system.

### User Value

ThreadWave receives a clear task instead of raw conversational wording, reducing accidental topic or filter changes while keeping the reply flow simple.

## Existing Infrastructure

- `skills/twitter-reply/SKILL.md` owns reply task-mode and exact-action behavior.
- `skills/twitter-reply/evals/evals.json` contains executable reply-flow scenarios.
- `threadwave-preflight` remains unchanged and continues to handle readiness.

## New Components Required

```text
skills/twitter-reply/
├── SKILL.md             # add the request-condensing instruction
└── evals/evals.json     # add focused regression prompts
```

No script, model service, dependency, persistent state, or new TypeScript type is required.

## Data Flow Architecture

```text
user's reply request
  -> identify any exact target/reply payload
  -> condense the task-mode direction into one corrected sentence
  -> existing mode selection and preflight
  -> tw task create --direction <condensed_request>
  -> existing proposal review
```

Exact-action mode preserves the target and reply text byte-for-byte. Only surrounding conversational instructions may be shortened.

## Component Design

### Reply Request Condenser

**Purpose**: Give ThreadWave a short, accurate task direction instead of raw conversational wording.

**Flow**:

1. Detect and protect exact target/reply content.
2. For task mode, rewrite the remaining request as one sentence.
3. Correct only obvious typos supported by the full sentence.
4. Keep all explicit constraints and remove no numbers or thresholds.
5. Do not add a domain such as finance unless the user explicitly requested it.
6. Pass the condensed sentence as `--direction` and display it in the normal task proposal.

**Key Dependencies**:

- Existing `twitter-reply` mode selection.
- Existing task proposal approval, which lets the user verify the condensed direction before discovery starts.
