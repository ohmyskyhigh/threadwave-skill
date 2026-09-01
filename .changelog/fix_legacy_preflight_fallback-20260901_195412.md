# Objective

Keep supported legacy ThreadWave CLIs usable after a skill update without invoking an unsupported forced-preflight option.

# Final Changes

- Defined missing `data.readiness_reuse` as legacy full-check mode.
- Required ordinary `tw preflight --format json` after invalidation for legacy or changed CLIs, while retaining `--force` only for the same confirmed receipt-aware CLI.
- Added preflight and daily-plan regression evaluations and contract tests.
- Confirmed the existing Vault command contract already matches this behavior, so the Vault was not changed.

# Final Result

The goal was achieved. Supported legacy CLIs can resume the preserved daily-plan workflow after an ordinary full preflight, and the complete skill-suite validation passes.
