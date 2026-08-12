# ThreadWave — Agent Skills for Review-Gated X Growth

[ThreadWave](https://www.threadwave.xyz) is an AI-powered X growth copilot that helps people stay visible on X without spending all day scrolling, drafting, replying, and managing repetitive account work.

It turns daily X growth into a reviewable agent workflow: find timely opportunities, create voice-matched posts and replies, plan ongoing activity, ask for approval at important boundaries, schedule approved work, and report what actually happened.

This repository contains the bilingual Agent Skills that teach Codex, Claude Code, Cursor, Qoder, Hermes Agent, OpenClaw, and other Agent Skills-compatible hosts how to operate ThreadWave safely. It is the instruction layer, not the complete product runtime. The workflows use the ThreadWave CLI and Chrome extension to reach the product's strategy, task, draft, scheduler, browser, and evidence capabilities.

## What ThreadWave does

ThreadWave is designed around five parts of X growth:

### Find timely ideas

ThreadWave can turn fresh news, tweets, trends, niche conversations, product work, and account context into useful content directions. The goal is to help users know what to post or where to join a conversation while the topic is still relevant.

### Draft in the user's voice

ThreadWave uses profile context, previous writing, edits, and optional reference accounts to make drafts more specific to the user. Drafts remain reviewable: users can inspect, edit, reject, skip, regenerate, schedule, or approve them instead of handing over unlimited publishing authority.

### Find and prepare replies

The reply workflow discovers relevant public posts, presents the complete candidate set for review, generates replies only for approved targets, and requires another review before any reply is sent. This helps users join conversations where their audience already pays attention without turning replies into spam.

### Plan repeatable daily growth

The daily agent maintains an active strategy, creates bounded daily plans, resumes pending work, surfaces reviews in order, checks scheduler state, and summarizes outcomes. It is built for ongoing account growth rather than one isolated post.

### Keep background work accountable

Approved work can move through the scheduler while ThreadWave tracks durable status and evidence. The agent distinguishes work that was sent, work still running, work that was conclusively not sent, and work whose outcome is unknown. It never treats “scheduled” as “published.”

The wider ThreadWave product also supports profile building and auditing, inspiration, follow-back, smart-unfollow, and recurring account-maintenance workflows. Learn more on the [ThreadWave website](https://www.threadwave.xyz).

## How the Agent Skill suite works

Each user request has one workflow owner. The owner first checks that the complete ThreadWave installation is compatible, then uses the deterministic CLI contract for the requested workflow.

```text
User request
    |
    +-- create or publish posts --------> twitter-post
    +-- discover or send replies -------> twitter-reply
    +-- run daily growth work ----------> twitter-agent
    +-- setup or ambiguous automation --> twitter-automation
                                              |
                                              v
                                  threadwave-preflight
                                     |       |       |
                                     v       v       v
                                  skills    CLI   extension
                                     |
                                     v
                              proposal and reviews
                                     |
                                     v
                          scheduler and durable evidence
```

The seven skills are independent flat peers:

| Skill | Responsibility |
| --- | --- |
| `twitter-automation` | Routes setup, readiness, repair, and ambiguous automation requests to the correct owner. It never posts or replies itself. |
| `twitter-agent` | Runs the daily strategy, plan, review, scheduler, recovery, and outcome loop. |
| `twitter-post` | Creates one to five bounded post tasks or handles one exact final post through dry-run and approval. |
| `twitter-reply` | Creates five to ten target-discovery reply tasks, reviews targets and drafts, monitors outcomes, or handles one exact final reply. |
| `threadwave-preflight` | Verifies the full skill roster, compatible CLI capabilities, Chrome extension, selected account context, and setup readiness. |
| `threadwave-update` | Compares each independently versioned skill with the authoritative public release index. |
| `threadwave-error-support` | Finds public known solutions and prepares sanitized bilingual issue reports without submitting them automatically. |

Operation skills call `threadwave-preflight` directly. They do not depend on the optional `twitter-automation` router, so a clear request can activate `twitter-post`, `twitter-reply`, or `twitter-agent` immediately.

## Core workflows

### Daily Twitter/X agent

Use `twitter-agent` for account strategy, daily planning, content reviews, scheduling, and outcome summaries.

The normal loop is:

1. Resume the selected account and any open work.
2. Resolve pending recovery or reviews before creating duplicates.
3. Initialize or load the active growth strategy.
4. Create a bounded daily plan.
5. Present strategy, plan, source, task, and content reviews at their correct boundaries.
6. Inspect scheduler state and durable evidence.
7. Summarize outcomes and use them for bounded improvement.

Example requests:

- “Run my daily Twitter agent.”
- “Create today's X growth plan and show me every review.”
- “Resume my pending drafts and check what the scheduler actually sent.”
- “Review my current strategy before planning new work.”

### Post creation and exact publishing

Use `twitter-post` for ad-hoc original posts.

It has two modes:

- **Task mode:** give ThreadWave a topic or direction and request one to five post tasks. ThreadWave creates a proposal, waits for approval, generates drafts, and presents each content review.
- **Exact-action mode:** provide one complete final post and ask to publish that exact text. ThreadWave performs a dry-run, displays the unchanged text and operation, and requires explicit approval before dispatch.

Exact content is never silently translated, normalized, or rewritten.

Example requests:

- “Write three posts about what I learned launching my product.”
- “Draft one concise X post for indie hackers. Avoid hype.”
- “Publish this exact post: …”

### Reply discovery and engagement

Use `twitter-reply` for target discovery, reply drafting, exact replies, and evidence-backed retry decisions.

It supports:

- a bounded batch of five to ten reply targets;
- complete target review before draft generation;
- per-target approval, rejection, or skip decisions;
- a separate content review for every generated reply;
- one exact target plus one exact final reply through dry-run and approval;
- monitoring scheduled replies until every item is terminal or needs a user decision;
- retrying only a conclusively undispatched reviewed reply through a fresh exact-action flow.

Example requests:

- “Find five high-signal posts about AI agents and draft useful replies.”
- “Show me all reply targets before generating anything.”
- “Reply to this exact post with this exact text: …”
- “Check whether yesterday's scheduled replies were actually sent.”

## Review and safety model

ThreadWave is review-first. A broad request such as “automate my X account” is not permission to mutate the account.

The suite enforces these boundaries:

- setup completion does not approve strategy, content, scheduling, posting, or replying;
- strategy, plan, source, task, and content approvals apply only to the exact displayed review and scope;
- changed text, target, hash, or scope requires a new review;
- exact posts and replies require a successful dry-run followed by explicit approval;
- batch reply targets and batch reply drafts use item-level decisions;
- scheduling is not reported as successful publication;
- ambiguous evidence remains `outcome unknown` and is never rewritten as “nothing was sent”;
- retries require conclusive evidence that the earlier action was not dispatched;
- issue reports are sanitized copy/paste artifacts and are never submitted automatically;
- ThreadWave does not promise guaranteed growth, zero account risk, or a way around X limits.

## Find the right skill by request

| What you want to ask | Skill |
| --- | --- |
| “Set up Twitter automation,” “check readiness,” or “repair my setup” | `twitter-automation` |
| “Run my daily Twitter agent,” “plan content,” “review drafts,” or “check the scheduler” | `twitter-agent` |
| “Write a tweet,” “create several posts,” or “publish this exact post” | `twitter-post` |
| “Find reply targets,” “draft replies,” “reply to this tweet,” or “retry a failed reply” | `twitter-reply` |
| “Check my ThreadWave skills, CLI, and Chrome extension” | `threadwave-preflight` |
| “Check whether my ThreadWave skills are current” | `threadwave-update` |
| “Diagnose this ThreadWave error” or “prepare a safe bug report” | `threadwave-error-support` |

Useful repository search terms include: Twitter automation, X agent, Twitter agent, tweet drafting, tweet scheduling, AI reply agent, reply target discovery, X growth workflow, social media agent, Codex skill, and bilingual Agent Skills.

## Setup

The operation skills require the complete roster, a compatible ThreadWave CLI, and the ThreadWave Chrome extension/setup relay. Do not copy only one operation skill and assume the workflow is complete; preflight intentionally blocks partial installations.

Use the canonical setup flow:

- [Set up ThreadWave](https://www.threadwave.xyz/cli/setup)
- [Agent-readable setup guide](https://www.threadwave.xyz/cli/setup/agent.md)
- [Public release index](release-index.json)

The setup guide installs or repairs the required components and returns the user to the original request after readiness is confirmed. Readiness never transfers into content approval.

## Distribution and marketplaces

The canonical setup guide is the supported installation path for Codex, Claude Code, Cursor, Qoder, Hermes Agent, and OpenClaw. It installs the complete roster from an immutable GitHub suite release and verifies the result for the selected host.

This repository is also prepared for discovery through Codex plugins, SkillsMP, skills.sh, Hermes skill taps, and ClawHub/OpenClaw SkillHub. Those listings point back to the same flat skill source; they do not replace `release-index.json`, permit a partial ThreadWave installation, or bypass preflight and review gates.

Each of the seven distributed skills declares `MIT-0` in its own `SKILL.md`. That declaration is scoped to the individual skill and does not implicitly license unrelated repository files.

## Repository structure and releases

```text
.codex-plugin/plugin.json       Optional Codex host-plugin bundle metadata
skills/                         Seven independently versioned flat peer skills
release-index.json              Public roster, compatibility, artifact, and checksum authority
suite-manifest.json             Repository and bundle declaration
schemas/                        Shared packaged contracts
tests/                          Suite structure and workflow contract checks
```

Skills are independently versioned because their workflows can change at different times. `release-index.json` declares the latest and minimum-supported version for each required peer, while suite releases package the complete roster atomically. Public artifacts include SHA-256 checksums so setup can verify the downloaded bytes.

## Language support

Every public workflow supports English and Simplified Chinese. The suite chooses the explicit user preference first, then the latest message and conversation language. Commands, JSON keys, stable references, and error codes remain in English. Exact post and reply content always stays unchanged.

## Links

- [ThreadWave](https://www.threadwave.xyz)
- [ThreadWave setup](https://www.threadwave.xyz/cli/setup)
- [Agent-readable setup](https://www.threadwave.xyz/cli/setup/agent.md)
- [GitHub releases](https://github.com/ohmyskyhigh/threadwave-skill/releases)

---

# ThreadWave 智能体技能

[ThreadWave](https://www.threadwave.xyz) 是一款 AI 驱动的 X 增长助手，帮助用户在不必全天浏览、写作、回复和维护账号的情况下持续经营 X。

它把日常 X 增长工作变成可审核的智能体流程：发现及时话题和互动机会、按照用户风格生成帖子与回复、制定每日计划、在重要操作前请求批准、安排已批准的任务，并根据持久证据报告真实结果。

本仓库包含适用于 Codex、Claude Code、Cursor、Qoder、Hermes Agent、OpenClaw 及其他兼容 Agent Skills 主机的中英双语技能。这里是 ThreadWave 的智能体指令层，不是完整产品运行时。实际流程通过 ThreadWave CLI 和 Chrome 扩展使用策略、任务、草稿、排期、浏览器和证据能力。

## ThreadWave 能做什么

### 发现及时内容方向

ThreadWave 可以从新闻、推文、趋势、细分领域讨论、产品进展和账号背景中提取内容方向，帮助用户判断现在应该发布什么、加入哪一场讨论。

### 按用户风格生成内容

ThreadWave 会参考用户资料、历史写作、编辑反馈和可选参考账号，使草稿更具体、更接近用户本人。用户仍然可以查看、编辑、拒绝、跳过、重新生成、排期或批准内容。

### 寻找并准备高质量回复

回复流程先发现相关公开帖子，再完整展示候选目标供用户审核。只有获批目标才会生成回复，每条回复在发送前还要经过独立内容审核，避免把互动变成垃圾回复。

### 运行可重复的每日增长流程

每日智能体维护当前策略、创建有限范围的每日计划、继续未完成工作、按顺序展示审核项、检查排期状态并总结结果。它面向长期账号增长，而不是单次发帖。

### 对后台任务保持可追踪

获批任务可进入排期系统，ThreadWave 会根据持久状态和证据区分：已经发送、仍在执行、确认未发送，以及结果未知。它不会把“已排期”误报成“已发布”。

完整 ThreadWave 产品还包含资料建设与审核、灵感、回关、智能取关和周期性账号维护流程。详情请访问 [ThreadWave 官网](https://www.threadwave.xyz)。

## 七个技能如何协作

| 技能 | 职责 |
| --- | --- |
| `twitter-automation` | 路由设置、就绪检查、修复和模糊的自动化请求；它本身不会发帖或回复。 |
| `twitter-agent` | 运行每日策略、计划、审核、排期、恢复和结果总结流程。 |
| `twitter-post` | 创建 1–5 个发帖任务，或通过 dry-run 和批准流程发布一条准确原文。 |
| `twitter-reply` | 创建 5–10 个回复目标任务、审核目标和草稿、监控结果，或发送一条准确回复。 |
| `threadwave-preflight` | 检查完整技能集合、CLI 能力、Chrome 扩展、账号上下文和设置状态。 |
| `threadwave-update` | 根据公开发布索引检查每个独立版本技能。 |
| `threadwave-error-support` | 查找公开已知解决方案，并生成经过净化的双语问题报告；不会自动提交。 |

操作技能会直接调用 `threadwave-preflight`，不依赖可选路由器 `twitter-automation`。因此，明确的发帖、回复或每日智能体请求可以直接进入对应技能。

## 主要流程

### 每日 Twitter/X 智能体

`twitter-agent` 用于账号策略、每日计划、内容审核、排期和结果总结。它会先继续现有工作并处理待审核项，再创建新计划，避免重复任务。

示例：

- “运行我的每日推特智能体。”
- “创建今天的 X 增长计划，并展示所有审核项。”
- “继续未完成的草稿，检查排期任务是否真的发送成功。”

### 发帖流程

`twitter-post` 支持两种模式：

- **任务模式：** 提供主题或方向，创建 1–5 个发帖任务，逐步审核任务提案和草稿。
- **准确操作模式：** 提供一条完整最终原文；ThreadWave 先执行 dry-run，再展示未改动的原文并请求明确批准。

准确内容不会被静默翻译、规范化或改写。

### 回复流程

`twitter-reply` 支持 5–10 个回复目标的有限批次、完整目标列表审核、逐目标决策、逐条回复内容审核、准确回复以及基于持久证据的结果监控。只有确认此前未派发的回复才能通过新的准确操作流程重试。

示例：

- “寻找 5 条关于 AI 智能体的高质量帖子，并起草有价值的回复。”
- “生成回复前先展示所有目标。”
- “检查昨天排期的回复是否真的发送成功。”

## 审核和安全边界

ThreadWave 采用审核优先设计。“自动化我的 X 账号”并不代表允许修改账号。

- 设置完成不等于批准策略、内容、排期、发帖或回复。
- 每次批准只适用于当时展示的准确审核对象和范围。
- 文本、目标、哈希或范围变化后必须重新审核。
- 准确帖子和回复必须先成功 dry-run，再获得明确批准。
- 回复目标和回复草稿按条目分别决定。
- “已排期”不会被报告为“已发布”。
- 证据不明确时，结果保持为 `outcome unknown`。
- 问题报告只会生成可复制文本，不会自动提交。
- ThreadWave 不承诺必然增长、零账号风险或绕过 X 限制。

## 按需求查找技能

| 你想提出的请求 | 技能 |
| --- | --- |
| “设置推特自动化”“检查是否就绪”或“修复设置” | `twitter-automation` |
| “运行每日推特代理”“规划内容”“审核草稿”或“检查排期” | `twitter-agent` |
| “写一条推文”“创建多条帖子”或“发布这段准确原文” | `twitter-post` |
| “寻找回复目标”“起草回复”“回复这条推文”或“重试失败回复” | `twitter-reply` |
| “检查 ThreadWave 技能、CLI 和 Chrome 扩展” | `threadwave-preflight` |
| “检查 ThreadWave 技能是否为最新版本” | `threadwave-update` |
| “诊断 ThreadWave 错误”或“准备安全的问题报告” | `threadwave-error-support` |

## 设置

操作技能需要完整技能集合、兼容的 ThreadWave CLI，以及 ThreadWave Chrome 扩展/设置中继。请使用官方设置流程，不要只复制单个操作技能：

- [设置 ThreadWave](https://www.threadwave.xyz/cli/setup)
- [智能体可读设置指南](https://www.threadwave.xyz/cli/setup/agent.md)
- [公开发布索引](release-index.json)

所有公开流程均支持英语和简体中文。命令、JSON 字段、稳定引用和错误码保持英文；准确帖子和回复内容始终保持不变。

## 分发与技能市场

官方设置指南支持 Codex、Claude Code、Cursor、Qoder、Hermes Agent 和 OpenClaw，并从不可变的 GitHub 套件版本安装完整技能集合。仓库同时兼容 Codex 插件、SkillsMP、skills.sh、Hermes skill tap 与 ClawHub/OpenClaw SkillHub 的发现方式；这些列表不会取代发布索引，也不会绕过预检和审核。

七个独立技能都在各自的 `SKILL.md` 中声明为 `MIT-0`。该声明仅适用于对应技能，不会自动覆盖仓库中的其他文件。
