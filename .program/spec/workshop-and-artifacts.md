# Capability: Workshop & Artifacts

The persistent, git-checkpointed per-profile project (founded module 5, built through module 14), the artifact model, the shelf, cumulative re-verification, and regression repair.

**Depends on:** `execution-layer.md` (Claude runs scoped to the workshop dir; sandbox isolation REQ-EX-06), `event-log-and-projections.md` (artifact_created events, ArtifactHealth projection), `mastery-model.md` (repair emits positive debugging evidence), `content-pipeline.md` (artifact/verifier declarations in the schema REQ-CP-03), `terminal-experience.md` (Workshop dock tab), `curriculum-content.md` (the m5→m14 artifact chain is authored content — mutual; content authors declare, this capability executes).
**Depended on by:** `dashboard-and-wayfinding.md` (shelf teaser).
**Contract owner:** Ramesh (git mechanics) / Sage (artifact semantics, mapping rule); Nova (shelf UI). "No hard reset anywhere in the UI" is Sage's invariant, enforced in plumbing (LANE-DEPENDENCIES "Workshop git plumbing" row).

---

## REQ-WA-01: One git-backed Workshop per profile; learner never sees git {#req-wa-01}

One persistent, git-backed workshop directory per profile with app-owned plumbing — the learner never sees git. Auto-checkpoint commit before every workshop exercise; `good/<exerciseId>` tag on verified pass; restore = checkout-into-new-commit (restore-forward — history never rewritten); **no hard reset anywhere in the UI**; nightly git-bundle backup. Claude runs scoped to the workshop dir. The Workshop directory is on the never-bulk-delete list (CURRENT-STATE.md).

**Source:** DREAM-BLUEPRINT.md §4 "Workshop & artifacts"; LEARNING-DESIGN-REVIEW-SAGE.md §3#3; GLOSSARY.md "Workshop".
**Current state (docs/origin/CURRENT-STATE.md):** new (`src/lib/workshop.ts` planned); `sandbox.ts` MODIFIED gains Workshop-adjacent lifecycle; per-profile isolation extends to Workshop dirs (blueprint §3 "Auth & profiles").

**Scenarios:**
1. Given a workshop exercise about to run, when it starts, then an automatic checkpoint commit exists from immediately before the run.
2. Given a verified workshop exercise pass, when recorded, then a `good/<exerciseId>` tag points at the passing state.
3. Given a restore to a prior checkpoint, when executed, then it lands as a NEW commit on top of history (no rewrite, no reset), and no UI control anywhere performs a hard reset.
4. Given all learner-facing Workshop UI (domain: ADR-0027 enumerates seven surfaces — workshop exercise beats, workshop dock tab, artifact shelf page, shelf teaser on dashboard, regression repair session, regression banner, artifact-created celebration; closed-world, future surfaces join via additive ADR), when audited per the five-audit template (text/control/state/path/celebration copy), then no git terminology or raw git operations are exposed.
5. Given the nightly schedule, when it runs, then a git-bundle backup of each workshop is produced.
6. Given two profiles, when their workshops are inspected, then they are fully isolated directories.

## REQ-WA-02: The mapping rule — Workshop iff a later module reads/extends/re-verifies {#req-wa-02}

An exercise lives in the Workshop iff it produces an artifact a later module reads, extends, or re-verifies (1–2 per module, m5→m14 chain: CLAUDE.md in m7, skill+hook in m9, context restructure in m10, subagent audit in m11, capstone in m14); drills stay throwaway sandboxes. Full cross-module continuity (every module in one repo) was REJECTED — it would break self-contained-fixture spec design (REJECTED.md).

**Source:** DREAM-BLUEPRINT.md §1, §4 "Mapping rule"; LEARNING-DESIGN-REVIEW-SAGE.md §3#3.
**Current state:** content-side chain is authored per curriculum-content REQ-CC-05.

**Scenarios:**
1. Given the built curriculum, when workshop-flagged exercises are enumerated, then each has ≥1 later-module exercise that reads/extends/re-verifies its artifact, and each module m5–m14 has 1–2 workshop exercises.
2. Given an exercise whose artifact nothing later consumes, when validated, then it is not workshop-flagged (drill sandbox instead).

## REQ-WA-03: Artifact records and capability verifiers {#req-wa-03}

Artifact = `{ id, kind: config|doc|skill|hook|feature, paths[], moduleOfOrigin, title, verifierId, status: healthy|regressed|missing, provenanceEventId }`. Verifiers are capability assertions (path-tolerant, deterministic + judgeFile for fuzzy prose), never byte-equality.

**Source:** DREAM-BLUEPRINT.md §4 "Artifact"; GLOSSARY.md "Artifact".
**Current state:** verifier registry SURVIVES + grows (CURRENT-STATE.md); artifact records are new, on the event log.

**Scenarios:**
1. Given an artifact created by a workshop exercise pass, when recorded, then it carries all schema fields including a provenance event ID.
2. Given an artifact file moved within the workshop (content intact), when its verifier runs, then it still passes (path-tolerant, capability-asserting — not byte-equality).

## REQ-WA-04: Artifact shelf with live health badges {#req-wa-04}

The artifact shelf is the progress-narrative centerpiece: each artifact with a one-line "what this does for you" and a live health badge (healthy/regressed/missing from the ArtifactHealth projection). The shelf-teaser appears on the dashboard hero; artifact-created triggers a shelf animation via the celebration ladder.

**Source:** DREAM-BLUEPRINT.md §1, §4 "Artifact shelf", §5 "Key screens", "Completion"; LEARNING-DESIGN-REVIEW-SAGE.md §3#3 ("converts the reward layer from checkmarks to accumulation").
**Current state:** new UI.

**Scenarios:**
1. Given the shelf, when rendered, then every artifact shows its title, a one-line plain-language benefit, and a health badge sourced from the ArtifactHealth projection.
2. Given a new artifact verified, when the server event arrives, then the shelf animation plays (server-confirmed, per frontend-platform REQ-FP-04).

## REQ-WA-05: Cumulative re-verification and non-punitive regression repair {#req-wa-05}

Cumulative re-verification piggybacks each checkpoint: all prior artifact verifiers re-run. A regression surfaces as a non-blocking banner ("your Module 9 hook stopped firing — this happens to every developer; want to investigate?") with a one-click scoped repair session; fixing one emits positive debugging evidence. Exercises declare preconditions (`requires: ["artifact:claude-md:healthy"]`); after two failed repairs, offer a labeled, reversible "patch-in" loaner.

**Source:** DREAM-BLUEPRINT.md §1, §4 "Artifact shelf"; LEARNING-DESIGN-REVIEW-SAGE.md §3#3; DREAM-BLUEPRINT.md §5 "Struggle/rescue"; GLOSSARY.md "Cumulative re-verification", "Patch-in loaner".
**Current state:** new; `api/challenge/verify` MODIFIED gains artifact re-verification for Workshop exercises.

**Scenarios:**
1. Given a workshop checkpoint, when it completes, then all existing artifacts' verifiers re-ran and statuses updated.
2. Given a regression detected, when surfaced, then it is a non-blocking banner with normalizing copy and a one-click scoped repair session — never a wall or blame framing.
3. Given a successful repair, when recorded, then positive debugging evidence lands on the relevant skill(s).
4. Given an exercise requiring `artifact:claude-md:healthy` while that artifact is regressed, when the learner reaches it, then the precondition surfaces (repair path offered) rather than a confusing failure.
5. Given two failed repair attempts on one artifact, when the learner continues, then a clearly labeled, reversible patch-in loaner is offered.
