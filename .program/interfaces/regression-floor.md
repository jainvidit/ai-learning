# Regression Floor — Verified Baseline Checklist

**Role:** This is the single shared regression checklist for all migration phases. Phase Gates (ROOT.1.8, ROOT.2.8, ROOT.3.8, ROOT.4.8, ROOT.5.8) cite rows by ID and never re-derive the list (glossary Gate level). Rows are append-only once cited. Maintained by ROOT.7.1 after ROOT.1.2 closes.

**Source authority:** REQ-MS-02 and REQ-MS-03 (.program/spec/migration-and-sequencing.md); docs/origin/CURRENT-STATE.md "Verified-working baseline" [OBSERVED]; ADR-0006.

Any migration step that breaks a behavior in this table halts. Replacement components retire their predecessors only after the replacement passes this baseline.

---

## Baseline Behaviors

| ID | Behavior | How to Verify |
|---|---|---|
| RF-01 | Dashboard, module page, lesson pages render | Navigate to `/` (dashboard), `/learn/01-how-llms-work` (module page), `/learn/01-how-llms-work/01-introduction` (lesson page); confirm content displays without errors |
| RF-02 | Quiz answers absent from client payload | Open DevTools Network tab, submit a quiz, inspect the response payload; confirm answer keys are NOT present in the client-side JSON |
| RF-03 | Profile create/switch/delete with full isolation | Create a new profile, make progress, switch to another profile; confirm progress is isolated. Delete a profile; confirm its data is removed. Access any authenticated route without the profile cookie; confirm 401 response |
| RF-04 | Server-side quiz grading with teaching explanations | Submit a quiz answer via `/api/quiz/submit`; confirm grading happens server-side and response includes teaching explanations per answered question. **ADR-0006 INTENDED CHANGE:** Failed submissions returning teaching explanations for answered questions with isomorphic-variant retries is INTENDED policy. Future changes to withheld-key display must be read as intended evolution, not regression |
| RF-05 | Live Bedrock playground streaming | Navigate to a lesson with a Playground exercise, run a prompt; confirm SSE text deltas stream in real-time and usage metadata is returned |
| RF-06 | Judge scores with score-in-code | Navigate to a lesson with a Judge exercise, submit a prompt; confirm the judge returns a 0-100 score with per-criterion feedback, and the score is computed in code (not by the model) |
| RF-07 | Full agent loop: spawn → fix → verify → reset | Navigate to a lesson with a Claude Code challenge, spawn an agent on a seeded-bug sandbox, confirm the agent fixes the bug, the verifier passes, and reset restores the broken fixture. Confirm the full multi-turn loop completes successfully |
| RF-08 | Non-localhost Host header → 403 | Send a request with a non-localhost Host header to any route; confirm 403 response (proxy.ts enforcement) |
| RF-09 | No secrets in client bundle | Inspect the client-side bundle (or DevTools Sources); confirm no AWS Bedrock credentials or API keys are present |
| RF-10 | Theme switcher | Use the ThemeToggle component to switch between light/system/dark themes; confirm the theme persists across page reloads |
| RF-11 | Active-profile indicator | Switch profiles; confirm the active profile is visually indicated in the profile picker UI |
| RF-12 | Independent nav scroll | Scroll the sidebar navigation independently of the main content area; confirm scroll positions are independent |
| RF-13 | Per-question quiz cards | Navigate to a lesson with a multi-question quiz; confirm each question is rendered as an independent card |

## Data-Safety Audit (REQ-MS-03)

| ID | Behavior | How to Verify |
|---|---|---|
| RF-14 | No code path deletes `data/**` or Workshop directory | Audit all migration scripts, cleanup scripts, and API routes; grep for `rm`, `unlink`, `rmdir`, `fs.remove`, `fs.rmSync` calls targeting `data/` or the future Workshop directory. Confirm no deletion code exists |
| RF-15 | Legacy JSON archived, not deleted, after verified import | After any storage migration (e.g., progress JSON → event log cutover), confirm legacy JSON files exist in an archived location (not deleted) |
| RF-16 | `docs/origin/` is append-only | Audit all code and scripts; confirm no deletions or overwrites of files under `docs/origin/`. Only appends or new files are allowed |

---

**Maintenance:** Rows RF-01 through RF-16 are frozen once cited by a Gate. New baseline behaviors discovered during migration may be appended as RF-17, RF-18, etc. Renumbering is prohibited (breaks audit evidence chain).
