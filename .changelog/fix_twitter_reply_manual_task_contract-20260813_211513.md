# Objective

Align the `twitter-reply` skill with the current plan-free manual task contract so task creation continues through automatic discovery and draft generation without obsolete task or source review gates.

# Final Changes

- Replaced the task-proposal and source-selection review flow with exact `task_blueprint_ref` monitoring.
- Kept content review as the only task-mode approval boundary before X mutation.
- Raised the reply skill's minimum CLI compatibility to the first supported direct-materialization contract and removed obsolete task-review command requirements.
- Updated reply evals and suite contract tests for automatic discovery, draft shortfalls, failure/restart handling, and per-draft approval.

# Final Result

Goal achieved. The source skill follows the current CLI contract, the locally installed flat skill matches the source, and repository validation passes.
