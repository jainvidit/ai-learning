# ROOT.1.1.2 verification evidence — beat compiler (REQ-CP-02)

Agent: `implementer-ROOT.1.1.2-gen0` (tier-2 hardened). All commands run in the MAIN
checkout `C:\Users\jainv\workplace\ai-learning-app` (see "Deviation" below).

| Command | Exit | Evidence file |
|---|---|---|
| `npm test` | 0 — **2 files, 65 tests passed** | `npm-test.txt` |
| `npx tsc --noEmit` | 0 — no output | `tsc-noemit.txt` |
| `npm run build` (`velite build --clean && next build`) | 0 — 14/14 static pages, all 15 routes | `npm-run-build.txt` |
| `npx eslint` on the 4 owned/created files | 0 — no output | `eslint-owned-files.txt` |

`authored-corpus-beats.json` is the actual emitted output of `compileAllLessonBeats()` over
the authored corpus (`npx tsx`, throwaway probe since deleted): **5 built lessons, 43
beats**, every one carrying `beatId` + closed-set `type` + `completion`, with no field
outside the frozen set.

## Criterion-by-criterion

### AC1 — every built lesson yields an ordered `Beat[]` with beatId / closed-set type / predicate (CP-02 sc. 1)

- `authored-corpus-beats.json`: all 5 `status: "built"` lessons emit non-empty ordered
  arrays; ids are `prose:<slug>` / `ex:<exerciseId>` only.
- Tests: `describe("REQ-CP-02 scenario 1 …")` asserts the shape for every fixture beat,
  asserts **no field outside `{beatId, type, persistent?, completion}`** (guards ADR-0011
  #6 — no `itemRevision`), asserts the 1:1 exercise→beat type mapping, asserts no `widget`
  beats are emitted (ADR-0011 #5), and asserts ordering.
- `describe("the real authored corpus compiles and conforms")` re-runs the whole gate over
  the on-disk corpus, so the criterion is proven against real content, not only fixtures.

### AC2 — beatId stability, proven by beat-model.md "How to test it" steps 1–4

Implemented literally, one `describe` per step, in `tests/beats.test.ts`:

| Step | `describe` block | Key assertion |
|---|---|---|
| 1 — compile fixture, record ordered id list | `beat-model.md step 1 …` | exact 10-id ordered list; h3 + fenced-code decoys are not boundaries; recompile is byte-identical (S2) |
| 2 — prose-only edit to a middle beat | `beat-model.md step 2 …` | **full beatId list unchanged**; whole beat array deep-equal (S1, S2) |
| 3 — insert a beat between beats 2 and 3 | `beat-model.md step 3 …` | every pre-existing id unchanged and deep-equal; new id is not any pre-existing id (I1); post-insertion ids shifted index but kept ids (S3) |
| 4 — delete a beat | `beat-model.md step 4 …` | **no surviving beat took the deleted id** (I2), and a later rebuild that adds different content still does not claim it |

Fixture: `tests/fixtures/beats-fixture-lesson.ts` — a TS module returning baseline + three
mutated variants. Chosen over an on-disk `.mdx` fixture deliberately: steps 2–4 each need a
*mutated* lesson, and writing into `content/**` from a test would race the real Velite build
and could leave the authored corpus dirty on an aborted run.

S3/I2 also hold structurally, not just empirically: duplicate keys throw instead of being
ordinal-suffixed (`describe("duplicate beat keys are a build failure …")`), and no counter,
index, timestamp or hash enters an id — `src/lib/beats.ts` is I/O-free and clock-free, which
is S2 as a code property.

### AC3 — terminal beats carry `persistent: true`; predicate x type mapping is compiler-enforced and fails the build

- `describe("REQ-CP-02 scenario 3 …")`: the fixture's terminal beat has `persistent: true`;
  non-persistent beats **omit** the flag (absent === false per contract); `assertValidBeats`
  throws `BeatCompileError` on a terminal beat lacking the flag.
- `describe("predicate x type mapping is compiler-enforced …")`: `COMPLETION_BY_BEAT_TYPE`
  deep-equals the contract table; the mapping is **total** over the closed set; and 12
  parameterised cases assert that **every invalid `type` x `completion` pair in the
  beat-model.md table throws** `BeatCompileError`.
- Two-layer enforcement: `Record<BeatType, CompletionPredicate>` makes `tsc` fail if a beat
  type is added without a predicate; `assertValidBeats()` re-checks emitted arrays so a
  future edit cannot ship a violating bundle.

### AC4 — the four verification commands pass with evidence paths

See the table at the top. All four exit 0.

## Deviation (recorded, not silent)

This agent was launched worktree-isolated, but its task directed the code to the MAIN
checkout, and the worktree has **no `node_modules`** — `npm test` / `tsc` / `next build`
cannot run there at all. Files were authored in the worktree (where the edit tools are
permitted to write) and mirrored to the main checkout, where every verification command was
executed. Both copies are byte-identical. No git command was run by this agent.

## No contract change

`.program/interfaces/beat-model.md` was **not edited**. `src/lib/schema.ts`,
`package.json`, `velite.config.ts` were **not touched**. Every pre-existing `content.ts`
export survives verbatim — asserted by a test that imports the module and checks all 14 of
them, including `isModuleUnlocked` and `lessonKey`.
