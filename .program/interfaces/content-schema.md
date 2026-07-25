# Content Schema Interface

**Single source of truth**: `src/lib/schema.ts`  
**Spec reference**: `.program/spec/content-pipeline.md#req-cp-03`

## Additive-only rule

The Zod content contract in `src/lib/schema.ts` is **extended**, never replaced. Fields may be added, but never renamed, retyped, or removed. This additivity guarantee allows existing content authored against the original contract to continue validating without modification (REQ-CP-03 scenario 1).

Well-formed values are accepted; malformed values are rejected by `npm run validate` (REQ-CP-03 scenario 3).

## Phase-0 extension fields (as landed by ROOT.1.2.1)

All extensions are **optional** at every use site unless otherwise noted.

### Skill references
- **`SkillIdSchema`**: `z.string().min(1)` — reference to a skill in the module's skill registry (REQ-MM-01). Shape only; registry membership is resolved by CI gate (REQ-CP-06 scenario 2), not by schema validation.
- **`skillIds`**: `z.array(SkillIdSchema).min(1).optional()` — appears on:
  - `LessonFrontmatterSchema` (lesson-level)
  - `QuizQuestionSchema`
  - `ExerciseAuthoringExtensionsSchema` (spread into all four exercise types)
  - `RubricCriterionSchema`
  - `TestOutProbeSchema`
- **`ObjectiveSkillsSchema`**: `z.object({ objective, skillIds })` — the per-objective sidecar, additive over `objectives: string[]` (which stays `string[]` verbatim). Its two members are **REQUIRED within the sidecar object**:
  - `objective`: `z.string().min(1)` — repeats the objective text verbatim. Matching it against a declared objective is a CI gate (REQ-CP-06), keeping schema validation context-free.
  - `skillIds`: `z.array(SkillIdSchema).min(1)` — note **no `.optional()`** here, unlike every other `skillIds` use site.
- **`objectiveSkills`**: `z.array(ObjectiveSkillsSchema).min(1).max(6).optional()` — the authorable carrier field that reaches the sidecar. Appears on:
  - `LessonFrontmatterSchema` — the field itself is optional; `.max(6)` mirrors `objectives: z.array(z.string()).min(1).max(6)`. Authors attach per-objective skills by adding `objectiveSkills` entries to lesson frontmatter; there is no other route to `ObjectiveSkillsSchema`.
- **Optionality note**: the "all extensions are optional" rule applies to *use sites on existing schemas*. Once an author opts into an `objectiveSkills` entry, both `objective` and `skillIds` are **required within `ObjectiveSkillsSchema`** and validation fails if either is absent.

### Difficulty tiers
- **`DifficultyTierSchema`**: `z.enum(["intro", "core", "stretch"])` — exactly three values (REQ-CP-03).
- **`tier`**: `DifficultyTierSchema.optional()` — appears on:
  - `LessonFrontmatterSchema`
  - `QuizQuestionSchema`
  - `ExerciseAuthoringExtensionsSchema` (spread into all four exercise types)

### Role flag
- **`ExerciseRoleSchema`**: `z.enum(["boss"])` — carried by an existing exercise type; boss is not a new exercise type (REQ-BT-01).
- **`role`**: `ExerciseRoleSchema.optional()` — appears on:
  - `ExerciseAuthoringExtensionsSchema` (spread into all four exercise types)
- **CI enforcement**: exactly one boss per module (REQ-CP-06 scenario 3).

### Hint ladder
- **`HintRungSchema`**: `z.object({ rung: z.number().int().min(1).max(4), text: z.string().min(1) })` — one authored rung of the four-rung hint ladder (REQ-CH-03):
  1. reflective question
  2. micro-explanation
  3. worked example in another domain
  4. full guided walkthrough
- **`HintLadderSchema`**: `z.array(HintRungSchema).min(1).max(4)` with uniqueness refinement on `rung` values.
- **`hintLadder`**: `HintLadderSchema.optional()` — appears on:
  - `ExerciseAuthoringExtensionsSchema` (spread into all four exercise types)
- **Note**: `ChallengeExerciseSchema` retains legacy `hints: z.array(z.string()).optional()` (flat progressive hints); `hintLadder` is the rung-aware form.

### Misconception tags on distractors
- **`MisconceptionTagSchema`**: `z.string().min(1)` — carried by a single quiz distractor (REQ-CP-03 scenario 2), per-option rather than per-question.
- **`misconception`**: `MisconceptionTagSchema.optional()` — appears on:
  - `QuizOptionSchema` (distractors, i.e., options not in `correctOptionIds`)

### Preconditions
- **`PreconditionSchema`**: `z.string().regex(/^[a-z][a-z0-9-]*:[a-z0-9][a-z0-9._-]*:[a-z][a-z0-9-]*$/)` — precondition predicate in form `"<namespace>:<id>:<state>"`, e.g., `"artifact:claude-md:healthy"` (REQ-WA-05 scenario 4). Shape validated here; whether the referenced artifact/verifier exists is a CI/registry question (REQ-CP-06), not a schema one.
- **`preconditions`**: `z.array(PreconditionSchema).optional()` — appears on:
  - `ExerciseAuthoringExtensionsSchema` (spread into all four exercise types)
- **NAMING NOTE**: The exercise-level precondition field is named **`preconditions`** (NOT `requires`). `CurriculumEntrySchema.requires` is the curriculum-level field that lists prerequisite module IDs. The distinct names prevent conflation.

### Artifact/verifier declarations
- **`ArtifactKindSchema`**: `z.enum(["config", "doc", "skill", "hook", "feature"])` (REQ-WA-03).
- **`ArtifactDeclarationSchema`**: `z.object({ id, kind, title, paths, verifierId, benefit? })` — declares what a Workshop exercise pass produces and which capability verifier asserts it stays healthy (REQ-WA-03, REQ-WA-05). `benefit` is the one-line plain-language line the artifact shelf renders (REQ-WA-04).
- **`produces`**: `z.array(ArtifactDeclarationSchema).min(1).optional()` — appears on:
  - `ExerciseAuthoringExtensionsSchema` (spread into all four exercise types)

### Test-out probe declarations
- **`TestOutProbeKindSchema`**: `z.enum(["boss-equivalent", "concept-quiz", "hands-on"])` (REQ-BT-02).
- **`TestOutProbeSchema`**: declares a test-out ("Prove it") probe with the following fields:
  - `id`: `z.string().min(1)`
  - `kind`: `TestOutProbeKindSchema`
  - `sourceExerciseId`: `z.string().min(1).optional()` — exercise whose verifier/rubric this probe reuses (the module boss for boss-equivalent). **REQUIRED for kind `"boss-equivalent"`** (enforced by refinement), optional otherwise. Concept-quiz probes sample lessons and need no source exercise (REQ-BT-02).
  - `fixture`: `z.string().min(1).optional()` — the different fixture the reused verifier/rubric runs against. **REQUIRED for kind `"boss-equivalent"`** (enforced by refinement).
  - `lessonId`: `z.string().min(1).optional()` — lesson this probe samples, for per-lesson concept quizzes.
  - `skillIds`: `z.array(SkillIdSchema).min(1).optional()`
- **`TestOutDeclarationSchema`**: `z.object({ probes: z.array(TestOutProbeSchema).min(1) })`
- **`testOut`**: `TestOutDeclarationSchema.optional()` — appears on:
  - `ModuleMetaSchema`

### Authoring extensions spread
**`ExerciseAuthoringExtensionsSchema`** — the optional authoring fields every existing exercise type gains, spread verbatim into `QuizExerciseSchema`, `PlaygroundExerciseSchema`, `TerminalExerciseSchema`, and `ChallengeExerciseSchema` so the four types cannot drift apart:
- `skillIds`
- `tier`
- `role`
- `hintLadder`
- `preconditions`
- `produces`

## Schema stewardship rule

**Only the schema steward edits `src/lib/schema.ts`.**

- **While ROOT.1.2 is open**: ROOT.1.2 is the schema steward.
- **After ROOT.1.2 closes**: ROOT.7.1 is the schema steward.

**Consumers must NOT edit the schema file directly.** Instead:
1. Record a `field_request` event in your item's events file.
2. Route the request through your coordinator.
3. Non-additive requests (rename, retype, remove) are **rejected** pending an ADR.

## Consumers

The following consume the authoring contract defined in `src/lib/schema.ts`:

1. **Content build/validate scripts** (`scripts/validate-content.ts`)
2. **Velite pipeline** (ROOT.1.3)
3. **Curriculum authoring** (ROOT.5)
4. **Content generation** (content-generation agents)
5. **CI gates** (REQ-CP-06: schema conformance, anchor integrity, skill-registry references, exactly one boss per module, ≥2 isomorph variants per review-eligible objective, rubric-change-requires-golden-update)

## Verification commands for schema changes

When the schema is extended, run the following verification commands:

1. **`npm run validate`** — validates all content files against the extended schema.
2. **`npx tsc --noEmit`** — ensures TypeScript type-checking passes.

Both commands must succeed before the schema change is considered landed.

---

**Out of scope for this file**:
- **Beat model types** (`beatId`, `type`, `completion`) — compiler OUTPUT (REQ-CP-02), not an authoring surface; see `.program/interfaces/beat-model.md`.
- **Module skill REGISTRY declaration** (4–6 named skills per module, REQ-MM-01) — only `skillIds` references are authored here; the registry's declaration site and reference resolution belong to the mastery-model lane and REQ-CP-06 CI gates.
- **Artifact runtime state** (`status`, `moduleOfOrigin`, `provenanceEventId` from REQ-WA-03) — projection state on the event log, not authored content.
