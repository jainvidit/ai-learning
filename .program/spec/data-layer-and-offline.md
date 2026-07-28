# Capability: Data Layer & Offline

The frozen UX read/write contract, its two implementations (Home: SQLite + in-process reactive cache; Hosted: Zero over Postgres), and the honest offline scope.

**Depends on:** `event-log-and-projections.md` (what is being read/written), `api-and-streaming.md` (write path), `content-pipeline.md` (versioned bundle is what gets precached).
**Depended on by:** `dashboard-and-wayfinding.md` (reactive reads), `lesson-experience.md` (offline lesson rendering), `hosted-edition.md` (Zero specifics).
**Contract owner:** Nova owns the UX contract (frozen); Ramesh corrected the offline scope (Zero cannot queue offline writes — fact-checked).

---

## REQ-DL-01: The frozen UX contract for reads and writes {#req-dl-01}

Every dashboard/navigation read is a reactive local query (<100ms, zero network on nav); writes are optimistic with server-authoritative rebase; every projection is computed in exactly one place (cross-link: event-log REQ-EL-03). Exception carve-out: LLM-judged verdicts are never optimistic — server-truth only; the ceiling is an optimistic "submitted" state (REJECTED.md).

**Source:** DREAM-BLUEPRINT.md §2 "Data layer & offline (The UX contract, frozen)"; UX-REVIEW-NOVA.md §5 P0-1; GLOSSARY.md "UX contract (reads)", "Server-truth verdicts".
**Current state (docs/origin/CURRENT-STATE.md):** new; today reads are per-request fs recompute (`content.ts` note: "Per-request fs recompute later replaced by LearnerState projection").

**Scenarios:**
1. Given dashboard or sidebar navigation, when a read occurs, then it is served from the local reactive store in <100ms with zero network requests on the navigation.
2. Given an optimistic write later rejected by the server, when the rebase lands, then the UI converges to the server-authoritative state.
3. Given an LLM-judged submission, when its UI state is observed before the server verdict, then it shows at most "submitted" — never an optimistic pass/fail.

## REQ-DL-02: Home Edition — SQLite + in-process reactive cache, no sync infra {#req-dl-02}

The Home Edition satisfies the same contract with SQLite + an in-process reactive cache and no sync infrastructure — single process where possible, files/embedded stores over managed databases (CONSTRAINTS.md #15 [HARD]).

**Source:** DREAM-BLUEPRINT.md §2 "Data layer", §3 "Personal-desktop-tool directive"; §7 radar row "DB".
**Current state:** replaces the JSON progress store per event-log REQ-EL-01's migration rules (never delete `data/**`).

**Scenarios:**
1. Given a Home Edition install, when running, then no external database or sync service is required — one process (or a minimal fixed set) serves everything.
2. Given a learner-model write in the Home Edition, when committed, then dependent reactive queries update without polling.

## REQ-DL-03: Honest offline scope — content bundle + local quiz grading + outbox replay {#req-dl-03}

Zero CANNOT queue offline writes (fact-checked; REJECTED.md). v1 offline = precached versioned content bundle (static route, never RSC flight payloads) + client-rendered lessons + locally graded quizzes with a custom IndexedDB outbox + idempotency keys; the server re-grades authoritatively on replay. Playground/terminal/challenge are never offline and say so ("terminal needs network for the model — same as today"). Serwist service worker; `navigator.storage.persist()` + eager replay to survive iOS ITP eviction. PowerSync is the recorded upgrade path.

**Source:** DREAM-BLUEPRINT.md §2 "Data layer & offline (honest scope — Ramesh)", §7 radar rows "Offline replay", "Service worker", §8 aligned decision 9. NOTE: offline support in a personal desktop tool is an unresolved scope tension — see OPEN-QUESTIONS.md #5.
**Current state:** new; no offline support exists today.

**Scenarios:**
1. Given a device offline with a precached bundle, when the learner opens a prose/quiz lesson, then it renders client-side and quizzes grade locally.
2. Given quiz attempts made offline, when connectivity returns, then the outbox replays them with idempotency keys, the server re-grades authoritatively, and duplicate replays produce no duplicate events.
3. Given an offline learner reaching a playground, terminal, or challenge beat, when it renders, then it plainly states that this exercise needs network — it never fakes availability. **Domain (ADR-0026):** "offline learner" quantifies over the enumerated offline states (Home v1: navigator.onLine=false OR model-gateway fetch failure; see ADR-0026 for full closed-world enumeration, Home-v1-reachability rulings, and additive relaxation path if REQ-DL-03 full machinery is later implemented).
4. Given the precache configuration, when inspected, then it targets the versioned static bundle route, never RSC flight payloads.
