# Batch Twitter Task Skills - Implementation Tasks

**Plan Date**: 2026-07-18
**Status**: Implemented locally; release pending

## Task Group 0: Align CLI Capability Advertisement

**Objective**: Make strict preflight able to confirm the task commands that already exist.

### Task 0.1: Correct Advertised Task Commands

**Modified Files**:

- `../threadwave-chrome-extension/cli/src/commands/capabilities.ts`
- `../threadwave-chrome-extension/cli/src/tests/milestone0E2E.test.ts`
- `../threadwave-chrome-extension/cli/package.json`

**Technical Solution**: Replace the stale plan-bound task-create capability with the implemented manual task command, including count and task-review commands. Add assertions that the capability projection matches the public command interface. Bump the CLI patch version.

**Dependencies:** Existing `cli/src/commands/task.ts` and `doc/CLI/harness-command-interface.md` contracts.

**Deliverable:** CLI `1.0.1` advertises task create, task review, batch retask, draft, content review, and scheduler commands required by the specialized skills.

**Testing Method:**

- `cd ../threadwave-chrome-extension/cli && npm run typecheck` -> zero TypeScript errors.
- `cd ../threadwave-chrome-extension/cli && npm test` -> all CLI tests pass.
- `rg -n "tw task create --plan" ../threadwave-chrome-extension/cli/src/commands/capabilities.ts` -> no match.
- `rg -n "tw task create.*--count" ../threadwave-chrome-extension/cli/src/commands/capabilities.ts` -> exact command is advertised.
- Assert the capabilities fixture rejects counts `0`, `6`, non-integers, and missing task-review commands.

## Task Group 1: Remove Router/Operation Overlap

**Objective**: Enforce `twitter-automation`, `twitter-post`, `twitter-reply`, and `twitter-agent` as independent flat peers, with automation acting only as an optional router.

### Task 1.1: Narrow Twitter Automation

**Modified Files**:

- `skills/twitter-automation/SKILL.md`
- `skills/twitter-automation/skill-manifest.json`
- `skills/twitter-automation/agents/openai.yaml`
- `skills/twitter-automation/evals/evals.json`

**Technical Solution**: Rewrite metadata and body around setup, readiness, and peer routing. Remove post/reply/daily procedure language and explicitly forbid invoking `tw task`, `tw draft`, or `tw action`. For an operation request, activate exactly one peer by skill name with unchanged intent and stop; let that peer perform its own preflight. Do not copy, import, or proxy any peer workflow.

**Dependencies:** Shared preflight contract and stable peer skill names.

**Deliverable:** `twitter-automation` owns no content or mutation workflow, routes to the three external flat peers, and advances to `0.5.0`.

**Testing Method:**

- `rg -n "tw (task|draft|action)" skills/twitter-automation/SKILL.md` -> only explicit prohibition, no executable procedure.
- Add eval: “Set up Twitter automation” remains in `twitter-automation`.
- Add eval: “Create five posts about launch lessons” routes to `twitter-post` unchanged.
- Add eval: “Do five replies to AI builder posts” routes to `twitter-reply` unchanged.
- Add eval: “Run today's growth plan” routes to `twitter-agent` unchanged.
- Add eval: broad “run Twitter automation” stops at readiness/next review and performs no content mutation.
- Assert an operation handoff stops the router and the destination skill owns the only operation preflight.

### Task 1.2: Add Ownership Validation

**Modified Files**:

- `scripts/validate-suite.mjs`
- `tests/suite-structure.test.mjs`
- `tests/approval-recovery.test.mjs`

**Technical Solution**: Add repository checks that every public Twitter skill is a sibling roster entry, no operation manifest depends on `twitter-automation`, the router lacks operation command requirements, and the two task skills advertise their own surface-specific commands.

**Dependencies:** Task 1.1 and the two updated skill manifests.

**Deliverable:** CI detects future scope regression or command ownership overlap.

**Testing Method:**

- `npm run validate` -> no ownership errors.
- Temporarily point a test fixture's router manifest at the `task` family -> validator must fail.
- Assert exactly one specialized skill owns each `--surface tweet` and `--surface reply` command.
- Add `twitter-automation` as a dependency of a temporary operation manifest -> validator must fail.
- Add a nested `skills/twitter-automation/twitter-post/SKILL.md` fixture -> validator must fail.
- Assert direct `twitter-post`, `twitter-reply`, and `twitter-agent` requests do not require router activation.

## Task Group 2: Add Task Workflows To Post And Reply Skills

**Objective**: Support bounded manual task batches while preserving exact single-action safety.

### Task 2.1: Upgrade Twitter Post

**Modified Files**:

- `skills/twitter-post/SKILL.md`
- `skills/twitter-post/skill-manifest.json`
- `skills/twitter-post/agents/openai.yaml`
- `skills/twitter-post/evals/evals.json`

**Technical Solution**: Add deterministic mode selection. Task mode creates one `tweet` proposal with count `1..5`, follows returned refs through task/content reviews, and reports each scheduled mutation. Exact-action mode retains the current byte-preserving one-post flow.

**Dependencies:** Task Group 0 and preflight readiness.

**Deliverable:** `twitter-post` `0.5.0` owns both count-bounded tweet tasks and one exact immediate tweet without mixing approval scopes.

**Testing Method:**

- Eval “Create 5 tweets about launch mistakes” -> one `tw task create --surface tweet ... --count 5` proposal and no `tw action`.
- Eval “Post exactly this now: ...” -> exact-action dry-run, exact review, and one possible dispatch.
- Eval count `0`, `6`, `10`, `1.5`, and missing direction -> no task creation.
- Eval three supplied exact texts -> ask task-vs-separate-action clarification; do not treat them as generative direction silently.
- Eval “approve all drafts” -> preserve one review decision per artifact.

### Task 2.2: Upgrade Twitter Reply

**Modified Files**:

- `skills/twitter-reply/SKILL.md`
- `skills/twitter-reply/skill-manifest.json`
- `skills/twitter-reply/agents/openai.yaml`
- `skills/twitter-reply/evals/evals.json`

**Technical Solution**: Add task mode for a direction or bounded target-selection request with count `1..5`. Follow task proposal, source-selection, draft, content-review, and scheduler refs without inferring targets. Preserve the exact one-target/one-text action mode.

**Dependencies:** Task Group 0 and preflight readiness.

**Deliverable:** `twitter-reply` `0.5.0` owns both batch reply tasks and one exact immediate reply.

**Testing Method:**

- Eval “Do 5 replies to AI builder posts” -> one `tw task create --surface reply ... --count 5` proposal.
- Eval one exact URL plus exact reply -> exact-action path.
- Eval “reply to that tweet” without an exact referent or discovery direction -> ask for clarification; never infer browser state.
- Eval source discovery returns three candidates for requested five -> review only returned valid candidates; never invent two.
- Eval source review rejected -> no draft and no mutation.
- Eval unknown scheduler evidence -> stop without retry.

### Task 2.3: Encode Capability Requirements

**Modified Files**:

- `skills/twitter-post/skill-manifest.json`
- `skills/twitter-reply/skill-manifest.json`
- `suite-manifest.json`

**Technical Solution**: Require CLI `1.0.1` and the `task`, `draft`, `plan`, `scheduler`, and `action` families. List exact surface-specific task and exact-action commands so preflight can fail closed on contract drift.

**Dependencies:** CLI `1.0.1` capability projection.

**Deliverable:** Preflight confirms both modes before any workflow command.

**Testing Method:**

- Remove `task` from a capability fixture -> both skills block before `tw task create`.
- Remove only `action` -> task mode remains selectable only if preflight supports mode-scoped requirements; otherwise document the deliberate all-mode block.
- Remove `tw task review approve` -> task mode blocks with CLI contract drift.
- Advertise CLI `1.0.0` -> updated task skills route to setup/upgrade and preserve the user request.

## Task Group 3: Suite Validation And Release

**Objective**: Validate routing and approval boundaries, then publish independently versioned artifacts.

### Task 3.1: Expand Contract Tests

**Modified Files**:

- `tests/cli-contract.test.mjs`
- `tests/approval-recovery.test.mjs`
- `tests/suite-structure.test.mjs`
- `tests/language-routing.test.mjs`

**Technical Solution**: Add declarative tests for mode selection, count bounds, returned-ref-only continuation, independent review approval, router isolation, and bilingual triggers.

**Dependencies:** Task Groups 1 and 2.

**Deliverable:** Tests fail if the router contains or absorbs an operation, an operation depends on the router, a task bypasses review, or a batch becomes a single broad mutation approval.

**Testing Method:**

- `npm run check` -> full suite passes.
- Run every skill through `quick_validate.py`.
- `rg -n "batch approval|approve all" skills/twitter-{post,reply}/SKILL.md` -> only prohibitions.
- `rg -n "count.*1\.\.5|--count" skills/twitter-{post,reply}` -> both skills encode the CLI bound.
- Forward-test English and Simplified Chinese prompts for setup, single exact actions, count-5 tasks, over-limit tasks, rejected sources, changed drafts, and unknown evidence.
- Forward-test direct peer activation and router-first delegation; both must reach the same destination workflow without duplicate operation preflight.

### Task 3.2: Version And Publish

**Modified Files**:

- `.codex-plugin/plugin.json`
- `package.json`
- `suite-manifest.json`
- `release-index.json`
- `.changelog/<session>.md`

**Technical Solution**: Bump only modified skills to `0.5.0`, bump the bundle to `0.6.0`, regenerate artifacts/checksums, package, tag, push once, and publish the matching GitHub release.

**Dependencies:** All tests and CLI `1.0.1` availability.

**Deliverable:** Public `suite-v0.6.0` release with immutable per-skill artifact URLs and SHA-256 values.

**Testing Method:**

- `npm run artifacts && npm run check && npm run package` -> all exit zero.
- Compare every `dist/skills/*.tgz` SHA-256 with `release-index.json`.
- Inspect the three modified skill archives and confirm no runtime `scripts/` directory.
- Verify the public release has every release-index asset before announcing readiness.

## Testing Checklist

### After Task Group 0

- [x] CLI advertises the implemented manual task contract.
- [x] CLI typecheck and tests pass.
- [ ] CLI `1.0.1` is available to setup/update flows.

### After Task Group 1

- [x] All public Twitter skills remain flat sibling folders and independent release-index entries.
- [x] Router owns setup/readiness/routing only.
- [x] Router delegates to the matching operation peer by skill name and stops.
- [x] No operation skill depends on the router.
- [x] Specialized requests preserve intent during delegation.
- [x] Ownership validation rejects overlap.

### After Task Group 2

- [x] Tweet and reply task counts accept only integers `1..5`.
- [x] Exact single actions retain dry-run and exact approval.
- [x] Task/source/content approvals remain independent.
- [x] No unknown mutation is retried.

### After Task Group 3

- [x] English and Simplified Chinese metadata and declarative evals validate.
- [x] Suite validation, tests, packaging, and checksums pass.
- [ ] Public release assets exist before the release index is announced.

## Milestone Verification

Run all checks in sequence:

1. `cd ../threadwave-chrome-extension/cli && npm run typecheck && npm test`
2. `cd ../threadwave-skill && npm run check`
3. Validate every folder under `skills/` with the skill validator.
4. `npm run artifacts && npm run package`
5. Confirm task skill artifacts have no runtime scripts and match release-index checksums.
6. Forward-test direct peer activation, router-first delegation, ambiguous router requests, exact single actions, count-5 tasks, over-limit counts, “approve all,” missing targets, rejected reviews, and unknown evidence.

**Gate**: Do not publish `suite-v0.6.0` until all six checks pass and CLI `1.0.1` is installable through the canonical setup route.

## Success Metrics

- One owner per request class.
- Zero operation workflows or operation dependencies inside `twitter-automation`.
- Direct and router-first requests reach the same independent destination skill.
- Batch task count exactly matches the requested integer from `1..5`.
- Zero X mutations before exact content approval.
- One scheduled mutation per approved artifact.
- Zero inferred targets or blind retries.
- All release artifacts and checksums verified.

## Rollback Points

1. After Task Group 0: CLI capability correction can ship independently; existing skills continue working.
2. After Task Group 1: Router narrowing can be reverted without changing task execution.
3. After Task Group 2: Exact-action paths remain a functional fallback if task mode is held from release.
4. Before Task Group 3 publication: no public version changes are visible; discard the unpublished artifact set if validation fails.
