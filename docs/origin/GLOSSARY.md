# Glossary — terms coined or used in a project-specific sense

The meaning we settled on, not the dictionary meaning. Where two lanes used a term
differently, both senses are given.

## Curriculum & content

- **Track** — one of three curriculum threads: `fundamentals` (sky), `prompting` (emerald), `claude-code` (violet). Tracks interleave at module level and converge via cross-track prerequisites.
- **Module** — one of 14 curriculum units (`01-how-llms-work` … `14-capstone`), each with 3–6 lessons. Status `built` or `spec`.
- **Lesson** — a folder `content/modules/<moduleId>/lessons/<lessonId>/` holding `lesson.mdx` (frontmatter + prose + anchors) and `exercises.json`.
- **Exercise** — a typed interactive unit inside a lesson: `quiz`, `playground`, `terminal`, or `challenge`. Defined in `exercises.json`, anchored in MDX via `<Exercise id="..."/>`.
- **The authoring contract** — `src/lib/schema.ts` (zod schemas) + `specs/AUTHORING-GUIDE.md` + `npm run validate`. Everything content must satisfy.
- **Module spec** — a self-contained blueprint (`specs/module-NN.md`) from which an agent can build an entire module without reading anything else except the guide and schema.
- **Fixture** — a verbatim starter file inside a sandbox template. "Load-bearing fixture" = one whose exact contents the pedagogy depends on (e.g., module 10's 600-word memo with the buried fact).
- **Pristine-must-fail / solution-must-pass** — the verifier discipline: a challenge verifier must fail on the untouched template and pass on a correct solution; both directions tested.
- **Banned vocabulary** — per-module list of terms a lesson may NOT use because the learner hasn't earned them yet (e.g., module 02 bans "context window", "few-shot").
- **Meta-pedagogy thread** — the course teaching how the course itself works (module 06 reveals the judge that grades you; module 09 reveals the headless mode the terminal runs on).
- **Observe-then-explain** — the signature exercise pattern: learner runs an experiment on the model (watch a hallucination, poison a session), then the lesson explains what they saw.

## Lesson experience (dream blueprint)

- **Beat** — the addressable unit a lesson compiles into: `{beatId, type: prose|quiz|playground|terminal|challenge|widget, persistent?, completion}`. Replaces the single-MDX-blob rendering.
- **Persistent beat** — a beat (terminal/streaming) that stays mounted across navigation within the lesson; never collapsed or display:none (xterm safety by construction).
- **Frontier** — the furthest beat the learner has engaged. The **soft frontier** *styles* beats beyond it (~60% opacity, hollow rail nodes) but never hides them; promotion on 50%-viewport/2s dwell or Continue.
- **Continue** — a courtesy button: smooth-scroll + focus move to the next beat. NEVER gates. On incomplete exercise beats it reads "Skip for now."
- **Completion predicate** — per-beat-type requirement for lesson completion: quizzes `passed`, challenges `verified`, exploratory interactives merely `attempted`. Boss exercises count toward nothing until passed.
- **Rail** — the sticky per-lesson progress column: beat states (done/current/upcoming/amber-skipped), doubles as jump-nav; pure jump-nav in revisit mode.
- **Warm-up (beat 0)** — 2–3 spaced-review items served at lesson start when due. Framed "keep it fresh," never a debt list.
- **Session-end beat** — the authored closing beat: recap mapped to objectives + one retrieval question + a curiosity hook for next time.
- **Celebration interstitial** — the lesson/module completion moment; fires ONLY on server-confirmed events, never client guesses.
- **SandboxBeat** — terminal + its paired challenge rendered as one composite frame (shared sandbox made spatial instead of a prose footnote).
- **ExerciseFrame** — the distinct visual treatment (accent border, state header) separating required exercises from decorative widgets.
- **Revisit mode** — how completed lessons open: no dimming, rail as jump-nav, Continue hidden; past lessons are living reference notes.
- **Metro map** — the dashboard curriculum visualization: three track lanes, stations = modules, DAG-depth columns, prerequisite edges that "go live" in track color when satisfied. Locked nodes are colorless — "color is earned."
- **Next-best-action hero** — the dashboard's single primary CTA, priority: resume beat → due warm-up → next lesson → frontier choice → mastery refresh.
- **Frontier choice** — surfacing the prerequisite DAG's genuine forks (e.g., after module 1: 02 or 03) as an explicit choice instead of a hidden linear ladder.

## Learning engine (Sage's lane)

- **Skill** — a named learning objective (4–6 per module, ~60–80 total), the unit of mastery tracking. Exercises map to skills via `skillIds`.
- **Mastery states** — per-skill `Introduced → Practiced → Fluent`. Promotion by evidence counts (see blueprint §4); **never demote**.
- **Fluent** — 3 clear positives across ≥2 evidence types, ≥1 deterministic, FSRS stability ≥21 days. Spacing is part of the definition.
- **"Worth a refresh"** — the only decay surface: shown after 45+ idle days AND a missed probe; returns Fluent→Practiced through that gentle path only.
- **Module states** — `Locked → Available → In progress → Complete → Mastered`. **Mastered = MIN over the module's skills** (not average), and requires the boss.
- **Evidence event** — an append-only record (quiz item result, rubric criterion score, verifier result, hint usage) from which all mastery/scheduling is derived.
- **Judge-noise firewall** — normalized judge score <0.4 = clear miss; >0.7 = clear pass; **0.4–0.7 = scheduling signal but ZERO mastery evidence** (the dead zone absorbs judge wobble). Judge never emits Easy; no source emits Hard.
- **Clear positive** — evidence outside the dead zone / deterministic pass; the only thing that counts toward promotion.
- **Boss** — the one integrative, unscaffolded exercise ending each module (`role: "boss"`); instructions must NOT enumerate the rubric. Gates Mastered, never Complete.
- **Test-out ("Prove it")** — skipping a module by passing a boss-equivalent probe (different fixture) + concept quiz + hands-on probe. Seeds skills at Practiced (never Fluent); renders identical to normal completion — no stigma.
- **Isomorphic variant** — a generated re-skin of an item testing the same concept with different surface details; reviews always use variants, never the verbatim item.
- **Redemption probe** — the disguised isomorphic re-check that restores full mastery credit after a rung-4-assisted pass; indistinguishable from a normal warm-up item to the learner.
- **Workshop** — the persistent, git-backed, per-profile project founded in module 5 and built on through module 14. App-owned checkpoints; learner never sees git; restore-forward only (history never rewritten); no hard reset anywhere.
- **Artifact** — a Workshop product a later module reads/extends/re-verifies: `{kind: config|doc|skill|hook|feature, paths, verifierId, status: healthy|regressed|missing}`.
- **Artifact shelf** — the learner-visible collection of artifacts with live health badges; the intrinsic reward centerpiece ("accumulation, not checkmarks").
- **Cumulative re-verification** — re-running all artifact verifiers at each checkpoint; a regression is a non-punitive banner offering a repair session, and repairing emits positive evidence.
- **Patch-in loaner** — after two failed artifact repairs: a labeled, reversible known-good substitute so the learner can proceed.
- **FSRS-6 frozen weights** — the ts-fsrs scheduler with default parameters, never fitted per-learner (n=1 = noise-fitting).
- **Grade collapse** — the mapping of all evidence sources onto FSRS grades: deterministic fail→Again, pass→Good, first-attempt-no-hints→Easy; judge scores per the firewall.
- **Lapse amnesty** — the first miss after a 21+-day gap emits no negative evidence.
- **Struggle-halt** — three fails on a skill stops difficulty escalation and opens the tutor ladder at the reflective rung.

## AI layer (Priya's lane)

- **Draft tier / gate tier** — two judging modes: cheap single-pass feedback while iterating (draft) vs the k=3 ensemble + arbiter whose verdicts alone touch the learner model, completion, and celebrations (gate).
- **Ensemble / arbiter** — 3 independent judge votes; a stronger model arbitrates on weight-flipping splits, scores within ±5 of the passing threshold, or any flag.
- **Vote-agreement confidence** — per-criterion confidence derived from how the ensemble voted (never self-reported by the model). **Shrink-only**: low confidence can reduce mastery evidence, never amplify it.
- **Evidence quote** — the verbatim substring of the learner's text a judge must cite per criterion; code verifies it actually appears (anti-gaming primary).
- **Weights hidden** — the judge never sees rubric weights or passingScore, so it cannot be steered toward a target score.
- **Calibration battery / goldens** — versioned sets of known clear-pass/clear-fail/boundary/adversarial submissions per exercise family; CI-gated (kappa ≥0.8, flip-rate ≤2%); doubles as the model-choice arbiter.
- **Drift detection** — nightly battery runs + production per-criterion met-rate z-tests over the (judgeModel, promptVersion, itemRevision) triple.
- **Ungradeable-content path** (formerly "injection quarantine") — graceful degradation for attempts that can't be graded honestly: normal-looking feedback, zero mastery evidence, no completion event, neutral copy, excluded from struggle thresholds. The only "attacker" is the learner experimenting.
- **Coach** — the learner-facing tutor persona: margin-note UI, labeled "Coach — not your grade," Socratic-first, on-demand (struggle signals only surface the affordance).
- **Hint ladder / rungs** — server-held four-rung escalation: (1) reflective question → (2) micro-explanation of the learner's own attempt → (3) worked example in a different domain → (4) **full guided walkthrough** of the method for this exact problem (owner directive: always reachable, never a dead end).
- **Method-not-artifact** — rung 4's boundary: explain every step and why, but never emit the literal passing artifact (exact option letter, verbatim passing prompt, finished diff).
- **No-numerics schema** — the tutor's output format structurally cannot contain numbers → score leaks are impossible by construction.
- **Data-plane isolation** — the tutor never *receives* answer keys, verifier sources, exemplar solutions, or unrevealed hints; it cannot leak what it does not hold.
- **Blind-solve gate** — generated items must be solved by a second model that hasn't seen the answer key before entering the bank.
- **Discrimination check** — generated playground items must let reference-pass submissions pass the real judge and reference-fail submissions fail it.
- **ModelRouter** — the injectable per-task model-selection abstraction over the Bedrock client (swap to direct Anthropic/Vertex by config).

## Architecture (Atlas's & Ramesh's lanes)

- **Home Edition / Hosted Edition** — two deployments of one codebase. Home = the personal desktop tool (primary; local CLI, SQLite, real folders). Hosted = optional multi-tenant web app (Phase 5, appendix).
- **ExecutionDriver** — the single interface both terminal execution backends implement: `LocalDriver` (spawn the learner's real claude CLI) and `CloudDriver` (Firecracker microVM + Durable Object session actor).
- **Durable seq-numbered event log** — THE transport invariant: every session's TermEvents get monotonic sequence numbers in a durable log; sockets are delivery details.
- **`attach(sessionId, fromSeq)`** — the reattach contract: ordered gap replay + live tail; what makes terminal sessions survive navigation/tab close.
- **Prompt-based terminal** — the stated product decision: learners send composed prompts, not raw PTY keystrokes (the pedagogy wants deliberate instructions); PTY remains a non-precluded upgrade.
- **PersistentTerminalHost** — root-level owner of xterm instances; beats and the bottom dock render portal slots into it.
- **Terminal dock** — the bottom-docked, per-sandbox-tabbed terminal panel; sessions outlive pages.
- **Fakes are a product surface** — `AgentRunner` and `ModelGateway` are production seams with recorded-transcript/fake consumers for dev, CI, previews, and offline; not test-only mocks.
- **Cassettes** — recorded NDJSON stream fixtures replayed through the seams for deterministic PR tests; live calls only in the nightly battery.
- **learning_events** — the append-only event table (SQLite home / Postgres hosted) from which ALL projections (SkillState, ReviewQueue, Streak, ResumePosition, ArtifactHealth) derive. Projections are the only readable truth.
- **Beat compiler** — the build step turning lesson MDX into the beat array (replacing runtime `next-mdx-remote` rendering; migration to Velite is forced by upstream archival).
- **Content bundle** — the versioned immutable compile output (curriculum DAG + beats + exercise bank + goldens) decoupling content releases from app deploys.
- **itemRevision** — content-hash recorded on every attempt event so mastery evidence survives item edits.
- **UX contract (reads)** — every dashboard/nav read is a reactive local query (<100ms, zero network on nav); writes optimistic with server-authoritative rebase; each projection computed in exactly one place.
- **Server-truth verdicts** — LLM-judged outcomes are never optimistic; the ceiling is an optimistic "submitted" state.
- **Edition-invariant** — parts of the design that belong to the core regardless of edition (the seams, the session-log contract, the verifier golden matrix).

## Current app (as built today)

- **Sandbox template / live sandbox** — `sandbox/templates/<name>/` (committed fixtures) copied to `sandbox/live/<profileId>/<lessonId>/` (runtime, per-profile).
- **Verifier registry** — `src/lib/verifiers/index.ts`: `verifierId → (sandboxDir) => VerifyResult`; content references verifiers by id only (content is data, never code).
- **Judge** — `src/lib/judge.ts`: one Bedrock call, XML-tagged inputs, score computed in code as Σ weights of met criteria.
- **Progressive hints** — challenge hints unlocked one per failed verify, gentle→explicit.
- **stream-json / TermEvent** — the CLI's NDJSON output mode and the app's typed mapping of it (`{type: text|tool|result|error}`) forwarded as SSE.
- **dontAsk** — the CLI permission mode used in sandboxes: anything not in `allowedTools` is auto-denied, no prompts.

## Process terms (how this project was run)

- **Lane** — one team member's domain of ownership in the dream-team effort (Atlas=architecture, Nova=UX, Sage=learning engine, Ramesh=implementation, Priya=AI layer).
- **Frozen** — a decision closed after debate; reopening requires an explicit evidence-backed **freeze-challenge**.
- **Champion debate** — the adversarial pattern: two agents argue opposing positions (e.g., StepChamp vs ScrollChamp), a Lead adjudicates; the loser's best points are absorbed, not discarded.
- **Callsign** — the unique lineage-prefixed agent name (Nova-PacingTeam-StepChamp) required of every spawned agent at every depth.
- **Joint decisions log** — blueprint §8: what was aligned, what was contested with both positions recorded, and the owner's directives.
- **The origin docs** — this directory (`docs/origin/`): the durable record of reasoning (rejections, constraints, assumptions, glossary, uncertainty, dependencies, current state) behind the saved documents. Append-only.
