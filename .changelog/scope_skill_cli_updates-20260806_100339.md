# Objective

Separate ThreadWave skill updates from CLI/runtime updates in preflight.

# Final Changes

- Classified pending updates as `skills_only`, `cli_only`, or `skills_and_cli`.
- Prevented skill-only repair and updates from running CLI, setup, daemon, extension, or native-host operations.
- Prevented CLI-only updates from fetching or installing the skill suite.
- Added regression assertions for every scoped branch.

# Final Result

Goal achieved. Preflight now selects only the affected component path, and the targeted contract tests and suite validation pass.
