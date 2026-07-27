# Shard survey — unfalsifiable universally-quantified criteria (count only)

Run: 2026-07-27 ~05:38Z, agent dream-reader-corpus (read-only). Persisted by
director-gen40. Owner mandate: count only, no rewrites this generation. Trigger: CP-05 s1
("content changes in any way") passed review while false — a universal claim over an
unenumerated domain is untestable, fixed by enumeration in ADR-0017.

## Result: ~290 scenarios/criteria scanned across 23 shards → 8 clear matches, 3 borderline

### Clear matches (universal quantifier over an unenumerated domain)

| Shard | REQ | Scen | Universal phrase | Unenumerated domain |
|---|---|---|---|---|
| api-and-streaming.md | REQ-API-03 | 3 | "any SSE response" | all streaming endpoints (playground/terminal/unspecified) |
| coach-and-hints.md | REQ-CH-01 | 1 | "any tutor invocation" | all contexts/rungs/subjects invoking tutor |
| data-layer-and-offline.md | REQ-DL-03 | 3 | "any offline learner reaching a playground, terminal, or challenge beat" | offline states (partial sync, stale bundle, mid-outbox) |
| frontend-platform.md | REQ-FP-04 | 2 | "any celebration anywhere" | all celebration trigger points across app |
| judge-pipeline.md | REQ-JP-04 | 2 | "any number of subsequent failures" | failure patterns (consecutive, scattered, timing) |
| lesson-experience.md | REQ-LX-07 | 3 | "any beat entering view" | beat entry modes (scroll, jump, resume, restore) |
| mastery-model.md | REQ-MM-05 | 4 | "any struggling learner" | struggle patterns/thresholds triggering adaptivity |
| workshop-and-artifacts.md | REQ-WA-01 | 4 | "all learner-facing Workshop UI" | Workshop UI surfaces (unnamed/future) |

### Borderline (counted separately, not matches)

| Shard | REQ | Scen | Why borderline |
|---|---|---|---|
| execution-layer.md | REQ-EX-01 | 3 | "never branches on driver" — driver count fixed (2) and named; vague but bounded |
| migration-and-sequencing.md | REQ-MS-03 | 1 | "zero hits" over delete verbs — verb list enumerated in the requirement, falsifiable if canonical |
| content-pipeline.md | REQ-CP-05 | 3 | new ADR-0017 scenario: rejected-domain is "outside" an enumerated inside — open only over future JS types |

## Disposition (director)

Count reported per owner mandate; NO shard edits this generation. Enumeration passes are
future work, best done per-shard immediately before the owning phase's items are
decomposed (the CP-05 pattern: enumerate at the moment a criterion becomes an acceptance
test, via ADR). Affected phases: 8 matches sit in Phases 1–4 shards — none blocks Phase 0.
The CP-05 s3 borderline is accepted as-is: "outside an enumerated inside" is the standard
shape of a rejection clause and is testable per named rejected type.
