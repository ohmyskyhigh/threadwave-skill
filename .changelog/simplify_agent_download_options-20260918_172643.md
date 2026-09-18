# Objective

Allow the agent to use official download options without a prescribed guide-reading tool or installation sequence.

# Final Changes

- Updated the preflight skill and its contract to treat setup documentation as a download reference and permit the equivalent official HTML page or another available reader.
- Kept update labels as component scopes while removing their fixed installation order and dependencies on numbered guide steps.
- Preserved runtime readiness, official-source, integrity, compatibility, and user-approval boundaries.
- Updated the existing evaluation for a blocked Markdown reader and removed the obsolete browser-prohibition assertion.
- Preserved unrelated worktree changes and left installed skills, versions, and public release metadata unchanged.

# Final Result

Source changes are ready for the reviewed release PR, based on the latest main branch. The candidate's single npm run check passed suite validation and all 53 tests. Versions and the public release index remain unchanged; public release awaits PR review and explicit merge approval.
