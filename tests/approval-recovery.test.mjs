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
  const manualOperationSkills = operationSkillNames(suite, releaseIndex)
    .filter((skill) => manifests.get(skill)?.role === 'manual-operation');
  assert.equal(manualOperationSkills.length, 2);
  for (const skill of manualOperationSkills) {
    const content = fs.readFileSync(path.join(root, 'skills', skill, 'SKILL.md'), 'utf8');
    assert.match(content, /## Task Mode/);
    assert.match(content, skill === 'twitter-reply' ? /--count <5\.\.10> --json/ : /--count <1\.\.5> --json/);
    assert.match(content, /Do not collapse|Never collapse/i);
    assert.match(content, /one exact scheduled X mutation|one exact reply mutation/i);
    assert.match(content, /## Exact-Action Mode/);
    assert.match(content, /--dry-run --json/);
    assert.match(content, /explicit approval/i);
    assert.match(content, /dispatch .* once/i);
    assert.match(content, /Never retry an unknown|stop without retry/i);
    assert.match(content, /schema_version=tw_cli_harness_v1/);
  }
});

test('reply peer condenses task directions without rewriting exact replies', () => {
  const content = fs.readFileSync(path.join(root, 'skills', 'twitter-reply', 'SKILL.md'), 'utf8');
  assert.match(content, /## Condense The Request First/);
  assert.match(content, /Before preflight or any `tw` command/);
  assert.match(content, /one concise, corrected sentence/);
  assert.match(content, /preserving every explicit count, topic, literal search phrase, account or relationship filter, engagement threshold/i);
  assert.match(content, /Do not add a topic or requirement the user did not state/);
  assert.match(content, /Never rewrite an exact target\/reply pair/);
  assert.match(content, /tw task create --surface reply --direction <condensed_request> --count <5\.\.10> --json/);
});

test('reply peer shows complete target batches and accepts scoped source approval', () => {
  const content = fs.readFileSync(path.join(root, 'skills', 'twitter-reply', 'SKILL.md'), 'utf8');
  assert.match(content, /## Approval Authority/);
  assert.match(content, /No wording such as .*approve all.*continue.*retry.* transfers authority between rows/i);
  assert.match(content, /present the complete pending target list .* together as one numbered set/i);
  assert.match(content, /numbered decision map/i);
  assert.match(content, /accept an explicit “approve all” as approval for every still-pending source review in that exact unchanged displayed set/i);
  assert.match(content, /matching `tw task review approve\|reject\|skip <review_ref> --json` command exactly once for each explicitly decided ref/i);
  assert.match(content, /leave omitted refs pending/i);
  assert.match(content, /do not replay successful decisions/i);
  assert.match(content, /Never apply it to a task proposal, generated reply\/content review, scheduled mutation, undisplayed target, or changed ref/i);
  assert.match(content, /Reviews: <current task, source, or content reviews/i);
  assert.doesNotMatch(content, /Review: <one exact current review>/i);
  assert.doesNotMatch(content, /invoke `tw task review approve <review_ref> --json` once per displayed ref/i);
});

test('reply peer restarts wrong candidate batches without plan-backed retask', () => {
  const content = fs.readFileSync(path.join(root, 'skills', 'twitter-reply', 'SKILL.md'), 'utf8');
  assert.match(content, /Every fresh task below reruns mandatory preflight; same-task review, monitoring, and redraft reuse/i);
  assert.match(content, /treat .*candidates are wrong.* as a candidate-stage restart/i);
  assert.match(content, /Do not use `tw task retask` or `tw draft redraft`/i);
  assert.match(content, /tw task review skip <review_ref> --json/);
  assert.match(content, /require `data\.review\.status=skipped`/);
  assert.match(content, /remove it from the active review set without deleting history/i);
  assert.match(content, /tw task create --surface reply --direction <latest_condensed_request> --count <same_count_unless_user_changed_it> --json/);
  assert.match(content, /stop for its new approval/i);
});

test('reply peer recreates only conclusively undispatched replies as fresh exact actions', () => {
  const content = fs.readFileSync(path.join(root, 'skills', 'twitter-reply', 'SKILL.md'), 'utf8');
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
  const content = fs.readFileSync(path.join(root, 'skills', 'twitter-reply', 'SKILL.md'), 'utf8');
  assert.match(content, /Scheduling is not completion/i);
  assert.match(content, /poll that ref with `tw scheduler show <scheduled_task_ref> --json` at intervals no longer than 15 seconds/i);
  assert.match(content, /Do not invoke `tw scheduler execute` merely to accelerate/i);
  assert.match(content, /tw scheduler evidence <scheduled_task_ref> --json/);
  assert.match(content, /place every draft under exactly one heading: `Sent`, `Not sent yet`, or `Needs attention`/i);
  assert.match(content, /Use `Sent` only for `succeeded` with conclusive evidence and `Not sent yet` only for `scheduled` or `running`/i);
  assert.match(content, /repeat the complete numbered split at least once every 60 seconds/i);
  assert.match(content, /Continue until every returned ref is terminal or needs user action/i);
  assert.match(content, /never finish the reply flow merely because all drafts are scheduled/i);
});

test('manual task peers discover source reviews from each approved blueprint', () => {
  for (const skill of ['twitter-post', 'twitter-reply']) {
    const content = fs.readFileSync(path.join(root, 'skills', skill, 'SKILL.md'), 'utf8');
    assert.match(content, /Capture every exact `task_blueprint_ref` (?:returned by that approval|from either the complete approval envelope or that exact recovery read)/);
    assert.match(content, /immediately inspect each with `tw task show <task_blueprint_ref> --json`/);
    assert.match(content, /fixed 180-second deadline/);
    assert.match(content, /wait `min\(15 seconds, remaining time\)`/);
    assert.match(content, /source_status=source_reviews_created/);
    assert.match(content, /only `source_review_refs_by_status\.pending`/);
    assert.match(content, /all three buckets are empty.*CLI contract drift/i);
    assert.match(content, /Never use `tw task review list`, a global review list, or a latest review/);
  }
});

test('reply peer preserves yielded approval sessions and recovers exact blueprint refs without reapproval', () => {
  const content = fs.readFileSync(path.join(root, 'skills', 'twitter-reply', 'SKILL.md'), 'utf8');
  assert.match(content, /If the execution yields a `session_id`, poll that same session to terminal completion/i);
  assert.match(content, /never project only `output` and discard the continuation handle/i);
  assert.match(content, /blank, partial, or unparseable, treat the result as indeterminate/i);
  assert.match(content, /do not invoke approval again/i);
  assert.match(content, /tw task review show <same_review_ref> --json/);
  assert.match(content, /non-empty `refs\.task_blueprint_refs`/);
  assert.match(content, /`records\[\]\.model_type=TaskBlueprint`/);
  assert.match(content, /A `task_blueprint_proposal_ref` is never a `task_blueprint_ref`/);
  assert.match(content, /Never substitute the proposal ref, use `tw task review list`, search a global\/latest task, or infer a ref by timestamp/i);
});

test('reply peer keeps outcome, continuation, stage, and return contracts coherent', () => {
  const content = fs.readFileSync(path.join(root, 'skills', 'twitter-reply', 'SKILL.md'), 'utf8');
  assert.match(content, /For `reject` or `skip`, invoke the matching `tw task review reject\|skip <same_review_ref> --json` command once/i);
  assert.match(content, /matching `tw plan review approve\|reject\|skip <review_ref> --json` command exactly once for each explicitly decided content review/i);
  assert.match(content, /follow only `data\.automatic_generation\.artifact_refs` and `data\.automatic_generation\.review_refs`/i);
  assert.match(content, /Issue-report generation sends no reply/i);
  assert.match(content, /report each affected reply as `sent`, `not sent`, or `outcome unknown` exactly as its durable evidence supports/i);
  assert.doesNotMatch(content, /State that nothing was sent|Issue report: .*nothing sent/i);
  assert.match(content, /task proposal is still pending.*tw task review skip <same_review_ref> --json/i);
  assert.match(content, /source_status=awaiting_selection.*do not create a duplicate task/i);
  assert.match(content, /wording-only change.*tw draft redraft/i);
  assert.match(content, /direction, source, angle, or target change.*tw plan review skip <review_ref> --json/i);
  assert.match(content, /`scheduled`, `running`, `paused`, `waiting_review`, or has unknown evidence, do not restart or create a replacement reply/i);
  assert.match(content, /needs exact-action approval/);
  assert.match(content, /Mode: <task \| exact-action>/);
  assert.match(content, /Outcome: <sent \| not sent \| not sent yet \| outcome unknown, per reply>/);
});

test('automation is a pure router to independent peers', () => {
  const operationSkills = operationSkillNames(suite, releaseIndex);
  const routerName = operationSkills.find((skill) => manifests.get(skill)?.role === 'operation-router');
  assert.ok(routerName);
  const content = fs.readFileSync(path.join(root, 'skills', routerName, 'SKILL.md'), 'utf8');
  assert.match(content, /independent installed siblings/);
  for (const peer of operationSkills.filter((skill) => skill !== routerName)) {
    assert.match(content, new RegExp(`routes to ${peer}`));
  }
  assert.match(content, /Never invoke `tw task`, `tw draft`, `tw plan`, `tw scheduler`, or `tw action`/);
  assert.match(content, /destination peer owns its mandatory preflight/);
});

test('daily agent checks existing work before creating a plan', () => {
  const dailyAgent = operationSkillNames(suite, releaseIndex)
    .find((skill) => manifests.get(skill)?.role === 'daily-operation');
  assert.ok(dailyAgent);
  const procedure = fs.readFileSync(path.join(root, 'skills', dailyAgent, 'references', 'daily-run.md'), 'utf8');
  assert.ok(procedure.indexOf('tw plan review list --json') < procedure.indexOf('tw plan create --json'));
  assert.match(procedure, /Never create a second plan/);
  assert.match(procedure, /exact `scheduled_task_ref`/);
});

test('every operation peer uses preflight and its error-support compatibility handoff', () => {
  for (const skill of operationSkillNames(suite, releaseIndex)) {
    const content = fs.readFileSync(path.join(root, 'skills', skill, 'SKILL.md'), 'utf8');
    assert.match(content, /threadwave-preflight/);
    assert.match(content, /issue-report-only mode/);
  }
  const preflight = fs.readFileSync(path.join(root, 'skills', releaseIndex.roles.preflight, 'SKILL.md'), 'utf8');
  assert.match(preflight, /threadwave-error-support/);
  assert.match(preflight, /separate .*task/i);
  assert.match(preflight, /pasteable handoff/i);
});

test('same-task review continuations reuse one successful preflight until readiness invalidation', () => {
  const preflight = fs.readFileSync(path.join(root, 'skills', 'threadwave-preflight', 'SKILL.md'), 'utf8');
  const contract = fs.readFileSync(path.join(root, 'skills', 'threadwave-preflight', 'references', 'preflight-contract.md'), 'utf8');
  assert.match(preflight, /start of each new ThreadWave task or agent session/i);
  assert.match(preflight, /review decision alone is not a new preflight boundary/i);
  assert.match(contract, /conversation working memory only/i);
  assert.match(contract, /Do not write a cache file, persist a receipt, or reuse it in another agent session/i);
  assert.match(contract, /Do not rerun `threadwave-update`, `tw preflight`, or `tw capabilities` for that decision alone/i);
  assert.match(contract, /setup, login, subscription\/payment, Chrome extension\/relay, X sign-in\/session/i);

  for (const skill of ['twitter-agent', 'twitter-post', 'twitter-reply']) {
    const content = fs.readFileSync(path.join(root, 'skills', skill, 'SKILL.md'), 'utf8');
    assert.match(content, /start of each new .* task or agent session/i);
    assert.match(content, /do not rerun preflight for a review decision alone/i);
    assert.doesNotMatch(content, /After approval, rerun preflight/i);
  }
});

test('preflight gives one non-blocking update choice and runs the approved guide itself', () => {
  const preflight = fs.readFileSync(path.join(root, 'skills', 'threadwave-preflight', 'SKILL.md'), 'utf8');
  const contract = fs.readFileSync(path.join(root, 'skills', 'threadwave-preflight', 'references', 'preflight-contract.md'), 'utf8');
  assert.match(preflight, /supported older skill or CLI is non-blocking/i);
  assert.match(contract, /Combine every supported skill update and `cli_update_available` into one decision/);
  assert.match(contract, /Continue with installed versions/);
  assert.match(contract, /Update now/);
  assert.match(contract, /curl -fsSL --max-time 30 .*https:\/\/www\.threadwave\.xyz\/cli\/setup\/agent\.md/);
  assert.match(contract, /Invoke-WebRequest -UseBasicParsing -Uri 'https:\/\/www\.threadwave\.xyz\/cli\/setup\/agent\.md'/);
  assert.match(contract, /Do not use Web search, browser navigation, URL-read, a cached copy, or a user-pasted copy/);
  assert.match(contract, /rerun the full preflight once, and resume the exact preserved originating request/);
  assert.match(contract, /applies across ThreadWave tasks for the rest of the same agent session only while the exact offered skill and CLI local\/latest version map is unchanged/);
  assert.match(contract, /Remind again in the next agent session or immediately if the offered version map changes/);
  assert.match(contract, /A new task still runs full preflight and its own capability gate/);
});
