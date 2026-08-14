# Objective

Add a ThreadWave starter menu to the high-level automation skill.

# Final Changes

- Added `start ThreadWave` and Chinese starter triggers to `twitter-automation`.
- Added exact standalone `threadwave` and `tw` starter aliases without intercepting normal `tw` CLI commands.
- Reused the exact preformatted setup panda above a menu that routes tweet, reply, daily-growth, and readiness choices to existing owners.
- Added starter-menu evaluations and structural regression coverage.

# Final Result

The skill can present the ThreadWave onboarding menu without running preflight, executing a workflow, or authorizing an X mutation. Goal achieved.
