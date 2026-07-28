# ROOT.7.3.3 gen1 fix verification

Date: 2026-07-28 02:20Z
Agent: implementer-ROOT.7.3.3-gen1
Status: All findings RESOLVED

## Findings addressed

### F1 BLOCKING — Exhaustiveness (3 sub-findings)

#### (a) Classify "attempts > N" (REQ-CH-02 line 24)
- **Resolution:** EXCLUDED from enumeration with rationale that survives review objection.
- **Discriminator:** Attempts>N operates in raw-interaction plane (includes draft-tier per REQ-JP-02 s1); Trigger 2 operates in graded-evidence plane (gate-tier clear-misses + in-band only). REQ-CH-02 obligation is visual surfacing only (not tier-stepping, evidence change).
- **Location:** ADR-0021.md Amendment gen1 F1 fix section + "What was NOT enumerated" section (new first bullet).
- **Evidence:** Lines ~103-112 (F1 fix section), lines ~170-174 ("What was NOT enumerated" amended).

#### (b) Correct false claim "repeated same-criterion misses covered by Trigger 2"
- **Resolution:** Claim RETRACTED. REQ-JP-01 s2 scores as weighted sum — low-weight criterion can miss 3x inside clear-passes (score >0.7), so Trigger 2 never fires. Not a struggle trigger in this ADR's domain; learner-feedback surface only.
- **Location:** ADR-0021.md Amendment gen1 F1 fix section + "What was NOT enumerated" section (new second bullet).
- **Evidence:** Lines ~114-118 (F1 fix), lines ~176-179 ("What was NOT enumerated" amended).

#### (c) Classify rung-4 exhaustion WITHOUT a pass (REQ-CH-03 s3)
- **Resolution:** EXCLUDED. No additional adaptive response beyond rung-4 re-explanation is specified. Default behavior: if clear-miss results, Trigger 1/2 engage normally. Served by closed-world default.
- **Location:** ADR-0021.md Amendment gen1 F1 fix section + "What was NOT enumerated" section (new fourth bullet).
- **Evidence:** Lines ~120-124 (F1 fix), lines ~184-187 ("What was NOT enumerated" amended).

### F2 BLOCKING — Contradiction with ADR-0020 on in-band struggle counting

- **Resolution:** Arbitration RECORDED. Both readings stated (ADR-0020 line 47: in-band does NOT count; ADR-0021 Trigger 2: in-band DOES count). Director ruling 2026-07-28 02:05:30Z: ADR-0021 wins. Single ownership: ADR-0021 owns struggle-halt semantics; ADR-0020 defers. Consistency check 3 "No overlap" claim RETRACTED and replaced with deferral structure. Closed-world default coordination stated.
- **Location:** ADR-0021.md Amendment gen1 F2 fix section + Trigger 2 detection rule note + consistency check 3 (amended).
- **Evidence:** Lines ~126-141 (F2 fix section with both readings + ruling + single ownership), Trigger 2 detection rule note (lines ~25-27), consistency check 3 retraction (lines ~154-160).

### F3 PARTIAL FAIL — Amnesty and quarantine exclusions

- **Resolution:** SR-01 s4 lapse amnesty and REQ-JP-04 line 49 quarantine exclusion written INTO Trigger 1/2 detection rules. Amnestied first-post-gap misses and quarantined/ungradeable attempts do NOT advance either counter.
- **Location:** ADR-0021.md Trigger 1 detection rule (amended), Trigger 2 detection rule (amended).
- **Evidence:** Trigger 1 detection rule (line ~17, EXCLUDING clause with both exclusions cited), Trigger 2 detection rule (line ~24, EXCLUDING clause with both exclusions cited).

### F4 RESERVATIONS — Falsifiability (2 sub-findings)

#### Trigger 2 release condition unsourced
- **Resolution:** Gen0's "until the coach is used or a pass is achieved" DELETED (not sourced in any shard). CORRECTED to state what shards DO say: escalation stopped, coach highlighted. Future work flag added for release condition.
- **Location:** ADR-0021.md Trigger 2 adaptive response (amended).
- **Evidence:** Trigger 2 adaptive response (lines ~28-29, release condition deleted, future work flag added).

#### Trigger 4 "reduced" unmagnituded
- **Resolution:** Magnitude explicitly DEFERRED to implementation or later ADR. REQ-CH-04 specifies "reduced/zero" without naming the factor.
- **Location:** ADR-0021.md Trigger 4 adaptive response (amended).
- **Evidence:** Trigger 4 adaptive response (line ~36, magnitude deferred, REQ-CH-04 caveat noted).

### F6 ADVISORY — Never-rewrite-live in default clause

- **Resolution:** Appended "In all cases (triggered or non-triggered), served content is a pre-authored/pre-validated variant" to closed-world rule line 44. Pre-existing REQ-MM-05 s4 obligation now applies universally (not just to triggered learners).
- **Location:** ADR-0021.md closed-world rule (amended).
- **Evidence:** Closed-world rule (line ~46, new sentence appended citing REQ-MM-05 s4).

### ALSO REQUIRED — REQ-MM-02 s5 additive cross-reference

- **Resolution:** mastery-model.md REQ-MM-02 s5 amended ADDITIVELY so "any number of subsequent failures" quantifies over ADR-0020's enumerated domain. Pre-existing text unchanged. Cites ADR-0020 with six patterns listed. This was ADR-0020 line 106's false claim; this item owns mastery-model.md edits.
- **Location:** mastery-model.md REQ-MM-02 s5 (line 38, appended after "without UI surface").
- **Evidence:** .program/spec/mastery-model.md line 38 (additive cross-reference with ADR-0020 domain clause).

## Verification method

All amendments made in place to ADR-0021.md (Amendment gen1 section + inline amendments to Triggers 1/2/4 + closed-world rule + consistency check 3 + "What was NOT enumerated" section). mastery-model.md REQ-MM-02 s5 amended additively per requirement. No deletions of pre-existing text; all amendments additive or corrections of gen0 false claims.

Grep verification:
- `grep -n "Amendment gen1" .program/decisions/ADR-0021.md` → line 99
- `grep -n "Failure-pattern domain (ADR-0020)" .program/spec/mastery-model.md` → line 38

All findings addressed per review + arbitration. Status: in_review (ready for re-review).
