# Batch Twitter Task Skills - Technical Architecture

**Plan Date**: 2026-07-18
**Status**: Implemented locally; release pending

## Overview

### Problem Statement

The current public operation skills do not match the CLI's available abstraction:

- `twitter-post` and `twitter-reply` support only one exact immediate `tw action` mutation;
- batch or direction-based requests have no dedicated manual-task skill path even though the CLI accepts `--count 1..5`;
- `twitter-automation` contains broad tweet/reply trigger language and routing rules, which can make independent peer skills look like internal automation subflows even though they are installed and invoked separately;
- the CLI capability projection advertises a stale `tw task create --plan ...` shape and omits task-review commands, which can make strict preflight reject a valid task workflow.

### Solution

1. Keep the SEO-friendly installed names as flat peer folders; do not nest, add, or remove roster skills.
2. Make `twitter-automation` an optional setup/readiness/router entry point that delegates by peer skill name and then stops.
3. Give `twitter-post` and `twitter-reply` two explicit modes:
   - **task mode** for a direction or requested count of `1..5`;
   - **exact-action mode** only for one complete final payload requested for immediate dispatch.
4. Reuse the CLI's existing review chain. Do not introduce skill-owned batch execution or approval state.
5. Correct the CLI capability advertisement before raising the skills' minimum CLI version.

The dependency graph is not a containment graph:

```text
twitter-automation ──routes to──> twitter-post
                  ├─routes to──> twitter-reply
                  └─routes to──> twitter-agent

twitter-automation ──depends on──> threadwave-preflight
twitter-post       ──depends on──> threadwave-preflight
twitter-reply      ──depends on──> threadwave-preflight
twitter-agent      ──depends on──> threadwave-preflight

threadwave-preflight ──depends on──> threadwave-update
```

`twitter-post`, `twitter-reply`, and `twitter-agent` never depend on `twitter-automation`. They can be activated directly by their own metadata. Routing is an agent handoff, not a folder hierarchy, import, shared implementation, or parent-child runtime relationship.

### User Value

- Users can request several tweets or replies in one bounded manual task.
- The agent selects a deterministic workflow instead of mixing router, drafting, and mutation responsibilities.
- Existing “post/reply exactly this now” requests retain their stronger byte-preserving safety contract.

## Existing Infrastructure

- `../threadwave-chrome-extension/doc/CLI/harness-command-interface.md`: authority for `tw task`, review, draft, scheduler, and manual action commands.
- `../threadwave-chrome-extension/doc/harness-agent-overview.md`: manual task path and approval authority.
- `../threadwave-chrome-extension/cli/src/commands/task.ts`: implemented `tw task create --surface ... --direction ... --count 1..5` interface.
- `../threadwave-chrome-extension/cli/src/commands/capabilities.ts`: capability projection that needs alignment with the implemented command.
- `skills/threadwave-preflight/references/preflight-contract.md`: manifest-driven capability gate; no new per-skill command map is needed.
- `skills/twitter-post/SKILL.md` and `skills/twitter-reply/SKILL.md`: existing exact-action safety contracts to retain as one mode.

## New Components Required

No new runtime components or skill folders are required.

```text
threadwave-skill/
├── skills/twitter-automation/     # independent optional router peer
├── skills/twitter-post/           # independent task + exact post peer
├── skills/twitter-reply/          # independent task + exact reply peer
├── skills/twitter-agent/          # independent daily-run peer
├── tests/                          # ownership, routing, capability, approval tests
├── suite-manifest.json            # bundle version only
└── release-index.json             # regenerated independent versions/artifacts

threadwave-chrome-extension/cli/
└── src/commands/capabilities.ts   # advertise the already implemented task contract
```

No new TypeScript interface is required. The implementation consumes the existing `HarnessCliEnvelope`, task proposal refs, review refs, artifact refs, and scheduled-task refs.

## Ownership And Mode Selection

All four public Twitter skills are siblings under `skills/`. Direct activation is preferred when intent is already clear. `twitter-automation` participates only when the request is setup/readiness-oriented or the host selected the broad router first.

| Request shape | Owning skill | Mode | CLI entry point |
|---|---|---|---|
| Setup, readiness, repair, “which Twitter workflow?” | `twitter-automation` | Router only | Preflight/setup commands only |
| Direction/topic plus `1..5` tweets | `twitter-post` | Task | `tw task create --surface tweet` |
| Direction/topic/target criteria plus `1..5` replies | `twitter-reply` | Task | `tw task create --surface reply` |
| One final exact post text, send now | `twitter-post` | Exact action | `tw action tweet` |
| One exact target plus final exact reply, send now | `twitter-reply` | Exact action | `tw action reply` |
| Daily growth strategy/plan | `twitter-agent` | Daily loop | Strategy/plan workflow |

Mode selection rules:

1. Any requested count above one selects task mode.
2. Topic, direction, discovery, drafting, or target-selection language selects task mode.
3. Exact-action mode requires one complete final payload and explicit immediate-send intent.
4. Multiple exact payloads are not silently converted into a generative task. Ask whether the user wants one direction-based task or separate exact actions.
5. Counts above five stop before task creation. Do not automatically create several proposals because each proposal has its own review authority.

## Data Flow Architecture

### Task Mode

```text
user direction + surface + count (1..5)
  -> specialized skill
  -> threadwave-preflight
  -> tw task create
  -> exact task_proposal review
  -> user approval
  -> optional scheduled discovery
  -> independent source_selection reviews
  -> independent generated draft reviews
  -> independent user content approvals
  -> one scheduled X mutation per approved artifact
  -> scheduler evidence and localized summary
```

### Exact-Action Mode

```text
one exact final payload
  -> specialized skill
  -> threadwave-preflight
  -> tw action ... --dry-run
  -> exact payload review
  -> explicit approval
  -> one dispatch
  -> conclusive evidence or stop without retry
```

### Router Mode

```text
clear post/reply/daily request
  -> specialized peer directly
  -> that peer owns preflight and workflow

setup/readiness request
  -> twitter-automation
  -> threadwave-preflight
  -> readiness result

operation request initially handled by twitter-automation
  -> delegate unchanged intent to exactly one specialized peer
  -> stop router flow
  -> specialized peer owns preflight and workflow
```

## Component Design

### `twitter-automation`

**Purpose**: Preserve the broad SEO entry point without containing or owning post, reply, or daily-agent behavior.

**Flow**:

1. For setup/readiness requests, run shared preflight and report readiness.
2. For an operation request, classify only `post`, `reply`, or `daily-agent` ownership.
3. Activate exactly one flat peer by skill name with the unchanged request, then stop.
4. Do not run a router preflight before delegating an operation; the destination peer owns its mandatory preflight.

**Key Dependencies**:

- `threadwave-preflight` only.
- No `task`, `draft`, `plan`, `scheduler`, or `action` capability requirement.
- No operation peer lists `twitter-automation` as a dependency.

### `twitter-post`

**Purpose**: Own every ad-hoc tweet request, including count-bounded task generation and one exact immediate post.

**Task Flow**:

1. Normalize only the requested count; preserve the user's direction.
2. Run preflight with `task`, `draft`, `plan`, and `scheduler` requirements.
3. Create one tweet task proposal with `count=1..5`.
4. Present the exact proposal and request approval.
5. Follow returned review refs; never guess the next ref.
6. Present each generated draft through its own content review.
7. Report scheduler reservation/evidence for each approved artifact.

**Exact Flow**: Retain the existing dry-run, byte-equivalent approval, one dispatch, and evidence rules through the `action` family.

### `twitter-reply`

**Purpose**: Own every ad-hoc reply request, including count-bounded target discovery/drafting and one exact target/text dispatch.

**Task Flow**:

1. Accept a direction, literal target/search anchor, or target-selection criteria plus count `1..5`.
2. Run preflight with `task`, `draft`, `plan`, and `scheduler` requirements.
3. Create one reply task proposal.
4. Review the task proposal, then every discovered source separately.
5. Review every generated reply separately.
6. Report one scheduled mutation and its evidence per approved reply.

**Exact Flow**: Require one exact target and exact final text, then retain the current `tw action reply` safety path.

## Approval Contract

- Task-proposal approval authorizes workflow continuation only; it authorizes no X mutation.
- Source approval authorizes draft generation for one exact source only.
- Content approval authorizes one exact scheduled X mutation only.
- The alpha contract has no batch content approval. “Approve all” must not collapse independent review refs.
- Changed direction uses `tw task retask`; changed wording with fixed lineage uses `tw draft redraft`.
- Unknown action or scheduler evidence stops without retry.

## Flat Installation Contract

- The canonical install shape is `skills/twitter-automation`, `skills/twitter-post`, `skills/twitter-reply`, and `skills/twitter-agent` as sibling folders.
- `suite-manifest.json` and `release-index.json` list each skill independently with its own version and artifact.
- Router handoff uses the peer skill name only. No `../` path, nested skill path, import, or copied workflow is allowed.
- Each destination peer invokes `threadwave-preflight` itself. The router does not proxy operation commands or review state.
- If the destination peer is missing, `twitter-automation` preserves the request and routes the user to the canonical setup guide; it does not emulate the missing skill.

## CLI Compatibility Prerequisite

Update `cli/src/commands/capabilities.ts` to advertise the command already implemented in `cli/src/commands/task.ts`:

- remove the stale `--plan <plan_revision_ref>` argument;
- include `--count <1..5>`;
- advertise task review list/show/approve/reject/skip and batch retask forms;
- keep plan-review, draft, and scheduler command families aligned with the documented workflow.

Release that correction as CLI `1.0.1`, then set the modified task skills' `cli.minimum_version` to `1.0.1`. This avoids claiming reliable task orchestration against a capability projection that cannot confirm it.

## Versioning Plan

- Suite bundle: `0.6.0`.
- `twitter-automation`: `0.5.0` for narrowed activation/ownership.
- `twitter-post`: `0.5.0` for the new task workflow.
- `twitter-reply`: `0.5.0` for the new task workflow.
- `threadwave-preflight`, `threadwave-update`, and `twitter-agent`: unchanged unless implementation reveals a contract change.
- CLI: `1.0.1` for capability-advertisement correction.

After validation, regenerate per-skill artifacts and `release-index.json`, create tag `suite-v0.6.0`, and upload the independently versioned artifacts to its GitHub release.
