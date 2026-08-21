# Capability: Frontend Platform

Framework/rendering posture, client state management, design system, motion stack, celebration policy, and the accessibility bar. The cross-cutting substrate the experience shards build on.

**Depends on:** `content-pipeline.md` (compiled MDX/beat arrays are what get rendered).
**Depended on by:** `lesson-experience.md`, `dashboard-and-wayfinding.md`, `terminal-experience.md`, `workshop-and-artifacts.md` (shelf UI).
**Contract owner:** Atlas (framework), Nova (motion tokens + celebration API; Ramesh holds the perf budget — LANE-DEPENDENCIES "Motion tokens" row).

---

## REQ-FP-01: Next.js (current generation) + React 19, RSC + islands {#req-fp-01}

Next.js + React 19 retained deliberately: lesson prose compiles to static, zero-JS HTML; interactives (Quiz, Playground, Terminal, Challenge, visualizations) are client islands hydrated inside Suspense boundaries. Alternatives (Astro, SvelteKit, TanStack Start, SolidStart) were evaluated and REJECTED (REJECTED.md). Per AGENTS.md: this repo's Next.js has breaking changes — read `docs/nextjs-conventions.md` before writing code.

**Source:** DREAM-BLUEPRINT.md §2 "Framework & rendering", §7 radar row "Framework".
**Current state (docs/origin/CURRENT-STATE.md):** framework survives; ASSUMPTIONS.md #5 carries the never-diagnosed jest-worker crash risk forward for Next dev on Windows + Node 24.

**Scenarios:**
1. Given a built lesson page, when its payload is inspected, then prose beats contribute static HTML with no hydration JS of their own.
2. Given an exercise beat, when the page loads, then it hydrates as a client island inside a Suspense boundary without blocking prose rendering.

## REQ-FP-02: Client state — TanStack Query, per-session Zustand factories, explicit machines {#req-fp-02}

Server state: reactive sync-engine queries for learner-model reads (data-layer REQ-DL-01); TanStack Query for classic request/response. Exercise lifecycles (idle → running → grading → verdict) are explicit state machines. Streaming token buffers and the terminal session registry live in Zustand stores created by per-session factories, never module-level (avoids token-per-frame context re-render storms). Jotai / XState-everywhere rejected.

**Source:** DREAM-BLUEPRINT.md §2 "State management", §7 radar row "Client state".
**Current state:** new discipline; current components use local useState (Nova §1 problem 5 — exercise state not hydrated from progress; fixed by lesson-experience REQ-LX-06).

**Scenarios:**
1. Given the codebase, when searched for Zustand stores, then streaming/session stores are created via per-session factories and no store is a module-level singleton.
2. Given an exercise component, when its lifecycle is traced, then transitions follow an explicit machine (no ad-hoc boolean soup for idle/running/grading/verdict).
3. Given a streaming run, when tokens arrive per frame, then unrelated React context consumers do not re-render (buffers live outside React context).

## REQ-FP-03: Design system — Tailwind v4 + shadcn/ui on Base UI with a full token layer {#req-fp-03}

Tailwind v4 + shadcn/ui on Base UI; full token layer including motion tokens (durations, easings, spring configs) with `prefers-reduced-motion` honored inside the token layer. Radix themes / Ark UI / Park UI rejected.

**Source:** DREAM-BLUEPRINT.md §2 "Design system, motion, accessibility", §7 radar row "Design system".
**Current state:** `src/components/ui/index.tsx` MODIFIED — Card/Button/Callout survive; ProgressRing renamed → ProgressBar + real RingProgress added; motion tokens added; Arial→Geist fix in `globals.css` (Nova §1 problem 11). ThemeToggle SURVIVES (CONSTRAINTS.md #27 [HARD]: theme switcher, light/system/dark, persisted).

**Scenarios:**
1. Given the token layer, when inspected, then motion durations/easings/springs are tokens, and reduced-motion variants are defined at the token level (not per-component ad hoc).
2. Given `prefers-reduced-motion`, when set, then all motion consuming the tokens degrades (macro celebrations → static/opacity) with no per-component opt-out required.
3. Given the shipped UI, when audited, then the theme switcher (light/system/dark, persisted) still works (owner [HARD] #27).

## REQ-FP-04: Motion stack and the celebration policy {#req-fp-04}

Motion (motion.dev, LazyMotion ≈4.6kb) + native `document.startViewTransition` with feature detection (the React `<ViewTransition>` wrapper is NOT production-ready — rejected) + exactly one wrapped confetti/particle primitive behind a celebration API. GSAP/Rive/Lottie: adopt-on-concrete-need only. Route transitions use View Transitions; in-page uses Motion; never both on one element. Timing bands: micro 120–180ms, meso 250–400ms spring, macro 600–900ms (lesson/module/mastery/streak milestones only). **Celebrations fire only on server-confirmed projection transitions** (lesson_completed, module_mastered, streak_milestone) delivered as typed events — never on client-side guesses.

**Source:** DREAM-BLUEPRINT.md §2 "Design system, motion, accessibility", §7 radar row "Motion", §8 aligned decision 2; UX-REVIEW-NOVA.md §3 "Motion system".
**Current state:** new; no motion system exists today.

**Scenarios:**
1. Given the dependency graph, when inspected, then Motion is the only animation library and exactly one confetti primitive exists, reachable only through the celebration API.
2. Given any celebration anywhere, when its trigger is traced, then it is a typed server-confirmed projection-transition event, never a client-side guess. **Celebration trigger domain (closed-world, per ADR-0023):** (1) first quiz pass, (2) lesson completion, (3) module mastery, (4) boss challenge pass, (5) test-out full pass, (6) artifact created/verified, (7) streak milestone (7/14/30/60/90/180/365 days). Any celebration-like moment not on this list must not trigger confetti/macro-motion animations until added via additive ADR per the ADR-0023 relaxation path. The enumeration quantifies over all celebration API invocations at any tier (micro/meso/macro), not only confetti/macro-motion; unenumerated moments must not invoke the celebration API at all. Audit procedure: grep for celebration-API call sites (scenario 1's single-entry-point property makes this deterministic), classify each against triggers 1–7, flag violations.
3. Given an element animated in-page by Motion, when routes change, then that element is not simultaneously driven by a View Transition.
4. Given confetti, when a single event fires repeatedly, then confetti plays at most once per event.

## REQ-FP-05: Accessibility bar — WCAG 2.2 AA {#req-fp-05}

WCAG 2.2 AA; keyboard-navigable beats; xterm's limited `screenReaderMode` paired with an off-screen live transcript rendered from the TermEvent log. (Terminal-specific a11y detail also in terminal-experience REQ-TX-04; map a11y in dashboard-and-wayfinding REQ-DW-03.)

**Source:** DREAM-BLUEPRINT.md §2 "Accessibility bar"; UX-REVIEW-NOVA.md §5 P2-14.
**Current state:** new bar over existing components.

**Scenarios:**
1. Given any beat sequence, when navigated by keyboard only, then every beat and its controls are reachable and operable.
2. Given a screen reader user on a terminal exercise, when the session streams, then an off-screen live region transcript derived from TermEvents is available (not reliant on xterm's canvas).
3. Given automated + manual WCAG 2.2 AA checks on the key screens, when run, then they pass at AA.
