---
id: ROOT.1.1.5
parent: ROOT.1.1
type: Task
title: revisions.ts rejection-widening — array-arm plainness + non-index own-prop checks (GEN2-1/GEN2-2)
ledger_depth: 3
status: in_progress
owner_agent: implementer-ROOT.1.1.5-gen0 (dream-implementer-hardened, dispatched by director-gen42 2026-07-27 ~22:25Z)
spawned_at: 2026-07-27T22:25:00Z
generation: 0
spec_refs:
  - .program/spec/content-pipeline.md#req-cp-05
acceptance_criteria:
  - Array arm rejects non-plain arrays — getPrototypeOf(arr) === Array.prototype required, else TypeError with JSON path (GEN2-1; closes the Array.isArray subclass admission)
  - Array arm rejects own symbol keys and non-index enumerable own properties with TypeError + path, matching the object arm's enforcement (GEN2-2; closes the silent-ignore asymmetry)
  - All 10 pinned hashes unchanged (frozen contract; the fix is rejection-widening ONLY — any pin change is an automatic failure)
  - New rejection tests with paths for both defects (subclass array; symbol-keyed array; out-of-domain value on an array expando, e.g. Date/function/self-ref)
  - npm test passes; npx tsc --noEmit passes; evidence paths recorded
depends_on: [ROOT.1.1.3]
blocks: []
children: []
file_ownership: ["src/lib/revisions.ts", "tests/revisions.test.ts"]
review: {tier: 2, required_lenses: [spec-conformance, adversarial-fixverify], verdicts: []}
verification: []
artifacts: []
resume_hint: "Created by director-gen42 from the GEN2 minors disposition (.program/audits/GEN2-minors-disposition.md — both ruled DEFECT vs ADR-0017 A1.3 closed-world). Must close before ROOT.1.1 assembly review / Phase 0 Gate. No new ADR needed (disposition: rejection-widening within ADR-0017 Amendment 1). Globs overlap only ROOT.1.1.3 (done) — do not reopen it; overlap scan re-run required if 1.1.3 ever reopens."
---
Fix venue: main checkout unless the hook forces a worktree (predecessor pattern: code in
worktree, director merges). Frozen contract: computeItemRevision / buildRevisionsMap /
loadMigrationMaps signatures untouched, all synchronous. The disposition doc names the
exact probes that must flip from silent-admission to TypeError-with-path. ROOT.1.1.4
consumes revisions.ts but only on valid corpus content (74 arrays, 0 non-plain) — this
fix cannot change any emitted bundle hash; if it does, stop and escalate.
