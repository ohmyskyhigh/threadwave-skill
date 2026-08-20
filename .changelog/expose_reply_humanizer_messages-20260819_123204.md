# Objective

Expose CLI-returned humanizer warnings and errors in the reply workflow.

# Final Changes

- Required the reply skill to show top-level warnings, per-draft generation warnings, and customer-facing error messages.
- Added a return-format field, an evaluation case, and a contract regression test.
- Synchronized the installed local reply skill copy.

# Final Result

Achieved. Reply agents must disclose the CLI's sanitized humanizer feedback instead of hiding it behind a generic failure.
