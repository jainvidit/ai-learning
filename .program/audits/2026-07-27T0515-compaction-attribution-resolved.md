# Compaction attribution — dispute resolved by structural count

Run: 2026-07-27 ~05:14Z. Tool: `.program/audits/compaction-attribution/structural-count.py`
(new reproducible script; run by director-gen40 because the write-scope hook correctly
blocks restricted roles from `python -c`/`node --eval`, so the named check could not be
executed by dream-verifier — verifier returned inconclusive-by-constraint, not a failure).

## The dispute
- Routine audit 2 (check 11): "17 compact_boundary across 235 transcripts, 7.2%"
- Attribution audit: "154 markers across 55 transcripts, 24.9%", attributing compactions
  to 8 item owners including 5 done items — and to read-only agents dispatched THIS
  session, including the attribution agent itself (claimed 20× on an item it was never
  assigned).

## The resolution — both prior counts were substring-contaminated
Structural count (marker = top-level JSON field: `type=='system' && subtype=='compact_boundary'`
or `type=='compact_boundary'`; json.loads per line, no grep):

- **files scanned: 222; TRUE structural records: 5, in exactly 1 file; unparseable lines: 0**
- files containing the SUBSTRING anywhere: 56 → 55 files' worth of contamination.
  Transcripts of agents that GREP for compact_boundary contain the literal string in
  their command/output records; every successive audit that searches for compaction
  inflates the next audit's substring count (17 → 154 within hours as more searchers ran).

## The 1 genuinely compacted transcript
`158c975b-9fe7-45cb-8194-1417b6133168.jsonl` — a **SESSION-ROOT transcript, not a
subagent**: the remediation-era main session started 2026-07-26T21:30Z ("The program is
halted for remediation…"). 5 compactions, preTokens 165501–166568 (~166k each, consistent
with a long-running main session). preTokens IS present on true structural records —
its "absence" in the attribution report is further proof that report matched prose, not
markers.

## Consequences
1. **Zero subagent item-owners have ever compacted. No tier raises. No owner_compacted
   events. No reopens.** The attribution report's list (ROOT.1.1.1, ROOT.1.2, ROOT.1.2.3,
   ROOT.1.7, ROOT.7.2, ROOT.1.8) is entirely contamination — those transcripts are this
   session's own auditors/readers whose dispatch prompts and grep output contain both the
   item IDs and the search string. Its "ROOT.1.3.2 non-existent item" lead dissolves the
   same way (an agent transcript MENTIONING an ID is not work on it).
2. The 7.2%-and-rising compaction-rate concern is retired: true subagent compaction rate
   to date is 0%. The remediation main session's 5 compactions are a known main-session
   pattern (director-scale context), already mitigated by rotation policy.
3. **Check 11 procedure is defective as written** (grep for compact_boundary). Amended:
   the auditor must run `structural-count.py` and never substring-scan. This is the same
   existence-vs-content defect class the owner flagged for checks 1–15, manifesting as
   substring-vs-structure.
4. dream-verifier's inconclusive return was CORRECT behavior: it refused to hand-roll a
   check it could not run under its write-scope constraints instead of substituting a
   weaker one. The escalation path for parse-requiring checks on restricted roles is a
   reproducible script under .program/audits/ run by the director — pattern now
   established (scan-globs.py, sweep.py, structural-count.py).
