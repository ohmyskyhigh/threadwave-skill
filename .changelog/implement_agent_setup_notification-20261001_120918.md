# Objective

Handle the approved CLI agent setup reminder without making it a blocker or expanding installation authority.

# Final Changes

- Added an inline `agent_setup_check` handler to `skills/threadwave/references/notifications.md` with canonical URL validation, reuse of verified host observations, missing versus unavailable inventory handling, scoped setup and conversation deduplication.
- Updated `skills/threadwave/references/notifications/update-available.md` to separate CLI completion from plugin verification and preserve CLI-only scope.
- Added one handler contract check in `tests/update-versioning.test.mjs`.

# Final Result

Local source verified. `npm run check` passed validation and all 42 tests; focused update-versioning checks passed all five tests. JavaScript syntax and diff checks passed. Instruction/archive checks do not prove live host installation. No version change, active installation change, commit, push or publication.
