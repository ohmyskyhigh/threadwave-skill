# Plan Batch Twitter Task Skills

## Objective

Plan an update that lets `twitter-post` and `twitter-reply` handle bounded batches through the existing `tw task` workflow while removing ownership overlap with `twitter-automation`.

## Final Changes

- Audited the current skill responsibilities and the CLI task/review/draft/scheduler contracts.
- Defined `twitter-automation` as setup/readiness/router only.
- Clarified that `twitter-post`, `twitter-reply`, and `twitter-agent` are external flat peers that never depend on or live inside `twitter-automation`; the router activates one peer by skill name and stops.
- Defined task mode and exact-action mode for `twitter-post` and `twitter-reply`.
- Added a staged implementation, adversarial testing, versioning, and release plan under `doc/plans/batch-twitter-task-skills-20260718/`.
- Identified the stale CLI task capability advertisement as a prerequisite reliability fix.

## Final Result

The update is fully planned but not implemented. The plan preserves independent flat skill installation, makes `twitter-automation` a pure router to external peers, retains the existing exact single-action safety flow, and adds count-bounded task workflows using existing CLI authority.
