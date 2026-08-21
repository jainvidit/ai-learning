# Migration Maps

This directory contains migration map entries that link old content revisions to new ones when items materially change.

## Format

Each `.json` file in this directory contains one or more migration entries. Each entry must have:

- `itemId` (string, nonempty): The stable item ID (exercise ID or beat ID)
- `fromRevision` (string): The old content hash — exactly 16 lowercase hex characters, `/^[0-9a-f]{16}$/`
- `toRevision` (string): The new content hash — same format, and it must differ from `fromRevision`
- `note` (string, nonempty): Human-readable description of what changed

These rules are enforced by the loader, not just documented here (REQ-CP-05 scenario 2 —
an entry must actually link an old revision to a new one):

- empty strings, non-hex or wrong-length revisions, and uppercase hex are rejected;
- `fromRevision === toRevision` (a self-link migrates nothing) is rejected;
- two entries sharing `{itemId, fromRevision}` are rejected — whether they disagree on
  `toRevision` (a fork: a consumer could not resolve the old revision) or duplicate it
  exactly. Chain multiple hops instead: entry 2's `fromRevision` is entry 1's `toRevision`.

## Single Entry Example

File: `2026-07-25-loops-typo.json`

```json
{
  "itemId": "exercise-loops-001",
  "fromRevision": "a1b2c3d4e5f60001",
  "toRevision": "b2c3d4e5f6071112",
  "note": "Fixed typo in prompt: 'teh' -> 'the'"
}
```

## Multiple Entries Example

File: `2026-07-25-batch-updates.json`

```json
[
  {
    "itemId": "exercise-loops-001",
    "fromRevision": "a1b2c3d4e5f60001",
    "toRevision": "b2c3d4e5f6071112",
    "note": "Fixed typo in prompt"
  },
  {
    "itemId": "exercise-conditionals-003",
    "fromRevision": "c3d4e5f607a1b2c3",
    "toRevision": "d4e5f6071112a3b4",
    "note": "Updated distractor to fix misleading wording"
  }
]
```

## Usage

The migration maps are loaded via `loadMigrationMaps()` in `src/lib/revisions.ts` (synchronous). The loader:

- Reads all `.json` files in this directory, in sorted file-name order
- Validates each entry's shape AND content (see Format above)
- Returns an array of validated entries sorted by `(itemId, fromRevision, toRevision)` —
  the order never depends on filesystem enumeration order, so it is stable across platforms
- Throws descriptive errors if entries are malformed or conflict
- Ignores non-JSON files (like this README)
- Returns `[]` if this default directory is absent, but THROWS if a directory is passed
  explicitly and does not exist (a mistyped path must not look like "no migrations")

## Revision hashes

`fromRevision`/`toRevision` come from `computeItemRevision(content)` — SHA-256 over canonical
JSON, truncated to 16 lowercase hex characters. Hashable content is the JSON data model only
(ADR-0017): `null`, booleans, finite numbers, strings, arrays, and plain objects. Values such
as `Date`, `Map`, `Set`, `NaN`, `Infinity`, functions, or circular references are rejected with
a `TypeError` naming the offending path rather than being silently coerced.

## When to Create a Migration Entry

Create a migration entry when:

1. An exercise's content materially changes (rubric change, prompt rewording, distractor change)
2. A beat's content changes in a way that affects learning outcomes
3. The change is significant enough that attempts against the old revision should not be counted toward mastery of the new revision

Do NOT create entries for:

- Cosmetic changes (formatting, whitespace)
- Metadata changes (tags, display order)
- Typo fixes that don't affect correctness

## File Naming Convention

Use descriptive names with dates: `YYYY-MM-DD-description.json`

Examples:
- `2026-07-25-loops-typo.json`
- `2026-08-01-quiz-rubric-updates.json`
- `2026-08-15-challenge-hints-expanded.json`
