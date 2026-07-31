# Twitter Reply Request Condensing - Implementation Tasks

**Plan Date**: 2026-07-31
**Status**: Draft

## Task Group 1: Update The Reply Skill

**Objective**: Condense typo-filled task-mode requests before ThreadWave task creation.

### Task 1.1: Add The Condensing Rule

**Modified File**: `skills/twitter-reply/SKILL.md`

**Technical Solution**:

- Add a short request-condensing step at the start of the reply flow.
- Define the condensed request as one corrected sentence with filler and repetition removed.
- Require it to preserve count, topic, literal phrase, account/relationship filters, and reply/engagement thresholds.
- Forbid adding unstated topics or filters.
- Keep exact target/reply pairs unchanged.
- Replace task-mode placeholders such as `<exact_user_direction>` and `<latest_exact_user_direction>` with the condensed request.
- Keep `threadwave-preflight` unchanged.

**Dependencies:**

- Preserve the unrelated edits already present in `skills/twitter-reply/SKILL.md`.

**Deliverable:**

- Reply task creation and candidate-stage restart both use the latest condensed request.
- Exact-action mode still preserves every character of the reply payload.

**Testing Method:**

**Static checks:**

- `rg -n "condensed request|condensed_request" skills/twitter-reply/SKILL.md`
- `rg -n "exact_user_direction|latest_exact_user_direction" skills/twitter-reply/SKILL.md` must return no task-direction placeholders.
- `rg -n "Never translate or normalize an exact target/reply pair" skills/twitter-reply/SKILL.md` confirms exact-content protection remains.

**Break it:**

- Verify the instruction retains explicit numbers such as `10`, `20`, and `50`.
- Verify it does not turn `find`/`fin` into a finance topic without explicit finance wording.
- Verify exact reply text containing intentional misspellings is not corrected.

## Task Group 2: Add Focused Evals And Validate

**Objective**: Cover the reported failure and the two important boundaries.

### Task 2.1: Add Reply-Condensing Evals

**Modified File**: `skills/twitter-reply/evals/evals.json`

**Technical Solution**: Add these focused scenarios to the existing eval set:

1. `fin 10 let's connect tweet and draft replies` becomes `Find 10 connection-seeking tweets and draft replies`, with no finance topic added.
2. A wordy request containing follower and reply-count conditions becomes one sentence while retaining every condition and number.
3. An exact target/reply pair containing a typo remains byte-for-byte unchanged.
4. An explicit finance reply request retains finance as its topic.

**Dependencies:**

- Task 1.1 complete.
- Preserve the unrelated edits already present in the eval file.

**Deliverable:**

- Four regression cases distinguish helpful summarization from invented intent or exact-content rewriting.

**Testing Method:**

- `node -e "JSON.parse(require('fs').readFileSync('skills/twitter-reply/evals/evals.json','utf8')); console.log('valid')"`
- `npm run validate`
- `npm run check`
- `git diff --check`

## Testing Checklist

### After Task Group 1

- [ ] Task-mode direction is condensed before `tw task create`.
- [ ] All explicit constraints survive condensation.
- [ ] Exact-action target/reply content remains unchanged.
- [ ] No preflight or runtime service was modified.

### After Task Group 2

- [ ] Reported typo no longer produces finance intent.
- [ ] Explicit finance wording still produces finance intent.
- [ ] Wordy constraints are summarized without loss.
- [ ] Exact text is preserved.
- [ ] Repository validation passes.

## Milestone Verification

Run:

```bash
node -v
npm run validate
npm run check
git diff --check
```

All commands must pass before bumping the then-current `twitter-reply` patch version. Candidate/release metadata is separate; no public release occurs without a new exact release authorization.

## Success Metrics

- One sentence is sent as the reply task direction.
- Obvious contextual typos are corrected.
- Every explicit filter and threshold is retained.
- No new topic or constraint is invented.
- Exact reply content is unchanged.

## Rollback Points

1. Revert the `SKILL.md` wording if condensation changes intent.
2. Revert the added eval entries independently; no runtime or stored user data is affected.
