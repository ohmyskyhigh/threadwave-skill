# Objective

Reuse ThreadWave readiness across new tasks until 12 hours of inactivity.

# Final Changes

- Updated the shared preflight contract to run skill updates per task and reuse the CLI-owned readiness receipt.
- Removed new-task and mode-change rules that forced a full readiness check.
- Updated the daily-agent, post, and reply peers, evals, and contract test.

# Final Result

Achieved. New tasks check updates and reuse fresh readiness; stale or invalidated readiness triggers one full check.
