# Objective

Require every skill preflight to detect the `tw` CLI, route missing installations to the canonical `www` setup page, and safely support the verified pre-Store manual extension package.

# Final Changes

- Updated the suite from `0.1.0` to `0.1.1` across the plugin, package, suite manifest, and all four skills.
- Set the only missing-CLI route to `https://www.threadwave.xyz/cli/setup` and added a deterministic regression test.
- Added the versioned manual extension release manifest, extension version, pinned ID, and load-unpacked mode to the suite manifest.
- Added mandatory release-manifest, checksum, size, HTTPS, extension-ID, archive, and user-confirmation checks before manual extension installation.
- Repackaged and reinstalled the enabled personal plugin at `0.1.1`.

# Final Result

Goal achieved. Source and installed-cache validation pass, including 15 policy tests, plugin validation, and all four skill validators. No commit or push was performed.
