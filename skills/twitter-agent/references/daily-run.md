# Daily Run Procedure

Read this only after suite preflight and an active strategy are ready.

## 1. Review Existing Work First

Inspect in order:

```bash
tw plan review list --json
tw task review list --json
tw draft list --json
tw scheduler status --json
tw scheduler list --json
```

Use context-resume refs to avoid broad duplicate reads. If any pending review exists, show the exact review/artifact and stop for one decision. Never create a second plan to avoid an unresolved plan, review, or recovery route.

## 2. Create Today's Plan

Only when an active strategy exists and no conflicting unresolved work remains:

```bash
tw plan create --json
```

This creates a proposal, not approved or scheduled work. Show the complete plan review with dates, items, targets/surfaces when present, rationale, risk notes, and exact review ref. Stop for approve, reject, skip, or edit.

On explicit approval of exactly what was displayed:

```bash
tw plan review approve <review_ref> --json
```

Use `reject`, `skip`, or `edit` only for the matching explicit decision. Do not reuse approval after the review scope or content hash changes.

## 3. Task And Source Reviews

Approved plans may yield logical task proposals and source work. Inspect returned refs and use:

```bash
tw task review list --json
tw task review show <review_ref> --json
```

Show the full task/source scope before a decision. Approval does not approve generated copy. Never use a task command to perform a direct X mutation.

## 4. Draft Reviews

Use task and artifact refs returned by the CLI:

```bash
tw draft list --json
tw draft show <artifact_ref> --json
tw draft create --task <task_blueprint_ref> --json
tw draft redraft <artifact_ref> --feedback <text> --json
```

Draft creation is direct generation outside scheduler ownership and creates a content review. Show the exact text, target/surface, and review scope in full. Stop for a decision.

On approval, use the exact review command returned by the CLI contract. Confirm that any created scheduled X operation has an exact `scheduled_task_ref` and reservation before saying it is scheduled.

## 5. Scheduler

Inspect only:

```bash
tw scheduler status --json
tw scheduler list --json
tw scheduler show <scheduled_task_ref> --json
tw scheduler evidence <scheduled_task_ref> --json
```

Management requires the user to identify the exact scheduled task:

```bash
tw scheduler reschedule <scheduled_task_ref> --time <ISO-8601> --json
tw scheduler pause <scheduled_task_ref> --json
tw scheduler resume <scheduled_task_ref> --json
tw scheduler cancel <scheduled_task_ref> --json
```

Immediate execution also requires an explicit ref and request:

```bash
tw scheduler execute <scheduled_task_ref> --dry-run --json
tw scheduler execute <scheduled_task_ref> --json
```

Do not guess the next task. Never retry when mutation evidence is unknown.

## 6. Outcomes And Improvement

After scheduler evidence exists:

```bash
tw plan outcome summarize --json
tw plan improve --json
```

For strategy-period improvement:

```bash
tw strategy outcome summarize --json
tw strategy improve --json
tw strategy create --mode profile --json
```

Every resulting strategy revision still requires a new exact review and activation. Prior snapshots and approvals remain immutable.
