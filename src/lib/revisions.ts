/**
 * Content revision hashing and migration map utilities.
 * REQ-CP-05: Stable item IDs + content-hash itemRevision + migration maps
 */

import { readdir, readFile } from 'fs/promises';
import { join } from 'path';
import { z } from 'zod';

// Migration entry schema - validate locally per item file requirement
const MigrationEntrySchema = z.object({
  itemId: z.string(),
  fromRevision: z.string(),
  toRevision: z.string(),
  note: z.string(),
});

export type MigrationEntry = z.infer<typeof MigrationEntrySchema>;

/**
 * Computes a deterministic content-hash itemRevision for any content.
 * Uses canonical JSON (recursively sorted object keys) followed by SHA-256,
 * truncated to 16 hex characters.
 *
 * @param content - Any JSON-serializable content
 * @returns 16-character hex hash string
 */
export function computeItemRevision(content: unknown): string {
  const canonicalJson = canonicalStringify(content);
  const hash = sha256(canonicalJson);
  return hash.slice(0, 16);
}

/**
 * Builds a map of item IDs to their itemRevision hashes.
 * Throws if duplicate IDs are encountered.
 *
 * @param items - Array of items with id and content fields
 * @returns Record mapping id to itemRevision
 * @throws Error if duplicate IDs are found
 */
export function buildRevisionsMap(
  items: Array<{ id: string; content: unknown }>
): Record<string, string> {
  const map: Record<string, string> = {};
  const seenIds = new Set<string>();

  for (const item of items) {
    if (seenIds.has(item.id)) {
      throw new Error(`Duplicate item ID encountered: ${item.id}`);
    }
    seenIds.add(item.id);
    map[item.id] = computeItemRevision(item.content);
  }

  return map;
}

/**
 * Loads and validates migration map entries from content/migrations/*.json.
 *
 * @param dir - Optional directory path (defaults to content/migrations)
 * @returns Array of validated migration entries
 * @throws Error if entries are malformed or validation fails
 */
export async function loadMigrationMaps(dir?: string): Promise<MigrationEntry[]> {
  const migrationsDir = dir ?? join(process.cwd(), 'content', 'migrations');

  let files: string[];
  try {
    files = await readdir(migrationsDir);
  } catch (error) {
    // If directory doesn't exist, return empty array
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return [];
    }
    throw error;
  }

  const jsonFiles = files.filter(f => f.endsWith('.json'));
  const entries: MigrationEntry[] = [];

  for (const file of jsonFiles) {
    const filePath = join(migrationsDir, file);
    const content = await readFile(filePath, 'utf-8');

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to parse JSON in ${file}: ${(error as Error).message}`);
    }

    // Handle both single entry and array of entries
    const arrayOfEntries = Array.isArray(parsed) ? parsed : [parsed];

    for (const entry of arrayOfEntries) {
      try {
        const validated = MigrationEntrySchema.parse(entry);
        entries.push(validated);
      } catch (error) {
        if (error instanceof z.ZodError) {
          throw new Error(
            `Invalid migration entry in ${file}: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`
          );
        }
        throw error;
      }
    }
  }

  return entries;
}

/**
 * Produces canonical JSON string with recursively sorted object keys.
 * Ensures deterministic serialization regardless of original key order.
 */
function canonicalStringify(value: unknown): string {
  if (value === null) return 'null';
  if (value === undefined) return 'undefined';

  if (typeof value === 'boolean' || typeof value === 'number' || typeof value === 'string') {
    return JSON.stringify(value);
  }

  if (Array.isArray(value)) {
    const items = value.map(item => canonicalStringify(item));
    return `[${items.join(',')}]`;
  }

  if (typeof value === 'object') {
    const keys = Object.keys(value).sort();
    const pairs = keys.map(key => {
      const val = (value as Record<string, unknown>)[key];
      return `${JSON.stringify(key)}:${canonicalStringify(val)}`;
    });
    return `{${pairs.join(',')}}`;
  }

  // Fallback for other types (functions, symbols, etc.)
  return JSON.stringify(value);
}

/**
 * Computes SHA-256 hash of a string and returns hex encoding.
 * Uses Node.js crypto module.
 */
function sha256(input: string): string {
  // Dynamic import for Node.js crypto to avoid bundler issues
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(input, 'utf8').digest('hex');
}
