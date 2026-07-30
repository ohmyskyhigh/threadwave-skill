# Objective

Keep the reply agent watching scheduled sends until their durable outcomes are known.

# Final Changes

- Poll each exact scheduled reply through its scheduler status.
- Inspect durable evidence when a reply reaches a terminal state.
- Prevent the reply flow from finishing at the scheduled state.

# Final Result

Achieved. Scheduled replies remain monitored until terminal or user action is required.
