# Uncertainty Register — recall confidence for the originating conversation

Anything from the originating conversation (2026-07-24) the assistant is no longer
confident it recalls accurately, written at the time of the docs/origin/ persistence pass.

## The compaction boundary

**This conversation HAS compacted.** The session ran from initial planning through the
app build, UI polish, the design reviews, and the five-lane blueprint effort — far beyond
a single context window. Everything before the most recent boundary survives as a
summary plus selected artifacts, not as verbatim transcript.

**Rule applied below and to all origin docs:** material from before the boundary is
**RECONSTRUCTED** (from summaries, saved files, git history, and agent reports), not
recalled verbatim. Material after it is **RECALLED**.

What is reconstruction-grade (pre-boundary):
- The exact phrasing of the earliest owner messages (initial request, tech-stack answers,
  the AskUserQuestion responses). The initial request's wording in CONSTRAINTS.md items
  1–2 ("build a modular learingin plan…", "explore the possiblity of executing the
  calude code commadns…") was carried through summaries and is believed verbatim, but
  cannot be re-checked against a transcript.
- The precise sequence and content of the plan-review rounds (which edits were made in
  which order; what exactly the plan file said at each stage).
- The full text of the ten Wave-1 build-agent reports (their summaries were accurate at
  the time; only the recorded conclusions survive).
- The exact live-verification transcript details (the curl outputs quoted in
  CURRENT-STATE.md's provenance are from the summary, believed accurate).
- The jest-worker investigation details beyond what ASSUMPTIONS.md #5 records.

What is recalled (post-boundary, high confidence):
- The design reviews' full texts (Nova's and Sage's final reports) — saved to
  docs/design/ from the delivered text within the recall window.
- The blueprint's full text — saved to docs/DREAM-BLUEPRINT.md from Atlas's delivery.
- All owner directives from the dream-team phase onward (non-competitive, effort-
  unconstrained, cost/security, personal-desktop, hint-ladder, naming, teams).
- The close-out reports of all five lanes.
- The deletion of openspec/ and .claude/ project skills, and the "keep everythign in
  docs" directive.

## Specific low-confidence items

1. **Owner's exact words for several mid-session UI requests.** "add a theme swticher"
   and "scroll of left nav shuold be independent of page scroll" are believed verbatim;
   the quiz-card complaint is transcribed in CONSTRAINTS.md #29 from the summary and may
   be paraphrase rather than exact.
2. **Which agent said what inside sub-team debates.** Only the pacing debate's two
   rebuttals and the Lead's ruling passed through the main conversation verbatim (they
   misrouted here). Every other sub-team's internals (Sage's SchedTeam FSRS-vs-Leitner
   bake-off, Ramesh's transport fact-checks, Priya's ensemble design iterations) are
   known ONLY through the lane leads' syntheses. Attribution to specific sub-agents in
   REJECTED.md relies on those syntheses.
3. **The exact contents of the ten Wave-1 agent prompts.** Their scope divisions are
   reconstructed from the task list and outcomes; precise prompt text is gone.
4. **The jest-worker error timeline.** Approximate: first seen after UI-polish edits,
   recurred after cache clear and restart, agent stopped mid-investigation. Exact
   timestamps and reproduction sequence are lost; the dev-log line numbers quoted at the
   time were accurate then but the log has since rotated.
5. **Numbers in early verification.** The challenge run's cost (~$0.42, 5 turns) and the
   judge's 100/100 verdict are from the recorded summary; believed accurate, not
   re-checkable.
6. **The order of the two "locally run" directives.** CONSTRAINTS.md #14/#15 records
   them as two messages (cost/security first, personal-desktop clarification second);
   this ordering is from the recall window and is confident — but the precise wording of
   the FIRST directive's subordinate clauses is summary-carried.
7. **openspec/config.yaml authorship context.** The file was recovered from git
   (verbatim, high confidence). What is less certain is whether the owner ever READ it
   before deleting the folder — the deletion message suggests the folder was removed
   wholesale, so the config's rules should be treated as assistant-authored conventions,
   not owner-ratified ones.
8. **Module-spec fidelity.** The specs were spot-checked at delivery, but the assistant
   cannot now enumerate the full lesson/exercise inventory of every spec from memory —
   the files themselves (specs/module-02..14.md) are the authority, not any statement
   about them in the origin docs.
9. **Whether every [TEAM] tag in the saved design reviews is accurate.** The reviews were
   saved as delivered; their internal claims of cross-lane agreement were consistent with
   the close-out reports at the time but were not independently re-verified line-by-line.
10. **The user's git-setup instruction (".program/", "ledger", "role definitions").**
    Received within the recall window — but its intent is genuinely uncertain: it
    described a package "not under version control yet" while this repo already had
    commits, and referenced structures (.program/ ledger, role definitions in .claude/)
    that have never existed in this project. Possibly a template message aimed at a
    different repository. Recorded as an open question, not acted on beyond the README
    convention edit it demanded.

## Standing correction

Any conflict between an origin-doc statement and (a) a file in this repository or
(b) git history should be resolved in favor of the file/history. The origin docs record
reasoning; the repo records fact.
