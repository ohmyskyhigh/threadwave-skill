# Objective

Expose the latest ThreadWave suite version as structured release-index data for setup clients.

# Final Changes

- Added `bundle_version` to the generated public release index.
- Added the tested standard installer package, version, and registry to the suite manifest and generated release index.
- Required the indexed bundle version to match `suite-manifest.json` in validation and tests.

# Final Result

Goal achieved: setup clients can resolve the tested installer and immutable suite tag from the latest release index without hardcoding versions.
