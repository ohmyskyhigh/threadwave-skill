# Objective

Prepare the approved expired-draft recovery source for manual PR review under the skills-only release authorization.

# Final Changes

- Include only the shared recovery instructions, tweet/reply routing, regression eval cases, test-only portability corrections and their session changelogs.
- Keep candidate versions and public release metadata unchanged.
- Preserve separate work in the primary development checkout.

# Final Result

Release candidate check passed on Node 22: source validation and all 42 tests passed. The unchanged source candidate is ready for its single release-preparation commit, candidate-branch push and PR targeting main.

Manual PR review and a later explicit merge instruction remain required before version preparation or public publication. No live Hermes installation, paid generation or X mutation is part of this source PR.
