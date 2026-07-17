---
name: twitter-automation
description: "Check the four-skill suite, CLI, and Chrome extension; diagnose readiness and route a review-gated Twitter/X automation suite powered by ThreadWave. Use for Twitter automation, X automation, tweet automation, Twitter bot/agent readiness, dependency checks, preflight, updates, onboarding, or choosing the right Twitter skill. If any required module is missing, route to the web-hosted harness setup guide at /cli/setup/agent.md. 中文：用于检查四个技能、CLI 与 Chrome 扩展，执行推特自动化、Twitter/X 自动化、推文自动化、代理就绪检查、依赖检查、预检、更新、引导和技能路由；任何必要模块缺失时转到 /cli/setup/agent.md 设置 harness agent。"
metadata:
  version: "0.3.0"
  suite: "threadwave-skill"
---

# Twitter Automation

Own high-level suite initialization, dependency validation, update checks, readiness diagnosis, and workflow routing. Delegate missing skill-suite, CLI, or extension setup to `https://www.threadwave.xyz/cli/setup/agent.md`. ThreadWave is the implementation provider; the public skill name remains generic.

## Scope

Use this skill to:

- verify that all four local suite skills are installed together at one version;
- diagnose packaged versus development installs;
- check CLI compatibility and required upgrades;
- hand any missing skill-suite, CLI, or extension module to the web-hosted harness setup guide without losing the original request;
- report readiness or route an already-requested workflow to the matching skill.

Do not create strategies, plans, drafts, posts, or replies unless the user already asked for that separate workflow and its specialized skill is available.

## Language

Choose `en` or `zh-CN` using the shared preflight rule. Read the matching file only when composing user-facing output:

- English: [../../references/i18n/en.md](../../references/i18n/en.md)
- 简体中文: [../../references/i18n/zh-CN.md](../../references/i18n/zh-CN.md)

Keep commands, JSON keys, refs, schema values, and error codes in English.

## Mandatory Preflight And Init Flow

Read [../../references/preflight-contract.md](../../references/preflight-contract.md) completely and execute it from step 1 on every invocation, including setup-only, update-only, status, repair, and issue-report requests.

The selected capability gate for this skill requires `capabilities`, `doctor`, and `setup`. Suite integrity must pass before invoking `tw`; a partial installation blocks every skill.

If any required skill, `tw`, or the Chrome extension is missing, preserve the user's request and tell the user to open `https://www.threadwave.xyz/cli/setup/agent.md` to set up the harness agent. The setup protocol is web-hosted and is not downloaded as a local fifth skill. Resume only after all three module checks verify ready.

## Setup Delegation

After the shared dry-run, interpret `tw setup` only from its returned contract:

- `data.state=ready`: report ready and stop for setup-only requests.
- `data.state=waiting`: state the localized user action and pause.
- `data.state=blocked`: report the stable code and do not bypass it.
- `data.state=error`: perform only the bounded diagnosis in preflight, then report.

The web-hosted setup guide may direct contract-authorized safe local repair. The user owns:

- Chrome extension permission confirmation;
- ThreadWave sign-up/sign-in;
- subscription/payment confirmation;
- X login.

For every missing skill-suite, CLI, or extension state, route to the canonical agent guide; do not install a local setup skill or expose a direct extension package. After the page-guided flow verifies all modules ready, resume this skill or the originating specialized workflow. Do not infer any content approval from setup completion.

## Dependency And Update Result

Summarize these independently:

1. Suite: four local skills present and same version.
2. CLI: installed version and supported schemas.
3. Install: `packaged` or safe `dev` worktree status.
4. Setup: ready or one concrete user gate.
5. Update: host plugin update when the host exposes one; CLI `required_upgrades` from capabilities.

If suite update status is unavailable, say `unknown`; this is not a failure. Never claim “latest” without an authoritative result.

## Router

When preflight is ready, preserve the original intent and route:

- daily growth, strategy, plan, reviews, drafts, or scheduler: `twitter-agent`;
- one exact new post now: `twitter-post`;
- one exact reply to one target now: `twitter-reply`;
- skill-suite, CLI, or extension install/repair: web-hosted harness setup at `https://www.threadwave.xyz/cli/setup/agent.md`;
- dependency/update/readiness check only: remain here and stop at readiness.

Do not ask the user to repeat content already supplied. Routing does not grant approval.

## Approval Boundaries

Automatically perform read-only checks, compatibility validation, setup dry-runs, and setup-authorized safe repair.

Pause before every user-owned browser/auth/payment/X login gate and before any strategy, plan, content, or X mutation decision. “Run Twitter automation” means initialize and show the next review; it does not authorize posting.

## Issue Report

Read [../../references/issue-report-contract.md](../../references/issue-report-contract.md) when the user asks for a report or a report-worthy failure occurs.

Generate a copy/paste report for incomplete suites, version mismatch, CLI contract drift, repeated unresolved setup, or a safe repair that failed once. Do not generate one for a normal Chrome/auth/payment/X-login/approval wait.

Always state that the report was not sent.

## Return Format

Use localized labels and only applicable lines:

```text
State: <ready | waiting for you | blocked>
Completed: <verified checks or safe repairs>
Preflight: <suite / CLI / compatibility / setup / automation capability>
Problem: <stable code and localized meaning>
Waiting for you: <one user action>
Next: <one next step or routed skill>
Issue report: <generated for copy/paste; nothing sent>
```

Never expose local paths, raw doctor/setup output, tokens, handles, target URLs, or private refs.
