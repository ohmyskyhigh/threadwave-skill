# Objective

Prevent valid multi-target reply drafts from being rejected when their per-target child task refs differ from the parent discovery task ref.

# Final Changes

- Defined exact parent artifact membership as the reply workflow's lineage authority.
- Allowed draft child task refs to differ from the parent task ref while retaining exact artifact, target, content, and review validation.
- Raised the reply skill's minimum CLI compatibility to 1.0.35.
- Added regression coverage for five distinct child task refs and the CLI compatibility boundary.

# Final Result

Goal achieved: the reply workflow now accepts valid parent-to-child draft lineage without weakening review or mutation gates.
