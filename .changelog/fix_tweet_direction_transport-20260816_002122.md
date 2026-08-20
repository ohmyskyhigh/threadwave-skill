# Objective

Teach the tweet flow skill to dispatch long task directions safely and recognize real CLI acceptance.

# Final Changes

- Updated `twitter-post` to use `--direction-file` on shell/PTY-only hosts and clean up its private temporary input after terminal completion.
- Kept yielded process handles in the `invoking` state until a complete ThreadWave JSON envelope returns durable refs.
- Added explicit handling for `task_direction_input_invalid` and `task_dispatch_unconfirmed` without duplicate creation.
- Updated the skill compatibility command, evaluation case, and deterministic contract tests.

# Final Result

The tweet flow no longer treats a local process handle as backend acceptance and no longer embeds long directions in shell syntax. The goal was achieved.
