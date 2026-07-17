# Objective

Keep CLI and Chrome extension onboarding on the public ThreadWave setup page instead of installing `twitter-cli-setup` on user machines.

# Final Changes

- Returned the downloadable plugin to four local skills: `twitter-automation`, `twitter-agent`, `twitter-post`, and `twitter-reply`.
- Removed the local `skills/twitter-cli-setup` folder and its manifest, schema, validator, test, and eval membership.
- Updated every local preflight to hand missing CLI or extension setup to `https://www.threadwave.xyz/cli/setup` while preserving the original user request.
- Declared the machine-readable web guide at `https://www.threadwave.xyz/cli/setup/agent.md` as the setup authority.
- Kept bilingual requests, issue reporting, atomic version checks, and resume-after-setup behavior in the four local skills.

# Final Result

Goal achieved. Users download four operational skills only. CLI and extension setup remains a web-hosted protocol and is not installed as a fifth local skill.
