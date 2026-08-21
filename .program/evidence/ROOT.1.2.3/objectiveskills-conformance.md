# ROOT.1.2.3 gen1 — review-fix conformance evidence

Fix pass after blind spec-conformance review (2 findings). Only artifact touched:
`.program/interfaces/content-schema.md`. `src/lib/schema.ts` was read-only (this item is
not the schema steward).

## Source-of-truth extraction: `sed -n '219,222p;229p;232,234p' src/lib/schema.ts`

```
export const ObjectiveSkillsSchema = z.object({     # line 219
  objective: z.string().min(1),                     # line 220  <- REQUIRED, no .optional()
  skillIds: z.array(SkillIdSchema).min(1),          # line 221  <- REQUIRED, no .optional()
});                                                 # line 222
  objectives: z.array(z.string()).min(1).max(6),    # line 229 (LessonFrontmatterSchema)
  skillIds: z.array(SkillIdSchema).min(1).optional(),                        # line 232
  objectiveSkills: z.array(ObjectiveSkillsSchema).min(1).max(6).optional(),  # line 234
```

## Verbatim string greps (all matched)

| Cited string | grep result |
|---|---|
| `objectiveSkills: z.array(ObjectiveSkillsSchema).min(1).max(6).optional(),` | schema.ts:234 |
| `objective: z.string().min(1),` | schema.ts:220 |
| `objectives: z.array(z.string()).min(1).max(6),` | schema.ts:229 |

Every name and constraint newly written into the doc is verified verbatim against source.
No line number is cited inside the doc itself (line numbers drift; names do not).

## MAJOR finding 1 — authorable carrier field now named

`ObjectiveSkillsSchema` was previously only a sub-bullet *under* `skillIds`, so an
authoring agent had no reachable field. The skill-references list now names:

- `ObjectiveSkillsSchema` as its own entry, with both members (`objective`, `skillIds`);
- `objectiveSkills` with full constraints `.min(1).max(6).optional()` on
  `LessonFrontmatterSchema`, stated as the only route to the sidecar.

## MINOR finding 2 — required-within-sidecar stated

Two explicit statements added: "REQUIRED within the sidecar object" on the schema entry,
plus an "Optionality note" scoping the doc's blanket "all extensions are optional" claim to
use sites on existing schemas, and stating that `objective` and `skillIds` are required once
an `objectiveSkills` entry exists.

## Empirical verification

- `npx tsc --noEmit` run in worktree `agent-a0d93ad2300952fb1`: exit 0, no output.
  Confirms the cited exports/types compile as named.
- Content-scoped diff (CRLF-normalized, `diff /tmp/main.md /tmp/wt.md`) confirms the ONLY
  changed region is the "Skill references" block: 1 line removed, 8 added (later reduced to
  6 by folding a continuation paragraph into its bullet). No other section — additive-only
  rule, difficulty tiers, role flag, hint ladder, misconception tags, preconditions,
  artifact/verifier declarations, test-out probes, extensions spread, stewardship rule,
  consumers, verification commands, out-of-scope list — differs from the gen0 reviewed text.

## Contract-shape assessment (tier-2 obligation)

No contract shape changed. `src/lib/schema.ts` is untouched; this is a documentation-only
correction that makes an already-landed field (`objectiveSkills`, landed by ROOT.1.2.1)
discoverable. No `needs_split` or blocked signal.
