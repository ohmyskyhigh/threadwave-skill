# Objective

Make ThreadWave preflight reliable for packaged Windows users while preserving shell-safety boundaries.

# Final Changes

- Added a packaged-Windows invocation adapter using absolute system `cmd.exe` and the canonical managed `tw.cmd`.
- Restricted CMD execution to a closed set of fixed readiness commands.
- Prohibited raw returned-command execution and interpolation of user content or dynamic operation values.
- Bound readiness reuse to the selected adapter, install mode, launcher, version, and capabilities.
- Added a Windows packaged evaluation and contract regression tests.

# Final Result

Preflight can invoke the packaged launcher on Windows without selecting the internal versioned executable or placing user-controlled content into a shell command.
