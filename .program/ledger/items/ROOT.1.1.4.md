---
id: ROOT.1.1.4
parent: ROOT.1.1
type: Task
title: Versioned immutable content bundle emitter + static route
ledger_depth: 3
status: done
generation: 2
owner_agent: implementer-ROOT.1.1.4-gen2 (dream-implementer-hardened, dispatched by director-gen42 at 2026-07-27 ~09:40Z wall clock; gen1 owner was recorded but never launched — rotation hit first, see HEADLINE 2026-07-27 + handoff ROOT-41)
spawned_at: 2026-07-27T09:40:00Z
spec_refs:
  - .program/spec/content-pipeline.md#req-cp-04
  - .program/spec/content-pipeline.md#req-cp-05
acceptance_criteria:
  - Content build emits one bundle under a single version identifier containing curriculum DAG with layout hints (computed (col,lane) math from curriculum.json requires/track — never hand-placed), all beat arrays, the exercise bank, calibration goldens (empty-but-structured section if none exist yet, noted as deviation), and the revisions sidecar + migration maps from src/lib/revisions.ts (CP-04 scenario 1, CP-05)
  - Immutability: emitter refuses to overwrite an existing version whose bytes differ; rebuilding unchanged content reproduces the same version id (content-hash version per ADR-0011 #7) — proven by vitest test (CP-04 scenario 2)
  - Bundle served from a versioned static route: public/content-bundle/<version>/*.json plus a latest-version manifest; fetching it requires no app redeploy for a new version (CP-04 scenario 3, restated for local desktop per ADR-0007)
  - npm run build passes; npm test passes; npx tsc --noEmit passes; evidence paths recorded
depends_on: [ROOT.1.1.3]
blocks: []
children: []
file_ownership: ["scripts/build-content-bundle.ts", "src/lib/bundle.ts", "tests/bundle.test.ts", "package.json", "public/content-bundle/**"]
review: {tier: 2, required_lenses: [spec-conformance, framework-empirical], verdicts: [{lens: framework-empirical, verdict: approve, confidence: high, doc: .program/audits/ROOT.1.1.4-review-secondary.md, event_ts: 2026-07-27T22:30:00Z}, {lens: spec-conformance, verdict: approve, confidence: high, doc: "verdict preserved verbatim in events @2026-07-27T22:45:00Z (sandbox path filter blocked the reviewer's audit-doc write)", event_ts: 2026-07-27T22:45:00Z}]}
verification:
  - criterion: "AC1 - one bundle under a single version id containing curriculum DAG with COMPUTED (col,lane) layout hints, all beat arrays, exercise bank, calibration goldens (empty-but-structured), revisions sidecar + migration maps (CP-04 s1, CP-05)"
    how_checked: "vitest suite tests/bundle.test.ts describe 'CP-04 scenario 1' (19 tests): asserts exactly ONE version dir + manifest and nothing else; version id is a short content hash; all 7 section files + bundle.json + index.json present; one DAG node per module (14) and one edge per requires entry (17); every module strictly right of each prerequisite; lanes grouped by track with no two modules at the same (col,lane); layout derived from topology NOT authored order (shuffled-input test); ordered contract-shaped beat array per built lesson; every exercise beat resolves to a bank entry (7 exercises); goldens section empty-but-structured; 16-hex itemRevision per exercise/beat/lesson; migration maps loaded from content/migrations; NO timestamp or build counter anywhere in the payload. Emitted payload independently inspected: bundle.json keys = beats,bundleFormat,curriculum,exercises,goldens,migrations,revisions; curriculum.layout = columns 8, lanes 3, bandByTrack over fundamentals/prompting/claude-code."
    evidence_path: ".program/audits/ROOT.1.1.4-verification/npm-test.txt"
    by_agent: implementer-ROOT.1.1.4-gen2
  - criterion: "AC2 - immutability: emitter refuses to overwrite an existing version whose bytes differ; rebuilding unchanged content reproduces the same version id (ADR-0011 #7), proven by vitest (CP-04 s2)"
    how_checked: "vitest describe 'CP-04 scenario 2' (11 tests): same content reproduces the same version id byte-for-byte; rebuild is a true no-op (bytes AND mtimes untouched); REFUSES on differing bytes, on a missing file, on an unexpected extra file, on a BOM-only difference, and on a single appended invalid byte, mutating nothing in every case; CHANGED content routes to a NEW version dir leaving the old intact; no staging dir left behind. Determinism proof strengthened by the CRLF/LF test: identical committed content yields the SAME id from a CRLF checkout and an LF checkout. Mutation-tested (events 2026-07-27T21:20:00Z): disabling normalizeNewlines FAILS that test (0c12e0ee42adeff2 vs 9d1aba588b90f5c7); disabling the immutability refusal FAILS 5 tests - both lines are load-bearing, not decorative."
    evidence_path: ".program/audits/ROOT.1.1.4-verification/npm-test.txt (+ mutation-testing finding in .program/ledger/events/ROOT.1.1.4.jsonl @2026-07-27T21:20:00Z)"
    by_agent: implementer-ROOT.1.1.4-gen2
  - criterion: "AC3 - bundle served from a versioned static route public/content-bundle/<version>/*.json plus a latest-version manifest; a new version needs no app redeploy (CP-04 s3, ADR-0007 local desktop)"
    how_checked: "vitest describe 'CP-04 scenario 3' (5 tests): emits under <root>/<version>/ with a manifest naming the public route; src/lib/bundle.ts re-resolves the manifest on EVERY read (a newly published version is served immediately; a stale manifest is re-read, not memoised); a version is loadable over the URL source too, proving the route shape and not merely the directory; the missing-bundle case fails loudly with remediation guidance. Framework side proven empirically by gen0 dream-reader-lookup (events @2026-07-25T19:20:02Z): Next 16.2.11 serves public/ at REQUEST time from disk (Cache-Control max-age=0), next.config.ts sets no output key, no copy of public/ inside .next/ - so no redeploy is required. Emitted manifest.json inspected: latest=eb647973722173b3, manifestFormat=1, versions=[eb647973722173b3 at /content-bundle/eb647973722173b3]."
    evidence_path: ".program/audits/ROOT.1.1.4-verification/npm-test.txt (+ framework_fact_verified in .program/ledger/events/ROOT.1.1.4.jsonl @2026-07-25T19:20:02Z)"
    by_agent: implementer-ROOT.1.1.4-gen2
  - criterion: "AC4 - npm run build passes; npm test passes; npx tsc --noEmit passes; evidence paths recorded"
    how_checked: "All three run in worktree agent-af25383e7431d0a4c and captured with provenance headers. npm run build: chain is 'velite build --clean && npm run build:content && next build', full route table emitted, EXIT_CODE=0 - this also satisfies the carried ROOT.1.1.2 finding that beat compile + assertValidBeats be wired into the build (9 build-failure-wiring tests confirm the emitter exits non-zero and publishes nothing on duplicate beat key, unknown exercise anchor, requires cycle, unknown requires target). npm test: vitest 4.1.10, 4 files / 200 tests passed (39 of them the new tests/bundle.test.ts), EXIT_CODE=0. npx tsc --noEmit: EXIT_CODE=0."
    evidence_path: ".program/audits/ROOT.1.1.4-verification/npm-build.txt, .program/audits/ROOT.1.1.4-verification/npm-test.txt, .program/audits/ROOT.1.1.4-verification/typecheck.txt"
    by_agent: implementer-ROOT.1.1.4-gen2
  - deviation: "Calibration goldens section is empty-but-structured, as AC1 explicitly permits. public/content-bundle/eb647973722173b3/goldens.json contains exactly count=0, families=[], goldensFormat=1, and a note recording that no calibration goldens exist in the authored corpus yet (REQ-JP-05 has not shipped) and that adding families is additive and changes no other section. A versioned container with a stable shape."
    by_agent: implementer-ROOT.1.1.4-gen2
  - deviation: "All gen2 evidence was produced inside worktree agent-af25383e7431d0a4c, which is a CRLF checkout (main is pure LF; the repo has no .gitattributes). This is deliberate and is the STRONGER venue: it is exactly the condition that produced the gen0 determinism defect, so it proves normalizeNewlines rather than merely not exercising it. The emitted version id eb647973722173b3 from this CRLF checkout equals the gen0 LF-canonical hash - independent cross-checkout determinism confirmation."
    by_agent: implementer-ROOT.1.1.4-gen2
  - stale_evidence_note: ".program/audits/ROOT.1.1.4-verification/eslint-owned.txt and tsc-noemit.txt (both 'EXIT=0', no provenance header, mtime 2026-07-25) are gen0 artifacts and do NOT cover gen2 code; npm-run-build.txt is likewise gen0. Lint is not an acceptance criterion on this item, but no gen2 lint evidence exists - flagged for the integrator/reviewer."
    by_agent: implementer-ROOT.1.1.4-gen2
artifacts:
  - path: "scripts/build-content-bundle.ts"
    note: "NEW emitter. Lives in worktree agent-af25383e7431d0a4c - PENDING INTEGRATOR MERGE, not yet in main."
  - path: "src/lib/bundle.ts"
    note: "NEW reader (manifest resolution + versioned bundle load). Worktree agent-af25383e7431d0a4c, pending merge."
  - path: "tests/bundle.test.ts"
    note: "NEW, 39 tests. Worktree agent-af25383e7431d0a4c, pending merge."
  - path: "package.json"
    note: "ADDITIVE ONLY: build:content script plus prefixing it into the build chain. No existing test/vitest/playwright/velite entry disturbed; no dependency added. Worktree agent-af25383e7431d0a4c, pending merge."
  - path: "public/content-bundle/**"
    note: "Emitted bundle: manifest.json plus eb647973722173b3/{bundle,beats,curriculum,exercises,goldens,migrations,revisions,index}.json. Worktree agent-af25383e7431d0a4c, pending merge."
  - path: ".program/audits/ROOT.1.1.4-verification/npm-build.txt, npm-test.txt, typecheck.txt"
    note: "gen2 evidence, already written to the MAIN checkout."
resume_hint: "DONE. Merged to main by director-gen42 (events @2026-07-27T21:55:00Z; commit f5bf9a3) with independent main re-verification (main-tsc-noemit.txt, main-npm-test.txt 200/200, main-npm-build.txt full chain, all EXIT 0; LF main reproduced eb647973722173b3 = CRLF worktree id). Tier-2 review both lenses APPROVE (framework-empirical @22:30:00Z; spec-conformance @22:45:00Z, verdict text in events - reviewer's doc write was sandbox-blocked). Closes the 1.1 leaf set except ROOT.1.1.5 (GEN2 minors fix, in flight); then ROOT.1.1 assembly review."
---
Emitter script scripts/build-content-bundle.ts (run via a new package.json script, e.g.
`build:content` — package.json edits ADDITIVE ONLY; never disturb existing
test/vitest/playwright/velite entries; this item is inside the serialized Phase-0
package.json chain, coordinator has serialized you, no concurrent writer).
Reader src/lib/bundle.ts resolves the latest manifest + loads a versioned bundle.

Read docs/nextjs-conventions.md first (Turbopack default; public/ static serving is
unchanged in Next 16 per conventions doc). Version id = short content hash over the
canonical bundle payload (ADR-0011 #7). Consume the beat compiler (src/lib/beats.ts /
content.ts, ROOT.1.1.2) and revisions module (src/lib/revisions.ts, ROOT.1.1.3
signatures) — do not reimplement either. Layout hints per LANE-DEPENDENCIES metro-map
row: derive (col, lane) from the DAG topology (requires edges) + track grouping.
src/lib/schema.ts steward-owned — never edit. NEVER touch port 3000 / npm run dev
(CONSTRAINTS #17).

## Tier-2 pre-implementation plan (gen0)

1. CONTRACT TOUCHED: the NEW content-bundle payload shape (public/content-bundle/<version>/*.json
   + manifest.json) and the package.json build chain. I CONSUME two frozen contracts without
   changing either: the compiled Beat shape (.program/interfaces/beat-model.md, steward-owned —
   beats are embedded verbatim, itemRevision stays a sidecar per ADR-0011 #6) and the
   ROOT.1.1.3 revisions export signatures (computeItemRevision / buildRevisionsMap /
   loadMigrationMaps, all synchronous).
2. OTHER SIDE OWNED BY: beat-model.md -> Atlas (schema steward, ROOT.1.2 while open);
   metro-map RENDERING of the layout hints -> Nova (LANE-DEPENDENCIES "Metro-map layout data"
   row: bundle side = Atlas/this item, rendering side = Nova); package.json chain -> ROOT.1.1
   coordinator (serialized, no concurrent writer).
3. I WILL NOT CHANGE: src/lib/schema.ts, beats.ts, content.ts, revisions.ts, velite.config.*,
   LessonRenderer.tsx, any existing package.json script beyond prefixing the build chain, any
   dependency (no add/remove), and no field of the Beat shape.
