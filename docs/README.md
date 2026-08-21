# Project Documentation

All project documents live under `docs/` in this repository — nowhere else.

## Index

| Document | Path | What it is |
|---|---|---|
| Dream Blueprint | `docs/DREAM-BLUEPRINT.md` | The five-lane (Atlas/Nova/Sage/Ramesh/Priya) target architecture, learning engine, experience layer, tech radar, and joint decisions log |
| Initial Build Plan | `docs/INITIAL-BUILD-PLAN.md` | The approved plan the current app was built from |
| UX Review | `docs/design/UX-REVIEW-NOVA.md` | Heuristic audit + P0/P1/P2 experience redesign (Nova) |
| Learning Design Review | `docs/design/LEARNING-DESIGN-REVIEW-SAGE.md` | Learning-science + game-design audit, five ranked structural changes (Sage) |
| Rejected Alternatives | `docs/origin/REJECTED.md` | Every alternative considered and not taken, with reasons — do not re-propose without new evidence |
| Constraints | `docs/origin/CONSTRAINTS.md` | Everything the owner stated as requirement/preference/non-negotiable, hard vs. preference |
| Assumptions | `docs/origin/ASSUMPTIONS.md` | What was treated as true without verification; deferred/out-of-scope; flagged inferences |
| Glossary | `docs/origin/GLOSSARY.md` | Every project-coined term with its settled meaning |
| Uncertainty Register | `docs/origin/UNCERTAIN.md` | Recall-confidence notes; compaction boundary; reconstructed vs. recalled |
| Lane Dependencies | `docs/origin/LANE-DEPENDENCIES.md` | Cross-lane blocking order and shared contracts — file-ownership boundaries for parallel agents |
| Current State | `docs/origin/CURRENT-STATE.md` | Per app part: survives / modified / replaced / deleted, with provenance |
| Authoring Guide | `specs/AUTHORING-GUIDE.md` | The content authoring contract for module-builder agents |
| Module Specs | `specs/module-02.md` … `specs/module-14.md` | Self-contained blueprints for the 13 unbuilt modules |

## Conventions

- **Sanctioned document locations: `docs/` and `.program/`.** Every project document —
  plans, reviews, ADRs, reports, ledgers — is written under one of these two roots,
  never elsewhere in the repo and never outside it. (`.program/`, if/when it exists,
  holds the program ledger and role definitions and must be versioned.)
- **`docs/origin/` is append-only and never overwritten.** These files are the recovery
  record of the project's reasoning. Corrections are added as dated addenda at the end
  of the relevant file, or as new files — existing content is not edited or deleted.
- Historical note: an `openspec/` change-management root and project-level `.claude/`
  skills existed briefly and were deleted by the owner ("keep everythign in docs").
  Do not recreate them; their unique content is preserved in
  `docs/origin/CONSTRAINTS.md`.
- Any conflict between an origin-doc statement and a file in this repository or git
  history resolves in favor of the file/history — origin docs record reasoning, the
  repo records fact.
