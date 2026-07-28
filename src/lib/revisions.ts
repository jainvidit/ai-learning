/**
 * Content revision hashing and migration map utilities.
 * REQ-CP-05: Stable item IDs + content-hash itemRevision + migration maps
 *
 * Hash-input domain (REQ-CP-05 "Hash-input domain", ADR-0017 reading B as
 * AMENDED — Amendment 1, 2026-07-27: closed world, holes, depth bound):
 *
 *   HASHABLE — this enumeration is EXHAUSTIVE; there is no third category:
 *   null; booleans; finite numbers (-0 normalized to 0); strings; DENSE PLAIN
 *   arrays (prototype exactly Array.prototype; index slots only) of hashable
 *   values; plain objects (Object.prototype or null prototype) with
 *   string keys and hashable values — key order irrelevant, keys whose value is
 *   `undefined` are omitted — nested to a maximum depth of MAX_HASH_DEPTH = 64
 *   (root = depth 0, objects and arrays counted together). Distinct values in
 *   this domain MUST produce distinct canonical forms.
 *
 *   EVERYTHING ELSE throws a TypeError naming the JSON path of the offending
 *   value. The implementation is a closed-world ALLOWLIST (A1.3): a dispatch
 *   whose default branch throws — never a denylist of known-bad cases.
 *   Illustrative rejects (NOT definitional): `undefined` (except as an omitted
 *   object value), functions, symbols (as values or as keys), BigInt, NaN,
 *   +/-Infinity, Date, Map, Set, RegExp, typed arrays, non-plain class
 *   instances (INCLUDING Array subclass instances and cross-realm /
 *   reassigned-prototype arrays, which Array.isArray accepts but which are not
 *   plain arrays — GEN2-1); own symbol keys and enumerable non-index own
 *   ("expando") properties on an array, which would otherwise be silently
 *   dropped along with any out-of-domain value they hold (GEN2-2);
 *   sparse-array holes (A1.1 — any index i in [0, length) with
 *   !(i in arr); a hole is an absence, not a type, and detection never relies
 *   on hole-skipping iteration like Array.prototype.map/forEach); nesting
 *   beyond MAX_HASH_DEPTH (A1.2 — explicit depth counter, never a recursion
 *   crash reinterpreted); and circular references (reported as a cycle, never
 *   a bare RangeError).
 *
 * Deliberately NOT done here: calling `toJSON`, tagging Dates, encoding NaN,
 * densifying holes, or otherwise coercing out-of-domain values into the
 * canonical form. Admitting a type later is additive (ADR-0017 Consequences);
 * un-collapsing hashes already published into an immutable CP-04 bundle is not.
 */

import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'path';
import { createHash } from 'node:crypto';
import { z } from 'zod';

/** Revision hashes are 16 lowercase hex characters (see REVISION_HEX_LENGTH). */
const REVISION_HEX_PATTERN = /^[0-9a-f]{16}$/;

/**
 * Truncation width of the SHA-256 digest, in hex characters (64 bits).
 * ACCEPTED RISK (adversarial review F6, 2026-07-27): birthday-collision
 * probability at 100,000 items is ~2.7e-10. A collision would mark changed
 * content unchanged; at content-bank scale that bound is accepted. Widening this
 * constant changes every revision string and requires migration maps.
 */
const REVISION_HEX_LENGTH = 16;

/**
 * Maximum nesting depth of hashable content (ADR-0017 Amendment 1, A1.2).
 * Root = depth 0; objects and arrays are counted together. A value at depth
 * greater than this throws a TypeError naming its path — an explicit counter,
 * never a recursion crash reinterpreted. 64 is a policy ceiling, not an
 * engineering one: real curriculum content is under depth 10; anything past 64
 * is a build bug. Raising it later is additive (new ADR + migration note that
 * previously-rejected content becomes newly computable).
 */
const MAX_HASH_DEPTH = 64;

/**
 * Migration entry schema — validated locally; `src/lib/schema.ts` is
 * steward-owned and is never edited from here (item ROOT.1.1.3).
 *
 * Content rules (REQ-CP-05 scenario 2 — an entry must actually "link old
 * revision to new"): ids and notes are nonempty, both revisions are exactly 16
 * lowercase hex characters, and an entry may not link a revision to itself.
 */
const MigrationEntrySchema = z
  .object({
    itemId: z.string().min(1, 'itemId must be a nonempty string'),
    fromRevision: z
      .string()
      .regex(REVISION_HEX_PATTERN, 'fromRevision must be exactly 16 lowercase hex characters'),
    toRevision: z
      .string()
      .regex(REVISION_HEX_PATTERN, 'toRevision must be exactly 16 lowercase hex characters'),
    note: z.string().min(1, 'note must be a nonempty string'),
  })
  .refine((entry) => entry.fromRevision !== entry.toRevision, {
    message: 'fromRevision and toRevision must differ (a self-link migrates nothing)',
    path: ['toRevision'],
  });

export type MigrationEntry = {
  itemId: string;
  fromRevision: string;
  toRevision: string;
  note: string;
};

/**
 * Computes a deterministic content-hash itemRevision for hashable content.
 * Canonical JSON (recursively sorted object keys) followed by SHA-256,
 * truncated to 16 hex characters.
 *
 * @param content - Content within the CP-05 hash-input domain (see file header)
 * @returns 16-character lowercase hex hash string
 * @throws TypeError if `content` contains a value outside the hash-input domain;
 *         the message names the JSON path of the offending value
 */
export function computeItemRevision(content: unknown): string {
  const canonicalJson = canonicalStringify(content);
  const hash = sha256(canonicalJson);
  return hash.slice(0, REVISION_HEX_LENGTH);
}

/**
 * Builds a map of item IDs to their itemRevision hashes.
 * Throws if duplicate IDs are encountered.
 *
 * Ids are accumulated in a Map and materialized with defineProperty, so an id of
 * `__proto__` (or any other Object.prototype accessor name) round-trips as a real
 * own property instead of hitting the prototype setter and vanishing
 * (REQ-CP-05 hash-input domain, last clause; adversarial finding F3).
 *
 * @param items - Array of items with id and content fields
 * @returns Record mapping id to itemRevision
 * @throws Error if duplicate IDs are found
 * @throws TypeError if any item's content is outside the hash-input domain
 */
export function buildRevisionsMap(
  items: Array<{ id: string; content: unknown }>
): Record<string, string> {
  const accumulated = new Map<string, string>();

  for (const item of items) {
    if (accumulated.has(item.id)) {
      throw new Error(`Duplicate item ID encountered: ${item.id}`);
    }
    accumulated.set(item.id, computeItemRevision(item.content));
  }

  const map: Record<string, string> = {};
  for (const [id, revision] of accumulated) {
    Object.defineProperty(map, id, {
      value: revision,
      enumerable: true,
      writable: true,
      configurable: true,
    });
  }

  return map;
}

/**
 * Loads and validates migration map entries from content/migrations/*.json.
 *
 * Ordering is explicit and filesystem-independent: files are sorted by name and
 * the loaded entries are then sorted by (itemId, fromRevision, toRevision), so
 * the result never depends on readdirSync order (adversarial finding F4).
 *
 * @param dir - Optional directory path (defaults to content/migrations). A
 *              missing DEFAULT directory yields []; an explicitly-passed missing
 *              directory throws, because a mistyped path must not look empty.
 * @returns Array of validated migration entries in deterministic order
 * @throws Error if the directory is missing (explicit dir), a file is unparseable,
 *         an entry is malformed, or two entries conflict on {itemId, fromRevision}
 */
export function loadMigrationMaps(dir?: string): MigrationEntry[] {
  const usingDefaultDir = dir === undefined;
  const migrationsDir = dir ?? join(process.cwd(), 'content', 'migrations');

  let files: string[];
  try {
    files = readdirSync(migrationsDir);
  } catch (error) {
    const code = (error as NodeJS.ErrnoException).code;
    if (usingDefaultDir && (code === 'ENOENT' || code === 'ENOTDIR')) {
      // The default location is optional: a repo with no migrations yet is valid.
      return [];
    }
    if (code === 'ENOENT' || code === 'ENOTDIR') {
      throw new Error(
        `Migration directory not found: ${migrationsDir} (an explicitly-passed directory must exist)`
      );
    }
    throw error;
  }

  // Explicit sort — readdirSync order is filesystem- and platform-dependent.
  const jsonFiles = files
    .filter((f) => f.endsWith('.json'))
    .sort((a, b) => (a < b ? -1 : a > b ? 1 : 0));

  const entries: MigrationEntry[] = [];
  // key = `${itemId} ${fromRevision}` -> where it was first seen
  const seenLinks = new Map<string, { file: string; entry: MigrationEntry }>();

  for (const file of jsonFiles) {
    const filePath = join(migrationsDir, file);
    const content = readFileSync(filePath, 'utf-8');

    let parsed: unknown;
    try {
      parsed = JSON.parse(content);
    } catch (error) {
      throw new Error(`Failed to parse JSON in ${file}: ${(error as Error).message}`);
    }

    // Handle both single entry and array of entries
    const arrayOfEntries = Array.isArray(parsed) ? parsed : [parsed];

    for (const entry of arrayOfEntries) {
      const result = MigrationEntrySchema.safeParse(entry);
      if (!result.success) {
        const errorDetails = result.error.issues
          .map((e) => `${e.path.join('.') || '<entry>'}: ${e.message}`)
          .join(', ');
        throw new Error(`Invalid migration entry in ${file}: ${errorDetails}`);
      }

      const validated: MigrationEntry = {
        itemId: result.data.itemId,
        fromRevision: result.data.fromRevision,
        toRevision: result.data.toRevision,
        note: result.data.note,
      };

      const linkKey = `${validated.itemId} ${validated.fromRevision}`;
      const previous = seenLinks.get(linkKey);
      if (previous) {
        const kind =
          previous.entry.toRevision === validated.toRevision
            ? 'Duplicate migration entry'
            : 'Conflicting migration entries';
        throw new Error(
          `${kind} for {itemId: ${validated.itemId}, fromRevision: ${validated.fromRevision}}: ` +
            `${previous.file} -> ${previous.entry.toRevision}, ${file} -> ${validated.toRevision}. ` +
            `Each {itemId, fromRevision} pair must resolve to exactly one toRevision.`
        );
      }
      seenLinks.set(linkKey, { file, entry: validated });
      entries.push(validated);
    }
  }

  // Total order independent of file order or in-file position.
  entries.sort(
    (a, b) =>
      compareStrings(a.itemId, b.itemId) ||
      compareStrings(a.fromRevision, b.fromRevision) ||
      compareStrings(a.toRevision, b.toRevision)
  );

  return entries;
}

/** Locale-independent code-unit string comparison (localeCompare is not stable across ICU builds). */
function compareStrings(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

/** Path label used when the offending value IS the top-level input. */
const ROOT_PATH = '(root)';

function keyPath(parentPath: string, key: string): string {
  return parentPath === ROOT_PATH ? key : `${parentPath}.${key}`;
}

function indexPath(parentPath: string, index: number): string {
  return parentPath === ROOT_PATH ? `[${index}]` : `${parentPath}[${index}]`;
}

function rejectOutOfDomain(path: string, description: string): never {
  throw new TypeError(
    `computeItemRevision: value at ${path} is outside the CP-05 hash-input domain: ${description}. ` +
      `Hashable content is the JSON data model (null, booleans, finite numbers, strings, dense arrays, ` +
      `plain objects) nested at most ${MAX_HASH_DEPTH} levels deep.`
  );
}

/**
 * Human-readable tag for a value the allowlist default branch rejected.
 * This helper only DESCRIBES — it never admits; the default branch that calls
 * it always throws (ADR-0017 A1.3: allowlist, not denylist).
 */
function describeRejectedPrimitive(value: unknown): string {
  switch (typeof value) {
    case 'undefined':
      return 'undefined';
    case 'bigint':
      return `BigInt (${value.toString()}n)`;
    case 'symbol':
      return `symbol (${value.toString()})`;
    case 'function':
      return 'function';
    default:
      return `unlisted type "${typeof value}"`;
  }
}

/** Human-readable tag for an out-of-domain object, for the error message. */
function describeObject(value: object): string {
  const tag = Object.prototype.toString.call(value).slice(8, -1); // "[object Date]" -> "Date"
  if (tag !== 'Object') return tag;
  const ctorName = value.constructor?.name;
  return ctorName && ctorName !== 'Object' ? `class instance (${ctorName})` : 'non-plain object';
}

/** True for object literals, Object.create(null) objects, and JSON.parse output. */
function isPlainObject(value: object): boolean {
  const proto = Object.getPrototypeOf(value);
  return proto === Object.prototype || proto === null;
}

/**
 * True only for PLAIN arrays: `Array.isArray` is prototype-blind, so it also
 * accepts `Array` subclass instances, cross-realm arrays, and arrays whose
 * prototype was reassigned. Those are class instances / non-plain prototypes,
 * which ADR-0017 rejects; the HASHABLE rule says "dense arrays", not "any exotic
 * object `Array.isArray` accepts" (A1.3 closed world). This is the array-arm
 * counterpart of `isPlainObject` — the two arms are now symmetric.
 *
 * Note the deliberate asymmetry with `isPlainObject`, which admits a `null`
 * prototype (`Object.create(null)` is named as plain in ADR-0017): there is no
 * corresponding "plain null-prototype array" idiom, and `JSON.parse` never
 * produces one, so a null-prototype array is a reassignment accident and is
 * rejected.
 */
function isPlainArray(value: object): boolean {
  return Object.getPrototypeOf(value) === Array.prototype;
}

/** Human-readable tag for an array-like whose prototype is not Array.prototype. */
function describeNonPlainArray(value: object): string {
  const proto = Object.getPrototypeOf(value) as unknown;
  const ctorName = (value as { constructor?: { name?: string } }).constructor?.name;
  const protoDescription =
    proto === null
      ? 'its prototype is null (a reassignment accident, not the Object.create(null) plain-object case)'
      : ctorName && ctorName !== 'Array'
        ? `it is a class instance (${ctorName})`
        : 'its prototype is a foreign or reassigned Array prototype (e.g. cross-realm)';
  return `non-plain array — Array.isArray accepts it, but ${protoDescription}`;
}

/**
 * True only for the canonical decimal spelling of an array index in
 * `[0, length)`: `"0"`, `"1"`, `"2"`, … Deliberately rejects `"01"`, `"+1"`,
 * `"1.0"`, `"1e0"`, `"-0"`, `" 1"` and `""` — each is a non-index own property
 * that merely looks numeric, and none of them is an element slot.
 */
function isCanonicalArrayIndex(key: string, length: number): boolean {
  const index = Number(key);
  return Number.isInteger(index) && index >= 0 && index < length && String(index) === key;
}

/**
 * Produces canonical JSON with recursively sorted object keys, enforcing the
 * CP-05 hash-input domain. Every out-of-domain value throws a TypeError naming
 * its JSON path (e.g. `beats[3].meta.createdAt`).
 *
 * Structure (ADR-0017 Amendment 1, A1.3): a closed-world ALLOWLIST. Each case
 * of the dispatch matches exactly one HASHABLE rule from the shard; the DEFAULT
 * branches (both the primitive switch default and the non-array/non-plain
 * object fallthrough) throw. Nothing is ever admitted implicitly — an unlisted
 * value cannot fall through into the canonical form.
 *
 * @param depth - explicit nesting depth counter (root = depth 0; objects and
 *   arrays counted together). Exceeding MAX_HASH_DEPTH throws a TypeError
 *   naming the path — never a bare RangeError from recursion (A1.2).
 * @param ancestors - the open recursion stack, used for cycle detection; a value
 *   repeated in sibling position (a DAG, not a cycle) stays legal.
 */
function canonicalStringify(
  value: unknown,
  path: string = ROOT_PATH,
  depth: number = 0,
  ancestors: Set<object> = new Set()
): string {
  // A1.2 depth guard — an explicit counter that fires deterministically at the
  // first value past the ceiling, long before any engine recursion limit.
  if (depth > MAX_HASH_DEPTH) {
    return rejectOutOfDomain(
      path,
      `exceeds MAX_HASH_DEPTH ${MAX_HASH_DEPTH} (this value sits at nesting depth ${depth}; root = depth 0)`
    );
  }

  switch (typeof value) {
    // HASHABLE rule: booleans.
    case 'boolean':
      return value ? 'true' : 'false';
    // HASHABLE rule: finite numbers, -0 normalized to 0 (matches JSON.stringify).
    case 'number': {
      if (!Number.isFinite(value)) {
        return rejectOutOfDomain(
          path,
          Number.isNaN(value) ? 'NaN' : value > 0 ? 'Infinity' : '-Infinity'
        );
      }
      const normalized = Object.is(value, -0) ? 0 : value;
      return JSON.stringify(normalized) as string;
    }
    // HASHABLE rule: strings.
    case 'string':
      return JSON.stringify(value) as string;
    // HASHABLE rules: null, dense arrays, plain objects — everything else in
    // typeof-object space (Date, Map, Set, RegExp, typed arrays, class
    // instances, ...) is rejected by the container fallthrough below.
    case 'object': {
      if (value === null) return 'null';
      return canonicalStringifyContainer(value, path, depth, ancestors);
    }
    // DEFAULT REJECT (A1.3): undefined (the only exemption — an object VALUE of
    // undefined — is handled by key omission in the caller), function, symbol,
    // bigint, and any typeof result this allowlist has never heard of.
    default:
      return rejectOutOfDomain(path, describeRejectedPrimitive(value));
  }
}

/** Container arm of the allowlist: dense PLAIN arrays and plain objects only. */
function canonicalStringifyContainer(
  objectValue: object,
  path: string,
  depth: number,
  ancestors: Set<object>
): string {
  if (ancestors.has(objectValue)) {
    throw new TypeError(
      `computeItemRevision: circular reference detected at ${path} — the value is its own ancestor ` +
        `(cycle). Circular content is outside the CP-05 hash-input domain.`
    );
  }
  ancestors.add(objectValue);

  try {
    if (Array.isArray(objectValue)) {
      const arr = objectValue as unknown[];

      // GEN2-1: PLAIN arrays only. `Array.isArray` is prototype-blind, so it
      // admits Array subclass instances and cross-realm/reassigned-prototype
      // arrays — class instances that ADR-0017 rejects and that the "dense
      // arrays" HASHABLE rule never matched (A1.3: the burden sits on the
      // HASHABLE rule, not on the illustrative reject list). Checked BEFORE
      // iterating, so a non-plain array is never partially canonicalized.
      if (!isPlainArray(arr)) {
        return rejectOutOfDomain(path, describeNonPlainArray(arr));
      }

      // GEN2-2: an array's hashable content is EXACTLY its index slots. Own
      // symbol keys and enumerable non-index own ("expando") properties are
      // structural conditions no HASHABLE rule matches, so the closed world
      // rejects them — mirroring the object arm below, which already rejects
      // symbol keys. Rejection, not silent ignoring: an expando can carry an
      // out-of-domain value (a Date, a function) or even a reference back to
      // the array itself, and CP-05 scenario 3 forbids an out-of-domain value
      // reaching the hash input unreported ("never silently coerces,
      // collapses"). Non-ENUMERABLE own properties stay tolerated, matching the
      // object arm's existing leniency rather than introducing the opposite
      // asymmetry (`length` is non-enumerable, so it is not an expando).
      const arraySymbolKeys = Object.getOwnPropertySymbols(arr);
      if (arraySymbolKeys.length > 0) {
        return rejectOutOfDomain(
          `${path}[${arraySymbolKeys[0].toString()}]`,
          'symbol-keyed property on an array (an array\'s hashable content is its index slots only)'
        );
      }
      for (const ownKey of Object.keys(arr)) {
        if (!isCanonicalArrayIndex(ownKey, arr.length)) {
          return rejectOutOfDomain(
            keyPath(path, ownKey),
            `non-index enumerable own property "${ownKey}" on an array (an array's hashable ` +
              `content is its index slots only; such a property would otherwise be silently ` +
              `dropped, hiding any out-of-domain value it holds)`
          );
        }
      }

      // A1.1: dense arrays only. Detection is an explicit index-based `in`
      // check — NEVER Array.prototype.map/forEach, which skip holes (the exact
      // gen1 bypass). The FIRST hole is named; a hole is an absence, not a
      // type, so it is rejected here rather than read as undefined.
      const parts: string[] = [];
      for (let index = 0; index < arr.length; index++) {
        if (!(index in arr)) {
          return rejectOutOfDomain(
            indexPath(path, index),
            'array hole (sparse arrays are out-of-domain; a hole is an absence, not a value)'
          );
        }
        parts.push(canonicalStringify(arr[index], indexPath(path, index), depth + 1, ancestors));
      }
      return `[${parts.join(',')}]`;
    }

    if (isPlainObject(objectValue)) {
      const symbolKeys = Object.getOwnPropertySymbols(objectValue);
      if (symbolKeys.length > 0) {
        return rejectOutOfDomain(
          `${path}[${symbolKeys[0].toString()}]`,
          'symbol-keyed property (hashable objects have string keys only)'
        );
      }

      const record = objectValue as Record<string, unknown>;
      const pairs = Object.keys(record)
        .sort(compareStrings)
        // Keys whose value is undefined are omitted (JSON.stringify semantics; ratified).
        .filter((key) => record[key] !== undefined)
        .map(
          (key) =>
            `${JSON.stringify(key)}:${canonicalStringify(record[key], keyPath(path, key), depth + 1, ancestors)}`
        );
      return `{${pairs.join(',')}}`;
    }

    // ALLOWLIST DEFAULT for containers (A1.3): not a dense array, not a plain
    // object — rejected, whatever it is.
    return rejectOutOfDomain(path, describeObject(objectValue));
  } finally {
    ancestors.delete(objectValue);
  }
}

/**
 * Computes SHA-256 hash of a string and returns hex encoding.
 * Uses Node.js crypto module.
 */
function sha256(input: string): string {
  return createHash('sha256').update(input, 'utf8').digest('hex');
}
