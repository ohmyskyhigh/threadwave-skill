# Objective

Continue a reply task with valid sibling drafts when one live source-approval continuation reports the precise no-safe-draft failure.

# Final Changes

- Added an exact `draft_generation_no_safe_drafts` skip rule to the reply skill while keeping generic candidate errors and missing refs fail-closed.
- Required the live source-approval envelope, prohibited retries and guessed refs, and defined non-empty and zero-valid batch outcomes.
- Added contract assertions and evaluation cases for four-of-five partial success and generic candidate failure.

# Final Result

Implemented. A recognized safe-filter rejection skips only that source and returns valid sibling drafts for content review; it grants no content approval or X mutation authority.
