# Objective

Allow an explicit retry of a reviewed reply that conclusively failed before dispatch.

# Final Changes

- Route the unchanged reply through a fresh exact-action dry-run and approval flow.
- Keep the old scheduled mutation closed and block retries for unknown or post-dispatch outcomes.
- Add focused contract coverage and one evaluation case.

# Final Result

Achieved. The source skill now defines a safe fresh-action retry for conclusively undispatched replies.
