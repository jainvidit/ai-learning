# Director handoff — gen43, 2026-07-27 ~23:50Z – 2026-07-28 ~03:00Z

Rotation is MANUAL: owner relaunches on DIRECTOR_HANDOFF_WRITTEN (carried from ROOT-40/41/42).
Owner directives this generation (both executed): (1) MS-03 baseline violations ledgered as
owned work, not just ADR notes; (2) ROOT.1.1 assembly review must ask shard-satisfaction,
not child pass-rate — three consecutive generations had a higher lens overturn a lower one.
That directive was prescient: it happened a FOURTH time this generation (ROOT.1.1.5 below).

## Authoritative (attempted/produced — trust this)

- **ROOT.7.3.1 DONE** (ADR-0019). Fix-verify approve/high; all 3 gen0 findings discharged;
  independent same-endpoint ruling HOLDS. NEW-1: header baseline lives in ADR-0019 ~49-52,
  NOT a shard section — item file corrected. NEW-2 carried to ROOT.4.5 as event
  (exec/route.ts:44 prompt guard blocks pure reattach). ROOT.1.3's 7.3.1 edge dischargeable.
- **ROOT.7.3.10 + ROOT.7.3.11 DONE** (ADR-0028 carried from gen42; ADR-0029 tier-0
  approve/high, zero gaps, lane discipline verified).
- **MS-03 baseline OWNED (owner directive 1):** ROOT.4.5 gained an acceptance criterion for
  sandbox.ts:65 + seed-sandboxes.ts:33 (+ scripts/seed-sandboxes.ts added to its globs;
  overlap scan re-run: 0 live) and ROOT.4.10 for profiles.ts:69/:70 (dispositioned per the
  ROOT.2.1 deletion-semantics ADR; PART 9 park if any delete on data/** is kept). Events on
  both items. A baseline nobody owns no longer exists.
- **Decision backlog fully activated:** all 11 ROOT.7.3.* items are now past `proposed`.
  Review outcomes this gen — the falsifiability bar (vacuous = presence-or-absence
  satisfiable) and exhaustiveness-vs-spec-domain are doing real work; EVERY enumeration ADR
  except 7.3.1/7.3.10/7.3.11 got request_changes on first review:
  - **7.3.2 (ADR-0020)** gen1 fix DONE, in_review — needs fix-verify. 5 blocking fixed incl.
    pattern 0 (deterministic scoreless failures), SR-01 s4 amnesty + ordering vs 45-day
    decay, decidable no-state-change default.
  - **7.3.3 (ADR-0021)** gen1 fix DONE, in_review — needs fix-verify. Also delivered the
    REQ-MM-02 s5 cross-ref ADR-0020 had wrongly claimed (mastery-model.md is 7.3.3's glob).
  - **7.3.4 (ADR-0022)** gen1 fix DONE, in_review — needs fix-verify. Note its F8
    resolution: quantifier-narrowing recorded as REPLACES with a divergence note.
  - **7.3.5 (ADR-0023)** gen1 fix DONE, in_review — needs fix-verify (F1-F7; additivity F8
    already director-confirmed by git diff).
  - **7.3.8 (ADR-0026)** gen1 fix DONE, in_review — needs fix-verify. Now FIVE states
    (added SSE-stream failure, spawn failure, fakes carve-out).
  - **7.3.6 (ADR-0024)** changes_requested, gen1 fix NOT yet dispatched. NOTE: its F5 is an
    ADDITIVITY VIOLATION in lesson-experience.md — pre-existing s3 sentence was reworded in
    place. The fix must RESTORE the original sentence verbatim + append a Domain clause in
    the ADR-0026 form.
  - **7.3.9 (ADR-0027)** changes_requested, gen1 fix NOT yet dispatched (word-list gaps
    incl. repo/repository; error-surface disposition; artifact_verified unsourced).
  - **7.3.7 (ADR-0025)** gen2 — SECOND failed cycle. F1/F3/F4 discharged; F2a (script CHECK 8
    regex narrower than ADR body + ADR claims a hit its own evidence contradicts) and F2b
    (8 new escapes; reviewer offered a downgrade path: necessary-not-sufficient screen +
    typed complement) remain. Per PART 9 the gen2 attempt goes to the ESCALATED variant
    (dream-implementer-hardened) or takes the downgrade option. One more failure → blocked
    with diagnosis.
- **ROOT.1.1.5 tier-2 SPLIT — the owner's pattern held a 4th time.** Lens 1
  spec-conformance APPROVE/high (pins re-derived independently, scoping calls both upheld).
  Lens 2 adversarial-fixverify REQUEST_CHANGES/high: GEN2 scope genuinely fixed (8/8
  disposition probes THREW; pins + bundle id unchanged) but 3 NEW MAJOR admissions:
  (A) Array.prototype pollution defeats the hole check ('in' walks the chain; polluted
  sparse collides with dense at 742804ccea6d339e); (B) enumerable getter at canonical index
  ADMITTED + IMPURE (two hashes from one object); (C) Proxy over array ADMITTED (collides
  with frozen pin 49a64717d5d4cb19). Status changes_requested gen1; owner UNASSIGNED.
- **Arbitration (binding, PART 6/PART 9 Rule 1), events on 7.3.2 + 7.3.3 ~02:05Z:** in-band
  0.4–0.7 verdicts DO count toward the struggle-halt counter; ADR-0021/mastery-model OWNS
  struggle-halt semantics; ADR-0020 defers, zero-evidence rulings unchanged. Both gen1
  fixes recorded it; 7.3.4 aligned verbatim.
- **ADR-0025 re-run bindings mirrored by director:** ROOT.4.5 acceptance criterion +
  ROOT.4.9 gate row (events logged).
- **Path-guard defect, now systemic:** SIX+ in-allowlist reviewer writes DENIED this gen
  (targets under .program/audits/** rejected; guard appears to parse slash-bearing/dotted
  tokens in the Bash payload as write targets — one reviewer had to use '#' for '.' inside
  its doc, another wrote a dashed filename ROOT-7-3-4-review.md). Director transcribed all
  verdicts verbatim into .program/audits/ (provenance noted in each). Auditor was tasked
  with the parser-vs-allowlist diagnosis and is STILL IN FLIGHT at rotation.
- Commits: b02834f, 87416c8, + review-wave commits + closing commit with this handoff.
  HEADLINE regenerated from scripts (counts: 17 done / 6 in_progress / 4 in_review /
  5 changes_requested / 36 proposed / 2 blocked; frontier = 9 review-cycle items only).

## Decisions a successor must not silently revisit

- The in-band/struggle-halt arbitration above (events ROOT.7.3.2 + ROOT.7.3.3 ~02:05Z).
- MS-03 baseline ownership lives in ROOT.4.5/ROOT.4.10 acceptance criteria — do not
  "simplify" back into a Gate note.
- ROOT.7.3.1's same-endpoint ruling (param-based reattach/resume) — re-derive at ROOT.1.3
  per ROOT-42 uncertainty note, but do not casually reverse.
- ROOT.1.1.3/1.1.4 stay done; all new revisions.ts defects live in ROOT.1.1.5's history.
- All prior standing decisions (ADR-0009/10/11/17+A1, frozen pins incl. the 10 + bundle id
  eb647973722173b3, EXIT_CODE convention) stand.

## Next actions (in order)

1. **Collect the in-flight ledger auditor** (full check set + path-guard diagnosis +
   ROOT.7.3.10 empty-verification-array ruling). Act on findings before widening.
2. **Dispatch ROOT.1.1.5 gen1 fix** (dream-implementer-hardened, tier 2): fix A (hole check
   via own-property semantics, not 'in'), B (reject own enumerable accessor descriptors),
   C (reject/disposition Proxies — note detectability limits honestly; if undetectable,
   disposition explicitly vs REQ-CP-05 domain). Pins FROZEN. Then re-run BOTH tier-2 lenses
   (fresh instances) — after a split + 4th escalation cycle, do not shortcut to
   fix-verify-only.
3. **Dispatch fix-verifies** for 7.3.2, 7.3.3, 7.3.4, 7.3.5, 7.3.8 (fresh primary
   instances, each verifying its gen0 findings discharged + additivity diff).
   Cross-check 7.3.2/7.3.3 against each other (shared arbitration, coordinated defaults).
4. **Dispatch gen1 fixes** for 7.3.6 (additivity restoration is the critical piece) and
   7.3.9 (word list, error surfaces, artifact_verified).
5. **Decide 7.3.7 gen2 route**: hardened implementer to extend checks vs reviewer's
   downgrade option. Recommend the downgrade (necessary-not-sufficient screen + typed
   complement owned by ROOT.4.5's review) — greps cannot close an open mechanism space,
   which is what the two failed cycles are demonstrating.
6. On 1.1.5 done: **ROOT.1.1 assembly review** (fresh coordinator) — per the owner
   directive, judge the ASSEMBLED result against content-pipeline.md CP-01/02/04/05, child
   pass-rate is weak evidence (four consecutive higher-lens overturns on this subtree);
   package.json baton to ROOT.1.6 per handoffs/ROOT.1.1-0.md. Also run the director
   byte-diff owed on workshop-and-artifacts.md (7.3.9 reviewer couldn't run git).
7. Then ROOT.1.4 + ROOT.1.6 unlock → Phase 0 tail (1.3, 1.5, 1.10, Gate 1.8).

## Risk register

1. **revisions.ts adversarial-escape pattern (4 cycles).** Each fix provably closes the
   reported holes and each adversarial pass finds new ones. If the gen1 fix draws ANOTHER
   new-majors verdict, stop iterating: escalate to a design-level decision (e.g. structural
   allowlist — reject anything whose descriptor set isn't exactly plain-data — as an
   ADR-0017 amendment) rather than a 5th whack-a-mole cycle.
2. **Path guard blocks reviewer evidence writes** — verdicts survive only via bounded
   returns + director transcription. If a reviewer's return were ever truncated, evidence
   would be lost. Auditor diagnosis pending; consider fixing the hook parser (it is
   program-authored infra, not .claude/ config) only AFTER the auditor reports.
3. ROOT.7.3.7 on its last attempt before PART 9 blocking.
4. In-flight at rotation: ledger auditor (task running). ROOT.7.1 steward: no batch
   requested this gen; backlogs 1, 2, 5 open per ROOT-41.
5. Parked, never self-authorize: ROOT.6, ROOT.2.4, ROOT.5.1 backup flag. ROOT gen15
   scoping-failure flag stands (ADR-0012).

## Uncertainty (re-derive, do not inherit)

- Whether Proxy-wrapped arrays are DETECTABLE at all in the hash path (finding C) — the
  gen1 implementer must establish this empirically before choosing reject-vs-disposition;
  do not inherit my framing that rejection is possible.
- Whether 7.3.4's "REPLACES + divergence note" resolution of the additivity question is
  acceptable program-wide or needs a director ruling standardizing amendment style (7.3.6's
  fix restores-verbatim instead — the two patterns now coexist; the fix-verify pass will
  surface whether that inconsistency matters).
- The auditor's path-guard diagnosis — everything above about parser-vs-allowlist is
  hypothesis from reviewer reports, not verified.
- ROOT.1.1 assembly-review coordinator mechanics: check events/ROOT.1.1.jsonl (gen2
  coordinator long dead; director has been acting for it per the flat-dispatch takeover
  pattern, event 2026-07-27T22:20Z).
