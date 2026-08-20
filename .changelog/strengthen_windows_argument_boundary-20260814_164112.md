# Objective

Strengthen packaged Windows instructions so downstream ThreadWave commands preserve each logical argument exactly.

# Final Changes

- Defined the concrete `ProcessStartInfo.ArgumentList` form for packaged Windows operation commands.
- Prohibited direct managed-launcher splatting and string-based process or shell invocation fallbacks.
- Added reply-workflow guidance, a Windows regression evaluation, and contract-test coverage.

# Final Result

Goal achieved: dynamic Windows values remain one structured process argument or the workflow stops safely.
