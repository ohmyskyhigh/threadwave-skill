# Objective

Keep one CLI agent session across the preflight/setup recovery flow.

# Final Changes

- Updated the preflight contract to execute the exact returned setup and resume commands.
- Required the setup response contract before following its action.

# Final Result

Achieved: the skill workflow no longer reconstructs commands that would create a different browser binding.
