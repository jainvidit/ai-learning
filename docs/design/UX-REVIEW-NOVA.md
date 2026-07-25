# UX Review & Redesign Proposal — AI Mastery Learning App

**Reviewer:** Nova (UX lane of the dream-team blueprint effort). Review only; no files were modified.
Grounded in the actual repo; redesign is blue-sky (ranked by learning-experience impact, not effort).
Decisions marked **[TEAM]** were negotiated and frozen with the learning-science lane (Sage), architecture (Atlas), engineering (Ramesh), and AI-reliability (Priya) — consistent with docs/DREAM-BLUEPRINT.md.

**Provenance legend** (per section, added post-hoc for the recovery record):
**[AUDITED]** = checked against this repo's actual code/content at review time (file-referenced facts an implementer can re-verify).
**[OBSERVED-LIVE]** = additionally exercised against the running app (see docs/origin/CURRENT-STATE.md baseline).
**[REASONED]** = design proposal derived from the review + blueprint — a hypothesis about what should exist, NOT checked against current code; may already be wrong about it.

---

## 1. Heuristic audit — what's actually there
*Provenance: **[AUDITED]** — every numbered problem cites the file it was found in; re-verify against current code before acting, as the app has received commits since.*

**Genuine strengths to preserve:** real interactive exercises are exceptional for a local app — a real Claude Code terminal (`src/components/lesson/Terminal.tsx`), LLM-judged playground with per-criterion ✅/❌ rubric feedback (`Playground.tsx`), teaching explanations on every quiz answer (`Quiz.tsx`), progressive hints on challenges (`Challenge.tsx`), and honest, well-written lesson prose (`01-what-is-an-llm/lesson.mdx` is genuinely good pedagogy). The gating model (`src/lib/content.ts`) is sound. Keep all of it.

**Problems, with receipts:**

1. **The dashboard is a wall of locked content.** `src/app/page.tsx` renders all 14 modules as equal-sized cards; 13 are `opacity-50` + "Coming soon — being built." A brand-new learner's first impression is 93% disabled UI. No "continue where you left off," no progress on the built module's card, no indication of what to do first.
2. **No resume affordance anywhere.** Progress stores `startedAt`/`completedAt` per lesson but no current position. A learner returning after 5 days must remember which module → click it → scan for the first non-checked lesson → scroll to find where they were.
3. **Completion is emotionally invisible.** When the final exercise passes, the entire reward is an inline string: "Lesson complete — the next one is unlocked" (`Quiz.tsx`, `Challenge.tsx`; the terminal writes it into the xterm buffer). No summary, no score recap, no next-lesson CTA, no moment.
4. **The sidebar is static wayfinding.** No checkmarks, no current-module indicator, no lesson-level state. Locked modules render as dead `href="#"` links.
5. **Lesson pages are undifferentiated long scrolls.** No within-lesson progress, no exercise inventory. Exercise state lives only in each card's local `useState` — refresh and a passed quiz renders as untouched (progress is on disk but the UI never reads it back).
6. **Weak visual hierarchy between prose and exercises.** Exercises use the same `Card` primitive as everything else, distinguished by emoji (📝🧪🏆).
7. **The terminal↔challenge relationship is explained in prose, not design.** "Do the work in the Terminal exercise panel above" — a load-bearing spatial relationship communicated by a footnote.
8. **Terminal sessions die with the tab.** `Terminal.tsx` aborts the in-flight run on unmount; navigate away mid-run and the flagship exercise is killed. No reattachment.
9. **Zero retention mechanics.** No streak, no daily goal, no review of past misses — quiz misses are recorded then never used again.
10. **Frontmatter is underused.** `minutes` and `objectives` render on lessons but nowhere else — the learner can't budget a session from the module page.
11. **Minor:** `04-hallucination/lesson.mdx` opens with an `# h1` duplicating the page title; body font is Arial via `globals.css` despite Geist being loaded; profiles page shows a discouraging global "% complete."

---

## 2. Motivation & engagement system
*Provenance: **[REASONED]** — design proposal; nothing in this section exists in the current app.*

Design stance for a solo, non-competitive, intrinsically-motivated adult: **progress-visibility + retrieval practice + earned celebration**, not points economies. **[TEAM]** rejected: XP/levels, leaderboards/social, bronze/silver/gold badges.

**Adopted set:**

| Mechanic | Job | Design |
|---|---|---|
| **Next-best-action hero** | Removes decision cost at session start | Priority: resume in-progress beat → review warm-up if due → next lesson → frontier choice → mastery refresh |
| **Metro-map curriculum** | Makes the journey and the *why* of locks visible | §4 |
| **Spaced review queue** | Fights forgetting across a months-long course | FSRS-style scheduling **[TEAM: Sage]**; warm-up beat at lesson start; "keep it fresh" framing; due chip capped "9+"; lapse → "5-minute warm-up," never the backlog |
| **Streak + gentle daily goal** | Habit formation, honestly | Local-timezone days, streak-freeze grace, invitational copy |
| **Mastery states** | Gives completion a horizon beyond "done" | Per-skill **Introduced → Practiced → Fluent** (decay surfaces as "worth a refresh"); per-module **Locked → Available → In progress → Complete → Mastered** **[TEAM]** |
| **Celebration interstitial** | The missing completion moment | §3 |
| **Estimated-time chips** | Session planning | `minutes` frontmatter, surfaced everywhere a start decision happens |
| **"Prove it" test-out** | Autonomy for an accelerating learner | Success renders identical Complete treatment — no "skipped" stigma **[TEAM]** |
| **Quiet intrinsic stats** | Competence feedback | "Your week": minutes, reviews, mastery deltas. No comparisons |

---

## 3. Lesson experience redesign
*Provenance: **[REASONED]** — proposal. The claims it makes about current behavior (single-MDX rendering, abort-on-unmount, local-useState exercise state) were **[AUDITED]** in §1; the beat/rail/frontier design itself is unbuilt hypothesis.*

**Content model:** lessons compile from MDX into an ordered array of addressable **beats** (`prose | interactive | exercise | recap`, stable ids, per-beat `persistent: boolean` for terminal/streaming beats) **[TEAM: frozen]**.

**Pacing model (adjudicated by champion debate; ruling frozen): free scroll + rail with a soft frontier.**
- All beats mount on load at full height; persistent beats never collapsed/hidden/unmounted until route exit (min-height reserved — xterm `fit()` safety by construction).
- The frontier **styles, never hides**: beats beyond the furthest-reached point render at ~60% opacity with hollow rail nodes; 50%-viewport/2s dwell or Continue promotes them.
- **Continue never gates**: smooth-scroll + focus move; on an incomplete exercise beat it relabels "Skip for now" and the rail marks amber.
- **Completion gates the lesson, not the viewport**: quizzes *passed*, challenges *verified*; exploratory interactives require only *attempted* (gating is undefinable for "play a few rounds" widgets).
- **Revisit mode**: completed lessons open fully undimmed, rail = jump-nav, Continue hidden.
- Keyboard: j/k and Alt+↑/↓ beat nav (suppressed inside terminal/playground inputs). Reduced motion: instant jumps.

**Page anatomy:** breadcrumb header (title, ~minutes, objectives, exercise chips + "Jump to where you left off") → warm-up beat 0 (2–3 retrieval cards when due) → prose/exercise beats with sticky progress rail → session-end beat (recap · 1 retrieval question · "next time you'll…") → celebration interstitial on server-confirmed completion only.

- **Exercise frames**: distinct treatment — indigo left-accent border, state header (Todo / In progress / Passed · best score), hydrated from stored progress.
- **SandboxBeat**: terminal + paired challenge as one composite frame (criteria beside the xterm) — the shared sandbox made spatial.
- **Coach (playground)**: on-demand "Get a hint on my draft" — margin-note treatment, labeled **"Coach — not your grade"**, rubric-mapped observations phrased as questions, schema-level guarantee it can never show a score **[TEAM: Priya]**. Gate verdicts (ensemble judging, 5–15s) show staged honest states: "Checking against the rubric…" → "Getting a second opinion…" — latency reads as rigor. Verdicts server-truth, never optimistic.
- **Struggle/rescue**: attempts > N, repeated same-criterion misses, dwell ≫ estimate surface the coach; 3rd challenge failure auto-unlocks the next hint. Final tutor rung = "Guide me through it": an indigo mode-change with stepped full-method reveal, "Guided" evidence tag with no penalty language, "Try it yourself now" exit.
- **Celebration interstitial**: checkmark bloom, objectives recap as "you can now…", score recap, streak tick, next-lesson CTA. Non-blocking; confetti max once per event; `prefers-reduced-motion` → static.

**Motion system [TEAM: Nova+Ramesh]:** one library (Motion) + one confetti primitive; motion tokens own durations/easings/springs *and* reduced-motion. Micro 120–180ms → meso 250–400ms spring → macro 600–900ms (lesson/module/mastery/streak milestones only). Route transitions = View Transitions; in-page = Motion; never both on one element.

---

## 4. Wayfinding — the return-after-5-days test
*Provenance: **[REASONED]** — proposal; the "today" failure description is **[AUDITED]** §1 material.*

Target: **position, next step, and why-it-matters within 5 seconds.**

1. **Dashboard hero**: "Welcome back — you left off in *Step-by-Step Thinking* (Lesson 3/6). ▶ Continue (~7 min left)" + warm-up option when reviews are due + streak/stats row.
2. **Sidebar**: Continue card under the profile header; Review Queue (badge); Workshop entry (live-session pulse); collapsible track groups with per-module state icons; active module expands to its lesson list.
3. **Metro map** (dashboard + `/map`): three horizontal lanes in track colors (sky/emerald/violet), column = DAG depth (computed); DOM-button nodes on a CSS grid + one `aria-hidden` SVG edge underlay; gutter-routed elbows; satisfied prereq edges "go live" in track color; locked nodes small/dashed/colorless — color is earned; Available frontier nodes enlarged with Start / **Prove it** popover; **list-view toggle with full action parity** (SR/keyboard first-class). Contrast: sky/emerald-600+ rings, 700 text in light; violet-400 in dark; every state = glyph + label, never color alone.
4. **Breadcrumbs**: `Map › Prompting › 04 Core Prompt Engineering › Lesson 3 of 6` + dismissible "you left off here N days ago" banner past 48h.

**Terminal dock**: sessions owned by a root-level `PersistentTerminalHost` (portals into lesson slots or a bottom-docked, tabbed panel), server-held with a transport-agnostic reattach contract — `attach(sessionId, fromSeq)` → ordered replay + live tail; scrollback restores via `@xterm/addon-serialize`. **[TEAM]**: local execution is the default (the pedagogy is "this is the real tool on your machine").

---

## 5. Redesign spec — prioritized by learning impact
*Provenance: **[REASONED]** — implementation plan; file paths named for NEW components are intended locations, not existing files. Verify the named existing files still match §1's description before modifying.*

### P0 — the core loop (orientation → session → consolidation)
1. **Learner-state projection + resume position** — event-sourced progress (append-only events, projections for mastery/review/streak/resume); one query feeds hero, sidebar, map. New `src/lib/events.ts`, `src/lib/projections.ts`.
2. **Next-best-action hero + welcome-back logic** — rewrite `src/app/page.tsx`; new `NextBestAction.tsx`.
3. **Beat model + progress rail + soft-frontier pacing + resume-to-beat** — beat compiler in the content pipeline; `BeatRail.tsx`; per-beat completion predicates; exercise cards hydrate from stored progress.
4. **Celebration interstitial + session-end beat** — `LessonCompleteOverlay.tsx`; completion becomes a typed server event; Motion + confetti + motion tokens.
5. **Exercise/SandboxBeat visual hierarchy** — `ExerciseFrame.tsx`; composite terminal+challenge frame.

### P1 — the journey layer
6. **Metro map** — `computeMapLayout()`, `CurriculumMap/MapNode/MapEdges/MapListView`; replaces the dashboard grid.
7. **Progress-aware sidebar + breadcrumbs** — rewrite `Sidebar.tsx`; `Breadcrumbs.tsx`.
8. **Streak + daily goal + quiet stats** — server-computed from the event log.
9. **Persistent terminal host + dockable panel + reattachable sessions** — fixes abort-on-unmount.
10. **Mastery layer** — per-skill projections; Mastered treatment; "worth a refresh".

### P2 — depth and polish
11. **"Prove it" test-out** on Available modules.
12. **On-demand coach** in the playground (margin-note, score-free schema, struggle-triggered).
13. **Workshop** — persistent project sandbox spanning modules 5–14, using the dock.
14. **A11y hardening** — roving-tabindex map nav, focus management, throttled `aria-live` streams, off-screen terminal transcript from structured TermEvents.
15. **Typography/token pass** — fix Arial→Geist, ~68ch measure, semantic track/state tokens; per-track completion on profiles.

**The through-line:** the app already has the hardest part — real practice with real feedback. What it lacks is *narrative around the practice*: knowing where you are, feeling the win, and being pulled back tomorrow.
