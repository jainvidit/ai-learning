# Capability: Lesson Experience

The beat-rendered lesson page: soft-frontier pacing, per-type completion predicates, the rail, warm-up beat 0, session-end beat, celebration interstitial, exercise frames, revisit mode, and resume-to-beat.

**Depends on:** `content-pipeline.md` (beat arrays — LANE-DEPENDENCIES block 2), `frontend-platform.md` (islands, motion tokens, celebration API), `event-log-and-projections.md` (ResumePosition, beat_viewed events, server-confirmed completion events), `judge-pipeline.md` (gate verdicts before celebrations — block 5), `spaced-review.md` (warm-up items), `coach-and-hints.md` (coach margin note), `terminal-experience.md` (SandboxBeat hosts portal slots).
**Depended on by:** `curriculum-content.md` (authored beats target this renderer).
**Contract owner:** Nova (pacing ruling frozen via champion debate); Atlas owns the beat type; Ramesh implements the compiler.

---

## REQ-LX-01: Soft-frontier pacing — style, never hide; no scroll-jail {#req-lx-01}

All beats mount on load at full height. Beats past the learner's frontier are *styled* as future (~60% opacity, hollow rail nodes), never hidden; the frontier advances on 50%-viewport/2s dwell or an explicit Continue. **Completion gates the lesson, never the viewport.** Continue never gates: smooth-scroll + focus move; on an incomplete exercise beat it relabels "Skip for now" and the rail marks amber. Step-through pacing, viewport/scroll gating, and dwell-analytics-justified gates were all REJECTED (REJECTED.md — pacing ruling).

**Source:** DREAM-BLUEPRINT.md §2 "The beat model" (Nova's ruling); UX-REVIEW-NOVA.md §3 "Pacing model" (frozen); GLOSSARY.md "Frontier", "Continue".
**Current state (docs/origin/CURRENT-STATE.md):** lesson page REPLACED (single-MDX render → beat flow + rail + warm-up + session-end + interstitial; frontmatter header survives); `LessonRenderer.tsx` REPLACED → BeatRenderer.

**Scenarios:**
1. Given a lesson at first open, when rendered, then every beat is mounted at full height and beats past the frontier are dimmed but scrollable and readable — nothing is hidden or collapsed.
2. Given a future beat kept at ≥50% viewport for 2s, when dwell completes, then the frontier advances to it.
3. Given Continue on an incomplete exercise beat, when rendered, then its label is "Skip for now", clicking it moves scroll+focus onward, and the rail marks that beat amber.
4. Given an incomplete lesson, when the learner scrolls to the last beat, then nothing blocks the scroll (completion gates lesson status, not the viewport).

## REQ-LX-02: Per-type completion predicates; boss exclusion; attempted-only firewall {#req-lx-02}

Lesson completion requires: quizzes `passed`, challenges `verified`; playground and exploratory beats only `attempted`. Attempted-only completions emit **zero mastery evidence** (Sage's firewall). Boss-flagged exercises are excluded entirely: a boss counts toward nothing until passed.

**Source:** DREAM-BLUEPRINT.md §2 "The beat model", §8 aligned decision 1; UX-REVIEW-NOVA.md §3; GLOSSARY.md "Completion predicate".
**Current state:** replaces today's all-exercises-passed gate (Sage §1e's hidden all-or-nothing gate; the "continue with this unresolved after N attempts" allowance rides the guaranteed-review engine — Sage §3#1).

**Scenarios:**
1. Given a lesson with a quiz (passed), a playground (attempted, not passing), and prose, when completion is computed, then the lesson is complete.
2. Given a playground beat marked complete via `attempted` only, when mastery evidence is checked, then zero evidence was emitted for it.
3. Given a lesson containing a boss exercise, when completion is computed, then the boss's attempted/failed state contributes nothing; only a pass registers it at all (and it gates Mastered, not Complete — boss-and-test-out REQ-BT-01).

## REQ-LX-03: Persistent beats stay mounted {#req-lx-03}

Terminal/streaming beats carry `persistent: true` and stay mounted across beat transitions within the lesson — never collapsed, never `display:none`, min-height reserved (xterm `fit()` safety by construction). Instance ownership lives with the PersistentTerminalHost (terminal-experience REQ-TX-01).

**Source:** DREAM-BLUEPRINT.md §2 "The beat model — Persistent beats"; UX-REVIEW-NOVA.md §3; GLOSSARY.md "Persistent beat".
**Current state:** `Terminal.tsx` MODIFIED heavily — xterm rendering survives, ownership moves to portals.

**Scenarios:**
1. Given a running terminal beat, when the learner scrolls or advances to other beats in the lesson, then the terminal's DOM instance remains mounted with its dimensions intact.
2. Given a persistent beat, when the lesson is browsed, then it is never given `display:none` or collapsed to zero height.

## REQ-LX-04: Page anatomy — header, warm-up beat 0, rail, session-end beat {#req-lx-04}

Anatomy: breadcrumb header (title, ~minutes, objectives, exercise chips + "Jump to where you left off") → warm-up beat 0 (2–3 retrieval cards when due; skippable; "keep it fresh" framing) → prose/exercise beats with sticky progress rail (beat states done/current/upcoming/amber-skipped; doubles as jump-nav) → session-end beat (recap mapped to objectives + one retrieval question + a curiosity hook). Keyboard: j/k and Alt+↑/↓ beat nav, suppressed inside terminal/playground inputs. Reduced motion: instant jumps.

**Source:** UX-REVIEW-NOVA.md §3 "Page anatomy"; LEARNING-DESIGN-REVIEW-SAGE.md §3#4 (session beats); DREAM-BLUEPRINT.md §5 "Key screens"; GLOSSARY.md "Warm-up (beat 0)", "Session-end beat", "Rail".
**Current state:** lesson page REPLACED (see REQ-LX-01). Session-end beats are an authoring convention amendment too (curriculum-content REQ-CC-04).

**Scenarios:**
1. Given a lesson with due reviews, when opened, then beat 0 offers 2–3 retrieval cards, is skippable, and uses fresh-keeping framing (no debt copy).
2. Given a lesson with no due reviews, when opened, then no warm-up beat renders.
3. Given any lesson, when its final beat renders, then it contains an objectives-mapped recap ("you can now…"), exactly one retrieval question, and a curiosity hook.
4. Given the rail, when a beat is clicked in it, then the view jumps to that beat; skipped-exercise beats show amber.
5. Given focus inside a terminal or playground input, when j/k is typed, then no beat navigation occurs (keys pass through as text).

## REQ-LX-05: Celebration interstitial on server-confirmed completion {#req-lx-05}

The lesson-completion interstitial (checkmark bloom, objectives recap, score recap, streak tick, next-lesson CTA) fires only on the server-confirmed completion event; it is non-blocking; graded celebration ladder per frontend-platform REQ-FP-04. Gate verdicts (5–15s ensemble) show staged honest states ("Checking against the rubric…" → "Getting a second opinion…") — latency reads as rigor; verdicts are server-truth, never optimistic.

**Source:** UX-REVIEW-NOVA.md §3 "Celebration interstitial", "Coach (playground)" (staged states); DREAM-BLUEPRINT.md §5 "Completion"; LANE-DEPENDENCIES block 5.
**Current state:** replaces today's inline "Lesson complete" string (Nova §1 problem 3 — completion emotionally invisible).

**Scenarios:**
1. Given the final exercise of a lesson passing, when the server-confirmed lesson_completed event arrives, then the interstitial renders with recap + next-lesson CTA; before that event, no interstitial.
2. Given the interstitial on screen, when the learner interacts elsewhere, then it does not block interaction (dismissible/non-modal).
3. Given a gate-tier judging in progress, when the learner waits, then staged status copy reflects the actual pipeline stages and no provisional pass/fail is shown.

## REQ-LX-06: Exercise frames hydrate from stored progress {#req-lx-06}

Exercises render in a distinct ExerciseFrame (accent border, state header: Todo / In progress / Passed · best score) hydrated from stored progress — refresh never renders a passed exercise as untouched. SandboxBeat renders terminal + paired challenge as one composite frame (criteria beside the xterm; Verify stays with the challenge card and deep-links to its beat).

**Source:** UX-REVIEW-NOVA.md §3 "Exercise frames", "SandboxBeat", §1 problems 5–7 [AUDITED]; DREAM-BLUEPRINT.md §5 "Key screens"; GLOSSARY.md "ExerciseFrame", "SandboxBeat".
**Current state:** `Quiz.tsx` MODIFIED (per-question cards — owner [HARD] #29 — survive; gains initialProgress hydration, ExerciseFrame wrapper, answer-reveal policy change per curriculum-content REQ-CC-06); `Playground.tsx` MODIFIED (gains passed-state hydration); `Challenge.tsx` MODIFIED (merges visually into SandboxBeat).

**Scenarios:**
1. Given a passed quiz and a page refresh, when the lesson re-renders, then the quiz frame shows Passed with its stored best score.
2. Given a terminal exercise with a paired challenge, when rendered, then both appear in one composite frame with the criteria visible beside the terminal, and Verify lives on the challenge card.
3. Given each quiz question, when rendered, then it is wrapped in its own card (owner [HARD] #29 preserved).

## REQ-LX-07: Revisit mode and resume-to-beat {#req-lx-07}

Completed lessons open fully undimmed with the rail as jump-nav and Continue hidden (revisit mode — past lessons are living reference notes). The resume chip targets a beat ID; every beat view is a telemetry event; a dismissible "you left off here N days ago" banner appears past 48h.

**Source:** DREAM-BLUEPRINT.md §2 "The beat model" (resume chip); UX-REVIEW-NOVA.md §3 "Revisit mode", §4 breadcrumbs/banner; GLOSSARY.md "Revisit mode".
**Current state:** new; no resume affordance exists today (Nova §1 problem 2 [AUDITED]).

**Scenarios:**
1. Given a completed lesson reopened, when rendered, then no dimming applies, the rail is pure jump-nav, and Continue is absent.
2. Given a resume action from the dashboard chip, when navigation completes, then the view lands on the exact stored beat ID.
3. Given any beat entering view via one of the enumerated modes (scroll entry, rail jump navigation, resume from stored position, initial page load, Continue button navigation, keyboard navigation, or state restore after page refresh — enumerated closed-world in ADR-0024), when telemetry is checked, then a `beat_viewed` event was recorded for that beat. Event shape and idempotency policy are defined by ROOT.2.1 (Event Log and Projections); this scenario obligates only that the event is recorded per mode. The enumeration is exhaustive — unenumerated modes fall under the decidable default (emit event) until explicitly added or excluded via additive ADR.
4. Given a return after >48h, when the lesson opens, then a dismissible "you left off here N days ago" banner shows.
