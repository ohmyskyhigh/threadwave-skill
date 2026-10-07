# Objective

Implement the approved recovery handoff from ThreadWave error issues #34 and #35 for local review before release.

# Final Changes

- Route tweet/reply expiry recovery through one shared rule: inspect exact expiry and publication evidence, retain safe expired unapproved drafts as history, and create independent fresh work only for an explicit fresh request.
- Preserve active/unknown publication gates, still-valid cleanup decisions, expiry-race handling, current direction/count/session, and fresh per-item content approval.
- Document existing native Hermes task-create fields; keep generic plan creation unavailable and preserve CLI enforcement and adapter access.
- Add seven regression eval cases, clarify the existing still-valid cleanup case, and apply the handoff's test-only Windows archive/npm portability corrections.

# Final Result

Local preparation achieved. Node 22 source validation and all 42 tests passed; changed JavaScript syntax and eval JSON/unique IDs passed. Temporary individual and complete package archives contained all four updated instruction resources byte-for-byte, including native Hermes task-create guidance, with no installed runtime scripts or public-index mutation.

The eval cases were added and structurally checked; a separate model evaluation was not run here. No live Hermes, paid generation or X mutation was performed. Source remains uncommitted on the isolated feature branch; active installations, versions, public metadata and release state are unchanged. Review, release and live installation acceptance remain separate work.
