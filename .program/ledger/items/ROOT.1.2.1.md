---
id: ROOT.1.2.1
parent: ROOT.1.2
type: Task
title: schema.ts additive extension — new authoring fields, Module 1 validates unchanged
ledger_depth: 3
status: in_progress
owner_agent: implementer-ROOT.1.2.1-gen2 # critical-variant rework: 2 must-fix review findings (changes_requested, coordinator-ROOT.1.2-gen1)
generation: 2
spec_refs:
  - .program/spec/content-pipeline.md#req-cp-03
acceptance_criteria:
  - src/lib/schema.ts gains ALL of, as OPTIONAL fields (additive only, no existing field renamed/retyped/removed) — per-objective skillIds (string[]), difficulty tier enum intro|core|stretch, role:"boss" flag, hint-ladder rungs on authored hints, misconception tag expressible on each quiz distractor (REQ-CP-03 scenario 2), artifact/verifier declarations, requires-preconditions array of strings like "artifact:claude-md:healthy" (workshop-and-artifacts REQ-WA-05 scenario 4), test-out probe declarations (boss-and-test-out REQ-BT-02 — same verifier/rubric, different fixture; curriculum-content REQ-CC-04 scenario 1 lists the authoring surface)
  - npm run validate passes against today's Module 1 content with ZERO content edits (REQ-CP-03 scenario 1 additivity check)
  - npx tsc --noEmit passes
  - Malformed values for the new fields are rejected by the Zod schema (REQ-CP-03 scenario 3 — e.g. tier outside the enum fails parse)
depends_on: []
blocks: [ROOT.1.2.3]
children: []
file_ownership: ["src/lib/schema.ts"]
review: {tier: 2, required_lenses: [spec-conformance, consumer-fit], verdicts: []}
verification:
  - criterion: "schema.ts gains all 7 new authoring surfaces as OPTIONAL fields, additive only"
    how_checked: "Implemented in src/lib/schema.ts. Diff vs main proves additivity: exactly ONE pre-existing line changed (the inline quiz-option object `options: z.array(z.object({id,text})).min(2)` extracted to named QuizOptionSchema with id/text byte-identical plus optional misconception). Zero existing fields renamed, retyped, removed or made required. Mapping: per-objective skillIds -> ObjectiveSkillsSchema + LessonFrontmatter.objectiveSkills/skillIds; tier -> DifficultyTierSchema (intro|core|stretch) on all 4 exercise types, quiz questions, lesson frontmatter; role:boss -> ExerciseRoleSchema on all 4 EXISTING types (no new union member); hint rungs -> HintRungSchema/HintLadderSchema (rung 1-4, unique) alongside surviving legacy ChallengeExercise.hints; misconception -> QuizOptionSchema.misconception (per-option/per-distractor); artifact/verifier -> ArtifactDeclarationSchema via .produces[]; requires-preconditions -> PreconditionSchema regex <ns>:<id>:<state> via .requires[]; test-out probes -> TestOutProbeSchema/TestOutDeclarationSchema via ModuleMeta.testOut."
    evidence_path: ".program/evidence/ROOT.1.2.1/reject-probe.txt (sections 1-10, 43/43 assertions) + .program/evidence/ROOT.1.2.1/reject-probe.ts.txt"
    by_agent: implementer-ROOT.1.2.1-gen1
  - criterion: "npm run validate passes against today Module 1 content with ZERO content edits (REQ-CP-03 scenario 1)"
    how_checked: "`npm run validate` in worktree, exit 0: 14 modules, all 5 lessons of 01-how-llms-work valid (1,1,1,2,2 exercises), 'All content valid.' Zero-content-edit proven independently by `diff -rq --strip-trailing-cr` of worktree content/ vs main content/ => exit 0, ALL IDENTICAL. Also confirmed only src/lib/schema.ts differs across all of src/ (all other src diffs were CRLF-only artifacts of worktree checkout)."
    evidence_path: ".program/evidence/ROOT.1.2.1/validate-final.txt (FINAL_VALIDATE_EXIT=0); also .program/evidence/ROOT.1.2.1/validate.txt, .program/evidence/ROOT.1.2.1/validate-npm.txt"
    by_agent: implementer-ROOT.1.2.1-gen1
  - criterion: "npx tsc --noEmit passes"
    how_checked: "`npx tsc --noEmit` in worktree, exit 0, no diagnostics. Run twice: once with the probe .ts present (tsconfig include is **/*.ts so the probe was in the typecheck surface) and again in the final deliverable state after the probe .ts was removed from the repo tree. Pre-edit baseline was also exit 0, so green is attributable."
    evidence_path: ".program/evidence/ROOT.1.2.1/tsc-final.txt (FINAL_TSC_EXIT=0); also .program/evidence/ROOT.1.2.1/tsc.txt"
    by_agent: implementer-ROOT.1.2.1-gen1
  - criterion: "Malformed values for the new fields are rejected by the Zod schema (REQ-CP-03 scenario 3)"
    how_checked: "Ran a 43-assertion tsx probe via Bash (npx tsx), exit 0, 43 passed / 0 failed. Uses safeParse and asserts both directions. Out-of-enum tier is rejected at the primitive AND through the full ExercisesFileSchema: tier 'expert'/'Core'/2 -> 'Invalid option: expected one of intro|core|stretch'; {...quiz, tier:'hard'} -> rejected. Also rejected: role 'miniboss'; type:'boss' as an exercise type (proves boss is a flag, not a type); skillIds [] / 's1' / [3]; misconception '' and 7; hint rung 5 and 0, duplicate rungs, empty rung text; preconditions 'artifact:claude-md', 'healthy', 'Artifact:claude-md:healthy'; artifact kind 'markdown', paths [], missing verifierId; probe kind 'essay', boss-equivalent probe with no fixture, testOut with zero probes; objectiveSkills with empty skillIds. Accepted counterparts all parse, and legacy no-new-field quiz/challenge/frontmatter still parse."
    evidence_path: ".program/evidence/ROOT.1.2.1/reject-probe.txt (PROBE_EXIT=0, 43 passed 0 failed); probe source .program/evidence/ROOT.1.2.1/reject-probe.ts.txt"
    by_agent: implementer-ROOT.1.2.1-gen1
  - criterion: "INDEPENDENT RE-VERIFICATION of all 4 criteria against the INTEGRATED main-checkout schema (duplicate-implementer reconciliation)"
    how_checked: "A duplicate concurrent agent using the SAME name (implementer-ROOT.1.2.1-gen1, worktree agent-a14c2ab9a5be2a8d4) implemented this item while I was implementing it independently in worktree agent-a187fcaa2f92bc282; director-gen0 then integrated ITS file into main. I did not trust its evidence files. Re-proved on the integrated code: (a) npm run validate on MAIN exit 0, 14 modules, all 5 Module 1 lessons valid, content/ untouched; (b) npx tsc --noEmit on MAIN exit 0, no diagnostics; (c) all 7 required surfaces present in main src/lib/schema.ts by direct read (DifficultyTierSchema intro|core|stretch, ExerciseRoleSchema boss on all 4 EXISTING types via ExerciseAuthoringExtensionsSchema.shape spread, HintRung/HintLadderSchema, QuizOptionSchema.misconception per-distractor, ArtifactDeclarationSchema + verifierId, PreconditionSchema for artifact:claude-md:healthy, TestOutProbeSchema with sourceExerciseId+fixture, LessonFrontmatter.objectiveSkills per-objective skillIds); (d) malformed-value rejection re-proved with MY OWN throwaway 39-assertion tsx probe (npx tsx, exit 0, 39 passed / 0 failed) written against main's exported symbols — tier 'expert'/'Core'/2 rejected with \"Invalid option: expected one of intro|core|stretch\", tier 'hard' rejected through the full ExercisesFileSchema, type:'boss' rejected as an exercise type (proves flag-not-type), bad preconditions/rungs/artifact-kinds/probe-without-fixture rejected, and all legacy no-new-field shapes still accepted. Probe was created outside src/ and DELETED — no test file committed."
    evidence_path: "inline in this entry (re-runnable); prior agent's files at .program/evidence/ROOT.1.2.1/* corroborate but were not relied on"
    by_agent: implementer-ROOT.1.2.1-gen1 (worktree agent-a187fcaa2f92bc282)
artifacts:
  - src/lib/schema.ts # THE ONLY code file changed (additive)
  - .program/evidence/ROOT.1.2.1/validate-final.txt
  - .program/evidence/ROOT.1.2.1/tsc-final.txt
  - .program/evidence/ROOT.1.2.1/reject-probe.txt
  - .program/evidence/ROOT.1.2.1/reject-probe.ts.txt
  - .program/evidence/ROOT.1.2.1/lint-schema.txt
  - .program/evidence/ROOT.1.2.1/validate.txt
  - .program/evidence/ROOT.1.2.1/validate-npm.txt
  - .program/evidence/ROOT.1.2.1/tsc.txt
resume_hint: "COMPLETE and ALREADY INTEGRATED INTO MAIN — awaiting tier-2 review only (spec-conformance + consumer-fit). NOTHING LEFT TO IMPLEMENT OR MERGE: src/lib/schema.ts in the MAIN checkout already contains the additive extension (director-gen0 integrated it; 14159 bytes, 385 lines). DO NOT merge src/lib/schema.ts from ANY worktree: worktree agent-a187fcaa2f92bc282 was a duplicate concurrent implementation whose file has been overwritten to be byte-identical to main, and worktree agent-a14c2ab9a5be2a8d4's copy is the one already integrated — re-merging either is a no-op at best and a clobber at worst. Also do NOT take worktree scripts/run-e2e-with-server.sh (pre-existing unrelated drift). Re-verify anytime from the main checkout with: npm run validate && npx tsc --noEmit (both exit 0, confirmed twice independently post-integration). Do NOT copy .program/evidence/ROOT.1.2.1/reject-probe.ts.txt into the repo as a .ts file — tsconfig include is **/*.ts and it would enter the typecheck surface."
---

Pinned contract decisions (do not re-decide at leaf level):
- Every new field is OPTIONAL so existing content parses unchanged.
- Tier enum is exactly `intro | core | stretch` (REQ-CP-03 text).
- Boss is `role: "boss"` on EXISTING exercise types — not a new exercise type (REQ-BT-01).
- Misconception tags attach to quiz distractors (per-option), not per-question only.
- requires-preconditions is a string array of artifact predicates (WA-05 form
  `"artifact:claude-md:healthy"`); schema validates shape, not registry membership
  (registry checks are REQ-CP-06 CI work, out of scope here).
- Test-out probe declaration references the module boss's verifier/rubric with a
  different fixture (BT-02 scenario 4); shape only, no runtime behavior.
- Beat model types do NOT go in this file — they are compiler output (REQ-CP-02),
  documented in .program/interfaces/beat-model.md.

## Rollback note (gen2, written BEFORE first code edit — tier-3 obligation)

gen2 will make exactly TWO changes, both confined to src/lib/schema.ts (worktree
agent-a88c42047b991b9c3; main already holds the gen1 artifact at md5
22e58c595a7a8551a85dcbaf010c9526, byte-identical to the worktree copy at gen2 start):
1. Rename ExerciseAuthoringExtensionsSchema field `requires` -> `preconditions`
   (exercise-level authoring extension only; CurriculumEntrySchema.requires untouched),
   updating comments that reference the exercise-level name.
2. Make TestOutProbeSchema.sourceExerciseId optional and add a .refine requiring it
   when kind === "boss-equivalent" (mirrors the existing fixture refine).
UNDO: restore src/lib/schema.ts to the pre-gen2 artifact — `git -C <main> checkout
c0ecb27^..HEAD -- src/lib/schema.ts` is NOT needed; simplest exact undo is
`git checkout HEAD -- src/lib/schema.ts` in whichever checkout was patched, since the
gen1 artifact is the committed/integrated state and gen2 touches no other file. Both
changes are pure-schema (no content files, no consumers currently read the renamed
field — verified by grep: only src/lib/schema.ts references `preconditions`/exercise
`requires`/`sourceExerciseId`), so reverting the one file is a complete rollback.
No data/** paths, no sandbox paths, no two-key contract files are touched.

## Plan (tier-2, written before implementing)
- Contract touched: the authoring contract in src/lib/schema.ts — Zod schemas for curriculum/module/lesson-frontmatter/exercises. Additive optional fields only.
- Other side owners: .program/interfaces/ is EMPTY at dispatch time (no seam docs written yet); consumers of this contract are scripts/validate-content.ts (imports CurriculumSchema, ModuleMetaSchema, ExercisesFileSchema, LessonFrontmatterSchema), src/lib/content.ts, src/lib/judge.ts, src/lib/progress.ts, src/lib/profiles.ts, and lesson components (type-only imports). ROOT.1.2.3 (content-schema.md seam doc) documents this seam downstream and is blocked on me.
- Will NOT change: any existing field name/type/optionality; PlaygroundExercise rubric-sums-to-100 refine; ExerciseSchema union membership; Progress/Profile interfaces; scripts/validate-content.ts; any content file; package.json. No beat-model types (REQ-CP-02, ROOT.1.2.2 owns those). No module-level skill REGISTRY declaration (registry membership = REQ-CP-06 CI work, pinned out of scope).

## Verification log (gen1, all commands run in worktree agent-a14c2ab9a5be2a8d4)

| check | command | exit | evidence |
|---|---|---|---|
| content additivity | npm run validate | 0 | .program/evidence/ROOT.1.2.1/validate-final.txt |
| typecheck | npx tsc --noEmit | 0 | .program/evidence/ROOT.1.2.1/tsc-final.txt |
| malformed rejection (REQ-CP-03 s3) | npx tsx (probe) | 0 (43/43) | .program/evidence/ROOT.1.2.1/reject-probe.txt |
| lint (shared file touched) | npx eslint src/lib/schema.ts | 0 | .program/evidence/ROOT.1.2.1/lint-schema.txt |
| zero content edits | diff -rq --strip-trailing-cr content/ vs main | 0 (identical) | inline, re-runnable |

Pre-edit baseline was ALSO validate exit 0 / tsc exit 0, so post-edit green is attributable.

Dependency fact established empirically (not from memory): the worktree has NO node_modules; Node
resolves upward to the main checkout. require.resolve("zod") ->
C:\Users\jainv\workplace\ai-learning-app\node_modules\zod\index.cjs, version 4.4.3. Zod 4
object .shape spread is what lets ExerciseAuthoringExtensionsSchema apply to all four exercise
types without restating fields; for PlaygroundExercise the spread goes INSIDE the z.object so the
existing rubric-weights-sum-to-100 .refine is preserved untouched.

Design notes for the reviewer (consumer-fit lens):
- objectives stays string[] verbatim. Per-objective skillIds are an additive sidecar
  (objectiveSkills: [{objective, skillIds}]) rather than a retype of objectives to objects, because
  retyping would violate additive-only and break every authored lesson plus its consumers. Cost:
  objective text is repeated; checking it matches a declared objective is a REQ-CP-06 CI job.
- Exercise-level requires (precondition predicates) is a DIFFERENT field from
  CurriculumEntry.requires (prerequisite module ids), which is untouched. Same name, different
  object - flagged so the seam doc (ROOT.1.2.3) documents both and no consumer conflates them.
- ChallengeExercise.hints (flat string[]) survives verbatim; hintLadder is the new rung-aware form.
  Both may coexist; deciding precedence is runtime behaviour, out of scope for a schema leaf.
- Only role "boss" is in ExerciseRoleSchema, written as an enum (not z.literal) so future roles are
  additive. type:"boss" is proven NOT parseable as an exercise type (probe section 3), which is the
  REQ-BT-01 "flag not a type" guarantee.
- Registry membership (skillId resolves, verifierId resolves, exactly-one-boss-per-module,
  artifact/precondition target exists) is deliberately NOT validated here - pinned to REQ-CP-06.
  Schema validation stays context-free so one file can be validated in isolation.
- No beat-model types were added (REQ-CP-02 / ROOT.1.2.2 owns those).

Observations for the integrator / coordinator (NOT authored by me):
- On arrival the item file said gen0; an external write had already set owner_agent:
  implementer-ROOT.1.2.1-gen1 / generation: 1 with the note "gen0 died pre-edit with coordinator
  gen0 (infra)". Files win per operating precedence, so I kept gen1 rather than overwriting it back
  to the gen0 my dispatch prompt named. This was gen1's FIRST code attempt - no prior attempt had
  touched schema.ts (main's schema.ts was pristine at baseline), so this is not a failed-twice case.
- Pre-existing drift NOT caused by me and NOT in my ownership: the worktree copy of
  scripts/run-e2e-with-server(.sh) differs from main in content (dev server vs production server,
  next dev vs npm run start) in addition to CRLF. My worktree copy is the older/dev variant; I never
  touched it. Whoever merges must take MAIN's version of that file, not the worktree's.
- All other worktree-vs-main diffs across src/ and content/ are CRLF-only checkout artifacts;
  src/lib/schema.ts is the only real code difference.
- The probe source is stored as reject-probe.ts.txt (NOT .ts) on purpose: tsconfig include is
  **/*.ts, and the probe imports the new symbols, so landing it as .ts anywhere schema.ts is not yet
  merged would break npx tsc --noEmit.
