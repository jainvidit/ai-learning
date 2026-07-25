# Rejected Alternatives — the road not taken

Every alternative considered and not taken across the initial build plan, the two design
reviews, the dream blueprint, and the working sessions. Recorded so these are not
re-proposed later as new ideas. "Who" = who rejected it.

## Initial build plan (2026-07-24)

| Alternative | Rejected because | Who |
|---|---|---|
| Vite React + separate Node/Express backend | Single full-stack Next.js app chosen; user prioritized "best learning experience" over architecture concerns | User (via options) |
| Plain HTML/JS + Node backend | Too limited for rich interactivity | User (via options) |
| Claude API only (no CLI) | Would miss the actual Claude Code tooling the course teaches; user chose BOTH: "Both we will use Amazon bedrock for api access" | User |
| Claude Agent SDK (`@anthropic-ai/claude-agent-sdk`) instead of CLI spawn | SDK requires explicit API-key/Bedrock env; spawning the installed CLI reuses existing auth automatically | Research + me |
| `claude -p --bare` mode | Forces API-key auth, skips the user's existing session | Research |
| Complete content up front (all 14 modules authored in first build) | Too large to review; user chose skeleton + Module 1 + self-contained specs so "other agents in parallel ... build while i learn module 1" | User |
| Structure only (no content) | User wanted Module 1 fully learnable immediately | User |
| SQLite (better-sqlite3) for progress | Native-build friction on Windows + Node 24; single local user; JSON file store adequate | Plan agent + me |
| 12-module curriculum (original) | Grew to 14: user added context-engineering depth (module 10) and autonomous/remote Claude (module 12) | User additions |
| OpenClaw hands-on exercises | User: "ignore the local open claw as its not setup correctly" — taught concept-only in module 12 L5 | User |

## reveal.js exploration (read-only, user-requested)

| Alternative | Rejected because | Who |
|---|---|---|
| Adopt reveal.js for lessons | Fixed-slide transform layout collides with streaming/tall content and xterm (blurry canvas, broken hit-testing, 0×0 init on hidden slides); imperative DOM ownership vs React 19 RSC is permanently fragile; document-level Space/arrow capture in a typing-heavy app; reveal can't express exercise-gated Next | Exploration agent, accepted |
| CSS scroll-snap for slide feel | `mandatory` snap + tall content = unreachable-content trap; `proximity` too subtle | Exploration agent |
| Framer Motion transition layer (v1) | Purely cosmetic; deferred | Exploration agent |
| (Parked, not dead) reveal.js for prose-only module recap decks on a separate route | The one honest fit; evaluate independently later | Exploration agent |

## Learning-design review (Sage) and learning engine

| Alternative | Rejected because | Who |
|---|---|---|
| Mistake journal | Homework nobody does; subsumed by the automated spaced-review queue | Sage |
| Micro-sessions (splitting lessons into 5-min beats) | Lessons are already honest 8–18 min; splitting adds navigation overhead and fragments the prose→experiment→debrief arcs | Sage |
| Dual-path guided/explorer lessons | Doubles authoring cost for one learner; un-enumerated bosses + optional suggestedPrompts deliver the 80% | Sage |
| Bronze/silver/gold mastery tiers | Competitive framing (user constraint) AND converts judge variance into visible status loss | Sage + user constraint |
| Full cross-module project continuity (every module inside one evolving repo) | Would break the self-contained-fixture spec design and pristine-template verifier discipline; scoped Workshop (1–2 artifact exercises per module) instead | Sage |
| Leitner boxes for spacing | Sage's own scheduler bake-off picked FSRS-6; Leitner survives at most as UI metaphor | Sage's SchedTeam |
| Per-learner FSRS weight fitting | n=1 is noise-fitting; defensible only with ~400+ reviews. Frozen default weights | Sage |
| Timing-based grading ("fast clean answer = Easy") | Timed pressure by the back door — violates non-competitive constraint | Sage (Atlas withdrew it) |
| EMA continuous mastery score (Atlas's lane proposed) | Any learner-facing continuous number invites false precision and leaks judge noise; discrete evidence-counted states won. EMA survives ONLY as internal item-selection signal | Sage (Atlas conceded — recorded reversal) |
| Judge emitting Easy / any source emitting Hard | Hard-vs-Good is exactly where judge variance lives | Sage + Priya |
| Generated terminal/challenge fixtures & verifiers | A generated verifier can't be trusted; one false FAIL poisons the honest-mastery contract. 100% authored | Sage + Priya |

## UX review (Nova) and experience layer

| Alternative | Rejected because | Who |
|---|---|---|
| XP / levels | Meaningless without peers; duplicates mastery states; invites grinding | Nova |
| Leaderboards / social features | No audience; user constraint: "the course is not meant to be competetive" | Nova + user |
| Punitive daily minute quotas (Duolingo-style) | Time-on-task is a vanity metric for a depth course. NOTE: a *gentle, self-chosen, invitational* daily goal WAS adopted — the rejection is of quota/shame framing | Nova |
| Per-module cosmetic badges | Interim review had entertained a badge shelf; final rejected it — mastery states (Mastered = min over skills) carry the meaning with pedagogy attached | Nova (evolved position) |
| Full skill-tree replacing the dashboard as primary navigation | 14-node DAG too shallow; metro map adopted as *visualization*, cards/hero stay primary | Nova |
| Always-on coach feedback while typing | Destroys desirable difficulty; on-demand coach with struggle-surfaced affordance instead | Nova (Atlas adopted) |
| Step-through pacing as lesson default (StepChamp position) | Lost the adjudicated debate: completion-gating is undefinable for exploratory interactives ("how many rounds unlock the debrief?"); debrief must sit in the same visual breath as the realization; adult autonomy over months. Its momentum psychology was absorbed via rail fill + celebrations | Nova-PacingTeam-Lead ruling |
| Viewport/scroll gating of any kind | "Completion gates the lesson, not the viewport" | Pacing ruling |
| Dwell-analytics-justified gates | Single-learner local app; telemetry precision doesn't justify UX friction | Pacing ruling |
| Optimistic client-side verdicts for LLM-judged exercises | Server-truth only; optimistic "submitted" state is the ceiling | Ramesh (Nova adopted) |
| Celebrations on client-side guesses | Only server-confirmed projection transitions fire celebrations | Nova |

## Dream blueprint — architecture & tech radar

| Alternative | Rejected because | Who |
|---|---|---|
| Cloud microVM execution as the universal default (Atlas's opening position) | Real files on the learner's real machine ARE the pedagogy for a Claude Code course; two editions behind one ExecutionDriver, local default at home. Atlas's isolation concern stands on record | Nova won; contested item |
| Astro islands / SvelteKit / TanStack Start / SolidStart | RSC fits compiled-content+islands; ecosystem continuity with existing code | Atlas |
| next-mdx-remote (current app uses it) | Archived upstream — migration to Velite build-time compilation is FORCED, not optional | Ramesh (fact-check) |
| Contentlayer | Dead project | Ramesh |
| Content Collections | Runner-up to Velite; tiebreak trigger held by Ramesh if two-process DX proves painful | Ramesh |
| tRPC | No OpenAPI exit path | Ramesh |
| ts-rest | Stalling | Ramesh |
| GraphQL | Overkill | Ramesh |
| Zero (Rocicorp) for offline writes | Zero CANNOT queue offline writes (fact-checked against Rocicorp docs, corrected Atlas's draft); custom IndexedDB outbox + idempotency keys; PowerSync recorded as upgrade path | Ramesh |
| Replicache | Archived | Ramesh |
| WS-sidecar as the transport architecture | Reframed: the durable seq-numbered event log is the architecture; the socket type is a delivery detail | Ramesh |
| Raw PTY keystroke terminal | Prompt-based interaction is a stated product decision (pedagogy wants composed prompts); protocol is transport-agnostic so a PTY upgrade never breaks clients | Ramesh |
| WebContainers for sandboxes | Cannot run the claude CLI | Ramesh |
| E2B / Modal / Daytona; all-Fly-Machines | Vercel Sandbox + Cloudflare DO session actors chosen for the (optional) hosted edition; Fly recorded as alternate | Ramesh/Atlas |
| hterm / custom terminal renderer | xterm 6 is standard; serialize addon gives restore/pop-out | Ramesh |
| Radix themes / Ark UI / Park UI | shadcn/ui on Base UI for token-layer ownership | Atlas |
| GSAP / Rive / Lottie | Adopt-on-concrete-need only; Motion 12 + native View Transitions | Atlas+Nova |
| React `<ViewTransition>` wrapper | Not production-ready; native `document.startViewTransition` with feature detection | Ramesh |
| SM-2 scheduler | FSRS-6 better intervals from same evidence | Sage |
| Turso / D1 | SQLite (home) / Postgres (hosted) | Atlas |
| Auth.js (v5 never left beta) / Clerk | Better Auth for the hosted edition | Atlas |
| Jotai / XState-everywhere | TanStack Query + per-session Zustand factories + explicit machines only where lifecycle is real | Atlas/Ramesh |
| Braintrust / LangSmith | Langfuse (self-hostable); Braintrust is the recorded fallback if eval volume outgrows self-hosting | Priya |
| Live-CLI tests on every PR (Priya's original) | Flaky and expensive; Ramesh's two-suite design won: deterministic cassettes on PRs, live battery nightly | Priya adopted Ramesh's |
| Judge consistency via temperature/seed policy (Atlas's draft framing) | No seed parameter exists in the Claude API; sampling params removed on newer tiers — consistency comes from structure + ensembles | Priya (fact-check) |
| Tool-use JSON schema for judge output | `output_config.format` json_schema chosen | Priya |
| Haiku-default model table with cost budgets (Priya's original) | Superseded by user directive "we dont care about cost": Sonnet default learner-facing, Opus arbiter/deep-tutor/generation, Haiku demoted to optional knob, cost budgets deleted | User directive |

## User-requested evaluations that ended in exclusion

| Item | Verdict | Reason |
|---|---|---|
| Trophy / Trophy UI | Excluded | Hosted gamification SaaS (points/leaderboards) — extrinsic engine contrary to design values; mandatory cloud dependency in a local app |
| Ludiks | Excluded | Same philosophy conflict + fails maturity (solo maintainer, ~16 weekly downloads, likely abandoned) |
| Phaser | Excluded | Teaching widgets are DOM/state interactions, not sprite/physics; ~1MB engine + a11y cliff for what React+Motion does. Radar rule: game engines only for real-time simulation loops with physics |
| Godot web export | Excluded | Tens of MB WASM, hostile to DOM embedding, separate toolchain, no in-canvas a11y |
| React Three Fiber | Parked (ASSESS) | Only defensible case: 3D viz in fundamentals track; teachable in 2D; adopt only if a specced lesson makes spatial 3D pedagogically load-bearing — then lazy island + 2D fallback |

## Things I proposed that the user declined / did not take up

| Proposal | Outcome |
|---|---|
| Scoped security review of the execution layer (my gap analysis, alongside the AI engineer) | Never commissioned; later mooted by user directive "we dont care about cost and security concerns" — with my learning-integrity carve-out (evidence verification, answer-key isolation, sandbox tool restrictions) retained and explicitly flagged for user disagreement — user did not object |
| Continue debugging the jest-worker crash | User stopped it: "we can jest worker to stop as we are rebuilding the app anyways" — ROOT CAUSE NEVER FOUND; risk documented in ASSUMPTIONS.md |
| Two ExitPlanMode attempts before the plan was accepted | User: "lets erview the plan first" / "continue reviewing" — wanted explicit walkthroughs before approval (process preference, see CONSTRAINTS.md) |

## Interim positions superseded during the process (not errors — evolution)

- My first jest-worker diagnosis ("transient hot-reload state") was wrong; the error recurred; proper debugging was delegated then stopped.
- The dream-blueprint effort initially had cost tiers as design rationale (Priya's $0.01–0.04 blended estimate) — deleted by directive.
- Injection quarantine as attacker-threat response → simplified to graceful-degradation "ungradeable content" path (user directive; learner experimenting is the only "attacker").
- The hint ladder originally topped out at Socratic walkthrough → user directive added a guaranteed rung-4 full-method walkthrough (never a dead end), reconciled with zero mastery evidence + disguised isomorphic re-probe.
