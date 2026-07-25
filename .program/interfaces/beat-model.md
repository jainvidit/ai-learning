# Interface: Beat Model

**Contract owner:** Atlas (beat type steward)  
**Current steward:** ROOT.1.2 (while open), ROOT.7.1 (after close)  
**Source:** `.program/spec/content-pipeline.md` REQ-CP-02, `.program/decisions/ADR-0005.md`, `.program/spec/lesson-experience.md` REQ-LX-03, `.program/spec/terminal-experience.md` REQ-TX-01

---

## Overview

This document defines the **compiled beat model** — the output shape emitted by the beat compiler (`src/lib/content.ts`) after processing MDX + JSON authored content. This is NOT the authored input schema (that lives in `content-schema.md` / `src/lib/schema.ts`).

Every lesson compiles to an ordered array of beats. Each beat represents a unit of instruction with a stable identity, a type from a closed vocabulary, optional persistence semantics, and a completion predicate.

---

## Beat Type Shape

```typescript
type Beat = {
  beatId: string;           // Stable across rebuilds (REQ-CP-02 scenario 2)
  type: BeatType;           // Closed vocabulary type
  persistent?: boolean;     // Terminal/streaming beats stay mounted
  completion: CompletionPredicate;
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

### Beat ID Stability

Beat IDs (`beatId`) are **stable across rebuilds** per REQ-CP-02 scenario 2. When lesson prose is edited without structural changes (no beat insertion/deletion/reordering), previously existing beats retain their prior `beatId`s. This stability enables:

- Resume positions to survive content edits
- Telemetry correlation across versions
- Dashboard resume-to-beat deep-linking

### Beat Type Vocabulary

The beat type vocabulary is the **closed set** from ADR-0005:

- **prose**: Text content, images, embedded media
- **quiz**: Multiple-choice or interactive knowledge checks
- **playground**: Exploratory coding environments (attempted-only completion)
- **terminal**: Interactive shell/REPL sessions (persistent)
- **challenge**: Graded exercises with rubrics (verified completion)
- **widget**: Custom interactive components

**Important:** The session-end/recap beat is an **authored convention over a prose beat** (ADR-0005), NOT a distinct schema type. Authoring marks a prose beat with frontmatter/anchor metadata to signal its session-end role; the compiled type remains `"prose"`.

### Persistent Beats

Terminal and streaming beats carry `persistent: true` (REQ-CP-02 scenario 3). This flag signals that the beat's DOM instance must:

- **Stay mounted** across beat transitions within the lesson
- Never receive `display:none` styling
- Never collapse to zero height
- Reserve minimum height for xterm `fit()` safety

Persistence is **REQUIRED** for `type: "terminal"` beats and any beat hosting streaming interactive content.

---

## Portal-Slot Contract (REQ-LX-03, REQ-TX-01)

The rendering contract for persistent beats involves the **PersistentTerminalHost** and **portal slots**:

### Architecture

1. **PersistentTerminalHost** (root-level, defined in REQ-TX-01)
   - Owns all xterm instances
   - Manages session lifecycle and scrollback restoration
   - Portals instances into beat slots or the bottom dock

2. **Beat Slots** (within `BeatRenderer`, defined in REQ-LX-03)
   - Lessons render an ordered sequence of beats
   - Persistent beats receive a **portal slot** — a reserved DOM container
   - The PersistentTerminalHost portals the appropriate xterm instance into the slot

3. **Bottom Dock** (defined in REQ-TX-01)
   - Alternative portal destination for terminal instances
   - Per-sandbox tabs
   - Sessions outlive page transitions

### Portal-Slot Invariants

For any beat with `persistent: true`:

- The beat slot **stays mounted** as long as the lesson is rendered
- The slot is **never given `display:none`**
- The slot is **never collapsed to zero height** (min-height reserved)
- xterm instances portal in/out without remounting the underlying DOM

This design ensures xterm `fit()` can compute dimensions safely and terminal sessions survive navigation within the lesson.

---

## Completion Predicates

Each beat declares one of three completion predicates (REQ-LX-02):

| Predicate | Meaning | Typical Types | Mastery Evidence |
|-----------|---------|---------------|------------------|
| `"passed"` | Correct answer(s) required | `quiz` | Yes (score recorded) |
| `"verified"` | Gate-tier judge verified | `challenge` | Yes (rubric verdict) |
| `"attempted"` | Engagement only | `playground`, `prose` | No (Sage's firewall) |

**Lesson completion gate:** requires `passed` for quizzes, `verified` for challenges; `attempted`-only beats do not block. Boss-flagged exercises are excluded from completion entirely until passed (REQ-LX-02).

---

## Consumers and Change Protocol

### Primary Consumers

1. **Beat Compiler** (`src/lib/content.ts`, ROOT.1.3)
   - Emits beat arrays from MDX/JSON source
   - Enforces stable beatId generation
   - Sets `persistent: true` for terminal beats

2. **Lesson Experience** (`BeatRenderer`, ROOT.4)
   - Renders beat sequences with soft-frontier pacing
   - Hosts portal slots for persistent beats
   - Computes lesson completion from beat completion states

3. **Terminal Experience** (`PersistentTerminalHost`, ROOT.4)
   - Portals xterm instances into beat slots and dock
   - Manages session detachability

4. **Dashboard Resume-to-Beat** (ROOT.5)
   - Deep-links to `beatId` from stored resume positions
   - Relies on beatId stability across rebuilds

### Change Protocol

- **While ROOT.1.2 is open:** interface changes must be approved by ROOT.1.2 (Atlas, beat type steward)
- **After ROOT.1.2 closes:** stewardship transfers to ROOT.7.1 (maintenance & evolution)

Any change that affects compiled beat shape, beatId generation logic, or persistence semantics is a **breaking change** requiring:

- Version bump in content bundle output (REQ-CP-04)
- Migration plan for consumers
- Updated contract documentation

---

## Out of Scope

**Event Types** are explicitly deferred to ROOT.2.1 (Event Log and Projections). Beat-related events include:

- `beat_viewed` (telemetry on every beat entering viewport)
- `beat_completed` (per-beat completion events)
- `lesson_completed` (server-confirmed completion)

The event schema, emission logic, and projection consumers are owned by ROOT.2.1, not this interface.
