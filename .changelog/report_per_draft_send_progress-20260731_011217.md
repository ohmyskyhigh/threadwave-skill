# Objective

Report which reply drafts have sent and which are still waiting throughout scheduler monitoring.

# Final Changes

- Keep the original draft numbering in every monitoring update.
- Separate sent, not-sent-yet, and needs-attention outcomes without guessing unknown delivery.
- Repeat the complete status split at least once per minute while state is unchanged.
- Prepare the change as reply skill `0.5.6` in atomic suite `0.7.3`.

# Final Result

Achieved. Reply monitoring now keeps the user informed per draft until all outcomes are terminal or need action.
