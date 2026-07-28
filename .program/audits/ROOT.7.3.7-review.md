# ROOT.7.3.7 review — ADR-0025 (REQ-EX-01 s3 no-driver-branching ratification)

Reviewer: dream-reviewer-primary, FRESH instance, blind. Date: 2026-07-28.
VERDICT: **request_changes**, confidence **high**.

PROVENANCE: reviewer's write of this doc DENIED by the path guard (rejected
`.program/audits/ROOT.7.3.7-review.md` and a -verification/ dir) — the FOURTH in-allowlist
denial. Verdict transcribed VERBATIM by director-gen43 from the bounded return; flagged to
the running auditor (hook-parser diagnosis already commissioned).

## Baseline reproduction

**FAILED AS WRITTEN.** ADR's rg command exits 2: `rg: unrecognized file type: tsx`
(rg 14.1.1; `ts` already covers .cts/.mts/.ts/.tsx, there is no `tsx` type). The recorded
"PASS (zero hits)" cannot have come from the recorded command. Dropping `--type tsx`:
zero hits over src/ — claim reproduces only after repairing the command.

## Findings

1. **BLOCKING** — Procedure is not executable as recorded, so the baseline is
   unverifiable and the pattern is not reusable by ROOT.4.5. Needs: corrected command
   plus pasted terminal transcript showing exit code and hit count.
2. **BLOCKING** — Pattern misses whole branching mechanisms. 10 synthetic branches fed to
   the regex; 9 escaped: `driver === "cloud"` (quoted literal — arm 2 only matches bare
   `Local|Cloud` identifiers), `d.kind`/`driverKind` (non-`driver.` receiver),
   `constructor.name`, `"sandboxToken" in driver` duck-typing, `config.executionMode`,
   `process.env.NEXT_PUBLIC_EDITION` (hosted-edition REQ-HE-01 s1 puts edition deltas in
   *configuration*), `switch (activeDriver.name)`, ternary dynamic `import()`. Only
   `driver.type` matched. Needs: extended pattern plus a negative-control run proving
   each mechanism is caught.
3. **BLOCKING** — Factory exception unbounded: `factory.ts (or equivalent)` (path absent
   today) + "a file MAY branch if its sole purpose is driver selection" is self-declared,
   unlike ADR-0028's named file/line + exception recording. Needs: single named
   file+symbol, or PARK the exception until ROOT.4.5 names it.
4. **MAJOR** — Zero-hits PASS is vacuous today: no ExecutionDriver exists, so absence of
   the abstraction and correct implementation both PASS. Combined with "one-time
   ratification, not a recurring gate", the check silently expires as drivers grow.
   Needs: a named gate/acceptance owner for the re-run.
5. **PASS** — acceptance criterion 2 (no-edit ruling): explicit "No shard edit required"
   section present and reasoned.
