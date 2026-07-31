# Objective

Plan and implement reply-request condensation so typo-filled or wordy task directions are corrected and shortened before reaching ThreadWave.

# Final Changes

- Added a three-part plan under `doc/plans/twitter-reply-request-condensing-20260731/`.
- Updated `twitter-reply` to correct obvious contextual typos, remove filler, preserve explicit constraints, and use one condensed task direction for creation and restart.
- Added focused evals for typo correction, wordy constraints, exact-content preservation, and explicit topical intent.
- Added a static contract test while preserving the existing approval and recovery edits.
- Kept `threadwave-preflight`, runtime services, and exact target/reply payloads unchanged.

# Final Result

Goal achieved. Suite validation and all 38 tests passed. Version and release metadata were not changed because the required release index is a protected promotion surface and no public release was authorized. No commit or push was performed.
