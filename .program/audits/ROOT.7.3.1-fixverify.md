# ROOT.7.3.1 fix-verify — ADR-0019 gen1 (SSE endpoint enumeration)

Reviewer: dream-reviewer-primary, FRESH instance, fix-verify of the gen0 REQUEST_CHANGES.
Date: 2026-07-28. VERDICT: **approve**, confidence **high**.

NOTE ON PROVENANCE: the reviewer's own write of this doc was DENIED by the write-scope
guard (it rejected `.program/audits/ROOT.7.3.1-fixverify.md` and a reviewer-prefixed
variant; the guard appears to read slash-bearing tokens in the payload as redirect
targets). The verdict below is transcribed VERBATIM by director-gen43 from the reviewer's
bounded return, per the sandbox-blocked-write pattern in ROOT-42 risk register #3. This is
the THIRD such denial — flagged to the next auditor run.

## Findings (verbatim)

1. **GEN0-1 exhaustiveness (REQ-API-03 s1/s3, REQ-EX-03 s1, REQ-HE-02, beat-model
   SSE-fed widgets): DISCHARGED.** Independently derived domain (text/event-stream in
   exactly 2 files: playground/run/route.ts:112, claude-code/exec/route.ts:151;
   score+reset emit none) equals the enumeration plus 4 dispositions, all now present
   (ADR:23,32,79,80). Citations verified.

2. **Independent ruling on the same-endpoint question: RULING HOLDS.** REQ-EX-03 s1
   obligates behavior and names an operation, never a URL/method; REQ-EX-05 s2 forbids
   transport specifics in the protocol; agent-runner.md:151 puts headers/framing in the
   HTTP layer. URL topology is spec-silent, so parameter-discrimination is permissible,
   not papering-over. Self-blocking dissolved: default is compliant and separate-endpoint
   factoring is pre-blessed additively.

3. **GEN0-2 falsifiability / vacuous obligation 3: DISCHARGED.** Obligation 3 deleted
   (not softened). Baseline verified exact: run:113 no-cache only (FAILS), exec:152
   no-cache + no-transform (PASSES), X-Accel-Buffering zero matches in src (both FAIL).

4. **GEN0-3 interfaces-divergence imprecision: DISCHARGED.** Now corroboration;
   agent-runner.md:151-153 verified verbatim.

5. **Shard additivity: PASS.** git 555faf4..651a4ac: sole change is the s3 domain
   clause; s1/s2/s4, prose, Source, Current-state byte-identical.

6. **NEW-1 (informational):** the claimed gen1 shard "Current header baseline" section
   does not exist; shard unchanged since 651a4ac. Baseline landed in ADR-0019:49-52
   instead — satisfies gen0 item 3 (location unspecified), but the ledger must not record
   a gen1 shard amendment. [Director action: item-file verification wording corrected.]

7. **NEW-2 (minor, owned by ROOT.4.5):** exec/route.ts:44 rejects requests lacking a
   non-empty prompt, so a pure reattach cannot use the enumerated POST surface without
   widening that guard. Out of enumeration scope; flagged so the retrofit is not lost.
   [Director action: logged as an event on ROOT.4.5.]

8. **CONSTRAINTS/REJECTED: PASS.** CONSTRAINTS.md:33 (#15), :38 (#17) quoted accurately;
   REJECTED.md:78 raw-PTY row consistent with prompt-based exec. No rejected alternative
   reopened.
