# Handoff: ROOT.1.1 gen0 -> gen1 (coordinator)

**Written:** 2026-07-25, at ~35–40% context per role rule. Nothing is failing; this is a
planned handoff mid-chain.

## State (verify against item files — they are current)

- ROOT.1.1 `in_progress`, gen now 1. Children serial chain 1.1.1 -> 1.1.2 -> 1.1.3 -> 1.1.4.
- **ROOT.1.1.1 DONE** (Velite swap + interim renderer). Gen1 after an environmental
  toolchain-denial block (now resolved; npm works — verify `npm --version` before any
  dispatch anyway). Integrated into MAIN checkout; evidence
  `.program/audits/ROOT.1.1.1-verification/main-*.txt`. Tier-2 pair approved.
- **ROOT.1.1.2 DONE** (beat compiler). Built in main; evidence
  `.program/audits/ROOT.1.1.2-verification/`. Tier-2 pair approved. 65/65 tests.
- **ROOT.1.1.3 NOT DISPATCHED** (itemRevision hashing + migration maps; tier 1,
  spec-conformance lens only). Item file is dispatch-ready; exports signature is FIXED
  in its body — do not let the implementer redesign it (1.1.4 consumes it).
- **ROOT.1.1.4 NOT DISPATCHED** (bundle emitter + static route; tier 2 pair). Dispatch
  ONLY after 1.1.3 closes. EXTRA INPUT it must receive: the emitter must invoke the
  beat compile + assertValidBeats path during the build so duplicate-key/persistent
  violations fail `npm run build`, not just `npm test` (reviewer finding, recorded in
  ROOT.1.1.md AC-2 log entry). 1.1.4 touches package.json — it is the ONLY remaining
  package.json writer in this subtree; ROOT.1.1 still writes FIRST in the Phase-0 chain
  (1.1 -> 1.6 -> 1.3 -> 1.5), so close 1.1.4 before signaling ROOT.1.1 done.

## Decisions a successor must NOT silently revisit (ADR links)

- ADR-0009: Velite migration proceeds despite next-mdx-remote being unarchived. Binding.
- ADR-0011 (written by gen0): beatId derivation (ex:/prose: keys), segmentation
  (Exercise anchors + h2), duplicate-key = failure, NO widget beats yet, itemRevision as
  SIDECAR not a Beat field, content-hash bundle version. 1.1.2 implemented exactly this.
- OQ #10 tiebreak: NOT FIRED — ruled workable, logged events 15:30:01. Do not reopen
  unless new DX evidence emerges in 1.1.4.
- pnpm-overrides isolation for Velite: consciously deferred (events 16:30:01 — npm repo
  per ADR-0008; single zod 4.4.3 in lockfile). Revisit only if a velite bump brings a
  second zod.
- Playground/persistent streaming-beat question: arbitrated NARROW (terminal-only),
  routed to steward via ROOT.7.1 field_request (events 17:40:01/17:40:03). If the
  steward rules wide, the fix is one entry in PERSISTENT_BEAT_TYPES (src/lib/beats.ts)
  + rebuild; no beatId churn. Do not widen without the steward.
- Attempt accounting: 1.1.1's gen0 block was environmental — the two-attempt escalation
  rule was NOT spent on it (ruling in events 14:12:00/15:00:01).

## Risk register / uncertainties

- 13 high-severity npm advisories in Velite's subtree — accepted eyes-open per
  REQ-CP-01/ADR-0009; `npm audit fix` deliberately not run. Leave it.
- Whole-repo `npm run lint` exits 1 on 4 pre-existing errors in files owned elsewhere,
  and lints sibling `.claude/**` worktrees (eslint.config.mjs lacks the ignore). Both
  routed to steward (ROOT.7.1 field_request 15:30:00). Use per-file eslint for evidence.
- RF-02/RF-11: DOM proven identical; prop-shape change (code?/mdx deprecated) reported
  to ROOT.7.1. Nothing further owed unless steward asks.
- Calibration goldens don't exist yet in the corpus — 1.1.4's criterion allows an
  empty-but-structured goldens section recorded as a deviation. Expect the reviewer to
  poke this; it's pre-authorized in the item file.
- Stale gen0 worktrees may linger (.claude/worktrees/agent-ad9cdcfddc53d1dfc etc.) —
  read-only history; do not build in them, always verify in the MAIN checkout.

## Closing procedure reminder (after 1.1.4)

Assembly review against the WHOLE shard slice (CP-01/02/04/05): does the assembled
pipeline satisfy it end-to-end — build compiles MDX, emits beats, hashes revisions,
publishes an immutable versioned bundle a route can serve? Then check the coupling #27
carry-over record + RF note are in ROOT.1.1.md verification (they are), update
views/ROOT.1.1.md, set ROOT.1.1 done, and return the depth-1 JSON to the director.
The interim renderer intentionally does NOT consume beats — that is ROOT.4.2's job;
absence of a beat-consuming UI is NOT an assembly gap (CP-02 requires compilation, not
rendering).

## Why this decomposition (recap)

Four leaves matching CP-01/02/05/04 one-to-one; serialized to kill file overlap
(content.ts: 1&2; package.json: 1&4). Rejected: mega-leaf (size/shard-count), separate
interim-renderer leaf (phantom ownership — build can't pass between swap and renderer),
parallel 3&4 (consumption coupling). Full record in ROOT.1.1.md body.
