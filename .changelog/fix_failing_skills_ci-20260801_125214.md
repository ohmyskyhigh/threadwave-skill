# Objective

Fix the skills CI failure caused by release artifact metadata drifting after five skill payloads changed.

# Final Changes

- Advanced the suite candidate from 0.7.3 to 0.7.4.
- Bumped only the five changed skills and regenerated their indexed artifact versions and checksums.
- Kept unchanged skill versions intact and synchronized the bundle, package, plugin, manifests, and release index.

# Final Result

Goal achieved locally. Static validation, release-index comparison, all 38 tests, syntax checks, and package creation pass.
