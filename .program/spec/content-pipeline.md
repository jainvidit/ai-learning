# Capability: Content Pipeline

Build-time compilation of authored content (MDX + JSON exercise definitions) into a versioned, immutable content bundle; the extended authoring contract; and the CI gates that protect it.

**Depends on:** none (root capability — the beat compiler must exist before `lesson-experience.md`; the skill registry must exist before `mastery-model.md`, per docs/origin/LANE-DEPENDENCIES.md blocks 2 and 3).
**Depended on by:** `lesson-experience.md`, `frontend-platform.md`, `mastery-model.md`, `curriculum-content.md`, `dashboard-and-wayfinding.md` (metro-map layout data), `content-generation.md`.
**Contract owner:** Atlas (schema steward); Ramesh implements the compiler (LANE-DEPENDENCIES "Beat model type" row). Content agents never edit `schema.ts`.

---

## REQ-CP-01: Velite build-time MDX compilation replaces next-mdx-remote {#req-cp-01}

MDX compilation moves from runtime (`next-mdx-remote`) to build time via Velite. This migration is FORCED — `next-mdx-remote` is archived upstream ([VERIFIED-EXTERNALLY] at blueprint time; docs/origin/ASSUMPTIONS.md #11 says re-verify before Phase 0). Velite's solo-maintainer / internal-Zod-3 risks are accepted eyes-open; isolate via pnpm overrides. Content Collections is the recorded runner-up; Ramesh holds the tiebreak trigger (two-process DX pain) — see OPEN-QUESTIONS.md #10.

**Source:** DREAM-BLUEPRINT.md §2 "Framework & rendering", §6 Phase 0, §7 radar row "MDX/content compile"; REJECTED.md (Contentlayer dead, next-mdx-remote archived).
**Current state (docs/origin/CURRENT-STATE.md):** `src/components/lesson/LessonRenderer.tsx` is REPLACED (→ BeatRenderer; the components map + quiz sanitization logic carry over); the `next-mdx-remote` dependency is forced out — "the one replacement with an external deadline."

**Scenarios:**
1. Given the repo after this capability ships, when `package.json` dependencies are inspected, then `next-mdx-remote` is absent and Velite (or the runner-up, if the recorded tiebreak fired) performs MDX compilation at build time.
2. Given a lesson MDX file with valid frontmatter and exercise anchors, when the content build runs, then it emits compiled output without any runtime MDX compilation step in the request path.
3. Given the claim "next-mdx-remote is archived" recorded at blueprint time, when Phase 0 starts, then the claim has been re-verified and the result recorded (ASSUMPTIONS.md #11 discharge).

## REQ-CP-02: Every lesson compiles to an ordered beat array with stable IDs {#req-cp-02}

Lessons compile to an ordered array of beats: `{ beatId, type: prose | quiz | playground | terminal | challenge | widget, persistent?: boolean, completion: "passed" | "verified" | "attempted" }`. Beat IDs are stable across rebuilds so resume positions and telemetry survive content edits.

**Source:** DREAM-BLUEPRINT.md §2 "The beat model"; UX-REVIEW-NOVA.md §3 "Content model" [TEAM: frozen]; GLOSSARY.md "Beat".
**Current state:** `src/lib/content.ts` MODIFIED — gains the beat-compile step; `isModuleUnlocked`/`lessonKey` survive.

**Scenarios:**
1. Given any built lesson, when the content bundle is generated, then the lesson's entry is an ordered beat array in which every beat has a `beatId`, a `type` from the closed set, and a completion predicate.
2. Given a lesson whose prose is edited without structural change, when the bundle is rebuilt, then previously existing beats keep their prior `beatId`s.
3. Given a terminal or streaming beat, when it is compiled, then it carries `persistent: true`.

## REQ-CP-03: Authoring contract extensions are additive to schema.ts {#req-cp-03}

The Zod content contract (`src/lib/schema.ts` lineage) is extended — never replaced — with: per-objective `skillIds`, difficulty tiers (`intro`/`core`/`stretch`), `role: "boss"` flags, hint-ladder rungs, misconception tags on distractors, and artifact/verifier declarations. Existing exercise types survive verbatim.

**Source:** DREAM-BLUEPRINT.md §3 "Content pipeline — Authoring", §6 keep-list item 2; LANE-DEPENDENCIES "Content schema" row (only Atlas's lane edits the file).
**Current state:** `src/lib/schema.ts` MODIFIED — "additive extensions only"; `specs/AUTHORING-GUIDE.md` and `specs/_TEMPLATE.md` MODIFIED (extended, never replaced).

**Scenarios:**
1. Given the extended schema, when today's Module 1 `exercises.json` is validated against it, then validation passes without content edits (additivity check).
2. Given a quiz distractor, when the schema is inspected, then a misconception tag field is expressible on it.
3. Given an exercise definition, when it declares `skillIds`, a difficulty tier, `role: "boss"`, hint rungs, or an artifact/verifier declaration, then `npm run validate` accepts well-formed values and rejects malformed ones.

## REQ-CP-04: Compile emits a versioned immutable content bundle {#req-cp-04}

The build produces a versioned, immutable content bundle — curriculum DAG with layout hints for the metro map, beat arrays, exercise bank, calibration goldens — served from a CDN/static route so content releases are decoupled from app deploys.

**Source:** DREAM-BLUEPRINT.md §3 "Content pipeline — Compile"; GLOSSARY.md "Content bundle"; LANE-DEPENDENCIES "Metro-map layout data" row (layout computed from (col,lane) math, not hand-placed).
**Current state:** new build output; `content/**` source files survive per their own dispositions.

**Scenarios:**
1. Given a content build, when it completes, then the output bundle contains the curriculum DAG (with layout hints), all beat arrays, the exercise bank, and calibration goldens, under a single version identifier.
2. Given a published bundle version, when any later build runs, then the previously published version's contents are never mutated (immutability).
3. Given a new bundle version, when it is released, then no app redeploy is required for learners to receive it.

## REQ-CP-05: Stable item IDs + content-hash itemRevision + migration maps {#req-cp-05}

Every item has a stable ID plus a content-hash `itemRevision`; every attempt event records the `itemRevision` it ran against; migration maps are provided when items materially change.

**Source:** DREAM-BLUEPRINT.md §3 "Content pipeline — Versioning"; GLOSSARY.md "itemRevision". Event-side recording is REQ-EL-02 in `event-log-and-projections.md`.
**Current state:** new mechanism; no current equivalent.

**Scenarios:**
1. Given an item whose content changes in any way, when the bundle rebuilds, then its `itemRevision` hash changes while its item ID does not.
2. Given an item that materially changes, when the change ships, then a migration map entry exists linking old revision to new.

## REQ-CP-06: CI content gates {#req-cp-06}

CI validates on every content change: schema conformance, anchor integrity, skill-registry references, exactly one boss per module, ≥2 isomorph variants per review-eligible objective, and rubric-change-requires-golden-update in the same PR.

**Source:** DREAM-BLUEPRINT.md §3 "Content pipeline — Versioning", §4 "Boss challenges" (one per module, CI-enforced); LANE-DEPENDENCIES "Calibration goldens" row (Ramesh wires CI).
**Current state:** `scripts/validate-content.ts` MODIFIED — "survives and grows (skills refs, boss-per-module, variant coverage, golden-update-with-rubric-change)".

**Scenarios:**
1. Given a content PR with an MDX anchor referencing a nonexistent exercise ID, when CI runs, then the build fails.
2. Given an exercise referencing a `skillId` absent from the skill registry, when CI runs, then the build fails.
3. Given a module with zero or two `role: "boss"` exercises, when CI runs, then the build fails.
4. Given a review-eligible objective with fewer than 2 isomorph variants in the bank, when CI runs, then the build fails.
5. Given a PR that changes a rubric without updating that exercise family's golden set in the same PR, when CI runs, then the build fails.

## REQ-CP-07: Git remains the source of truth; spec-driven agent authoring stays first-class {#req-cp-07}

Content lives in git (what lets Claude agents author modules — "the repo's superpower, kept"). The spec-driven authoring workflow (`specs/AUTHORING-GUIDE.md` + per-module specs) remains the way modules are built; the oRPC layer's JSON-Schema emission doubles as the contract handed to content-authoring agents (see `api-and-streaming.md` REQ-API-02).

**Source:** DREAM-BLUEPRINT.md §3 "Content pipeline" lead, §6 keep-list items 2–3; CONSTRAINTS.md #4 [HARD] (self-contained specs for parallel agents).
**Current state:** `specs/module-*.md` MODIFIED (survive as authoring source; must be amended per Sage #2 before modules are built from them — see `curriculum-content.md` REQ-CC-04); `specs/AUTHORING-GUIDE.md`, `specs/_TEMPLATE.md` MODIFIED.

**Scenarios:**
1. Given the shipped pipeline, when a content author (human or agent) needs to add a module, then the complete authoring contract is discoverable from the repo alone (guide + template + schema + validate command).
2. Given a module authored strictly from its spec + guide + schema, when `npm run validate` and the CI gates run, then they are the only approval gates the content must pass (no out-of-band contract).
