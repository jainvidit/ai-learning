# Interface: Beat Model

**Contract owner:** Atlas (beat type steward)
**Current steward:** ROOT.1.2 (while open), ROOT.7.1 (after close)
**Source:** `.program/spec/content-pipeline.md` REQ-CP-02, `.program/decisions/ADR-0005.md`, `.program/spec/lesson-experience.md` REQ-LX-02 / REQ-LX-03, `.program/spec/terminal-experience.md` REQ-TX-01 / REQ-TX-02

---

## Overview

This document defines the **compiled beat model** — the output shape emitted by the beat compiler (`src/lib/content.ts`) after processing MDX + JSON authored content. This is NOT the authored input schema (that lives in `src/lib/schema.ts`; its seam doc, `content-schema.md`, is authored under ROOT.1.2.3 and may not exist yet).

Every lesson compiles to an ordered array of beats. Each beat represents a unit of instruction with a stable identity, a type from a closed vocabulary, optional persistence semantics, and a **completion predicate**.

### Read this before consuming the shape

Every field in this contract is **build-time data**. A compiled beat is immutable content, not a record of what a learner did. Consumer errors against earlier drafts of this doc read `completion` as runtime state; both halves of that confusion are ruled out explicitly:

| If you are looking for… | It is NOT here | It lives in |
|---|---|---|
| Whether *this learner* completed this beat | `completion` is not that field (see below) | Event log + projections, ROOT.2.1 |
| Rail state (done / current / upcoming / amber-skipped) | not a beat field | Lesson experience, ROOT.4.2 (REQ-LX-04) |
| Whether a beat's content changed between builds | `beatId` deliberately does not change for that | `itemRevision` content hash, REQ-CP-05 |
| Beat event names/shapes | out of scope | ROOT.2.1 (see Out of Scope) |

---

## Beat Type Shape

```typescript
type Beat = {
  beatId: string;           // Stable across rebuilds (REQ-CP-02 scenario 2)
  type: BeatType;           // Closed vocabulary (ADR-0005)
  persistent?: boolean;     // Absent === false. MUST be true for terminal/streaming beats.
  completion: CompletionPredicate;  // PREDICATE, not state. See "Completion Predicates".
}

type BeatType =
  | "prose"
  | "quiz"
  | "playground"
  | "terminal"
  | "challenge"
  | "widget";

type CompletionPredicate =
  | "passed"
  | "verified"
  | "attempted";
```

Field shape is frozen by REQ-CP-02's literal declaration. The closed `BeatType` set is frozen by ADR-0005.

---

## Completion Predicates

### `completion` is a predicate, not a state (normative)

`completion` declares **what would count as completing this beat** — the rule, fixed at compile time by the author and the compiler. It is **not** a runtime state field, **not** a per-learner value, and **not** mutated by the app.

- It has the **same value for every learner** and for every visit, until the content is rebuilt.
- It is **never written by the client or the server at runtime**. A consumer that assigns to `beat.completion` is misusing this contract.
- It answers *"how is this beat completed?"* (`"passed"` = a correct answer is required), never *"is this beat complete?"*.
- Per-learner completion **state** is derived from events and projections owned by ROOT.2.1, and is joined to a beat by `beatId`. It never travels inside the compiled beat.

Concretely: `completion: "passed"` on a quiz means *"passing is required here"* — it does **not** mean *"the learner passed"*. A freshly compiled bundle that no learner has ever opened still has `completion: "passed"` on that beat.

### Predicate semantics

| Predicate | Means (as a requirement) | Satisfied by | Mastery evidence |
|---|---|---|---|
| `"passed"` | Correct answer(s) required | Deterministic correctness check (score recorded) | Yes (score) |
| `"verified"` | Gate-tier judge verdict required | Server-truth rubric verdict, never optimistic (REQ-LX-05) | Yes (rubric verdict) |
| `"attempted"` | Engagement only; no correctness bar | Learner engaged with the beat | **No** (Sage's firewall, REQ-LX-02 scenario 2) |

### Predicate × type mapping (closure)

REQ-CP-02 freezes the *shape* — it does not by itself constrain which predicate may appear on which type, so unconstrained the field admits meaningless pairs (e.g. `"verified"` on prose: there is no rubric and no judge for prose, so that pair has no defined satisfaction condition). **This table closes the mapping.** It is a **compiler-enforced convention** — enforced by the beat compiler (ROOT.1.1), not expressible in the TypeScript types above:

| `type` | Valid `completion` | Invalid | Why / where a stricter need goes |
|---|---|---|---|
| `prose` | `"attempted"` | `"passed"`, `"verified"` | No correctness bar and no judge exists for prose. |
| `quiz` | `"passed"` | `"verified"`, `"attempted"` | REQ-LX-02: lesson completion requires quizzes `passed`. |
| `playground` | `"attempted"` | `"passed"`, `"verified"` | REQ-LX-02: playground/exploratory beats only `attempted`; judged work is authored as a `challenge` beat instead. |
| `terminal` | `"attempted"` | `"passed"`, `"verified"` | The terminal is a surface, not a graded artifact. Sandbox work is graded by the **paired challenge beat** (REQ-LX-06 scenario 2; Verify lives on the challenge card, REQ-TX-02 scenario 3). |
| `challenge` | `"verified"` | `"passed"`, `"attempted"` | REQ-LX-02: challenges are `verified` by the gate-tier judge. |
| `widget` | `"attempted"` | `"passed"`, `"verified"` | Custom interactives are engagement-only. A widget needing a correctness bar is authored as `quiz` (deterministic) or `challenge` (judged). |

Provenance, stated honestly: the `quiz`, `challenge`, and `playground` rows are direct readings of REQ-LX-02; the `prose`, `terminal`, and `widget` rows are **this contract's convention**, chosen as the narrowest option consistent with REQ-LX-02's attempted-only firewall and REQ-LX-06's SandboxBeat pairing. Widening any row is a steward decision (ROOT.1.2 while open, ROOT.7.1 after) and is additive (see Change Protocol).

**Consumers must still read the field, not infer it from `type`.** The mapping is compile-time data that the steward may widen and that ADR-0005's additive-`recap` fallback path could extend; a consumer that hardcodes `type → predicate` breaks on the next additive change.

### Lesson completion gate

Lesson completion requires `passed` for quizzes and `verified` for challenges; `attempted`-only beats never block completion (REQ-LX-02). Boss-flagged exercises are excluded from completion entirely until passed — the exclusion is driven by the authored `role: "boss"` flag (REQ-CP-03), independent of the beat's predicate, and a boss gates Mastered rather than Complete (boss-and-test-out REQ-BT-01).

---

## Beat ID Stability

`beatId` is **stable across rebuilds** (REQ-CP-02 scenario 2) so that resume positions, telemetry correlation, and dashboard resume-to-beat deep links survive content edits.

"Stable" is stated below as testable invariants rather than as an algorithm. The derivation algorithm is the beat compiler's choice (ROOT.1.1) and is **not** part of this contract; any derivation satisfying S1–S4 conforms. Note that a purely **ordinal** derivation (`beat-1`, `beat-2`, …) does **not** conform — it fails S3.

### What PRESERVES a beatId

Given a lesson compiled at build A and rebuilt at build B, a beat that still exists in B keeps its build-A `beatId` when:

- **S1 — Prose/content edits without structural change.** Editing the text, markup, or embedded media inside a beat, fixing typos, or reformatting the file preserves that beat's `beatId`. This is REQ-CP-02 scenario 2 literally: *previously existing beats keep their prior `beatId`s.* No beat insertion, deletion, reordering, or retyping = no ID change anywhere in the lesson.
- **S2 — Deterministic rebuild.** Rebuilding unchanged source produces byte-identical `beatId`s. No build counter, timestamp, hash-of-build, or random component may enter a `beatId`.
- **S3 — Edits elsewhere in the lesson.** Inserting, deleting, or reordering *other* beats must not change *this* beat's `beatId`. Identity is per-beat, never positional.
- **S4 — Edits to non-identity metadata.** Changing lesson-level or beat-level metadata that is not part of the beat's identity key (title, estimated minutes, objectives prose, difficulty tier, hint rungs) preserves `beatId`s.

### What INVALIDATES a beatId

- **I1 — A genuinely new beat.** A newly authored beat gets a fresh `beatId`. It must never receive the `beatId` of a removed beat.
- **I2 — Deletion retires the ID.** A deleted beat's `beatId` is retired and must never be reassigned to a different beat. A stored resume position pointing at it must resolve to "beat no longer exists" and degrade (the dashboard falls back to the lesson top), never to a different beat.
- **I3 — Change of the authored identity key.** Renaming the anchor / exercise ID / stable slug a beat is keyed to yields a different beat identity — treated as I2 + I1 (retire and create), with a migration map entry when the change is material (REQ-CP-05 scenario 2).
- **I4 — Change of `type`.** Re-authoring a beat as a different `BeatType` is a new beat identity (retire + create): a stored predicate or renderer expectation must not silently switch types under a stable ID. This is also ADR-0005's stated reason for not shipping coarse types that later split.

### How to test it

The invariants are assertion-shaped on purpose:

1. Compile a fixture lesson → record the ordered `beatId` list.
2. Apply a prose-only edit to a middle beat, recompile → **assert the full `beatId` list is unchanged** (S1, S2).
3. Insert a new beat between beats 2 and 3, recompile → **assert every pre-existing `beatId` is unchanged**, and the new beat's ID is not any retired ID (S3, I1).
4. Delete a beat, recompile → **assert no surviving beat took the deleted ID** (I2).

`beatId` intentionally carries **no** information about whether a beat's content changed. Content-change detection is `itemRevision`, a content hash that changes while the ID does not (REQ-CP-05 scenario 1).

---

## Beat Type Vocabulary

The beat type vocabulary is the **closed set** from ADR-0005:

- **prose**: Text content, images, embedded media
- **quiz**: Multiple-choice or interactive knowledge checks
- **playground**: Exploratory coding environments
- **terminal**: Interactive shell/REPL sessions (always `persistent: true`)
- **challenge**: Graded exercises with rubrics
- **widget**: Custom interactive components

**Important:** The session-end/recap beat is an **authored convention over a prose beat** (ADR-0005), NOT a distinct schema type. Authoring marks a prose beat with frontmatter/anchor metadata to signal its session-end role; the compiled `type` remains `"prose"` (and its predicate is therefore `"attempted"`). The warm-up beat 0 framing (REQ-LX-04) is likewise a convention, not a type. ADR-0005 records the fallback if that reading is wrong: add `recap` as an **additive** type and migrate the convention-marked prose beats — beatId stability for all other beats is preserved.

Nova's coarser taxonomy (`interactive` / `exercise` / `recap`) is a rendering-level grouping *over* these types, not an alternative type set (ADR-0005). It must not appear in compiled output.

---

## Persistent Beats

`persistent` is **optional in the shape** and **required to be `true` for one class of beats**. Both halves are normative:

- **Default when absent:** `persistent` absent means `false`. Consumers MUST treat `undefined` and `false` identically. Read the flag — do not re-derive persistence from `type`.
- **Required `true` for:** every beat of `type: "terminal"`, and every **streaming beat** — a beat whose content is fed by a live server stream while the learner is on the page (terminal sessions, agent runs, SSE-fed widgets). REQ-CP-02 scenario 3: *"Given a terminal or streaming beat, when it is compiled, then it carries `persistent: true`."*
- **Who enforces the requirement:** the **beat compiler** (ROOT.1.1). It is a compile-time obligation, so a bundle containing a terminal or streaming beat without `persistent: true` is a **compiler defect and a build failure**, not a runtime condition to be patched. Consumers may assume the invariant holds; a consumer that "fixes" a missing flag at runtime masks a build bug and must fail loudly instead.

For any beat with `persistent: true`, the beat's DOM instance must:

- **Stay mounted** across beat transitions within the lesson (REQ-LX-03 scenario 1)
- Never receive `display:none` styling (REQ-LX-03 scenario 2)
- Never collapse to zero height (REQ-LX-03 scenario 2)
- Reserve minimum height so xterm `fit()` can compute dimensions safely

---

### Steward ruling — what "streaming beat" means (ROOT.7.1, 2026-07-25) — NARROW, ratified

**Additive clarification. It changes no field, no default, and no existing value's meaning**
— it only says which beats the existing `persistent: true` requirement already reached.
Logged on `events/ROOT.7.1.jsonl`; requested by `coordinator-ROOT.1.1-gen0`
(`field_request` 2026-07-25T17:40:03Z, arbitration record `events/ROOT.1.1.jsonl`
17:40:01).

**Question.** `Playground.tsx` consumes an SSE response stream from
`/api/playground/run`. Does a **playground** beat therefore fall under the streaming-beat
`persistent: true` requirement above?

**Ruling: NO. The narrow reading is ratified.** `PERSISTENT_BEAT_TYPES = { terminal }`
(`src/lib/beats.ts`) is correct and stands. A playground beat MUST NOT be marked
`persistent` on the strength of its SSE transport alone.

**The deciding test — session identity, not transport.** The requirement's obligations are
*session-survival* obligations, not stream-handling ones: stay mounted across beat
transitions **and route changes**, never `display:none`, never zero height, reserve
min-height so xterm `fit()` is safe. Read them against the shard text:

- **lesson-experience REQ-LX-03** states the obligation set and then vests instance
  ownership in the PersistentTerminalHost (`terminal-experience REQ-TX-01`).
- **terminal-experience REQ-TX-01** scopes that host to **xterm instances** — its three
  scenarios are same-instance-with-scrollback across route changes, scrollback restoration
  via `@xterm/addon-serialize` plus event-log replay for the gap, and WebGL context-loss
  fallback.
- **`docs/origin/GLOSSARY.md`** (line 23 — the *only* glossary carrying this entry;
  `.program/GLOSSARY.md` has none) likewise defines a persistent beat as one that "stays
  mounted across navigation within the lesson … (xterm safety by construction)".

So the question a compiler must answer is **"is there a session identity to restore?"** —
not "does bytes-over-time reach the client?". A playground run is **request-scoped**: it
completes, its output becomes ordinary client state, there is no session to reattach to, no
scrollback to serialize, and no xterm to `fit()`. Marking it `persistent: true` would
impose portal-slot obligations on ROOT.4.2 and ROOT.4.6 that **nothing in their specs asks
for**, and would put a non-xterm instance under a host defined to own xterm instances. The
narrow reading is also the least-irreversible one: widening later is additive, whereas
retracting a wrongly-set flag would strand consumers that had built slots for it.

**Honest note on the residual ambiguity.** "Streaming beat" is **not** defined in any shard;
REQ-CP-02 scenario 3 uses it disjunctively ("a terminal **or streaming** beat"), so the
second limb must denote something a terminal beat is not. This document's own gloss above
enumerates that limb as "terminal sessions, **agent runs**, **SSE-fed widgets**" — and
conspicuously **not** playgrounds, though `playground` is a first-class member of the same
closed `BeatType` set. That enumeration is the reading ratified here. The limb is
currently **vacuous in the authored corpus** — no agent-run or session-backed SSE widget
beat is authored yet — which is why `PERSISTENT_BEAT_TYPES` has exactly one member. It is
vacuous because the corpus lacks members, **not** because the compiler denies the category.

**Widening path, pre-authorized in shape but NOT in effect.** If a beat with genuine
session identity is later authored (an agent-run beat; a session-backed SSE widget whose
stream must survive navigation; a playground redesigned around a *resumable* session), the
steward widens by:

1. one entry added to `PERSISTENT_BEAT_TYPES` in `src/lib/beats.ts`, and
2. one line appended here recording which type was added and why.

That is an **additive** change under the Change Protocol: **no `beatId` churn** (the set
feeds the `persistent` flag, never id derivation), no field added or removed, no consumer
migration. `assertValidBeats()` then enforces the new member at build time as it does for
`terminal`. Widening remains a **steward decision** — a producer or consumer item that
widens it unilaterally has made a contract change the protocol forbids. Note the converse
too: because the flag is compiler-set and build-enforced, a widening requires a content
**rebuild** for existing bundles to carry the new flag.

**Consumers: this changes nothing you must do.** The standing rule above still binds —
**read the `persistent` flag; never re-derive persistence from `type`.** A consumer that
special-cases `type === "terminal"` will break on the first widening, which this ruling
explicitly leaves open.

**Ratification attestation (steward batch 2, 2026-07-25).** The ruling text above was
drafted in steward batch 1, which stopped before logging it; batch 2 re-derived it rather
than inherit it. Every citation was re-read at the source before ratifying: REQ-LX-03
(`lesson-experience.md` lines 36–46 — obligation set, then "Instance ownership lives with
the PersistentTerminalHost"), REQ-TX-01 (`terminal-experience.md` lines 11–21 — "owns all
**xterm** instances", three scenarios all xterm/session-shaped), REQ-CP-02 scenario 3
(`content-pipeline.md` line 33, verbatim as quoted above), and `docs/origin/GLOSSARY.md`
line 23. Two facts were re-verified empirically rather than assumed: `PERSISTENT_BEAT_TYPES`
in `src/lib/beats.ts` has exactly one member, `"terminal"` (line 91–93), enforced at build
time by `assertValidBeats()` (line 413); and `src/app/api/playground/run/route.ts` returns a
per-request `ReadableStream` with `Content-Type: text/event-stream` and carries **no session
identifier** (line 62–112) — confirming the request-scoped premise the ruling turns on.
Independent conclusion: **the narrow reading is correct and is hereby ratified**; nothing in
either shard ties `persistent` to transport, and both tie it to a restorable session
instance.

---

## Portal-Slot Contract (REQ-LX-03, REQ-TX-01)

The rendering contract for persistent beats involves the **PersistentTerminalHost** and **portal slots**:

### Architecture

1. **PersistentTerminalHost** (root-level, REQ-TX-01)
   - Owns all xterm instances (`src/app/layout.tsx` hosts it)
   - Manages session lifecycle and scrollback restoration (`@xterm/addon-serialize` plus event-log replay for the gap, REQ-TX-01 scenario 2)
   - Portals instances into beat slots or the bottom dock
   - Terminal sessions survive **route changes**, not merely beat transitions (REQ-TX-01 scenario 1)

2. **Beat Slots** (within `BeatRenderer`, REQ-LX-03)
   - Lessons render an ordered sequence of beats; all beats mount at full height (REQ-LX-01)
   - Persistent beats receive a **portal slot** — a reserved DOM container
   - The PersistentTerminalHost portals the appropriate xterm instance into the slot

3. **Bottom Dock** (REQ-TX-02)
   - Alternative portal destination for terminal instances
   - Per-sandbox tabs with live status; sessions outlive pages
   - Verify is never moved into the dock — it stays on the challenge card and deep-links to its beat (REQ-TX-02 scenario 3)

### Portal-Slot Invariants

For any beat with `persistent: true`:

- The beat slot **stays mounted** as long as the lesson is rendered
- The slot is **never given `display:none`**
- The slot is **never collapsed to zero height** (min-height reserved)
- xterm instances portal in/out without remounting the underlying DOM

This design ensures xterm `fit()` can compute dimensions safely and that terminal sessions survive navigation.

---

## Consumers and Change Protocol

### Primary Consumers

1. **Beat Compiler** (`src/lib/content.ts`) — **produces** this shape
   - Implemented under **ROOT.1.1** (content pipeline): emits beat arrays from MDX/JSON source, generates `beatId`s satisfying S1–S4, sets `persistent: true` for terminal/streaming beats, and enforces the predicate × type mapping.
   - **ROOT.1.3** (API & streaming) carries the compiled beats over the wire — the oRPC/Zod boundary transports this shape and must not reshape or re-derive it.

2. **Lesson Experience** (`BeatRenderer`, ROOT.4.2)
   - Renders beat sequences with soft-frontier pacing (REQ-LX-01)
   - Hosts portal slots for persistent beats
   - Evaluates each beat's **predicate** against per-learner state from ROOT.2.1 projections to compute lesson completion — it reads `completion` as the rule and never writes to it

3. **Terminal Experience** (`PersistentTerminalHost`, ROOT.4.6)
   - Portals xterm instances into beat slots and the dock
   - Manages session detachability (REQ-TX-03)

4. **Dashboard Resume-to-Beat** (ROOT.4.3)
   - Deep-links to `beatId` from stored resume positions (REQ-LX-07 scenario 2)
   - Relies on beatId stability (S1–S4) and on the I2 degradation rule for retired IDs

### Change Protocol

- **While ROOT.1.2 is open:** interface changes must be approved by ROOT.1.2 (Atlas, beat type steward)
- **After ROOT.1.2 closes:** stewardship transfers to ROOT.7.1 (standing steward, ADR-0007)
- Consumers request changes by logging a `field_request` event on their own item's events file; the steward serves them in a batch. Nobody else edits this file.

**Additive changes** (allowed; no consumer migration required): adding a `BeatType` via ADR-0005's `recap` fallback path; widening a predicate × type row; adding an optional field with a documented default. Each still requires a steward decision and a note here, and must preserve existing `beatId`s and existing field meanings.

**Breaking changes** (require more): removing or renaming a field, narrowing an existing value set, changing a field's meaning, or changing `beatId` derivation in a way that violates S1–S4. Each requires:

- A content bundle version bump (REQ-CP-04)
- A migration plan for the consumers listed above, plus migration map entries where item identity moves (REQ-CP-05)
- Updated contract documentation here, before the change lands

---

## Out of Scope

**Event types** are explicitly deferred to **ROOT.2.1** (Event Log and Projections). ROOT.2.1 owns the beat-related event namespace — names, payload shapes, emission points, and projections — and nothing in this file constrains it. Beat-view telemetry (REQ-LX-07 scenario 3) and server-confirmed lesson completion (REQ-LX-05 scenario 1) are required behaviors of those lanes; the event identifiers are ROOT.2.1's to define and are deliberately not enumerated here.

Also out of scope: the authored input schema (`src/lib/schema.ts` / `content-schema.md`, ROOT.1.2.3), `itemRevision` hashing and migration maps (REQ-CP-05, ROOT.1.1), rail and frontier visual states (ROOT.4.2), and the per-learner completion projections that `completion` is evaluated against (ROOT.2.1).

**Steward scoping note (ROOT.7.1, 2026-07-25 — steward-note backlog 4, inherited from
ROOT.1.2's close).** The ROOT.2.1 deferral in the paragraph above is about **beat telemetry
into the `learning_events` store** (`event-log-and-projections.md` REQ-EL-01…04) and the
per-learner completion projections that `completion` is evaluated against. It must **not**
be read as making this document, or `event-log-and-projections.md`, the place to resolve a
**`TermEvent`** question. `TermEvent` is a **distinct event family**: its *requirements*
live in `execution-layer.md` **REQ-EX-02 / REQ-EX-03** (co-owned with
`api-and-streaming.md`; protocol owner Ramesh), it concerns a **different log** — the
durable, sequence-numbered *session* log with `attach(sessionId, fromSeq)` replay, not the
append-only `learning_events` store — and the **authoritative deferral table** for it is
the "Event payload — DEFERRED" table in `.program/interfaces/agent-runner.md` (section
heading at line 157; the three-row table at lines 163–167, followed by its
"boundary stated plainly" paragraph — cite the heading, not the line numbers, which drift). ROOT.2.1
is the steward item that will define the *types* for both families; that shared type-owner
is the only thing the two have in common, and it is not a shared schema. Anything in this
program trying to answer a `TermEvent` question from `event-log-and-projections.md` (or
from this file) is reading the wrong shard.

**Grounding re-verified (steward batch 2, 2026-07-25).** Drafted in batch 1, which stopped
before logging it; batch 2 re-checked each claim. Confirmed at source: the four REQ-EL ids
in `event-log-and-projections.md` are REQ-EL-01…04 as cited and that shard contains **zero**
occurrences of `TermEvent` (grep count 0); `execution-layer.md` **REQ-EX-02** is the
durable sequence-numbered session log and **REQ-EX-03** the reattachable session, with its
header stating the co-ownership and naming Ramesh as the protocol's contract owner (lines
5 and 7); and the `agent-runner.md` deferral table exists as cited. This note is scoping
prose only — it adds no field, changes no deferral, and moves no ownership.
