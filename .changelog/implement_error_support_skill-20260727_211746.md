# Objective

Create the `threadwave-error-support` peer skill and move post-failure classification, public solution retrieval, and human-readable issue-report generation out of preflight.

# Final Changes

- Added the bilingual support skill, manifest, agent metadata, unified support contract, and adversarial eval cases.
- Converted preflight issue-report-only mode into a sanitized compatibility handoff and removed its duplicate report contract.
- Added the support role to candidate suite metadata, validation, artifact generation, packaging, and tests.
- Prepared bundle `0.7.0` with independently versioned preflight `0.4.0`, update `0.3.3`, and support `0.1.0` artifacts without changing the public release index.

# Final Result

The update now lives only in worktree `threadwave-skill-error-support` on branch `codex/error-support-skill`. The unreleased candidate passes syntax, all 27 tests, and packaging in an isolated regenerated-index workspace; the public error repository is ready, while commit, push, and release remain separately gated.
