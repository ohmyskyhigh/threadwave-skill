# Objective

Tell reply-workflow users when scheduler cancellation has started linked workflow cleanup.

# Final Changes

- Required the reply skill to relay the CLI-provided cleanup state and 60-second recheck interval.
- Clarified that immutable scheduler history does not expire.
- Added a contract assertion for the relay and wording rule.

# Final Result

Goal achieved. The reply skill now keeps monitoring and gives the user the authoritative cleanup reminder. Suite validation and tests pass.
