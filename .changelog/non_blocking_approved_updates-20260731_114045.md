# Objective

Make supported ThreadWave skill and CLI updates optional while keeping incompatible installations safe.

# Final Changes

Changed the shared update and preflight contracts to distinguish supported older versions from blocking incompatibilities, remind once per agent session for each exact update offer, and run the canonical setup guide automatically after approval. Updated affected callers, evaluations, and policy tests.

# Final Result

Goal achieved. Supported installed versions can continue after capability validation without repeated same-session reminders, while approved updates run through the canonical setup guide and resume the preserved workflow.
