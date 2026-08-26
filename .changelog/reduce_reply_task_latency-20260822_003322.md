# Objective

Make future reply workflows wait once for task completion instead of repeatedly invoking task and draft reads.

# Final Changes

- Updated the reply skill to use one bounded `tw task wait` call with bundled drafts.
- Made wait timeout user-visible and prevented automatic replacement or indefinite re-waiting.
- Added the wait command to the reply compatibility manifest and updated evaluations and contract tests.

# Final Result

Goal achieved. Suite validation and all 50 skill tests pass.
