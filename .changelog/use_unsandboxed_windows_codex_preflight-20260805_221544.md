# Objective

Prevent native Windows Codex sandboxing from causing false `network_unavailable` readiness failures.

# Final Changes

- Required fixed Windows Codex readiness operations to use an already-available non-sandboxed local process capability from the first call.
- Removed the sandbox probe and conversational approval choice from that adapter flow.
- Added contract and evaluation coverage while preserving the closed command mapping and host-policy boundary.

# Final Result

Windows Codex readiness now selects the non-sandboxed execution boundary directly when the host already provides it. Goal achieved.
