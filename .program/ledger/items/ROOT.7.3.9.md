---
id: ROOT.7.3.9
parent: ROOT.7.3
type: Decision
title: Enumerate REQ-WA-01 s4 "all learner-facing Workshop UI" — Workshop surface domain (ADR-0027)
ledger_depth: 3
status: changes_requested
owner_agent: UNASSIGNED — gen1 fix dispatch is a gen44 action (dream-implementer-standard)
spawned_at: 2026-07-28T00:35:00Z
generation: 1
review_findings_gen0: "request_changes/high — full text .program/audits/reviewer-ROOT.7.3.9-review.md (guard forced reviewer- prefix). Exhaustiveness PASS (12 candidates, 7 enumerated + 5 ruled out; restore UI assigned to surface 3). MAJOR F1: 18-term grep word list omits repo/repository while surface 2's own obligation names 'Repo' a violation — a 'Repo' label PASSES the canonical procedure while FAILING the prose; also missing dirty/staged/unstaged/worktree/blame/bisect/detached; extend the list or rule it illustrative against ADR-0028. MAJOR F3: workshop-operation error/failure surfaces neither enumerated nor excluded while audit 4 permits raw passthrough — add an 8th surface (never render raw git stderr) or an explicit exclusion. MINOR F4: artifact_verified exists in no shard (ADR-0023 + event-log name only artifact_created); F5/F6 s1→s3 miscite + banner copy attributed to wrong surface. Additivity PASS within reviewer limits; director byte-diff still owed at close."
spec_refs:
  - .program/spec/workshop-and-artifacts.md#req-wa-01
acceptance_criteria:
  - ADR-0027 ratified — learner-facing Workshop UI surfaces enumerated closed-world (unnamed/future surfaces join via additive ADR); the s4 obligation testable per surface
  - workshop-and-artifacts.md amended additively so s4 quantifies over the enumerated surfaces
depends_on: []
blocks: [ROOT.5.1]
children: []
file_ownership: [".program/decisions/ADR-0027.md", ".program/spec/workshop-and-artifacts.md"]
review: {tier: 1, required_lenses: [spec-conformance], verdicts: []}
verification:
  - criterion: "ADR-0027 ratified — learner-facing Workshop UI surfaces enumerated closed-world (unnamed/future surfaces join via additive ADR); the s4 obligation testable per surface"
    method: "Corpus read: workshop-and-artifacts.md full (5 reqs), terminal-experience.md, dashboard-and-wayfinding.md, lesson-experience.md, frontend-platform.md, execution-layer.md (Workshop dependencies), CONSTRAINTS.md, REJECTED.md; grep .program/spec/ for workshop/artifact/shelf/restore/repair/regression language. Enumerated seven learner-facing surfaces with per-surface falsifiable s4 obligation (five-audit template: text/control/state/path/celebration copy for git-terminology absence). Closed-world rule: unenumerated surfaces out-of-domain until additive ADR. Consistency check: terminal-experience co-ownership (Workshop dock tab, session activity not git state), dashboard-and-wayfinding co-ownership (shelf teaser, health badges not git state), lesson-experience boundary (generic navigation not Workshop-specific), frontend-platform celebration policy (ADR-0023 row 6), execution-layer scoping (plumbing not UI), CONSTRAINTS/REJECTED (no contradictions). Precedents followed: ADR-0017 pattern (enumerate domain + closed-world + relaxation path), ADR-0019 per-endpoint falsifiable template, ADR-0028 grep-based text audit. Falsifiability bar met: every s4 obligation checkable by named five-audit procedure per surface; universal 'all UI' now bounded to seven enumerated surfaces."
    evidence: ".program/decisions/ADR-0027.md"
  - criterion: "workshop-and-artifacts.md amended additively so s4 quantifies over the enumerated surfaces"
    method: "REQ-WA-01 s4 amended: inserted domain clause '(domain: ADR-0027 enumerates seven surfaces — workshop exercise beats, workshop dock tab, artifact shelf page, shelf teaser on dashboard, regression repair session, regression banner, artifact-created celebration; closed-world, future surfaces join via additive ADR), when audited per the five-audit template (text/control/state/path/celebration copy)' before 'then no git terminology or raw git operations are exposed.' ADDITIVE ONLY — no deletion or rewording of existing scenario text outside the domain clause insertion."
    evidence: ".program/spec/workshop-and-artifacts.md lines 22 (s4 domain clause)"
artifacts: [".program/decisions/ADR-0027.md"]
resume_hint: "Both acceptance criteria satisfied. ADR-0027 ratified (seven surfaces enumerated closed-world, per-surface five-audit template, consistency checks green). Shard amended additively (s4 domain clause inserted). Set status in_review."
---
