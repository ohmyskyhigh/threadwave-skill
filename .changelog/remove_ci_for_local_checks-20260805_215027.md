# Objective

Remove repository CI and rely on local validation to avoid hosted workflow costs.

# Final Changes

- Removed the GitHub Actions CI workflow.
- Replaced release-process CI requirements with exact-SHA local validation.

# Final Result

Achieved. The repository no longer defines a hosted CI workflow, while its local validation and release gates remain documented.
