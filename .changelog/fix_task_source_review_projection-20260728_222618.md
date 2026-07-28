# Objective

Make manual task skills find source reviews from each approved task blueprint instead of guessing the latest review.

# Final Changes

- Added exact `tw task show <task_blueprint_ref> --json` polling and three-bucket source-review handling to `twitter-post` and `twitter-reply`.
- Declared the task-show capability in both skill manifests.
- Added contract tests and eval scenarios for exact blueprint scoping and bounded polling.
- Bumped the suite to `0.7.1`, `twitter-post` to `0.5.3`, and `twitter-reply` to `0.5.4`.
- Regenerated the complete atomic candidate index and release artifacts for `suite-v0.7.1`.

# Final Result

Goal achieved. All 31 checks pass and the `0.7.1` suite package builds successfully. The candidate is prepared for exact-SHA CI; no public release was performed.
