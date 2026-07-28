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

test('reply peer shows complete target batches and accepts scoped source approval', () => {
  const content = fs.readFileSync(path.join(root, 'skills', 'twitter-reply', 'SKILL.md'), 'utf8');
  assert.match(content, /present the complete pending target list .* together as one numbered set/i);
  assert.match(content, /numbered decision map/i);
  assert.match(content, /accept an explicit “approve all” as approval for every still-pending source review in that exact unchanged displayed set/i);
  assert.match(content, /tw task review approve <review_ref> --json/);
  assert.match(content, /Never apply it to a task proposal, generated reply\/content review, scheduled mutation, undisplayed target, or changed ref/i);
  assert.match(content, /leave every omitted item pending/i);
  assert.match(content, /Reviews: <all current source or content reviews/i);
  assert.doesNotMatch(content, /Review: <one exact current review>/i);
});

test('reply peer restarts wrong candidate batches without plan-backed retask', () => {
  const content = fs.readFileSync(path.join(root, 'skills', 'twitter-reply', 'SKILL.md'), 'utf8');
  assert.match(content, /treat .*candidates are wrong.* as a restart of the current manual reply task/i);
  assert.match(content, /Do not use `tw task retask` or `tw draft redraft` for this candidate-stage restart/i);
  assert.match(content, /tw task review skip <review_ref> --json/);
  assert.match(content, /require `status=skipped`/);
  assert.match(content, /remove it from the skill's active review set/i);
  assert.match(content, /removal means it is no longer active or pending, not deletion from append-only history/i);
  assert.match(content, /tw task create --surface reply --direction <latest_exact_user_direction> --count <same_count_unless_user_changed_it> --json/);
  assert.match(content, /no old approval, source, draft, or review authority transfers/i);
});

test('manual task peers discover source reviews from each approved blueprint', () => {
  for (const skill of ['twitter-post', 'twitter-reply']) {
    const content = fs.readFileSync(path.join(root, 'skills', skill, 'SKILL.md'), 'utf8');
    assert.match(content, /Capture every exact `task_blueprint_ref` returned by that approval/);
    assert.match(content, /immediately inspect each with `tw task show <task_blueprint_ref> --json`/);
    assert.match(content, /fixed 180-second deadline/);
    assert.match(content, /wait `min\(15 seconds, remaining time\)`/);
    assert.match(content, /source_status=source_reviews_created/);
    assert.match(content, /only `source_review_refs_by_status\.pending`/);
    assert.match(content, /all three buckets are empty.*CLI contract drift/i);
    assert.match(content, /Never use `tw task review list`, a global review list, or a latest review/);
  }
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
