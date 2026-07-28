---
id: ROOT.7.3.10
parent: ROOT.7.3
type: Decision
title: Ratify REQ-MS-03 s1 delete-verb list as canonical (borderline) (ADR-0028)
ledger_depth: 3
status: done
owner_agent: implementer-ROOT.7.3.10-gen0 (dream-implementer-standard, dispatched by director-gen42 2026-07-27 ~22:25Z)
spawned_at: 2026-07-27T22:25:00Z
generation: 0
spec_refs:
  - .program/spec/migration-and-sequencing.md#req-ms-03
acceptance_criteria:
  - ADR-0028 ratified — either the delete-verb list in REQ-MS-03 s1 is ruled CANONICAL (the "zero hits" audit greps exactly that list, closed-world, additions via additive ADR), or the list is completed and the shard amended additively
  - The Gate audit row's exact grep procedure named in the ADR so every phase Gate (ROOT.1.8, 2.5, 3.6, 4.9, 5.6) runs the same falsifiable check
depends_on: []
blocks: [ROOT.1.8]
children: []
file_ownership: [".program/decisions/ADR-0028.md", ".program/spec/migration-and-sequencing.md"]
review: {tier: 1, required_lenses: [spec-conformance], verdicts: [{lens: spec-conformance, verdict: approve, confidence: high, event_ts: 2026-07-27T23:05:00Z}]}
verification: []
artifacts: []
resume_hint: "Scheduled by ADR-0018. NEAR-TERM: blocks ROOT.1.8 (Phase 0 Gate) — the Gate's MS-03 never-delete row needs a canonical verb list to be falsifiable. Likely a short ratification. Survey row: migration-and-sequencing REQ-MS-03 s1 (borderline)."
---

## Verification

### AC1: ADR-0028 ratified with canonical verb list + shard amendment

**Verified:** 2026-07-27

**Method:** 
1. Read REQ-MS-03 s1 in full; the spec's verb list (line 71) was: `rm`, `rmdir`, `unlink`, `rmtree`, `Remove-Item`, `fs.rm`, `fs.unlink`, `del`, `truncate`.
2. Empirical test: grepped current codebase for the spec's verbs plus common candidates (`fs.rmSync`, `fs.rmdir`, `fs.unlinkSync`, `rimraf`).
3. **Finding:** six instances of `fs.rmSync` in current code, NOT covered by spec list. The list names `fs.rm` and `fs.unlink` but omits sync variants.
4. **Ruling:** list is INCOMPLETE. Completed canonical closed-world list (13 verbs): `rm`, `rmdir`, `unlink`, `rmtree`, `Remove-Item`, `fs.rm`, `fs.rmSync`, `fs.rmdir`, `fs.rmdirSync`, `fs.unlink`, `fs.unlinkSync`, `del`, `truncate`, `rimraf`. Rejected `remove` (too generic), `drop` (SQL-specific).
5. Wrote ADR-0028 with completed list, exact grep procedure (pattern, exclusions, hit classification), allowed exceptions (.program/ledger/append-event.py temp files), closed-world/relaxation rules.
6. Amended .program/spec/migration-and-sequencing.md REQ-MS-03 s1 ADDITIVELY (no deletion/rewording) citing ADR-0028.

**Evidence:** 
- ADR: C:\Users\jainv\workplace\ai-learning-app\.program\decisions\ADR-0028.md
- Shard amendment: C:\Users\jainv\workplace\ai-learning-app\.program\spec\migration-and-sequencing.md lines 76-81 (AMENDED block)

### AC2: Exact grep procedure named for phase Gates

**Verified:** 2026-07-27

**Method:** ADR-0028 section "The grep procedure for every phase Gate" specifies the full command with pattern, file types, paths, exclusions, hit classification (PASS/FAIL/conservative-fail), and exception recording rules. The procedure is copy-pasteable and falsifiable.

**Evidence:** ADR-0028 lines ~55-95 (grep procedure section)

## Baseline dry-run findings

**Dry-run executed:** 2026-07-27, program/dream-build branch

**Result:** 13 hits; 3 allowed exceptions (heartbeat test, append-event.py temp cleanup), 3 CSS false positives, **4 violations** (seed-sandboxes.ts:33, profiles.ts:69, profiles.ts:70, sandbox.ts:65) deleting from protected trees `data/**` and `sandbox/live/**`.

**Baseline Gate status:** FAIL (4 violations found). These are CURRENT-STATE [OBSERVED] code predating the program; findings recorded in ADR-0028 for Phase 0/1 remediation.

**Evidence:** ADR-0028 "Baseline dry-run" section with full hit list + classification
