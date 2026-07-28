---
id: ROOT.4.10
parent: ROOT.4
type: Capability
title: Profiles — picker rework, isolation regression, deletion-over-event-log semantics
ledger_depth: 2
status: proposed
generation: 0
spec_refs:
  - .program/spec/profiles-and-identity.md#req-pi-01
acceptance_criteria:
  - Passwordless Netflix-style picker survives the redesign — per-track completion display, Active badge, owner [HARD]s #10/#26 (PI-01 scenarios 1–2)
  - Per-profile isolation regression evidence recorded (progress, sandboxes, 401-without-cookie)
  - Profile deletion works per the ROOT.2.1 deletion-semantics ADR — only that profile's data removed, UI confirmation first, never-delete rules respected (PI-01 scenario 3)
  - MS-03 baseline remediation (ADR-0028) — the two recorded baseline violations in this item's ownership, src/lib/profiles.ts:69 (fs.rmSync on data/progress/{id}.json) and :70 (fs.rmSync on sandbox/live/{id}), are DISPOSITIONED per the ROOT.2.1 deletion-semantics ADR — learner-initiated profile deletion either becomes an ADR-recorded allowed exception (additive, citing ADR-0028's exception rules) or the paths are refactored; the ADR-0028 Gate grep re-run over profiles.ts shows zero unclassified hits. Deletion of learner data is PART 9-adjacent — the disposition is parked for authorization if it keeps any delete on data/**, never self-approved.
depends_on: [ROOT.4.1]
blocks: []
children: []
file_ownership: ["src/app/profiles/**", "src/lib/profiles.ts", "src/app/api/profiles/**"]
review: {tier: 2, required_lenses: [spec-conformance, data-safety], verdicts: []}
verification: []
artifacts: []
resume_hint: "Split from ROOT.4.3 (sizing #20, completeness #6). Deletion over an append-only log follows ROOT.2.1's ADR — if that ADR is missing, request it before implementing scenario 3; deletion of learner data is PART 9-adjacent, so the deletion leaf is tier 2 with a data-safety lens minimum."
---

# Profiles capability

Owns profiles-and-identity.md at depth 2 (previously the shard had no owning item —
completeness #6). Profile deletion is learner-initiated deletion of their own data via
an existing product feature — in scope, but reviewed at tier 2 with data-safety.
