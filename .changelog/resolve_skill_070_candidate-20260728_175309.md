# Objective

Integrate the pending suite integrity and CLI contract changes with the error-support skill as one 0.7.0 release candidate.

# Final Changes

- Preserved the 0.6.4 release-integrity and CLI 1.0.21 contract changes.
- Resolved bundle metadata at 0.7.0 and retained the new error-support peer and support role.
- Added the support role to the candidate-index regression fixture.
- Staged the generated 0.7.0 candidate release index on the non-public preparation branch while leaving `main` unchanged.

# Final Result

Achieved. Syntax checks, release-static validation, all 29 tests, and package generation passed for the staged 0.7.0 candidate. No public release or `main` promotion was performed.
