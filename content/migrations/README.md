# Migration Maps

This directory contains migration map entries that link old content revisions to new ones when items materially change.

## Format

Each `.json` file in this directory contains one or more migration entries. Each entry must have:

- `itemId` (string): The stable item ID (exercise ID or beat ID)
- `fromRevision` (string): The 16-character hex hash of the old content
- `toRevision` (string): The 16-character hex hash of the new content
- `note` (string): Human-readable description of what changed

## Single Entry Example

File: `2026-07-25-loops-typo.json`

```json
{
  "itemId": "exercise-loops-001",
  "fromRevision": "a1b2c3d4e5f6g7h8",
  "toRevision": "b2c3d4e5f6g7h8i9",
  "note": "Fixed typo in prompt: 'teh' -> 'the'"
}
```

## Multiple Entries Example

File: `2026-07-25-batch-updates.json`

```json
[
  {
    "itemId": "exercise-loops-001",
    "fromRevision": "a1b2c3d4e5f6g7h8",
    "toRevision": "b2c3d4e5f6g7h8i9",
    "note": "Fixed typo in prompt"
  },
  {
    "itemId": "exercise-conditionals-003",
    "fromRevision": "c3d4e5f6g7h8i9j0",
    "toRevision": "d4e5f6g7h8i9j0k1",
    "note": "Updated distractor to fix misleading wording"
  }
]
```

## Usage

The migration maps are loaded via `loadMigrationMaps()` in `src/lib/revisions.ts`. The loader:

- Reads all `.json` files in this directory
- Validates each entry against the required schema
- Returns an array of all validated entries
- Throws descriptive errors if entries are malformed
- Ignores non-JSON files (like this README)

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
