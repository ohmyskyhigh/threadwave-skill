# Objective

Unblock ThreadWave workflow dead ends: give users explicit, bounded exits wherever a gate previously ended in a stop-plus-report with no path forward, and add next-step suggestions with task templates.

# Final Changes

- Added a Pending Recovery contract to the daily agent: once-per-session numbered presentation, per-item or skip-all user decisions (investigate/skip/report), an exact-ref `tw scheduler cancel` path, and the rule that undecided recovery blocks new work while skipped recovery does not.
- Made an unconfirmed release index non-blocking: one fresh cache-bust retry in the update skill, then a localized continue/stop choice in preflight; continuation is session-scoped and never persisted.
- Routed below-minimum and ahead-of-public skill versions into the existing continue-or-update choice; `blocked` is now reserved for missing or invalid skills.
- Added a Required Update Failure Escape: after two scoped-guide failures in one session the user may continue with the current unsupported version or stop; continuing never suppresses later real readiness failures.
- Added Setup Retry Rounds: after `doctor`, the user may rerun the setup step up to three rounds per session before the unresolved stop and report.
- Let a stalled approved task (`awaiting_selection` past the fixed deadline) be restarted on explicit user choice via `tw task restart`, capped at two failed rounds per session; added the same path to the post peer.
- Isolated single-source approval envelope failures as `error_source` so one malformed envelope no longer kills a batch; the whole workflow stops only when no envelope parses with the expected shape.
- Allowed one explicit approval retry when the recovery read conclusively shows the review still pending, in both reply and post peers.
- Added Inspect Previous Work to the reply peer: lineage-matched, read-only evidence checks for prior sessions' scheduled refs, with retry still gated on conclusive pre-dispatch evidence.
- Added the localized `你可以 / You can` suggestion line to every operation skill's return format, bilingual task templates to the post and reply peers, and mandatory presentation of the CLI's primary next action in the daily agent.

# Final Result

Goal achieved. Every reviewed dead end now has a bounded, user-controlled exit while evidence truth rules and approval authority stay unchanged; suite validation and all 43 contract tests pass.
