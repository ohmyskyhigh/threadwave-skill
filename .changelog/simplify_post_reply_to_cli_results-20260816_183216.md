# Objective

Reduce false alarms in the Twitter post and reply skills by making them rely on authoritative CLI results.

# Final Changes

- Added one shared UX-versus-CLI authority rule to both skills.
- Removed parent/child lineage comparisons and successful-result contract-drift inference.
- Routed `ok=true`, `ok=false`, `next`, review choices, and transport failures through distinct UX behavior.
- Updated contract tests for the new boundary.

# Final Result

Goal achieved. Both skills now choose commands and present decisions while the CLI owns workflow truth and validation.
