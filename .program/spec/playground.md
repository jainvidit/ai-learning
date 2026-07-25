# Capability: Playground

The prompt playground: streaming model runs against real Claude models, rubric display, and its judged-exercise surface. (Judging mechanics live in `judge-pipeline.md`; the coach margin-note in `coach-and-hints.md`.)

**Depends on:** `model-gateway.md` (ModelRouter; Sonnet-class learner-facing default), `api-and-streaming.md` (resumable SSE, stop endpoint REQ-API-03), `judge-pipeline.md` (verdict shape, tiers), `lesson-experience.md` (playground beats, ExerciseFrame).
**Depended on by:** `curriculum-content.md` (playground exercises, observe-then-explain experiments).
**Contract owner:** Priya (model side); Nova (surface).

---

## REQ-PG-01: Server-authoritative playground runs {#req-pg-01}

The server loads the exercise definition (never trusting the client for system prompt / maxTokens / rubric) and streams model output to the browser. The learner's prompt runs against a real Claude model. Rubrics grade the prompt, not the model's reply — the stable artifact, not the dice roll (kept: Sage "What NOT to change" #2).

**Source:** DREAM-BLUEPRINT.md §1, §6 keep-list items 1 & 4; INITIAL-BUILD-PLAN.md "Playground"; LEARNING-DESIGN-REVIEW-SAGE.md §1 & §5.
**Current state (docs/origin/CURRENT-STATE.md):** `api/playground/run` MODIFIED — SSE + server-side exercise loading survive; gains resumable-stream + stop endpoint. `Playground.tsx` MODIFIED — SSE reader + rubric card survive; gains coach margin-note, staged gate-verdict states, passed-state hydration. `src/lib/bedrock.ts` per model-gateway.

**Scenarios:**
1. Given a playground run request, when the server executes it, then systemPrompt/maxTokens/rubric come from the server-side exercise definition regardless of request-body contents.
2. Given a run in progress, when tokens stream, then they render live in the playground surface; a page refresh resumes the same run (api-and-streaming REQ-API-03).
3. Given the judge pipeline grading a playground submission, when the graded object is inspected, then it is the learner's prompt (with the model output as context), not a grade of the model's reply quality alone.

## REQ-PG-02: Rubric transparency and per-criterion feedback {#req-pg-02}

The learner-facing verdict is a per-criterion ✅/❌ rubric card with feedback quoting the learner's own words (evidence quotes — judge-pipeline REQ-JP-03) and a "show me a stronger prompt" disclosure (`improvedPromptExample` — which the Coach never holds, coach-and-hints REQ-CH-01). Assessment transparency (module 06 shows learners the rubric) is a protected property (Sage "What NOT to change" #2). Faded guidance: expert-tier and boss playgrounds must not enumerate every rubric element in instructions (Sage §1d; boss rule REQ-BT-01).

**Source:** LEARNING-DESIGN-REVIEW-SAGE.md §1, §5; UX-REVIEW-NOVA.md §1 strengths, §3 "Coach"; INITIAL-BUILD-PLAN.md "LLM-as-judge".
**Current state:** rubric card survives from today's Playground.tsx; feedback shape extends per judge-pipeline.

**Scenarios:**
1. Given a graded submission, when the verdict renders, then each criterion shows met/unmet with feedback that quotes the learner's own text.
2. Given the improved-prompt example, when rendered, then it is behind an explicit disclosure (not shown by default), and it is never present in coach/tutor context.
