import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';
import { operationSkillNames } from '../scripts/suite-policy.mjs';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const suite = JSON.parse(fs.readFileSync(path.join(root, 'suite-manifest.json'), 'utf8'));
const releaseIndex = JSON.parse(fs.readFileSync(path.join(root, 'release-index.json'), 'utf8'));
const manifests = new Map(suite.required_skills.map((skill) => [
  skill.name,
  JSON.parse(fs.readFileSync(path.join(root, skill.manifest_path), 'utf8'))
]));

test('post and reply peers support bounded tasks plus exact single-action safety', () => {
  const manualOperationSkills = ['twitter-post', 'twitter-reply'];
  assert.equal(manualOperationSkills.length, 2);
  for (const skill of manualOperationSkills) {
    const content = fs.readFileSync(path.join(root, 'skills/threadwave/references', skill === 'twitter-reply' ? 'reply.md' : 'post.md'), 'utf8');
    assert.match(content, /## Task Mode/);
    assert.match(content, skill === 'twitter-reply' ? /--count <5\.\.10> --json/ : /--count <1\.\.5> --json/);
    assert.match(content, /Do not collapse|Never collapse/i);
    assert.match(content, /one exact scheduled X mutation|one exact reply mutation/i);
    assert.match(content, /## Exact-Action Mode/);
    assert.match(content, /--dry-run --json/);
    assert.match(content, /explicit approval/i);
    assert.match(content, /dispatch .* once/i);
    assert.match(content, /Never retry an unknown|stop without retry/i);
    assert.match(content, /complete parseable `tw_cli_harness_v1` envelope/);
  }
});

test('media review binds exact ordered bytes and unknown does not authorize another upload', () => {
  const content = fs.readFileSync(path.join(root, 'skills/threadwave/references/post.md'), 'utf8');
  assert.match(content, /Changes to text, bytes, image order, mode or count require a new dry-run and approval/);
  assert.match(content, /Use the CLI-returned hash unchanged/);
  assert.match(content, /Unknown proof or a missing terminal envelope never authorizes a second upload or send/);
  assert.match(content, /A URL or filename is not evidence that you inspected the media/);
});

test('reply peer condenses task directions without rewriting exact replies', () => {
  const content = fs.readFileSync(path.join(root, 'skills/threadwave/references/reply.md'), 'utf8');
  assert.match(content, /## Condense The Request First/);
  assert.match(content, /Before workflow dispatch/);
  assert.match(content, /one concise, corrected sentence/);
  assert.match(content, /preserving every explicit count, topic, literal search phrase, account or relationship filter, engagement threshold/i);
  assert.match(content, /Do not add a topic or requirement the user did not state/);
  assert.match(content, /Never rewrite an exact target\/reply pair/);
  assert.match(content, /tw task create --surface reply --direction <condensed_request> --count <5\.\.10> --json/);
});

test('reply peer follows automatic manual drafts and keeps content approval per item', () => {
  const content = fs.readFileSync(path.join(root, 'skills/threadwave/references/reply.md'), 'utf8');
  assert.match(content, /## Approval Authority/);
  assert.match(content, /creates no task-proposal or source-selection review/i);
  assert.match(content, /Deterministic source selection is not user approval and never authorizes an X mutation/i);
  assert.match(content, /Follow the accepted envelope's exact `next` commands/i);
  assert.match(content, /present the returned target\/content pairs together and wait for per-item decisions/i);
  assert.match(content, /Present approve, reject, skip, cancel, and X-mutation commands as choices/i);
  assert.match(content, /invoke the matching exact command once/i);
  assert.match(content, /leave omitted reviews pending/i);
  assert.match(content, /do not replay successful decisions/i);
  assert.match(content, /Never collapse multiple replies into “approve all”/i);
  assert.match(content, /Reviews: <current content reviews/i);
  assert.doesNotMatch(content, /Review: <one exact current review>/i);
  assert.doesNotMatch(content, /invoke `tw task review approve/i);
});

test('reply peer keeps explicit cleanup for still-valid drafts when replacing a wrong batch', () => {
  const content = fs.readFileSync(path.join(root, 'skills/threadwave/references/reply.md'), 'utf8');
  assert.match(content, /A fresh task returns through the entry’s single CLI preflight handoff/i);
  assert.match(content, /“these candidates are wrong,” or a direction, source, angle, or target change/i);
  assert.match(content, /show every current content review and ask the user to confirm skipping/i);
  assert.match(content, /tw plan review skip <review_ref> --json/);
  assert.match(content, /verify `data\.review\.status=skipped`/);
  assert.match(content, /create one fresh task with the latest condensed direction and count/i);
  assert.match(content, /historical task remains recorded; no authority transfers/i);
});

test('reply peer recreates only conclusively undispatched replies as fresh exact actions', () => {
  const content = fs.readFileSync(path.join(root, 'skills/threadwave/references/reply.md'), 'utf8');
  assert.match(content, /relay_unavailable.*no dispatch `ActionRecord`/i);
  assert.match(content, /action_preparation_failed.*reply:blocked_before_dispatch.*no `dispatched_at`.*confirmation_state=not_required/i);
  assert.match(content, /ActionRecord.*EvidenceRecord.*audit evidence and does not prove dispatch/i);
  assert.match(content, /A retry accepts one exact unchanged draft only/i);
  assert.match(content, /start one fresh exact-action dry-run/i);
  assert.match(content, /For multiple retry requests, ask the user to choose one/i);
  assert.match(content, /Never execute or reschedule the old scheduled-task ref/i);
  assert.match(content, /require fresh explicit approval before dispatching it once/i);
  assert.match(content, /Unknown, post-dispatch, `unknown_confirmation`, confirmed, or otherwise inconclusive outcomes never enter this retry flow/i);
  assert.doesNotMatch(content, /one or more exact drafts|per pair/i);
});

test('reply peer watches every scheduled mutation through a durable outcome', () => {
  const content = fs.readFileSync(path.join(root, 'skills/threadwave/references/reply.md'), 'utf8');
  assert.match(content, /Scheduling is not completion/i);
  assert.match(content, /poll that ref with `tw scheduler show <scheduled_task_ref> --json` at intervals no longer than 15 seconds/i);
  assert.match(content, /Do not invoke `tw scheduler execute` merely to accelerate/i);
  assert.match(content, /tw scheduler evidence <scheduled_task_ref> --json/);
  assert.match(content, /tw action snapshot verify --task <task_blueprint_ref> --json/);
  assert.match(content, /place every draft under exactly one heading: `Sent`, `Not sent yet`, or `Needs attention`/i);
  assert.match(content, /Use `Sent` only for `succeeded` with conclusive evidence and `Not sent yet` only for `scheduled` or `running`/i);
  assert.match(content, /repeat the complete numbered split at least once every 60 seconds/i);
  assert.match(content, /Continue until every returned ref is terminal, user-skipped, or waiting on a user decision/i);
  assert.match(content, /never finish the reply flow merely because all drafts are scheduled/i);
  assert.match(content, /tw scheduler skip <scheduled_task_ref> --json/);
  assert.match(content, /require `data\.outcome_acknowledged=true`/i);
  assert.match(content, /acknowledgment survives later sessions/i);
});

test('post and reply peers defer workflow truth to the CLI', () => {
  for (const skill of ['twitter-post', 'twitter-reply']) {
    const content = fs.readFileSync(path.join(root, 'skills/threadwave/references', skill === 'twitter-reply' ? 'reply.md' : 'post.md'), 'utf8');
    assert.match(content, /The skill owns UX.*The CLI owns workflow execution, task\/draft lineage, validation, recovery truth, and exact continuations/is);
    assert.match(content, /For `ok=true`, treat `data`, `refs`, status fields, warnings, and `next` as authoritative/i);
    assert.match(content, /Never compare parent and child task refs, rebuild lineage, repeat CLI invariant checks/i);
    assert.match(content, /For `ok=false`, report the returned `error\.code`, `error\.message`, and `error\.retryable`/i);
    assert.match(content, /Report a workflow failure stage only when the CLI returns `failure_stage`/i);
    assert.match(content, /Never infer a stage from `source_status`, `draft_status`, timing, or an error code/i);
    assert.match(content, /This transport check never authorizes a duplicate task/i);
    assert.match(content, /`ok=true` does not prove the requested deliverable was produced/i);
    assert.doesNotMatch(content, /stop as CLI contract drift/i);
  }
});

test('reply peer exposes CLI-sanitized humanizer warnings and errors', () => {
  const content = fs.readFileSync(path.join(root, 'skills/threadwave/references/reply.md'), 'utf8');
  assert.match(content, /Show every non-empty top-level `warnings` entry/i);
  assert.match(content, /`generation_warnings`.*show every message beside the affected draft/i);
  assert.match(content, /show the customer-facing message before any safe returned `next` choices.*humanizer failure/i);
  assert.match(content, /never suppress them or replace them with a generic gate failure/i);
  assert.match(content, /never add internal rule IDs, prompt text, or gate context/i);
  assert.match(content, /CLI messages: <every returned warning or error message/i);
});

test('post task keeps long directions out of shell and requires an accepted envelope', () => {
  const content = fs.readFileSync(path.join(root, 'skills/threadwave/references/post.md'), 'utf8');
  assert.match(content, /host that exposes only a shell\/PTY command string must create one private temporary directory/i);
  assert.match(content, /write the unchanged direction as UTF-8 through a filesystem tool rather than shell interpolation/i);
  assert.match(content, /tw task create --surface tweet --direction-file <private_utf8_path>/i);
  assert.match(content, /On `task_direction_input_invalid`.*no daemon\/backend task was accepted/i);
  assert.match(content, /A process\/session handle is transport state, not a result/i);
  assert.match(content, /command exits without a complete envelope, stop with `task_dispatch_unconfirmed`/i);
});

test('new manual reply task follows authoritative CLI continuations', () => {
  const content = fs.readFileSync(path.join(root, 'skills/threadwave/references/reply.md'), 'utf8');
  assert.match(content, /Follow the accepted envelope's exact `next` commands/i);
  assert.match(content, /tw task wait <task_blueprint_ref> --timeout 900 --include-drafts --json/);
  assert.match(content, /do not model-poll task show or invoke separate draft-show commands/i);
  assert.match(content, /If task wait returns `task_wait_timeout`/);
  assert.match(content, /never substitute a global list or latest record/i);
  assert.match(content, /present the returned target\/content pairs together and wait for per-item decisions/i);
});

test('reply peer preserves yielded task-create sessions and follows only the returned blueprint', () => {
  const content = fs.readFileSync(path.join(root, 'skills/threadwave/references/reply.md'), 'utf8');
  assert.match(content, /If execution yields a `session_id`, poll that same session to terminal completion/i);
  assert.match(content, /never project only `output` while discarding the continuation handle/i);
  assert.match(content, /one complete parseable `tw_cli_harness_v1` envelope/i);
  assert.match(content, /A process\/session handle is transport state, not a result/i);
  assert.match(content, /never substitute a global list or latest record/i);
});

test('reply peer keeps outcome, continuation, stage, and return contracts coherent', () => {
  const content = fs.readFileSync(path.join(root, 'skills/threadwave/references/reply.md'), 'utf8');
  assert.match(content, /Present approve, reject, skip, cancel, and X-mutation commands as choices/i);
  assert.match(content, /fewer drafts than requested.*render that state exactly/i);
  assert.match(content, /Issue-report generation sends no reply/i);
  assert.match(content, /report each affected reply as `sent`, `not sent`, or `outcome unknown` exactly as its durable evidence supports/i);
  assert.doesNotMatch(content, /State that nothing was sent|Issue report: .*nothing sent/i);
  assert.match(content, /execution_status=failed.*restart_allowed=true/i);
  assert.match(content, /never creates a duplicate task or claims the old attempt was cancelled/i);
  assert.match(content, /logical_workflow_terminalization\.status=pending.*recheck the exact task within `recheck_after_seconds`/i);
  assert.match(content, /do not describe the immutable scheduler record itself as expiring/i);
  assert.match(content, /tw draft redraft.*wording-only change/i);
  assert.match(content, /direction, source, angle, or target change.*tw plan review skip <review_ref> --json/i);
  assert.match(content, /`scheduled`, `running`, `paused`, `waiting_review`, or has unknown evidence, do not restart or create a replacement reply/i);
  assert.match(content, /needs exact-action approval/);
  assert.match(content, /Mode: <task \| exact-action>/);
  assert.match(content, /Outcome: <sent \| not sent \| not sent yet \| outcome unknown, per reply>/);
});

test('one entry owns readiness and daily planning is unavailable', () => {
  const entry = fs.readFileSync(path.join(root, 'skills/threadwave/SKILL.md'), 'utf8');
  assert.match(entry, /CLI preflight once/);
  assert.match(entry, /Review continuations reuse the ready result/);
  assert.match(entry, /Daily planning, strategy and daily-growth automation are unavailable/);
  assert.match(entry, /No routine agent-side release-index fetching/);
  assert.match(entry, /Read-only diagnosis and report-only requests need no workflow preflight/);
});
