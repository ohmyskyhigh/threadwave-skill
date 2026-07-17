# Objective

Expand the atomic bilingual Twitter/X skill suite from four skills to five by adding a dedicated CLI/extension setup skill and routing both missing dependencies through the canonical ThreadWave setup page.

# Final Changes

- Added the SEO-readable `twitter-cli-setup` skill with English and Simplified Chinese request support, resumable setup, and copy/paste issue reporting.
- Updated all suite manifests, validators, metadata, schemas, tests, and evals to require five same-version skills.
- Routed a missing `tw` CLI or missing Chrome extension to `https://www.threadwave.xyz/cli/setup`.
- Removed the direct COS extension artifact fallback from operational skill contracts; the setup page now owns Store or pre-release package delivery.
- Preserved original daily-run, post, and reply intent across setup without treating setup completion as approval.

# Final Result

Goal achieved. The suite has one high-level automation router, one dedicated CLI/extension setup skill, and three operation skills. Partial installation blocks safely, both missing dependency paths are consistent, and all skills remain bilingual and issue-report capable.
