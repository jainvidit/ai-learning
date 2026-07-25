---
id: ROOT.1.1.4
parent: ROOT.1.1
type: Task
title: Versioned immutable content bundle emitter + static route
ledger_depth: 3
status: in_progress
generation: 1
owner_agent: implementer-ROOT.1.1.4-gen1 (dream-implementer-hardened, attempt 1, dispatched by coordinator-ROOT.1.1-gen2 at 2026-07-25T16:40Z wall clock)
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
review: {tier: 2, required_lenses: [spec-conformance, framework-empirical], verdicts: []}
verification: []
artifacts: []
resume_hint: "INTERRUPTED at plan stage — gen0 implementer died with its parent session ~16:22Z. Plan below is authoritative-attempted; NO code written (worktree agent-a1fcc6791af56f266 abandoned). One framework fact verified and logged (events 19:20:02 in-band ts, skewed): Next 16.2.11 serves public/ at request time — CP-04 s3 holds. Fresh gen1 dispatch: dream-implementer-hardened, same item inventory; MUST also wire beat compile+assertValidBeats into npm run build (carried finding from 1.1.2)."
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
