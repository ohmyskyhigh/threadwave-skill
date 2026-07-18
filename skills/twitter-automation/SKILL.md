---
name: twitter-automation
description: "Route review-gated Twitter/X automation requests after dedicated ThreadWave preflight and update skills verify six flat peer skills, the CLI, and Chrome extension. Use for Twitter automation, X automation, tweet automation, Twitter bot/agent readiness, onboarding, or choosing the correct Twitter operation skill. 中文：用于在 ThreadWave 预检和更新技能确认六个平铺技能、CLI 与 Chrome 扩展后，路由推特自动化、Twitter/X 自动化、推文自动化、代理就绪、引导和技能选择请求。"
---

# Twitter Automation

Own high-level workflow routing after the dedicated infrastructure peers complete readiness. `threadwave-preflight` owns dependencies/setup and `threadwave-update` owns versions. Delegate missing skill, CLI, or extension setup to `https://www.threadwave.xyz/cli/setup/agent.md`. ThreadWave is the implementation provider; the public operation name remains generic.

## Scope

Use this skill to:

- request the mandatory dedicated preflight and update checks;
- hand any missing skill-suite, CLI, or extension module to the web-hosted harness setup guide without losing the original request;
- report readiness or route an already-requested workflow to the matching skill.

Do not create strategies, plans, drafts, posts, or replies unless the user already asked for that separate workflow and its specialized skill is available.

## Language

Choose `en` or `zh-CN` through `threadwave-preflight`: explicit user preference, latest message, conversation language, then English.

Keep commands, JSON keys, refs, schema values, and error codes in English.

## Mandatory Preflight And Init Flow

Activate `threadwave-preflight` by skill name on every invocation, including setup-only, status, repair, and routed operation requests. Pass the unchanged original intent and originating skill. Do not invoke `tw` until preflight returns `ready` with all six individual skill versions confirmed latest.

The selected capability gate requires `capabilities`, `doctor`, and `setup`. A partial or outdated six-skill installation blocks every operation.

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

1. Skills: six flat peers present, with each independent version confirmed latest.
2. CLI: installed version and supported schemas.
3. Install: `packaged` or safe `dev` worktree status.
4. Setup: ready or one concrete user gate.
5. Update: authoritative result from `threadwave-update`; CLI `required_upgrades` from capabilities.

If GitHub update status is unconfirmed, stop before `tw`. Never claim “latest” without the authoritative release index result.

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

For an explicit report request or report-worthy failure, activate `threadwave-preflight` in issue-report-only mode with sanitized diagnostic metadata.

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
