# Objective

Prevent cached release-index reads and redundant same-task preflight runs.

# Final Changes

- Required a direct `curl` fetch on macOS/Linux or `Invoke-WebRequest` on Windows.
- Forbid Web search, browser search, URL-read, Firecrawl, crawl, and scrape tools for the release index.
- Made the PowerShell command compatible with Windows PowerShell 5.1 and PowerShell 7.
- Reused one successful preflight across unchanged review continuations in the same agent session, with explicit invalidation boundaries.
- Updated focused validation and prepared suite version 0.6.3 with independently bumped changed skills.

# Final Result

Goal achieved locally. Suite validation and all 26 tests pass, the 0.6.3 release artifacts and npm package build successfully, and release remains pending explicit commit and publication approval.
