# Blind tier-1 review - item ROOT-7-3-9
Lens: spec conformance and falsifiability. Reviewer: dream-reviewer-primary, 2026-07-27.
Artifacts: decision doc ADR-0027; spec shard workshop-and-artifacts, REQ-WA-01 scenario 4.
Author reasoning NOT read (ledger item body not opened).

VERDICT: request_changes. Confidence: high.

## 1. EXHAUSTIVENESS - PASS

Independent sweep done before reading the ADR (ripgrep for workshop, artifact, shelf, repair,
regress, restore, checkpoint across every spec shard; plus targeted workshop sweeps of
hosted-edition, data-layer-and-offline, testing-and-ci, judge-pipeline, mastery-model, spaced-review,
boss-and-test-out, playground, content-generation - zero hits). My list, with ADR disposition:

| Surface | Shard source | ADR disposition |
|---|---|---|
| Workshop exercise beats (SandboxBeat) | LX-06, TX-01, TX-03, CC-05 | enumerated 1 |
| Workshop dock tab plus pulsing indicator | TX-02 | enumerated 2 |
| Artifact shelf page | WA-04 | enumerated 3 |
| Shelf teaser on dashboard hero | DW-01, WA-04 | enumerated 4 |
| Regression repair session | WA-05 s2 | enumerated 5 |
| Regression banner | WA-05 s2 | enumerated 6 |
| Artifact-created celebration, shelf animation | WA-04 s2, FP-04 s2 | enumerated 7 |
| Sidebar Workshop entry (live-session pulse) | DW-03 | ruled not-distinct, folded into 2 |
| Exercise precondition-failure surface | WA-05 s4 | ruled a specialization of 6 |
| Patch-in loaner offer | WA-05 s5 | covered inside surface 5 obligation |
| Generic rail, resume chip, breadcrumbs | LX-04, LX-07, DW-03 | ruled out-of-domain |
| Nightly bundle backup, git plumbing | WA-01 s5, EX-06 | ruled server-side |

No shard-named learner-facing Workshop surface is left both unenumerated and unruled. Restore UI is
named by no shard; the ADR assigns it to surface 3 (the surface 1 entry states restore UX is surface
3), closing the gap rather than leaving it open. Settings and profile surfaces: the profiles shard
and DW-04 name per-track completion and an Active badge only, no Workshop path exposure.
Exhaustiveness obligation satisfied.

Residual, feeding finding F3: no shard names a Workshop-operation error or failure surface, so its
absence is not itself a shard-conformance breach, but it is the highest-risk leak channel (raw git
stderr, for example the string fatal not a git repository, on a failed checkpoint, restore or
bundle), and the ADR neither enumerates nor rules it out.

## 2. FALSIFIABILITY of the five-audit template - MOSTLY PASS, one MAJOR contradiction

Each audit names a procedure plus at least one decidable FAIL class with worked examples (ADR lines
108-130): (1) grep over a closed 18-term word list with three allow-classes; (2) control
enumeration, FAIL equals a git operation name in label, tooltip or triggered action; (3)
state-indicator enumeration, FAIL equals git repository state such as branch name, dirty, commit
count, detached HEAD; (4) the git metadata directory must not appear in UI-rendered path lists,
pickers or actively rendered terminal output; (5) celebration and toast copy must not name git
operations. Every audit carries both PASS and FAIL exemplars. This is not a vacuous audit-the-text
template, and the forbidden vocabulary IS enumerated, so the survey unfalsifiability concern is
substantively addressed.

F1 (MAJOR) - the word list contradicts the ADR own named violations.
Surface 2 normative obligation (ADR line 47) says the tab label must never be Git, Repo or Branch.
Audit 1 word list (ADR line 108) is: git, commit, branch, tag, HEAD, checkout, reset, revert, diff,
log, cherry-pick, rebase, merge, clone, push, pull, fetch, stash, plus the git metadata dir. A label
Repo or Repository therefore PASSES the ADR own decision procedure while violating the ADR own
stated obligation. The same gap exists for dirty and clean (audit 3 own FAIL example, 2 uncommitted
files, survives only incidentally because it contains the substring commit), and for staged,
unstaged, worktree, blame, bisect and detached. Audit 1 is the primary decision procedure the shard
now points at (audited per the five-audit template), so an under-inclusive list that fails to decide
a case the ADR itself calls FAIL is a defect in the artifact core purpose.
Reading: the ADR-0028 precedent treats the enumerated verb list as canonical for the grep, so a term
named as a violation in prose but missing from the canonical list is an internal inconsistency, not
a harmless omission.
Evidence to satisfy: word list extended to include at minimum repo, repository, dirty, staged,
unstaged, worktree, blame, bisect, detached; OR an explicit statement that the list is illustrative
and the per-surface prose obligations govern, justified against the ADR-0028 canonical-list
precedent (this weakens decidability, so the justification matters).

F2 (MINOR) - allow-class 3 is the one soft edge. Generic words with non-git primary meanings in
context (ADR line 111) is judgment, not procedure, and it bites hardest on log, merge, fetch, pull
and tag, all words this app own vocabulary uses non-git-ly (event log, TermEvent log). Bounded and
exemplified, so non-blocking; a recorded exception list, as ADR-0028 does for baseline hits, would
remove the residual judgment.

## 3. CLOSED-WORLD DEFAULT and RELAXATION PATH - PASS

Closed-world rule is explicit and normative (ADR line 100: the obligation applies to these seven
surfaces and no others; creating a new learner-facing Workshop UI surface without amending this ADR
first is a spec violation). Relaxation path (ADR lines 134-137) is decidable and three-step: an
additive ADR naming the new surface, its obligation stated through the five-audit template, an
append to the enumeration, then an additive shard amendment. Structurally parallel to ADR-0023 and
ADR-0019. Step 3 phrase or document an exception with rationale is an implementation allowance, not
a domain loophole, so acceptable.

## 4. ADDITIVITY of the shard amendment - PASS within my evidence limits

I am barred from running git, so I verified textually rather than by diff.
- The pre-amendment scenario 4 wording is independently attested twice outside the artifact: the
  unfalsifiable-criteria survey row 21 (quoting all learner-facing Workshop UI) and the ADR own
  block quote at line 11. The amended shard scenario 4 preserves the original opener verbatim
  (Given all learner-facing Workshop UI) and the original consequent verbatim (then no git
  terminology or raw git operations are exposed). The only changes are the inserted parenthetical
  domain clause and the qualifier appended to when audited.
- Structural inventory intact: WA-01 six scenarios, WA-02 two, WA-03 two, WA-04 two, WA-05 five;
  frontmatter, Source and Current-state blocks, and the no-hard-reset prose all present and
  coherent. No other scenario text altered.
- No deletion or rewording detected. Evidence gap I cannot close myself: a byte-level diff against
  commit 87416c8 is the implementer to supply. My finding is no textual evidence of deletion, not
  diff verified.

## 5. CROSS-ADR CONSISTENCY with ADR-0023 - MOSTLY PASS, one MINOR

Ownership is clean and non-contradictory. ADR-0023 trigger 6 owns whether and when the artifact
celebration may fire (server-confirmed artifact_created event, ArtifactHealth shows the artifact
healthy, MESO tier). ADR-0027 surface 7 owns the copy obligation (celebrate the capability, never
the git operation). No overlap in obligation, no contradiction in tier or trigger. The ADR-0023
explicit exclusion of repair success from the celebration domain is consistent with ADR-0027
surface 5, which claims no celebration and uses fixed or still-broken framing.

F4 (MINOR) - artifact_verified is an invented event name. ADR line 75 says surface 7 is triggered by
server-confirmed artifact_created and artifact_verified events. Grep across the whole program tree
shows artifact_verified appears ONLY in ADR-0027; the event-log shard names artifact_created, and the
ADR-0023 trigger 6 normative event type is artifact_created alone. Inside a section this ADR labels
normative, that either invents an event or informally widens the ADR-0023 closed trigger domain.
Evidence to satisfy: drop the artifact_verified alternative, or cite the shard or ADR defining it.

## 6. Other findings

F3 (MAJOR) - the Workshop-operation error and failure surface is neither enumerated nor ruled out,
while audit 4 carve-out actively opens a git-passthrough channel. ADR line 125 permits the terminal
to stream raw directory-listing output containing the git metadata dir; line 149 adds that the
Workshop directory name may appear in pwd output. Both are defensible readings of exposed, meaning
exposed by UI chrome. But scenario 4 plain text quantifies over all learner-facing Workshop UI, and
the dock tab (surface 2) is enumerated UI. The combination of an explicit raw-passthrough carve-out
plus silence on failed Workshop git operations leaves the single most likely real leak, raw git
stderr on a failed checkpoint, restore or nightly backup, unruled in either direction.
Reading: competing readings of the scenario 4 word exposed. Reading A, the ADR reading: UI chrome
only, so scoped command output is out of scope. Reading B: any learner-visible pixel on an
enumerated surface, including streamed stderr the app itself triggered without the learner asking.
Evidence to satisfy: one added ruling, either an eighth surface (Workshop operation failure and
error surfaces, obligation never render raw git stderr or exit text, failures surface as
plain-language artifact or session state), or an explicit exclusion with rationale distinguishing
learner-initiated command output from app-initiated operation failures. Either resolves the
ambiguity; I do not require a particular choice.

F5 (MINOR) - wrong scenario citation. ADR line 168 attributes no hard reset anywhere in the UI to
REQ-WA-01 s1. Verified against the shard: s1 is the pre-run checkpoint commit; the hard-reset clause
lives in the REQ-WA-01 prose paragraph and in s3. A cheap fix, but it matters because this ADR is now
normatively cited by the shard.

F6 (MINOR) - banner copy is double-assigned. Surface 5 obligation (ADR line 65) opens with banner
copy uses normalizing developer framing, which is surface 6 obligation (ADR line 71). Over-inclusive
rather than under-inclusive, the safe direction, but it muddies which surface owns the banner-copy
check when the per-surface audit is actually run.

## Verified factual claims (grounding)

- REJECTED line 39 is indeed full cross-module project continuity rejected in favour of a scoped
  Workshop of one to two artifact exercises per module. The ADR citation is accurate.
- CONSTRAINTS contains no Workshop-UI mandate and no git-terminology constraint; the only git
  mentions are two incidental git-show provenance references at lines 11 and 57. The ADR claim is
  accurate.
- The interfaces directory contains no Workshop interface doc. The ADR claim is accurate.
- Survey row 21 confirms REQ-WA-01 scenario 4 as a clear match with the phrase all learner-facing
  Workshop UI over an unenumerated domain. The ADR context is accurate.
- Both artifacts are prose documents with no framework or API usage, so build and typecheck
  grounding is not applicable. No code was changed and none needed running. I read no node modules
  and approved no framework API from memory.

## Summary

Strong artifact. The enumeration is genuinely exhaustive against my independent sweep, the
closed-world rule and relaxation path are decidable, the shard amendment is additive on all
available textual evidence, and it does not contradict ADR-0023. Changes requested for two
substantive defects: F1, the word list versus the ADR own named violation Repo; and F3, the unruled
Workshop error or failure surface alongside an explicit raw-passthrough carve-out. Plus three cheap
corrections: F4 artifact_verified, F5 s1 should be s3, F6 double-assigned banner copy. None require
re-architecture.
