# Mandatory Preflight Contract

Run this initialization flow on every invocation of any suite skill. Complete steps in order. Do not invoke `tw` until suite integrity passes.

## 1. Preserve Intent And Choose Language

Record the original requested skill, exact user intent, and any exact post/reply text and target in working memory only.

Choose the response locale in this order:

1. Explicit user language choice.
2. Language of the latest user message.
3. Dominant conversation language.
4. English.

Supported locales are `en` and `zh-CN`. Keep commands, JSON keys, refs, stable states, and error codes in English. Never translate, rewrite, trim, normalize, or spell-correct exact post/reply text.

## 2. Verify The Atomic Suite

Resolve the selected skill's installed directory, then read `../../suite-manifest.json` relative to it.

Require all of the following before any `tw` command:

- `schema_version=threadwave-skill-suite-v1`;
- all four required local skill files exist at their manifest paths;
- each skill frontmatter `name` matches its manifest name;
- each skill frontmatter `metadata.version` equals `suite_version`;
- the plugin manifest base version and `package.json` version equal `suite_version`;
- the requested skill is one of the four manifest skills.

If any required skill file is missing, stop before every `tw` command with `twitter_automation_suite_incomplete`. Preserve the original intent, tell the user to open `https://www.threadwave.xyz/cli/setup/agent.md` to set up the harness agent, and pause. A missing skill module is a normal setup route; generate an issue report only when the user completed the page-guided setup and the module remains missing.

If the suite exists but names, versions, or manifests disagree, stop with `twitter_automation_suite_version_mismatch` and generate an issue report using the shared report contract. Do not fall back to a partial skill or the legacy `twitter-harness`.

## 3. Locate The CLI

Run:

```bash
command -v tw
```

If missing, preserve the original intent and tell the user to open `https://www.threadwave.xyz/cli/setup/agent.md` to set up the harness agent, then pause. The web guide—not a locally installed `twitter-cli-setup` skill—owns skill-suite, CLI, and extension onboarding. Never substitute repository entrypoints, `npm`, `node`, `npx`, `tsx`, or another download origin. Treat missing CLI as a normal user setup route, not a failed repair, unless the user completed the page-guided setup and the command remains missing.

When the user returns, resume the same request from step 3. Do not ask them to repeat the originating post, reply, or daily-run request.

## 4. Diagnose Install Mode

Run exactly once:

```bash
tw doctor --format json
```

Require `schemaVersion=threadwave-doctor-v1`. Read `install.mode`.

- `packaged`: do not run any worktree command.
- `dev`: run `tw worktree tag --format json`. Add `--expected <tag>` only when an expected tag is known from trusted workspace instructions; never guess it. Stop on `worktree_tag_missing` or `worktree_tag_mismatch`.
- any other value or missing field: stop with `twitter_automation_install_mode_unknown` and generate an issue report.

Doctor may expose local paths. Never repeat them to the user or include them in an issue report.

## 5. Check Compatibility And Updates

Run:

```bash
tw capabilities --format json
```

Require:

- top-level `schema_version=tw-cli-v1`;
- `data.cli_schema_versions` includes `tw-cli-v1`;
- `data.harness_schema_versions` includes `tw-harness-v1`;
- every command family required by the selected skill is `available`;
- any exact command required by the selected skill is advertised or confirmed by the matching command help;
- `data.cli_version` is not lower than the manifest `minimum_version`;
- `data.required_upgrades` is empty.

When `required_upgrades` is non-empty, stop and follow only the returned upgrade guidance. When the host plugin manager exposes an update for `threadwave-skill`, present it before continuing. If the host exposes no update lookup, label suite update status `unknown` and continue; do not invent an endpoint or scrape arbitrary release pages.

An absent command, unsupported schema, or incompatible version is `twitter_automation_cli_contract_drift`. Stop before any external action and generate an issue report.

## 6. Probe Setup Without Mutation

Run:

```bash
tw setup --dry-run --format json
```

Require top-level `schema_version=tw-cli-v1` and `data.contract_version=threadwave-setup-v1`.

- If `data.state=ready`, continue.
- Otherwise run the safe reconciler once: `tw setup --format json`.
- Follow only its returned `data.action`.
- If the dry-run or reconciler identifies the Chrome extension as missing, preserve the original intent, tell the user to open `https://www.threadwave.xyz/cli/setup/agent.md` to set up the harness agent, and pause.
- Automatically run a returned command only when `action.type=run_command` and `safe_to_run=true`.
- Pause for `open_url` with `user_confirmation=true` and every `wait_for_user` reason.
- Chrome permission, ThreadWave auth, subscription/payment, and X login are normal user gates. They do not generate issue reports.
- Never open a second checkout or bypass installer, signature, notarization, publisher, or Web Store trust failures.

The machine-readable guide at `https://www.threadwave.xyz/cli/setup/agent.md` owns harness-agent setup for all three required modules: the four-skill suite, CLI, and Chrome extension. It also owns the current extension delivery choice, including any Chrome Web Store or pre-release manual package. The four local skills must not install or embed a fifth setup skill, and must not invent, embed, fetch, or substitute a direct extension artifact URL. Never claim installation until all four skills pass suite integrity, `command -v tw` succeeds, and `tw setup --dry-run --format json` verifies the relay.

After a safe repair or completed user gate, rerun the dry-run once. Do not loop. If the same unresolved non-user action repeats, run doctor once more, stop with `twitter_automation_setup_unresolved`, and generate an issue report.

## 7. Apply The Skill Capability Gate

After setup is ready, confirm the selected skill's command families and feature gates:

- `twitter-automation`: `capabilities`, `doctor`, and `setup` are available.
- `twitter-agent`: `context`, `strategy`, `plan`, `task`, `draft`, and `scheduler` are available.
- `twitter-post`: `action` is available, production actions are enabled, and the tweet command supports `--dry-run`.
- `twitter-reply`: `action` is available, production actions are enabled, and the reply command supports `--dry-run`.

Capability failure blocks only after the atomic suite itself has already passed. Use `twitter_automation_capability_unavailable`; generate an issue report only when the failure indicates skill/CLI drift, not a normal account/user gate.

## 8. Resume The Original Intent

Continue the workflow that invoked preflight without asking the user to repeat their request. Never treat successful setup, login, payment, or preflight as approval for a strategy, plan, draft, post, or reply.

## Preflight Result

Return a compact localized status:

```text
State: <ready | waiting for you | blocked>
Preflight: <suite, CLI, compatibility, setup, selected capability>
Waiting for you: <only when a normal user gate exists>
Problem: <stable code plus localized meaning, only on failure>
Next: <the resumed workflow or required user action>
Harness setup guide: <https://www.threadwave.xyz/cli/setup/agent.md only when a module is missing>
```
