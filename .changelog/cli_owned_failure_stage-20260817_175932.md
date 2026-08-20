# Objective

Prevent post and reply skills from inventing workflow failure stages.

# Final changes

- Required both skills to report a stage only from CLI `failure_stage`.
- Added reply and post evaluation cases for a failure with no returned stage.
- Synced the same changes to the installed local `.agents/skills` copies.

# Final result

Achieved. Skill validation and focused contract tests pass.
