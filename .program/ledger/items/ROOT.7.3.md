---
id: ROOT.7.3
parent: ROOT.7
type: Capability
title: Enumeration ADRs — close open-world spec criteria before owning capabilities decompose
ledger_depth: 2
status: in_progress
owner_agent: director-gen42 (scheduling container; children flat-dispatched)
generation: 0
spawned_at: 2026-07-27T22:05:00Z
spec_refs:
  - .program/spec/migration-and-sequencing.md#req-ms-01
acceptance_criteria:
  - Every child Decision item done or cancelled; each produced a ratified enumeration ADR (or a recorded no-ADR-needed ruling) before its blocked capability dispatched
depends_on: []
blocks: []
children: [ROOT.7.3.1, ROOT.7.3.2, ROOT.7.3.3, ROOT.7.3.4, ROOT.7.3.5, ROOT.7.3.6, ROOT.7.3.7, ROOT.7.3.8, ROOT.7.3.9, ROOT.7.3.10, ROOT.7.3.11]
file_ownership: []
review: {tier: 1, required_lenses: [completeness-vs-survey], verdicts: []}
verification: []
artifacts: []
resume_hint: "Created per ADR-0018 (owner directive gen42) from the unfalsifiable-criteria survey (.program/audits/2026-07-27T0540-...). Ordering-exempt under ROOT.7 (ADR-0007); the constraint is carried by depends_on edges ON THE BLOCKED CAPABILITIES, not by phase ordering. Children are Decision-level leaves (glossary; point-5 exempt like Probe/Gate). Near-term: 7.3.1 (blocks ROOT.1.3, Phase 0) and 7.3.10 (blocks ROOT.1.8 Gate) — dispatch these before the 1.1 subtree closes."
---

Container for the 11 per-shard enumeration Decision items scheduled by ADR-0018. Each
child's exit: an ADR (numbers pre-reserved 0019–0029, mapping in ADR-0018) that
enumerates the universally-quantified criterion's domain closed-world (the ADR-0017
pattern: exhaustive inside-list, throwing/failing default outside, relaxation additive
via new ADR), plus an additive shard amendment where the shard text itself must change.
Do NOT write the ADRs at creation time (owner directive): each is written when
dispatched, informed by the phases that precede its shard's consumption.
