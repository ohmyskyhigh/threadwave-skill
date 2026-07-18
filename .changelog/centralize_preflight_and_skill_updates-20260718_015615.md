# Objective

Replace the flat-install-breaking shared contract layout with dedicated `threadwave-preflight` and `threadwave-update` peer skills, while giving every skill an independently managed version.

# Final Changes

- Added two infrastructure skills and changed the dependency flow to operation skill -> preflight -> update.
- Added one GitHub release index as the latest-version authority for all six skills.
- Added a local manifest beside every skill and a deterministic command that updates one skill manifest plus the release index.
- Centralized setup, CLI, extension, recovery, and copy/paste issue reporting in the preflight skill.
- Removed operation-skill references that escaped their flat installation folders.
- Updated bilingual metadata, validation, tests, issue-report schema, and package contents.

# Final Result

Achieved locally. The six flat peer skills validate successfully, all automated tests pass, and the bundle packages successfully. The GitHub release index will become authoritative for installed users after these uncommitted changes are published.
