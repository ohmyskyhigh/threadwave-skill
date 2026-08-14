# Objective

Prepare the ThreadWave starter menu and manual reply-task workflow changes as one reviewed skills source release candidate.

# Final Changes

- Added the canonical panda starter menu and exact `threadwave` and `tw` starter aliases to the automation router.
- Updated the reply skill to the CLI 1.0.34 manual-task contract with automatic discovery and draft generation while preserving per-draft content approval.
- Preserved yielded command-session polling, exact task lineage, bounded restart behavior, and mutation review boundaries.
- Updated skill evals and suite contract tests for the new routing and reply workflow.

# Final Result

The source candidate passed `npm run check` and is ready for a reviewed PR. Versions, release metadata, public assets, and the current public suite remain unchanged pending explicit PR approval.
