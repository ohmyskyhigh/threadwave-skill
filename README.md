# ThreadWave

One bilingual skill for tweet and reply drafts, read-only X snapshots, notifications and support. This branch implements the approved single-skill design; the published release index may still describe the legacy seven-skill release.

Invoke `$threadwave` or the host's displayed ThreadWave entry. “Open ThreadWave” shows the text home screen with examples; “tw tweet” and “tw reply” are chat shortcuts. Native `/tw` registration depends on the host and is not promised by this package.

- Draft one to five tweets from a direction.
- Find five to ten relevant posts and draft replies.
- Inspect a tweet, profile, search or feed without drafting.
- Review exact content before any publishing action.

Daily planning is unavailable. Existing user work remains intact. The CLI owns readiness and release discovery. A notification only reminds the user; it never blocks work or installs an update.

## Setup and migration

Follow the [human setup guide](https://www.threadwave.xyz/cli/setup) or [agent-readable guide](https://www.threadwave.xyz/cli/setup/agent.md). The published index and verified immutable artifacts decide what is installable; this source tree is not evidence of a public release.

For the first single-skill release, the guide verifies the replacement, removes identified old ThreadWave skills/plugin, installs the new plugin and verifies fresh discovery. No installation backups are created. Local user configuration, authentication, tasks, drafts, schedules and approvals remain intact; symlink targets and unrelated skills are preserved. Later updates use the host's supported update route.

## Source structure

`skills/threadwave/SKILL.md` is the only discoverable entry. Its `references/` directory contains on-demand workflows, not additional skills. `.codex-plugin/plugin.json` keeps plugin identity `threadwave-skill`. All resources share one version.

`npm run check` validates source and fresh candidate fixtures; `npm run package` builds individual and full-plugin candidate archives. The full candidate contains its matching v3 index. These commands leave the public `release-index.json` unchanged. Publishing remains a separately authorized operation; local administrator release tooling is outside this update. The notification-capable released CLI minimum, host migration evidence and reporting dependencies must pass before release.

The skill declares MIT-0; that declaration does not license unrelated repository files.

## 中文

只有一个公开技能 `threadwave`，按需读取推文、回复、快照、通知和支持流程。使用 `$threadwave` 或宿主显示的 ThreadWave 入口；“打开 ThreadWave”显示文字首页与示例。每日规划暂不可用，发布前仍需审核准确内容。

首次迁移按[官方指南](https://www.threadwave.xyz/cli/setup/agent.md)验证新包、移除旧技能或插件、安装新插件并检查发现结果。不备份安装文件，不删除本地用户配置、登录信息、任务、草稿、排程或审批记录，不删除符号链接的目标。版本通知只提醒，不阻塞任务，也不会自动安装。
