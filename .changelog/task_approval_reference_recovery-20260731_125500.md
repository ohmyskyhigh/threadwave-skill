# Objective

Make reply-task approval continuation deterministic and remove conflicting approval, restart, retry, and unknown-outcome instructions.

# Final Changes

- Required preservation and polling of a yielded command `session_id`.
- Added one exact, read-only approved-review recovery path for blank or unparseable approval output.
- Prohibited reapproval, proposal-ref substitution, global/latest lookup, and timestamp inference.
- Added one approval-authority matrix and matching per-item task, source, and content decisions; omitted refs stay pending and successful decisions are never replayed.
- Bound source approval continuation to its returned artifact/content-review refs and made restart behavior explicit for each lifecycle stage.
- Made fresh tasks rerun preflight, kept retries singular, and preserved inconclusive dispatch evidence as `outcome unknown` through issue reports and return output.
- Added deterministic contract coverage plus adversarial lost-output, mixed-decision, unknown-outcome, and awaiting-selection evaluations.

# Final Result

Goal achieved. The reply skill now has one unambiguous authority and continuation path at each stage, including exact persisted `TaskBlueprint` recovery. `npm run check` passes suite validation and all 37 tests.
