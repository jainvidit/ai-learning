# Capability: Dashboard & Wayfinding

The hero dashboard, next-best-action, metro map, progress-aware sidebar, breadcrumbs, and quiet stats. Target: position, next step, and why-it-matters within 5 seconds of return.

**Depends on:** `event-log-and-projections.md` (ResumePosition, ReviewQueue, Streak — LANE-DEPENDENCIES block 1), `data-layer-and-offline.md` (reactive <100ms reads), `content-pipeline.md` (curriculum DAG + metro-map layout hints in the bundle), `mastery-model.md` (module/skill states for display), `frontend-platform.md` (tokens, motion).
**Depended on by:** `boss-and-test-out.md` ("Prove it" popover lives on map/module surfaces), `workshop-and-artifacts.md` (shelf teaser on hero).
**Contract owner:** Nova (UX); Atlas owns the bundle's layout data; layout computed from (col,lane) math, not hand-placed (LANE-DEPENDENCIES "Metro-map layout data" row).

---

## REQ-DW-01: Hero dashboard with next-best-action {#req-dw-01}

The dashboard hero answers "where am I, what's next, what's due?" in one glance: welcome-back resume chip ("you left off in <lesson> (Lesson n/m) ▶ Continue (~X min left)"), warm-up card with capped due count, streak with grace-day framing, artifact-shelf teaser. Next-best-action priority: resume in-progress beat → review warm-up if due → next lesson → frontier choice → mastery refresh.

**Source:** DREAM-BLUEPRINT.md §1, §5 "Key screens", "Daily return"; UX-REVIEW-NOVA.md §2 "Next-best-action hero", §4 item 1, §5 P0-2; GLOSSARY.md "Next-best-action hero".
**Current state (docs/origin/CURRENT-STATE.md):** `src/app/page.tsx` REPLACED (card grid → hero + metro map); the 14-module visibility requirement survives in new form. Fixes Nova §1 problems 1–2 [AUDITED].

**Scenarios:**
1. Given a learner with an in-progress lesson, when the dashboard loads, then the primary CTA is resume-to-beat for that lesson with lesson position and remaining-minutes estimate.
2. Given no in-progress lesson but due reviews, when the dashboard loads, then the primary CTA is the warm-up.
3. Given no in-progress lesson and no due reviews, when the dashboard loads, then the primary CTA is the next frontier lesson (or the frontier choice when the DAG genuinely forks).
4. Given the hero's reads, when profiled, then they are reactive local queries meeting the <100ms contract (data-layer REQ-DL-01).

## REQ-DW-02: Metro map — earned color, live edges, list-view parity {#req-dw-02}

The metro map renders the 14-module curriculum DAG from the compiled content graph + LearnerState overlay in one reactive query: three horizontal lanes in track colors (sky=fundamentals, emerald=prompting, violet=claude-code), column = DAG depth (computed), DOM-button nodes on a CSS grid + one `aria-hidden` SVG edge underlay, gutter-routed elbows. Satisfied prerequisite edges "go live" in track color; locked nodes are small/dashed/colorless — color is earned; Available frontier nodes are enlarged with a Start / "Prove it" popover; boss stations marked. Contrast: sky/emerald-600+ rings, 700 text in light; violet-400 in dark; every state = glyph + label, never color alone. A list-view toggle has full action parity (SR/keyboard first-class). The map replaces the dashboard grid as visualization while hero/cards stay primary navigation (full skill-tree-as-navigation was REJECTED).

**Source:** DREAM-BLUEPRINT.md §5 "Key screens"; UX-REVIEW-NOVA.md §4 item 3, §5 P1-6; REJECTED.md "Full skill-tree replacing the dashboard"; GLOSSARY.md "Metro map".
**Current state:** replaces today's wall-of-locked-cards dashboard (Nova §1 problem 1); the day-one-full-map visibility survives in map form ("Spec'd modules show greyed 'coming soon'" softened into the horizon view per Sage §3#4).

**Scenarios:**
1. Given the compiled DAG, when the map renders, then node positions derive from computed (column=depth, lane=track) math — no hand-placed coordinates.
2. Given a module whose prerequisites just completed, when the map updates, then its incoming edges render "live" in track color and the node enlarges with Start/"Prove it" actions.
3. Given a locked module, when rendered, then it is small, dashed, and colorless, with its state conveyed by glyph + label (not color alone).
4. Given the list view, when toggled, then every action available on the map (open, Start, Prove it) is available and keyboard/SR operable.
5. Given map reads, when traced, then one reactive query supplies the DAG + learner overlay.

## REQ-DW-03: Progress-aware sidebar and breadcrumbs {#req-dw-03}

Sidebar: Continue card under the profile header; Review Queue entry (badge); Workshop entry (live-session pulse); collapsible track groups with per-module state icons; active module expands to its lesson list. Breadcrumbs: `Map › <track> › <module> › Lesson n of m`. The sidebar scrolls independently of the page (owner [HARD] #28) and shows the active profile (owner [HARD] #26).

**Source:** UX-REVIEW-NOVA.md §4 items 2 & 4, §5 P1-7; CONSTRAINTS.md #26, #28.
**Current state:** `Sidebar.tsx` REPLACED (→ progress-aware NavList; active-profile display and ThemeToggle placement survive into the replacement); fixes Nova §1 problem 4 (static wayfinding, dead `href="#"` links).

**Scenarios:**
1. Given any module in the sidebar, when rendered, then it shows a per-module state icon, and the active module is expanded to its lessons with per-lesson state.
2. Given a locked module in the sidebar, when rendered, then it is not a dead link styled as a live one (locked state is explicit, not `href="#"`).
3. Given long page content, when the page scrolls, then the sidebar scroll position is independent (owner [HARD] #28) and the active profile remains visible (owner [HARD] #26).
4. Given a lesson page, when breadcrumbs render, then they show map › track › module › "Lesson n of m".

## REQ-DW-04: Quiet intrinsic stats {#req-dw-04}

"Your week": minutes, reviews done, mastery deltas — competence feedback with no comparisons, no quotas. Estimated-time chips (`minutes` frontmatter) surface everywhere a start decision happens (module page, hero, map popovers).

**Source:** UX-REVIEW-NOVA.md §2 "Quiet intrinsic stats", "Estimated-time chips"; §1 problem 10 [AUDITED] (frontmatter underused).
**Current state:** module page MODIFIED (gains time chips, resume emphasis, completion states); profiles page MODIFIED (per-track completion replaces the discouraging global % — Nova §1 problem 11, and "Active" badge survives per CONSTRAINTS.md #26).

**Scenarios:**
1. Given the stats surface, when rendered, then it shows the learner's own minutes/reviews/mastery deltas and contains no comparison to any other person and no quota framing.
2. Given any surface where a learner decides to start a lesson/module, when rendered, then an estimated-minutes chip is present.
3. Given the profile picker, when rendered, then completion shows per-track (not a single global %) and the active profile carries an "Active" badge.

## REQ-DW-05: First-run — no form, no lecture {#req-dw-05}

First run: pick a profile, land in module 1 lesson 1 within seconds; the first quiz pass triggers the first (small) celebration — establishing that celebrations are earned, server-confirmed events. (First-run *cosmetic* refinement remains deferred — OPEN-QUESTIONS.md #12.)

**Source:** DREAM-BLUEPRINT.md §5 "The moments that matter — First-run".
**Current state (docs/origin/CURRENT-STATE.md):** partially true today (picker-first flow exists); the celebration moment is new.

**Scenarios:**
1. Given a brand-new install, when the learner picks a profile, then they can be inside module 1 lesson 1 with no intervening form, survey, or lecture screen.
2. Given the learner's first quiz pass, when the server confirms it, then a small celebration fires — and no celebration of any kind fired before that first server-confirmed event.
