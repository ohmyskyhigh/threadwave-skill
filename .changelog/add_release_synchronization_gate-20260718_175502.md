# Add Release Synchronization Gate

## Objective

Update the repository agent instructions so every new suite version keeps `main`, the release tag, the public GitHub release, the release index, and downloadable packages synchronized.

## Final Changes

- Added explicit version, tag, artifact-set, checksum, and public-download invariants.
- Added a draft-first release order that verifies all artifacts before the version commit reaches `main`.
- Added recovery rules for a version already advertised by `main` without its matching public release.
- Preserved the requirement for explicit user authority before commit, push, or release publication.

## Final Result

The repository now defines release synchronization as a mandatory completion gate instead of treating artifact publication as an optional follow-up. No code was committed or pushed in this session.
