# Snapshot

Read-only inspection of X. Collect only missing scope (tweet/profile/search/feed), target or query, and a bounded item count. Default the count to 10. Use the entry's CLI preflight and invocation contract. Require the action family and confirm the selected snapshot command/options through capabilities or its local --help if omitted there; do not require drafting/scheduler commands.

- Tweet: `tw action snapshot tweet <tweet_url_or_ref> --json`
- Profile: `tw action snapshot profile <handle_or_url> --max-items <count> --json`
- Search: `tw action snapshot search --query <query> --max-items <count> --json`
- Feed: `tw action snapshot feed --source <following|for-you> --max-items <count> --json`

Keep values as separate arguments through cli-invocation.md. These are example logical invocations, not shell interpolation templates. Follow the actual returned envelope, refs, warnings and read-only next continuation. Preserve process/session handles until a complete terminal envelope arrives. Inspect notifications without changing the outcome.

Report what was observed and its limits. A valid empty result is allowed; do not label it a delivery failure or silently change the query/source. On a failure report its actual code/message and use support.md if qualifying. Never create tasks, generate drafts, approve reviews, publish, or retry a mutation from this flow. Today's News discovery is a reply source when requested; do not invent a snapshot news command.
