# Objective

Prevent cached GitHub release indexes from falsely blocking current ThreadWave skill suites.

# Final Changes

- Added a trusted per-check cache-busting query to `threadwave-update`.
- Bumped `threadwave-update` to `0.3.1` and the suite bundle to `0.6.2`.
- Added regression coverage for fresh release-index reads.

# Final Result

Achieved locally. The update gate now compares installed skills against a fresh authoritative index response.
