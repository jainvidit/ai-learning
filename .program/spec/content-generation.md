# Capability: Content Generation (Variant Bank)

Offline generation of isomorphic item variants with a validation gauntlet and human review. Terminal/challenge fixtures and verifiers are NEVER generated.

**Depends on:** `model-gateway.md` (generator/solver/judge model calls; Opus-class for generation), `judge-pipeline.md` (the real judge used in the discrimination check), `content-pipeline.md` (bank ships in the content bundle; ≥2-variant CI gate REQ-CP-06).
**Depended on by:** `spaced-review.md` (variants are what reviews serve, REQ-SR-03).
**Contract owner:** Priya (generation methodology); Sage (pedagogical validity); content agents author fixtures.

---

## REQ-CG-01: Offline-only generation pipeline with human review {#req-cg-01}

Variant generation is offline only — never live at serve time. Pipeline: generator (given reference passing AND failing submissions) → schema validation → solvability (blind solver) + discrimination check → quality judge → **human review** → bank. Correlated generator/solver error is honestly undetectable automatically; human review plus post-deploy item-statistics retirement is the answer.

**Source:** DREAM-BLUEPRINT.md §3 "The AI layer — Generation"; LEARNING-DESIGN-REVIEW-SAGE.md §3#5 "Isomorphic variants"; GLOSSARY.md "Blind-solve gate", "Discrimination check".
**Current state (docs/origin/CURRENT-STATE.md):** new pipeline; no generated content exists today.

**Scenarios:**
1. Given any item served to a learner, when its provenance is traced, then it entered the bank through the full pipeline including a recorded human-review approval — no live-generated item is ever served.
2. Given a generated item, when the blind-solve gate runs, then a second model that has not seen the answer key solves it successfully before it may proceed.
3. Given a generated playground item, when the discrimination check runs, then the reference-pass submission passes the real judge and the reference-fail submission fails it; items failing either direction are rejected.
4. Given a banked item with bad post-deploy statistics, when the retirement process runs, then the item can be pulled from rotation without a code deploy.

## REQ-CG-02: Terminal/challenge fixtures and verifiers are 100% authored {#req-cg-02}

Generated terminal/challenge fixtures and verifiers are REJECTED (a generated verifier can't be trusted; one false FAIL poisons the honest-mastery contract — REJECTED.md). Variants apply to quiz/playground-family items; terminal and challenge fixtures stay 100% authored.

**Source:** REJECTED.md "Generated terminal/challenge fixtures & verifiers"; LEARNING-DESIGN-REVIEW-SAGE.md §3#5 ("Terminal/challenge fixtures stay 100% authored").
**Current state:** consistent with today (all fixtures authored).

**Scenarios:**
1. Given the generation pipeline's input configuration, when inspected, then terminal and challenge exercise types are not generatable targets.
2. Given any sandbox template or verifier in the repo, when its provenance is traced, then it was authored (human or authoring-agent under the spec workflow), never emitted by the variant generator.

## REQ-CG-03: Variant construction — template slots + invariants, fallback to canonical {#req-cg-03}

Variants are built from template slots + invariants (same concept, different surface details), LLM-generated into a pre-validated bank with rubric lint; when no validated variant exists, the system falls back to the canonical item deliberately.

**Source:** LEARNING-DESIGN-REVIEW-SAGE.md §3#5 "Isomorphic variants"; GLOSSARY.md "Isomorphic variant". (Blueprint §4 requires ≥2 isomorph variants per review-eligible objective — CI-enforced via content-pipeline REQ-CP-06.)
**Current state:** new.

**Scenarios:**
1. Given a variant and its source item, when compared, then the tested concept and rubric structure are identical while surface details differ.
2. Given a review-eligible objective with zero validated variants at serve time, when a review is due, then the canonical item is served via the explicit fallback path (logged), not a raw generation.
