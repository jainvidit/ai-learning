---
id: ROOT.1.1
parent: ROOT.1
type: Capability
title: Content pipeline — Velite migration, beat compiler, versioned bundle
ledger_depth: 2
status: blocked
blocked_reason: "verification toolchain (npm/Bash) denied by permission system environment-wide; PART 6 empirical evidence unattainable; repo left build-broken mid-migration by ROOT.1.1.1 partial artifacts — see DECISIONS-PENDING.md entry"
owner_agent: coordinator-ROOT.1.1-gen0
generation: 0
spec_refs:
  - .program/spec/content-pipeline.md#req-cp-01
  - .program/spec/content-pipeline.md#req-cp-02
  - .program/spec/content-pipeline.md#req-cp-04
  - .program/spec/content-pipeline.md#req-cp-05
acceptance_criteria:
  - next-mdx-remote absent from package.json; MDX compiles at build time via the framework named in the tiebreak record (Velite default; OQ #10); npm run build passes (CP-01 scenarios 1–2)
  - Every lesson compiles to an ordered beat array with stable beatIds across rebuilds (CP-02 scenarios 1–3)
  - Build emits a versioned bundle — DAG + layout hints, beat arrays, exercise bank, goldens — immutable per version, served from a versioned static route (CP-04 restated for local desktop per ADR-0007)
  - Stable item IDs + content-hash itemRevision + migration maps (CP-05)
depends_on: [ROOT.1.2, ROOT.1.7]
blocks: []
children: [ROOT.1.1.1, ROOT.1.1.2, ROOT.1.1.3, ROOT.1.1.4]
heartbeat: 2026-07-25T13:56:26Z
file_ownership: ["velite.config.*", "src/lib/content.ts", "src/components/lesson/LessonRenderer.tsx", "package.json"]
review: {tier: 2, required_lenses: [spec-conformance, framework-empirical], verdicts: []}
verification: []
artifacts: []
resume_hint: "BLOCKED on toolchain permission (see DECISIONS-PENDING.md). Decomposition DONE (children 1.1.1-4, serial chain, ADR-0011 fixes algorithms). ROOT.1.1.1 blocked mid-flight with partial artifacts (package.json swapped, velite.config.ts landed, LessonRenderer NOT migrated, npm install never ran — repo build-broken). On resume: verify toolchain works, then re-dispatch ROOT.1.1.1 gen1 (dream-implementer-hardened, second attempt) with its 'Partial state at block' section as input; then 1.1.2 -> 1.1.3 -> 1.1.4."
---
Coordinator-owned; will split into leaves (Velite swap, compiler, bundle emitter,
itemRevision hashing). Framework-touching: verification must include build/typecheck
evidence, never review alone (PART 6).

HANDOFF NOTE (coupling #27): this item ships an INTERIM renderer that keeps lesson
rendering + quiz sanitization working at the Phase 0 Gate after next-mdx-remote is
removed; the components map + sanitization logic carry over and ROOT.4.2's BeatRenderer
replaces it in Phase 3 — record what carries over in this item's verification.
package.json writes are serialized: this item writes FIRST in the Phase 0 chain
(1.1 → 1.6 → 1.3 → 1.5), then ROOT.1.10, then ownership transfers to ROOT.7.1.

## Decomposition record (gen0, 2026-07-25)

Four leaves, all passing the six-point test; STRICTLY SEQUENCED 1 → 2 → 3 → 4 (each
consumes the prior's exports; content.ts shared by 1&2, package.json by 1&4 — sequencing
removes all file overlap, so no isolated-implementer needed):

- ROOT.1.1.1 Velite swap + interim renderer (CP-01; tier 2). Owns package.json,
  velite.config.*, content.ts, LessonRenderer.tsx.
- ROOT.1.1.2 Beat compiler (CP-02; tier 2). Owns content.ts, new src/lib/beats.ts, tests.
- ROOT.1.1.3 itemRevision hashing + migration maps (CP-05; tier 1 — pure library, no
  framework surface, no foreign interface). Owns new src/lib/revisions.ts, tests,
  content/migrations/**.
- ROOT.1.1.4 Versioned bundle emitter + static route (CP-04+CP-05 assembly; tier 2).
  Owns scripts/build-content-bundle.ts, src/lib/bundle.ts, tests, package.json,
  public/content-bundle/**.

Decisions delegated to no leaf: beatId derivation, segmentation, sidecar revisions,
hash-based bundle version — fixed in ADR-0011. Rejected decompositions: single mega-leaf
(fails ~5-file bound + multiple shard sections); splitting the interim renderer from the
Velite swap (phantom ownership — build cannot pass between them, renderer breaks the
moment next-mdx-remote is removed); parallel 3&4 (package.json + consumption coupling).

Code-state survey evidence (dream-reader-corpus, 2026-07-25): next-mdx-remote ^6.0.0
used ONLY in LessonRenderer.tsx (MDXRemote RSC, line ~162); mdxComponents map lines
31–103; sanitizeQuiz lines 16–29; content.ts 138 lines, no runtime MDX; no velite
remnants; curriculum.json = 14-module DAG with requires/track; Next 16.2.11 Turbopack
default (webpack plugins unusable — Velite wired via script chaining).

OQ #10 tiebreak watch: held here. ROOT.1.1.1 must report two-process DX pain; if
unworkable, coordinator writes the tiebreak record and re-dispatches on Content
Collections (runner-up). ADR-0009 weighed: risk lowered.

RF-02/RF-11 watch: any LessonRenderer.tsx DOM/selector change reported by ROOT.1.1.1 →
field_request-style note appended to ROOT.7.1's events; never edit regression-floor.md.

## Verification log

- CP-01 scenario 3 (ASSUMPTIONS #11 re-verify): DISCHARGED upstream by ROOT.1.7 /
  ADR-0009 (evidence .program/audits/probes-mdx-archival.md). Divergent finding
  (not archived) ruled Reading 2: migration proceeds. Nothing for this item to re-run.

## Blocker record (gen0, 2026-07-25T14:20Z)

ROOT.1.1.1 attempt 1 (dream-implementer-suite) hit environment-wide Bash/npm permission
denial: npm install / build / tsc / lint / validate / test all denied individually and
bare, after coordinator-directed retry (per-command, no compounds, redirection-free).
Coordinator independently confirmed: even `npm --version` denied to this coordinator.
Diagnosis: environmental, not agent-capability — a second attempt on the escalated
implementer variant CANNOT succeed (attempt-2 rule not spent; do not burn it on this).

Consequence inventory (read-only survey, dream-reader-lookup a070e98c, 14:15Z):
package.json swapped (next-mdx-remote out, velite ^0.2.0 in, build = `velite && next
build`), velite.config.ts landed, .gitignore gained /.velite/; LessonRenderer.tsx STILL
imports next-mdx-remote/rsc; content.ts untouched; node_modules has neither package;
npm install never ran => `npm run build` fails right now. Repo is build-broken until
resumed or reverted (agents may not run git; revert is the owner's call).

Parked per PART 9 (blocked, awaiting_human_authorization via DECISIONS-PENDING.md).
Nothing dispatchable remains: 1.1.2/3/4 all chain behind 1.1.1 and all require the
same toolchain for PART 6 evidence. Decomposition + ADR-0011 remain valid for resume.
