# THE DREAM VERSION — Joint Blueprint for the AI Mastery Learning App

**Team:** Atlas (architecture, lead/synthesizer) · Nova (UX) · Sage (game-based learning) · Ramesh (implementation, testing, DX) · Priya (AI/LLM engineering)
**Grounded in:** the existing repo at `C:\Users\jainv\workplace\ai-learning-app` (Next.js 16 App Router, MDX + Zod content contract, Bedrock playground + LLM judge, local `claude.exe` spawn with path-confined sandboxes, JSON-file progress, Netflix-style profiles, 14-module curriculum).

---

## 1. Product Vision (synthesis of all lanes)

The dream version is **a personal apprenticeship in AI, run by real tools, that never lies to you about what you know.**

A learner — a complete beginner — opens the app and is greeted not by a grid of module cards but by a **hero dashboard** that answers three questions in one glance: *where am I, what's next, what's due?* A **metro map** of the 14-module curriculum renders the three tracks (fundamentals, prompting, claude-code) as interweaving lines with real prerequisite edges; their position glows on it. A small chip offers to resume mid-lesson, at the exact paragraph — "beat" — where they left off.

Lessons read like well-paced essays, but every few beats the prose gives way to something real: a quiz that explains *why* the tempting wrong answer is wrong; a playground where their prompt runs against a real Claude model and a hardened LLM judge grades the *prompt* criterion-by-criterion, quoting their own words back at them; a terminal where **the real Claude Code CLI** works in a real folder on their machine — files they can open in Explorer. When they struggle, a **Coach** (visually a margin note, explicitly labeled "not your grade") asks Socratic questions up a hint ladder that is enforced by the server, not by the model's goodwill.

Progress is **honest mastery**, not completion theater. Skills move through three visible states — *Introduced → Practiced → Fluent* — and promotion requires real evidence: a deterministic verifier pass, a clear judge verdict, spaced re-demonstration days later. A gentle daily **warm-up** (never more than ~5 minutes, never a guilt-wall of overdue counts) resurfaces skills as fresh variants, scheduled by FSRS. Each module ends in a **boss challenge** that integrates several skills with no scaffolding; confident learners can **test out** of a module entirely — and the app treats that exactly like completing it.

From module 5 onward, the learner founds a **Workshop**: one persistent, git-checkpointed project that they build across the entire curriculum — a CLAUDE.md in module 7, a skill and a hook in module 9, a context-engineered restructure in module 10, the capstone in module 14. Its **artifact shelf** shows every capability they've built, with a live health badge; when a later change breaks an earlier artifact, the app says what every senior engineer knows — "this happens to everyone; want to investigate?" — and turns the regression into a lesson.

There are no points, no leaderboards, no XP. The reward *is* the shelf of working artifacts, the map filling with light, and the quiet accumulation of skills the app can prove you have.

---

## 2. Frontend Architecture (Atlas, with Nova's contracts and Ramesh's corrections)

### Framework & rendering
**Next.js (current generation) + React 19, retained deliberately.** The app's shape — long-form compiled content punctuated by heavy client islands — is exactly what RSC + partial prerendering serve well, and the team's content pipeline, agent-authoring workflow, and existing code are Next-native. Alternatives (Astro islands, SvelteKit, TanStack Start) were evaluated; none justified abandoning the RSC content path plus the React ecosystem the interactive components need (full comparison in the tech radar).

- **Lesson prose:** compiled MDX → static, zero-JS HTML at build time.
- **Interactives:** client islands (Quiz, Playground, Terminal, Challenge, visualizations) hydrated inside Suspense boundaries.
- **Forced migration (Ramesh):** `next-mdx-remote` is archived — MDX compilation moves to build-time via **Velite** (single maintainer, internal Zod 3; isolate via pnpm overrides; Content Collections is the runner-up if single-process HMR wins).

### The beat model — the lesson-experience component system
Every lesson compiles to an **ordered array of beats** with stable IDs: `{ beatId, type: prose | quiz | playground | terminal | challenge | widget, persistent?: boolean, completion: "passed" | "verified" | "attempted" }`.

- The renderer walks beats; prose beats are static HTML, exercise beats hydrate islands.
- **Soft-frontier pacing (Nova's ruling):** beats past the learner's frontier are *styled* as future (dimmed), never hidden; the frontier advances on 50%-viewport/2s dwell or an explicit Continue. Completion gates the *lesson*, never the viewport — no scroll-jail.
- **Per-type completion predicates (Nova + Sage):** quizzes/challenges require `passed`/`verified`; playground and exploratory beats require only `attempted` to count toward lesson completion — but attempted-only completions emit **zero mastery evidence** (Sage's firewall). Boss-flagged exercises are excluded entirely: a boss counts toward nothing until passed.
- **Persistent beats:** terminal/streaming beats carry `persistent: true` and stay mounted across beat transitions; the terminal also lives in a **bottom dock** (Nova) with per-sandbox tabs and a pulsing Workshop indicator, because sessions outlive the page (see §3).
- Resume chip targets a beat ID; every beat view is a telemetry event.

### State management
- **Server state:** reactive sync-engine queries (below) for all learner-model reads; TanStack Query for classic request/response.
- **Machines:** exercise lifecycles (idle → running → grading → verdict) as explicit state machines; **Zustand** stores (per-session factories, never module-level — Ramesh) for streaming token buffers and the terminal session registry, avoiding token-per-frame context re-render storms.

### Data layer & offline (Nova's UX contract, Ramesh's corrections)
**The UX contract (frozen):** every dashboard/navigation read is a reactive local query (<100ms, zero network on nav); writes are optimistic with server-authoritative rebase; every projection (streak, mastery, review queue) is computed in exactly one place.

- **Hosted Edition:** **Zero (Rocicorp)** over Postgres as the online optimistic-sync implementation. Known limits recorded: no SSR bindings, no ZQL aggregates (aggregates come from server SQL projections anyway), real self-hosting ops.
- **Home Edition:** SQLite + in-process reactive cache satisfies the same contract with no sync infra.
- **Offline (honest scope — Ramesh):** Zero **cannot** queue offline writes. v1 offline = precached versioned content bundle (static route, never RSC flight payloads) + client-rendered lessons + locally graded quizzes with a **custom IndexedDB outbox + idempotency keys**, server re-grades authoritatively on replay. Playground/terminal/challenge are never offline and say so ("terminal needs network for the model — same as today"). Serwist 9.5 service worker; `navigator.storage.persist()` + eager replay to survive iOS ITP eviction. PowerSync is the recorded upgrade path.

### Design system, motion, accessibility
- **Tailwind v4 + shadcn/ui on Base UI**, full token layer including **motion tokens** (durations, easings, spring configs) with `prefers-reduced-motion` honored *inside the token layer*.
- **Motion stack (frozen with Nova):** Motion (motion.dev, LazyMotion ≈4.6kb) + native `document.startViewTransition` with feature detection (the React `<ViewTransition>` wrapper is not production-ready — Ramesh) + one wrapped confetti/particle primitive behind a celebration API. GSAP/Rive: adopt-on-concrete-need only.
- **Celebrations fire only on server-confirmed projection transitions** (lesson_completed, module_mastered, streak_milestone) delivered as typed events — never on client-side guesses (Nova's requirement).
- **Accessibility bar:** WCAG 2.2 AA; keyboard-navigable beats; xterm's limited `screenReaderMode` paired with an off-screen live transcript rendered from the TermEvent log (Nova + Ramesh).

---

## 3. Backend Architecture (Atlas, with Ramesh's transport verdict and Priya's AI layer)

### Two editions, one codebase
The defining call of this blueprint: the product ships as **two deployments of one codebase** behind shared interfaces.

- **Home Edition** (the current product's persona, kept primary): runs on the learner's machine; local claude CLI; SQLite; real folders. Authenticity is the pedagogy — Nova's argument, adopted.
- **Hosted Edition** (multi-tenant public web app): Postgres + Zero, cloud sandboxes, real auth.

### BFF & API
Yes to a BFF — the Next server (plus a session service) is the only thing the browser talks to; model credentials and sandbox tokens never reach the client (already true today — kept).

- **API shape:** **oRPC over Zod** (Ramesh) — tRPC-class DX with OpenAPI-native output, giving a language-agnostic exit path; `z.toJSONSchema` emission doubles as the contract handed to content-authoring agents.
- **Streaming:** the load-bearing invariant is the **durable, sequence-numbered event log per session** — not the socket type (Ramesh's reframe). Playground: SSE from route handlers + resumable-stream (Redis) so a refresh doesn't kill a run; explicit stop endpoint. Terminal: SSE-down + POST-up suffices for the **prompt-based interaction model, which is a stated product decision** (the pedagogy wants composed prompts, not raw PTY keystrokes); the protocol (`attach(sessionId, fromSeq)` → gap replay + live tail) is transport-agnostic so a WS/PTY upgrade never breaks clients. Mandatory plumbing: `X-Accel-Buffering: no`, no-transform, ~20s heartbeats, client backoff-reconnect with last-seq (doubles as the deploy-drain story).

### Execution layer — the ExecutionDriver interface
One interface, one stream protocol, one dock UX; two drivers:

- **LocalDriver (Home default):** spawns the learner's real claude CLI (evolution of today's `claudeSpawn.ts`), path-confined sandboxes, `allowedTools`/`maxTurns` from content definitions only, plus Claude Code's own OS sandbox where supported; the product states plainly that the agent runs on your machine.
- **CloudDriver (Hosted default; opt-in at home):** Firecracker microVM per sandbox. **Reference topology (Ramesh, fact-checked):** Vercel Sandbox (24h persistent, reattachable) runs Claude Code; one **Cloudflare Durable Object per session** (partyserver) is the session actor — drives the sandbox, appends TermEvents with monotonic seq to DO storage (~5k ring buffer), terminates client WebSockets with hibernation (idle terminal ≈ $0). Auth: Next mints a short-lived JWT (sessionId+profileId); the DO verifies on upgrade and holds the sandbox token. Alternates recorded: all-Fly Machines; Vercel-native experimental WS for least-infra v1.
- Sessions are **server-held and reattachable**: navigate away, close the tab, come back — the run continued and the stream resumes from your last sequence number.

**Fakes are a product surface (Ramesh, adopted as principle):** two seams — `AgentRunner` and `ModelGateway` — are production interfaces with dev/preview/CI/offline consumers, so the whole app runs against recorded transcripts without a CLI or an API key.

### Content pipeline
Git stays the source of truth (it's what lets Claude agents author modules — the repo's superpower, kept).

- **Authoring:** MDX + JSON exercise definitions against the Zod contract (`schema.ts` lineage), extended with: per-objective `skillIds`, difficulty tiers (intro/core/stretch), `role: "boss"` flags, hint-ladder rungs, misconception tags on distractors, artifact/verifier declarations.
- **Compile:** Velite-based build → **versioned immutable content bundle** (curriculum DAG with layout hints for the metro map, beat arrays, exercise bank, calibration goldens) served from CDN/static route — content releases decoupled from app deploys.
- **Versioning:** stable item IDs + content-hash `itemRevision` recorded on every attempt event; migration maps when items materially change; CI validates schemas, anchor integrity, skill-registry references, boss-per-module, ≥2 isomorph variants per review-eligible objective, and rubric-change-requires-golden-update in the same PR.

### Progress & learner-model storage
**Append-only `learning_events`** (beat_viewed, exercise_attempted, hint_revealed, review_graded, boss_passed, test_out, artifact_created, …), each carrying `itemRevision` and — for judge events — `judgeModel + judgePromptVersion` (Priya's drift hooks). Server-side SQL projections derive: SkillState, ReviewQueue, Streak (server time, learner-declared timezone, grace day), ResumePosition, ArtifactHealth. Projections are the only readable truth; the log is the audit trail that makes honest mastery *provable*.

### The AI layer (Priya's spec, adopted near-verbatim)
- **Judge pipeline:** score computed **in code** from rubric weights (kept from current app); strict structured outputs via `output_config.format json_schema` (replaces prose-JSON + fence-stripping); the judge **never sees weights or passingScore**; every criterion verdict must include an `evidenceQuote` that code verifies as a substring of the learner's text — failed check downgrades confidence. Two tiers: cheap single-pass **draft** feedback vs **gate** decisions (×3 ensemble; confidence derived from vote agreement, not self-report; stronger arbiter on weight-flipping splits, ±5-of-threshold scores, or any flag). Only gate-tier verdicts touch the learner model or fire celebrations.
- **Learning integrity (reframed from security per user directive):** instruction hierarchy (learner text is data, never instructions), injection pre-screen → quarantine as graceful degradation: graded normally for feedback, zero mastery evidence, no completion event, neutral copy, excluded from tutor struggle thresholds.
- **Calibration & drift:** versioned golden sets per exercise family (clear-pass/clear-fail/boundary/adversarial); CI gate on judge-prompt/model/rubric changes + nightly live battery (kappa ≥0.8, flip-rate ≤2%); production met-rate z-test monitor; on alarm: always-escalate, pin model, page. Ramesh owns CI wiring; Priya owns methodology. Langfuse for observability.
- **Tutor (Coach):** strict context contract — objectives, instructions, rubric descriptions (no weights), missed-criterion IDs, current draft, server-held ladder position; **never** answer keys, verifier sources, or `improvedPromptExample`. Output schema has no numeric fields (score-leak structurally impossible). On-demand button always; struggle-watcher only surfaces the affordance. Post-response leak-check (n-gram dup vs solutions + judgeCriterion) → regenerate once → authored rung fallback. **Multi-staged ladder ending in full guidance (user directive):** (1) reflective question → (2) micro-explanation of the learner's own attempt → (3) worked example in a different domain → (4) full step-by-step guided walkthrough of the solution method for this problem — always reachable, never a dead end; stops short of the literal passing artifact; passes after rung 4 emit reduced/zero mastery evidence and the skill stays in review rotation.
- **Generation:** offline only — generator (with reference passing *and* failing submissions) → schema validation → solvability (blind solver; discrimination check: reference-pass must pass the real judge, reference-fail must fail) → quality judge → **human review** → bank. Correlated generator/solver error is honestly undetectable automatically; human review + post-deploy item-statistics retirement is the answer.
- **Models (quality-first per user directive — cost is not a constraint):** Sonnet-class default everywhere learner-facing including the gate ensemble; Opus-class for arbiter, deep tutoring rungs, and generation; Haiku demoted to an optional router knob. The calibration battery, not price, is the arbiter of model choice. ModelRouter abstraction: Bedrock today, direct Anthropic/Vertex as config; strips sampling params per model (no seed exists; temperature removed on newest tiers — consistency comes from structure + ensembles, not decoding params). Explicit `cache_control` breakpoints.

### Auth & profiles
Home Edition keeps passwordless Netflix-style local profiles (a genuine strength — kept, with per-profile isolation extended to Workshop dirs and session keys). Hosted Edition: **Better Auth** with the same Profile shape beneath accounts, so home data can migrate up.

### Personal-desktop-tool directive (user)
The Home Edition is a personal desktop tool, not a production service: single process where possible, files/embedded stores (SQLite/JSONL) over managed databases, restart-and-recover over distributed durability; no SLA/scaling/ops machinery. The durable event log is a local append-only store, not infrastructure. Cloud topology exists only as the optional Hosted Edition. Cost and public-internet security are not design constraints; learning-integrity features (evidence verification, weight hiding, answer-key isolation, sandbox tool restrictions as own-machine safety) stay.

---

## 4. The Learning Engine (Sage's lane, synthesized)

### Mastery model — discrete states, evidence-counted
Per skill (4–6 per module, declared in content, mapped from rubric criteria via `skillIds`):

- **States:** `Introduced → Practiced → Fluent`. Promotion: Introduced→Practiced = 2 clear positive evidence events ≥2 sessions apart; Practiced→Fluent = 3 clear positives across ≥2 evidence types **including ≥1 deterministic** (verifier/quiz-key) success AND FSRS stability ≥21 days. **Never demote** — failures reset scheduler stability invisibly; the UI shows only "worth a refresh" after 45+ idle days plus a missed probe. The UI shows the literal evidence events, never a fabricated percent. (EMA-based continuous mastery was proposed by the architecture lane and **killed** by Sage's structural-noise-immunity argument; a continuous estimator survives only as an internal item-selection signal.)
- **The judge-noise firewall (frozen):** normalized judge score <0.4 = clear-miss (Again), >0.7 = clear-pass (Good); **0.4–0.7 emits a scheduler grade but zero mastery evidence**. Judge never emits Easy; no source emits Hard. Low ensemble confidence forces in-band treatment — confidence can shrink evidence, never amplify it. Only gate-tier verdicts count toward Fluent and boss/test-out.

### Spaced review — FSRS-6, frozen weights
One **ts-fsrs** card per skill; default FSRS-6 weights, never per-learner-fitted (defensible only with ~400+ reviews); ±10% interval fuzz; post-21-day-gap first-failure amnesty. Grade mapping: deterministic fail = Again; pass-with-hints = Good (hint count reduces evidence *weight*, not the grade); first-attempt-no-hints = Easy. Timing-based grading was explicitly rejected (a timed-pressure mechanic by the back door). **Review UX:** due-count capped at ~6 ("9+" chip); a ~5-minute warm-up clears the visible queue; remainder reschedules silently. Reviews are always **isomorphic banked variants or micro-probes, never the verbatim item**.

### Adaptive difficulty
Item *selection*, never live content rewriting: items tagged {skill, tier: intro/core/stretch}; select by state + retrievability targeting ~80% success; two fails step down a tier and inject a prerequisite probe; three fails trigger struggle-halt into the tutor ladder at the reflective rung. Challenge passes propagate 0.25× credit to direct prerequisite skills.

### Boss challenges & test-out
- **Boss** = `role: "boss"` flag on existing exercise types (one per module, CI-enforced); must integrate ≥2 module skills with no per-step scaffolding. Boss gates **Mastered**, never Complete — a struggling learner is never walled. Unlimited retries, hint ladder applies.
- **Test-out** per module: boss-equivalent probe (same verifier/rubric, different fixture) + concept quiz sampling each lesson + one hands-on probe where the module has terminal content. Full pass → single `test_out` event marks lessons complete (identical presentation, no "skipped" badge), skills seeded **Practiced (never Fluent — no shortcut past spaced re-demonstration)**, FSRS cards seeded as-if-reviewed. Partial pass loses nothing and seeds what was demonstrated.

### Workshop & artifacts
- **Workshop:** one git-backed directory per profile, app-owned plumbing (learner never sees git). Auto-checkpoint commit before every workshop exercise; `good/<exerciseId>` tag on verified pass; restore = checkout-into-new-commit (restore-forward — history never rewritten); **no hard reset anywhere in the UI**; nightly git-bundle backup. Claude runs scoped to the workshop dir.
- **Mapping rule:** an exercise lives in the Workshop iff it produces an artifact a later module reads/extends/re-verifies (1–2 per module, m5→m14 chain); drills stay throwaway sandboxes.
- **Artifact** = `{ id, kind: config|doc|skill|hook|feature, paths[], moduleOfOrigin, title, verifierId, status: healthy|regressed|missing, provenanceEventId }`. Verifiers are capability assertions (path-tolerant, deterministic + judgeFile for fuzzy prose), never byte-equality.
- **Artifact shelf:** the progress-narrative centerpiece — each artifact with a one-line "what this does for you" and a live health badge. **Cumulative re-verification** piggybacks each checkpoint; regressions surface as a non-blocking banner ("your Module 9 hook stopped firing — this happens to every developer; want to investigate?") with a one-click scoped repair session; fixing one emits positive debugging evidence. Exercises declare preconditions (`requires: ["artifact:claude-md:healthy"]`); two failed repairs offer a labeled, reversible "patch-in" loaner.

### Anti-requirements (enforced by schema absence)
No points, XP, leaderboards, or competitive comparison — these fields do not exist in the data model, so they cannot creep in.

---

## 5. The Experience Layer (Nova's lane, synthesized)

**Key screens:** Hero dashboard (resume chip, warm-up card with capped due count, streak with grace-day, artifact-shelf teaser) · **Metro map** (curriculum DAG rendered from the compiled content graph + LearnerState overlay, one reactive query — track lines interweave, nodes show state, boss stations marked) · Lesson view (beat flow per §2, coach margin-notes vs judge rubric cards) · **Bottom terminal dock** (per-sandbox tabs, session status, pulsing Workshop indicator; Verify stays with the challenge card and deep-links to its beat) · Workshop/artifact shelf · Review warm-up.

**The moments that matter:**
- **First-run:** no form, no lecture — pick a profile, land in module 1 lesson 1 within seconds; the first quiz pass triggers the first (small) celebration to establish that celebrations are earned, server-confirmed events.
- **Daily return:** dashboard answers "what's due, what's next" instantly (local reactive reads); warm-up first (~5 min), then the frontier lesson; streak framed as continuity, never as threatened loss.
- **Completion:** typed server events drive a graded celebration ladder — beat-level micro-affordances, lesson completion moment, module-mastered set-piece (the one place the confetti primitive earns its keep), artifact-created shelf animation. All routed through motion tokens; reduced-motion degrades to opacity/position.
- **Struggle/rescue:** failure is never a wall — two fails step difficulty down; three fails surface the Coach affordance (never auto-open); the hint ladder climbs at the learner's request to a final full-guidance rung; artifact regressions are reframed as normal engineering life with a guided repair path.

**Session detachability** is an experience feature: a terminal run started in a lesson continues while you read elsewhere; the dock pulses when it finishes; reattach replays the gap from the event log.

---

## 6. What We Keep, and the Migration Sketch

### The current app gets these things right (kept, sometimes generalized)
1. **Real tools, not simulations** — real Claude Code, real Bedrock models, real files. The entire dream version doubles down on this.
2. **The Zod content contract + `npm run validate`** as the authoring gate — extended, never replaced.
3. **Spec-driven agent authoring** (`specs/AUTHORING-GUIDE.md` + per-module specs) — the content pipeline is designed around keeping this workflow first-class.
4. **Judge score computed in code from weights; answers stripped from client payloads** (`sanitizeQuiz`) — both survive verbatim.
5. **Sandbox posture:** localhost-only, path-confined sandboxes, no-shell spawn, flags from content only — generalized into the LocalDriver (reframed as own-machine safety).
6. **Passwordless local profiles** — kept as the Home Edition identity model.
7. **Progressive hints and explanation-that-teach quiz culture** — extended into ladders and misconception tags.

### Migration phases (sequenced even with unlimited devs — each phase ships value and de-risks the next)
- **Phase 0 — Forced foundations:** replace archived `next-mdx-remote` with Velite build-time compilation; introduce the beat compiler; monorepo split (`apps/web`, `apps/api`, `packages/content-schema`, `packages/learning-engine`); oRPC layer; AgentRunner/ModelGateway seams + recorded-transcript fakes; CI (validate, typecheck, Playwright, judge calibration battery).
- **Phase 1 — Event log under the floorboards:** SQLite `learning_events` + projections behind the existing progress API; dual-write, then cut over; streaks/resume/telemetry come free. Judge v2 (structured outputs, evidence quotes, tiers, quarantine).
- **Phase 2 — Learning engine:** skill registry in content, FSRS cards + review warm-up, mastery states, adaptive item selection; variant bank pipeline + human review queue; Coach with ladder enforcement.
- **Phase 3 — Experience layer:** hero dashboard, metro map, beat pacing, motion/celebration system, terminal dock with durable seq-log sessions (LocalDriver first).
- **Phase 4 — Workshop era:** git-backed Workshop, artifact shelf, cumulative re-verification, boss flags + test-out; author modules 2–14 against the enriched schema (agents, in parallel — the specs already exist).
- **Phase 5 — Hosted Edition (optional):** Postgres + Zero, Better Auth, CloudDriver (Vercel Sandbox + DO session actors), multi-tenant hardening. Home Edition remains the reference product throughout.

---

## 7. Tech Radar

| Area | Chosen | Alternatives considered | Why |
|---|---|---|---|
| Framework | Next.js + React 19 | Astro islands, SvelteKit 2, TanStack Start, SolidStart | RSC fits compiled-content + islands; ecosystem for xterm/Motion/MDX; continuity with existing code |
| MDX/content compile | Velite 0.4 (eyes open: solo maintainer, internal Zod 3) | Content Collections (runner-up), Contentlayer (dead), next-mdx-remote (**archived — migration forced**) | Typed build-time bundles matching the schema-first pipeline |
| Design system | Tailwind v4 + shadcn/ui on Base UI | Radix themes, Ark UI, Park UI | Token-layer control incl. motion tokens; ownership of components |
| Motion | Motion 12 (LazyMotion) + native View Transitions + wrapped confetti primitive | GSAP, Rive, Lottie (adopt-on-need); React `<ViewTransition>` (not prod-ready) | 4.6kb core; FLIP free via layoutId; reduced-motion in tokens |
| Terminal | @xterm/xterm 6 + fit/webgl/serialize addons | hterm, custom renderer | Standard; serialize = restore/pop-out; WebGL with context-loss fallback; a11y via TermEvent transcript |
| API | oRPC 1.x over Zod 4 | tRPC (no OpenAPI exit), ts-rest (stalling), GraphQL (overkill) | Typed DX + OpenAPI + JSON-Schema emission as agent contract |
| Sync (hosted) | Zero (Rocicorp) — online-optimistic only | PowerSync (offline upgrade path), ElectricSQL, Replicache (**archived**), LiveStore | Meets <100ms reactive-read contract; **no offline writes — outbox handles that** |
| Offline replay | Custom IndexedDB outbox + idempotency keys | PowerSync, Workbox background sync | One entity type queued; ~200 lines; honest scope |
| Service worker | Serwist 9.5 | Workbox direct, v10 preview (avoid) | Turbopack path via createSerwistRoute; bundle precache with own revisions |
| Scheduler | ts-fsrs 5 (FSRS-6, frozen default weights, pinned major) | SM-2, Leitner (killed by SchedTeam), fsrs-rs optimizer (skipped — no fitting) | Best intervals from same graded evidence; engine-agnostic Scheduler interface retained |
| DB | SQLite (home) / Postgres (hosted) | Turso, D1 | Event log + SQL projections; ZQL can't aggregate anyway |
| Cloud sandboxes (hosted only) | Vercel Sandbox (Firecracker) + Cloudflare DO session actors (partyserver + partysocket) | Fly Machines (alternate), E2B, Modal, Daytona, WebContainers (can't run claude CLI) | 24h reattachable VMs; DO hibernation ≈ $0 idle; durable seq-log |
| Models | Sonnet-class default learner-facing incl. gate ensemble; Opus-class arbiter/deep-tutor/generation; Haiku as optional knob — via ModelRouter on Bedrock | Direct Anthropic API / Vertex = config swap | Quality-first per user directive; calibration battery arbitrates; caching via explicit cache_control |
| LLM observability | Langfuse | Braintrust (runner-up), LangSmith | Self-hostable; verdict events already carry the (model, promptVersion, itemRevision) triple |
| Auth (hosted) | Better Auth | Auth.js (v5 never left beta), Clerk | Profiles-under-accounts migration path |
| Client state | TanStack Query + Zustand 5 (per-session stores) + explicit machines | Jotai, XState everywhere | Streaming buffers out of React context; machines where lifecycle is real |
| Testing | Playwright e2e + recorded NDJSON cassettes for AgentRunner + golden calibration sets for judge + contract tests on TermEvent protocol | Live-CLI CI (flaky, expensive) | Fakes as product surface; nightly live battery catches drift |
| Gamification SDKs | — (excluded) | Trophy/Trophy UI, Ludiks | Extrinsic/competitive engines conflict with intrinsic non-competitive design; SaaS dependency in a local app; Ludiks fails maturity |
| Game engines | — (excluded) | Phaser, Godot web export | Teaching widgets are DOM/state interactions; engines bring canvas islands, a11y cliffs, MBs of runtime. Rule: only for real-time simulation loops with physics — none exist here |
| 3D | — (assess, parked) | React Three Fiber | Adopt only if a lesson is specced where spatial 3D is pedagogically load-bearing; lazy island + 2D fallback; R3F is the right pick if triggered |

---

## 8. Joint Decisions Log

**Aligned (unanimous after debate):**
1. Beat-compiled lessons with soft-frontier pacing; per-type completion predicates; boss exclusion from `attempted` credit (Nova proposed, Sage amended, Atlas wired).
2. Event-sourced progress with single-place projections; celebrations only on server-confirmed transitions (Nova + Atlas).
3. The judge-noise firewall and discrete no-demotion mastery states (Sage; architecture lane **conceded EMA mastery** on her structural-noise-immunity argument — recorded as a genuine reversal).
4. FSRS-6 with frozen weights replacing Leitner boxes (Sage's own SchedTeam verdict; Leitner survives as UI metaphor only if ever wanted).
5. Timing-based "fast-clean = Easy" grading **rejected** (Sage: timed pressure by the back door; Atlas withdrew it).
6. Coach-on-demand as default over always-on critique (Nova argued it's better pedagogy; Atlas adopted).
7. Fakes/seams as production interfaces; durable seq-numbered session log as the transport invariant; prompt-based terminal as an explicit product decision with a non-precluding upgrade path (Ramesh).
8. Judge hardening: evidence-quote code verification, weights hidden from the judge, gate/draft tiers, quarantine excluded from struggle thresholds (Priya, bound onto Sage's firewall; her no-seed/no-temperature evidence replaced Atlas's decoding-param leaning).
9. Zero scoped to online-optimistic only after Ramesh's dealbreaker fact-check; custom outbox for offline.

**User directives (recorded):**
- Non-competitive, intrinsic-motivation-first (no XP/points/leaderboards — enforced by schema absence).
- Effort-unconstrained ideal design; rank by learning impact.
- Cost and public-internet security are not design constraints; learning-integrity features kept and reframed.
- Personal desktop tool, not a production service — single-process simplicity, files over infrastructure.
- Hint ladder must end in full step-by-step guidance (never a dead end); reduced mastery evidence after full guidance; skill stays in review rotation.

**Contested (resolved, positions recorded):**
- **Local vs cloud execution as the default.** Atlas opened with cloud microVMs everywhere (isolation, weak machines, multi-tenant readiness). Nova countered that real files on the learner's real machine *are the pedagogy* for a Claude Code curriculum, and offline honesty matters. **Resolution:** two editions behind one ExecutionDriver; local default at home, cloud default hosted. Atlas's isolation concern stands in the record for the Home Edition (mitigated by allowedTools/path confinement/OS sandbox, not eliminated).
- **EMA continuous mastery vs discrete evidence-counted states.** Atlas's research lane favored EMA with decay; Sage argued any continuous number invites both false precision in the UI and judge-noise leakage. **Resolution:** discrete states win everywhere learner-facing; EMA survives only as an internal item-selection signal. Sage's position prevailed.
- **Remaining open (non-blocking):** first-run cosmetic refinement (Nova, deferred); Velite vs Content Collections tiebreak if two-process DX proves painful (Ramesh holds the trigger); Langfuse vs Braintrust if eval volume outgrows self-hosting (Priya).

---

*This blueprint was produced by five lanes (Atlas, Nova, Sage, Ramesh, Priya) with at least one full pushback round each; every capability above names its mechanism, and the three places the team changed its mind under evidence (EMA mastery, Zero offline, decoding-param determinism) are marked. It is ambitious, and none of it is magic.*
