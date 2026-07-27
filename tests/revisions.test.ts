/**
 * Tests for content revision hashing and migration maps.
 * CP-05 scenarios: content change flips hash (s1), migration map load + validation (s2),
 * out-of-domain values rejected with a TypeError naming the JSON path (s3).
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { writeFile, mkdir, rm } from 'fs/promises';
import { join } from 'path';
import {
  computeItemRevision,
  buildRevisionsMap,
  loadMigrationMaps,
  type MigrationEntry,
} from '../src/lib/revisions';

describe('computeItemRevision', () => {
  it('produces a 16-character hex hash', () => {
    const content = { title: 'Test', body: 'Content' };
    const hash = computeItemRevision(content);
    expect(hash).toMatch(/^[0-9a-f]{16}$/);
  });

  it('CP-05 scenario 1: content change flips the hash while ID stays fixed', () => {
    const id = 'exercise-001';
    const content1 = { id, title: 'Original', body: 'Original content' };
    const content2 = { id, title: 'Modified', body: 'Original content' };

    const hash1 = computeItemRevision(content1);
    const hash2 = computeItemRevision(content2);

    // ID is the same (not hashed), but content changed so hash differs
    expect(hash1).not.toBe(hash2);
  });

  it('is deterministic - recomputing over unchanged content yields identical hashes', () => {
    const content = { title: 'Test', nested: { value: 42, array: [1, 2, 3] } };
    const hash1 = computeItemRevision(content);
    const hash2 = computeItemRevision(content);
    const hash3 = computeItemRevision(content);

    expect(hash1).toBe(hash2);
    expect(hash2).toBe(hash3);
  });

  it('is key-order independent - different key orders produce identical hashes', () => {
    const content1 = { a: 1, b: 2, c: 3 };
    const content2 = { c: 3, a: 1, b: 2 };
    const content3 = { b: 2, c: 3, a: 1 };

    const hash1 = computeItemRevision(content1);
    const hash2 = computeItemRevision(content2);
    const hash3 = computeItemRevision(content3);

    expect(hash1).toBe(hash2);
    expect(hash2).toBe(hash3);
  });

  it('handles nested objects with key-order independence', () => {
    const content1 = { outer: { a: 1, b: { x: 10, y: 20 } } };
    const content2 = { outer: { b: { y: 20, x: 10 }, a: 1 } };

    const hash1 = computeItemRevision(content1);
    const hash2 = computeItemRevision(content2);

    expect(hash1).toBe(hash2);
  });

  it('handles arrays correctly (order matters in arrays)', () => {
    const content1 = { items: [1, 2, 3] };
    const content2 = { items: [3, 2, 1] };

    const hash1 = computeItemRevision(content1);
    const hash2 = computeItemRevision(content2);

    // Array order DOES matter (not sorted)
    expect(hash1).not.toBe(hash2);
  });

  it('handles null and boolean values', () => {
    const content = { flag: true, value: null, disabled: false };
    const hash = computeItemRevision(content);
    expect(hash).toMatch(/^[0-9a-f]{16}$/);
  });

  it('produces different hashes for different content', () => {
    const hash1 = computeItemRevision({ value: 1 });
    const hash2 = computeItemRevision({ value: 2 });
    expect(hash1).not.toBe(hash2);
  });

  it('canonicalization: keys with undefined values are omitted (matching JSON.stringify semantics)', () => {
    const content1 = { a: 1, b: undefined };
    const content2 = { a: 1 };

    const hash1 = computeItemRevision(content1);
    const hash2 = computeItemRevision(content2);

    // {a:1,b:undefined} should hash identically to {a:1}
    expect(hash1).toBe(hash2);
  });
});

/**
 * REGRESSION PIN (fix cycle gen1). These hashes were captured from the module
 * BEFORE the CP-05 domain enforcement landed. In-domain content must keep hashing
 * IDENTICALLY forever: ROOT.1.1.4 and any published CP-04 bundle depend on it.
 * A failure here means a canonicalization change silently invalidated every
 * revision string in the repo — never "update the expected value", write a
 * migration map and a new ADR.
 */
describe('computeItemRevision: pinned in-domain hashes (pre-fix baseline)', () => {
  const pinned: Array<[string, unknown, string]> = [
    ['null', null, '74234e98afe7498f'],
    ['true', true, 'b5bea41b6c623f7c'],
    ['number 42', 42, '73475cb40a568e8d'],
    ['negative zero (normalizes to 0)', -0, '5feceb66ffc86f38'],
    ['string "hello"', 'hello', '5aa762ae383fbb72'],
    ['empty object', {}, '44136fa355b3678a'],
    ['empty array', [], '4f53cda18c2baa0c'],
    [
      'nested object',
      { title: 'Test', nested: { value: 42, array: [1, 2, 3] } },
      '90d6116c9bd77072',
    ],
    [
      'representative compiled beat',
      {
        beatId: 'm1-l1-b3',
        type: 'quiz',
        persistent: false,
        completion: 'passed',
        prompt: 'What does 2+2 equal?',
        choices: ['3', '4', '5'],
        answerIndex: 1,
        meta: { skillIds: ['arith.add'], tier: 'core' },
        nullField: null,
        emptyArr: [],
        emptyObj: {},
      },
      '5ac6a2295c26fb46',
    ],
    ['object with an undefined-valued key', { a: 1, b: undefined }, '015abd7f5cc57a2d'],
  ];

  for (const [label, content, expected] of pinned) {
    it(`${label} hashes to ${expected}`, () => {
      expect(computeItemRevision(content)).toBe(expected);
    });
  }

  it('-0 hashes identically to 0 (normalization, not a separate encoding)', () => {
    expect(computeItemRevision(-0)).toBe(computeItemRevision(0));
    expect(computeItemRevision({ delta: -0 })).toBe(computeItemRevision({ delta: 0 }));
    expect(computeItemRevision([-0, 1])).toBe(computeItemRevision([0, 1]));
  });
});

/**
 * CP-05 scenario 3 + the hash-input domain enumeration (ADR-0017 reading B):
 * every out-of-domain type throws a TypeError naming the JSON path. One test per
 * rejected type.
 */
describe('computeItemRevision: CP-05 hash-input domain enforcement (scenario 3)', () => {
  /** Asserts a TypeError whose message contains the given JSON path. */
  function expectRejected(fn: () => unknown, path: string, descriptor: RegExp) {
    let caught: unknown;
    try {
      fn();
    } catch (error) {
      caught = error;
    }
    expect(caught, 'expected a throw but the call returned normally').toBeInstanceOf(TypeError);
    const message = (caught as TypeError).message;
    expect(message).toContain(path);
    expect(message).toMatch(descriptor);
  }

  it('rejects top-level undefined', () => {
    expectRejected(() => computeItemRevision(undefined), '(root)', /undefined/);
  });

  it('rejects undefined inside an array (not omittable there)', () => {
    expectRejected(() => computeItemRevision({ beats: [1, undefined] }), 'beats[1]', /undefined/);
  });

  it('rejects functions', () => {
    expectRejected(
      () => computeItemRevision({ verifier: () => true }),
      'verifier',
      /function/
    );
  });

  it('rejects symbols as values', () => {
    expectRejected(
      () => computeItemRevision({ tag: Symbol('boss') }),
      'tag',
      /symbol/
    );
  });

  it('rejects symbol-keyed properties', () => {
    const key = Symbol('hidden');
    expectRejected(() => computeItemRevision({ a: 1, [key]: 2 }), 'Symbol(hidden)', /symbol-keyed/);
  });

  it('rejects BigInt', () => {
    // BigInt(10) not 10n: tsconfig targets below ES2020, where BigInt literals are a TS error.
    expectRejected(() => computeItemRevision({ count: BigInt(10) }), 'count', /BigInt/);
  });

  it('rejects NaN', () => {
    expectRejected(() => computeItemRevision({ score: NaN }), 'score', /NaN/);
  });

  it('rejects +Infinity', () => {
    expectRejected(() => computeItemRevision({ score: Infinity }), 'score', /Infinity/);
  });

  it('rejects -Infinity', () => {
    expectRejected(() => computeItemRevision({ score: -Infinity }), 'score', /-Infinity/);
  });

  it('rejects Date', () => {
    expectRejected(
      () => computeItemRevision({ meta: { createdAt: new Date('2026-07-27T00:00:00Z') } }),
      'meta.createdAt',
      /Date/
    );
  });

  it('rejects Map', () => {
    expectRejected(() => computeItemRevision({ lookup: new Map([['a', 1]]) }), 'lookup', /Map/);
  });

  it('rejects Set', () => {
    expectRejected(() => computeItemRevision({ skills: new Set(['a']) }), 'skills', /Set/);
  });

  it('rejects RegExp', () => {
    expectRejected(() => computeItemRevision({ pattern: /^a+$/ }), 'pattern', /RegExp/);
  });

  it('rejects typed arrays', () => {
    expectRejected(() => computeItemRevision({ bytes: new Uint8Array([1, 2]) }), 'bytes', /Uint8Array/);
  });

  it('rejects non-plain class instances', () => {
    class Rubric {
      constructor(public weight: number) {}
    }
    expectRejected(() => computeItemRevision({ rubric: new Rubric(1) }), 'rubric', /Rubric/);
  });

  it('reports a circular reference as a cycle, never a bare RangeError', () => {
    const inner: Record<string, unknown> = { label: 'loop' };
    const content: Record<string, unknown> = { beats: [{ meta: inner }] };
    inner.parent = content;

    let caught: unknown;
    try {
      computeItemRevision(content);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(TypeError);
    expect(caught).not.toBeInstanceOf(RangeError);
    const message = (caught as TypeError).message;
    expect(message).toMatch(/circular reference|cycle/i);
    expect(message).toContain('beats[0].meta.parent');
  });

  it('reports a direct self-reference as a cycle', () => {
    const content: Record<string, unknown> = {};
    content.self = content;
    expect(() => computeItemRevision(content)).toThrow(TypeError);
    expect(() => computeItemRevision(content)).toThrow(/self\b|cycle|circular/i);
  });

  it('reports an array self-reference as a cycle', () => {
    const arr: unknown[] = [1];
    arr.push(arr);
    expect(() => computeItemRevision(arr)).toThrow(/circular|cycle/i);
  });

  it('names a deep array path exactly (beats[3].meta.createdAt style)', () => {
    const content = {
      beats: [{}, {}, {}, { meta: { createdAt: new Date(0) } }],
    };
    expect(() => computeItemRevision(content)).toThrow(/beats\[3\]\.meta\.createdAt/);
  });

  it('admits repeated (shared, non-circular) references — a DAG is not a cycle', () => {
    const shared = { skillIds: ['arith.add'] };
    const content = { a: shared, b: shared };
    expect(computeItemRevision(content)).toMatch(/^[0-9a-f]{16}$/);
    expect(computeItemRevision(content)).toBe(
      computeItemRevision({ a: { skillIds: ['arith.add'] }, b: { skillIds: ['arith.add'] } })
    );
  });

  it('admits null-prototype objects as plain (Object.create(null))', () => {
    const nullProto = Object.create(null) as Record<string, unknown>;
    nullProto.a = 1;
    expect(computeItemRevision(nullProto)).toBe(computeItemRevision({ a: 1 }));
  });

  it('admits JSON.parse output verbatim (the bundle is JSON on disk)', () => {
    const parsed = JSON.parse('{"b":[1,2,{"a":null}],"a":"x"}');
    expect(computeItemRevision(parsed)).toBe(computeItemRevision({ a: 'x', b: [1, 2, { a: null }] }));
  });

  it('does NOT call toJSON (no coercion path exists for out-of-domain values)', () => {
    const withToJson = {
      toJSON() {
        return { substituted: true };
      },
      real: 1,
    };
    // toJSON is a function-valued own key -> rejected, not invoked.
    expect(() => computeItemRevision(withToJson)).toThrow(TypeError);
    expect(() => computeItemRevision(withToJson)).toThrow(/toJSON/);
  });

  /** Distinctness within the domain: no two distinct in-domain values may collide. */
  it('produces distinct canonical hashes for every distinct in-domain value', () => {
    const values: Array<[string, unknown]> = [
      ['null', null],
      ['false', false],
      ['true', true],
      ['0', 0],
      ['1', 1],
      ['-1', -1],
      ['1.5', 1.5],
      ['"" (empty string)', ''],
      ['"0"', '0'],
      ['"1"', '1'],
      ['"null"', 'null'],
      ['"true"', 'true'],
      ['"undefined"', 'undefined'],
      ['"{}"', '{}'],
      ['[] empty array', []],
      ['{} empty object', {}],
      ['[0]', [0]],
      ['["0"]', ['0']],
      ['[null]', [null]],
      ['[[]]', [[]]],
      ['[[0]]', [[0]]],
      ['[0,1]', [0, 1]],
      ['[1,0]', [1, 0]],
      ['{a:1}', { a: 1 }],
      ['{a:"1"}', { a: '1' }],
      ['{a:null}', { a: null }],
      ['{a:1,b:2}', { a: 1, b: 2 }],
      ['{a:{b:1}}', { a: { b: 1 } }],
      ['{"a.b":1}', { 'a.b': 1 }],
      ['{"a":{}}', { a: {} }],
      ['{"a":[]}', { a: [] }],
      ['{b:1}', { b: 1 }],
      ['{"a,b":1}', { 'a,b': 1 }],
      ['{"a\\":1,\\"b":1}', { 'a":1,"b': 1 }],
    ];

    const seen = new Map<string, string>();
    for (const [label, value] of values) {
      const hash = computeItemRevision(value);
      const collidesWith = seen.get(hash);
      expect(
        collidesWith,
        `${label} collided with ${collidesWith} (hash ${hash}) — distinct in-domain values must have distinct canonical forms`
      ).toBeUndefined();
      seen.set(hash, label);
    }
    expect(seen.size).toBe(values.length);
  });

  it('keeps __proto__ as a content key distinguishable from an absent key', () => {
    const withKey = JSON.parse('{"__proto__": 1, "a": 2}');
    const withoutKey = JSON.parse('{"a": 2}');
    expect(computeItemRevision(withKey)).not.toBe(computeItemRevision(withoutKey));
  });
});

describe('buildRevisionsMap', () => {
  it('builds a map of id to itemRevision', () => {
    const items = [
      { id: 'item-1', content: { title: 'First' } },
      { id: 'item-2', content: { title: 'Second' } },
      { id: 'item-3', content: { title: 'Third' } },
    ];

    const map = buildRevisionsMap(items);

    expect(map['item-1']).toMatch(/^[0-9a-f]{16}$/);
    expect(map['item-2']).toMatch(/^[0-9a-f]{16}$/);
    expect(map['item-3']).toMatch(/^[0-9a-f]{16}$/);
    expect(Object.keys(map)).toEqual(['item-1', 'item-2', 'item-3']);
  });

  it('throws on duplicate IDs', () => {
    const items = [
      { id: 'item-1', content: { title: 'First' } },
      { id: 'item-2', content: { title: 'Second' } },
      { id: 'item-1', content: { title: 'Duplicate' } },
    ];

    expect(() => buildRevisionsMap(items)).toThrow('Duplicate item ID encountered: item-1');
  });

  it('handles empty array', () => {
    const map = buildRevisionsMap([]);
    expect(map).toEqual({});
  });

  it('produces consistent hashes for same content', () => {
    const items = [{ id: 'test', content: { value: 42 } }];
    const map1 = buildRevisionsMap(items);
    const map2 = buildRevisionsMap(items);

    expect(map1['test']).toBe(map2['test']);
  });

  it('CP-05 scenario 1 via buildRevisionsMap: same item id with changed content -> map key unchanged, map value changed', () => {
    const itemId = 'exercise-001';
    const originalContent = { id: itemId, title: 'Original Title', prompt: 'Original prompt' };
    const modifiedContent = { id: itemId, title: 'Updated Title', prompt: 'Original prompt' };

    const map1 = buildRevisionsMap([{ id: itemId, content: originalContent }]);
    const map2 = buildRevisionsMap([{ id: itemId, content: modifiedContent }]);

    // Both maps have the same key (itemId)
    expect(Object.keys(map1)).toEqual([itemId]);
    expect(Object.keys(map2)).toEqual([itemId]);

    // But the revision hash values differ because content changed
    expect(map1[itemId]).not.toBe(map2[itemId]);
  });

  it('round-trips an id of __proto__ without prototype-accessor loss', () => {
    const items = [
      { id: '__proto__', content: { title: 'Proto item' } },
      { id: 'constructor', content: { title: 'Ctor item' } },
      { id: 'toString', content: { title: 'ToString item' } },
    ];

    const map = buildRevisionsMap(items);
    const expectedProto = computeItemRevision({ title: 'Proto item' });

    // Own key present, in insertion order, none dropped.
    expect(Object.keys(map)).toEqual(['__proto__', 'constructor', 'toString']);
    expect(Object.prototype.hasOwnProperty.call(map, '__proto__')).toBe(true);

    // Readable by index, by descriptor, by entries, and after a JSON round-trip.
    expect(map['__proto__']).toBe(expectedProto);
    expect(Object.getOwnPropertyDescriptor(map, '__proto__')?.value).toBe(expectedProto);
    expect(Object.entries(map)).toEqual([
      ['__proto__', expectedProto],
      ['constructor', computeItemRevision({ title: 'Ctor item' })],
      ['toString', computeItemRevision({ title: 'ToString item' })],
    ]);
    expect(JSON.parse(JSON.stringify(map))['__proto__']).toBe(expectedProto);

    // And the map itself is not polluted: its prototype is untouched.
    expect(Object.getPrototypeOf(map)).toBe(Object.prototype);
    expect(Object.getPrototypeOf({})).toBe(Object.prototype);
    expect(({} as Record<string, unknown>)['title']).toBeUndefined();
  });

  it('still throws on a duplicate __proto__ id (no silent overwrite)', () => {
    expect(() =>
      buildRevisionsMap([
        { id: '__proto__', content: { v: 1 } },
        { id: '__proto__', content: { v: 2 } },
      ])
    ).toThrow('Duplicate item ID encountered: __proto__');
  });

  it('propagates the domain TypeError with the offending item path', () => {
    expect(() =>
      buildRevisionsMap([{ id: 'bad-item', content: { meta: { createdAt: new Date(0) } } }])
    ).toThrow(/meta\.createdAt/);
  });
});

describe('loadMigrationMaps', () => {
  const testDir = join(process.cwd(), 'tests', 'fixtures', 'test-migrations');

  beforeAll(async () => {
    await rm(testDir, { recursive: true, force: true });
    await mkdir(testDir, { recursive: true });
  });

  afterAll(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  /** Creates an isolated fixture dir and writes the given files into it. */
  async function fixture(name: string, files: Record<string, unknown | string>): Promise<string> {
    const subDir = join(testDir, name);
    await mkdir(subDir, { recursive: true });
    for (const [fileName, body] of Object.entries(files)) {
      await writeFile(
        join(subDir, fileName),
        typeof body === 'string' ? body : JSON.stringify(body, null, 2)
      );
    }
    return subDir;
  }

  it('CP-05 scenario 2: loads valid migration entries', async () => {
    const validEntry: MigrationEntry = {
      itemId: 'exercise-loops-001',
      fromRevision: 'a1b2c3d4e5f60001',
      toRevision: 'b2c3d4e5f6071112',
      note: 'Fixed typo in prompt',
    };
    const subDir = await fixture('test-valid', { 'migration-001.json': validEntry });

    const entries = loadMigrationMaps(subDir);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toEqual(validEntry);
  });

  it('loads multiple entries from a single file (array format) exactly, in sorted order', async () => {
    const first: MigrationEntry = {
      itemId: 'ex-001',
      fromRevision: 'aaaa111122223333',
      toRevision: 'bbbb222233334444',
      note: 'First migration',
    };
    const second: MigrationEntry = {
      itemId: 'ex-002',
      fromRevision: 'cccc333344445555',
      toRevision: 'dddd444455556666',
      note: 'Second migration',
    };
    // Written out of order on purpose: the loader must sort, not preserve.
    const subDir = await fixture('test-batch', { 'batch-migrations.json': [second, first] });

    const loaded = loadMigrationMaps(subDir);
    // Exact expectation: no extra, no missing, no duplicated entries.
    expect(loaded).toEqual([first, second]);
  });

  it('throws on malformed JSON', async () => {
    const subDir = await fixture('test-malformed', { 'malformed.json': '{ invalid json }' });
    expect(() => loadMigrationMaps(subDir)).toThrow('Failed to parse JSON');
  });

  it('throws on missing required fields', async () => {
    const subDir = await fixture('test-missing-fields', {
      'invalid-entry.json': { itemId: 'ex-003', fromRevision: 'eeee555566667777' },
    });
    expect(() => loadMigrationMaps(subDir)).toThrow('Invalid migration entry');
  });

  it('throws on wrong field types', async () => {
    const subDir = await fixture('test-wrong-types', {
      'wrong-type.json': {
        itemId: 123,
        fromRevision: 'ffff666677778888',
        toRevision: 'aaaa777788889999',
        note: 'Invalid itemId type',
      },
    });
    expect(() => loadMigrationMaps(subDir)).toThrow('Invalid migration entry');
  });

  it('ignores non-JSON files in the directory', async () => {
    const validEntry: MigrationEntry = {
      itemId: 'ex-readme-test',
      fromRevision: 'abcd888899990000',
      toRevision: 'ef01999900001111',
      note: 'Test with README present',
    };
    const subDir = await fixture('test-ignore-readme', {
      'README.md': '# Migration Maps\n\nThis directory contains migration entries.',
      'with-readme.json': validEntry,
    });

    const entries = loadMigrationMaps(subDir);
    expect(entries).toEqual([validEntry]);
  });

  it('returns [] for an existing but empty directory', async () => {
    const subDir = await fixture('test-empty', {});
    expect(loadMigrationMaps(subDir)).toEqual([]);
  });

  it('throws when an explicitly-passed directory does not exist', () => {
    const nonExistentDir = join(process.cwd(), 'non-existent-migrations-dir');
    expect(() => loadMigrationMaps(nonExistentDir)).toThrow(/Migration directory not found/);
    expect(() => loadMigrationMaps(nonExistentDir)).toThrow(nonExistentDir);
  });

  it('tolerates an absent DEFAULT directory (returns an array)', () => {
    // The real content/migrations dir exists in-repo, so this asserts the shape of
    // the default path rather than the ENOENT branch: it must never throw.
    expect(Array.isArray(loadMigrationMaps())).toBe(true);
  });

  describe('content validation (CP-05 scenario 2: an entry must link old revision to new)', () => {
    const base: MigrationEntry = {
      itemId: 'ex-valid',
      fromRevision: '0123456789abcdef',
      toRevision: 'fedcba9876543210',
      note: 'baseline',
    };

    const rejected: Array<[string, Partial<Record<keyof MigrationEntry, string>>, RegExp]> = [
      ['empty itemId', { itemId: '' }, /itemId/],
      ['empty note', { note: '' }, /note/],
      ['empty fromRevision', { fromRevision: '' }, /fromRevision/],
      ['empty toRevision', { toRevision: '' }, /toRevision/],
      ['non-hex fromRevision', { fromRevision: 'not-a-hash!!!!!!' }, /fromRevision/],
      ['non-hex toRevision', { toRevision: 'ZZZZZZZZZZZZZZZZ' }, /toRevision/],
      ['too-short fromRevision', { fromRevision: 'abc' }, /fromRevision/],
      ['too-long toRevision', { toRevision: '0123456789abcdef0' }, /toRevision/],
      ['uppercase hex fromRevision', { fromRevision: '0123456789ABCDEF' }, /fromRevision/],
    ];

    for (const [label, override, matcher] of rejected) {
      it(`rejects ${label}`, async () => {
        const dirName = `test-reject-${label.replace(/[^a-z0-9]+/gi, '-')}`;
        const subDir = await fixture(dirName, { 'entry.json': { ...base, ...override } });
        expect(() => loadMigrationMaps(subDir)).toThrow('Invalid migration entry');
        expect(() => loadMigrationMaps(subDir)).toThrow(matcher);
      });
    }

    it('rejects a self-link where fromRevision === toRevision', async () => {
      const subDir = await fixture('test-self-link', {
        'entry.json': { ...base, toRevision: base.fromRevision },
      });
      expect(() => loadMigrationMaps(subDir)).toThrow('Invalid migration entry');
      expect(() => loadMigrationMaps(subDir)).toThrow(/must differ/);
    });

    it('accepts the baseline entry the rejection cases are derived from', async () => {
      const subDir = await fixture('test-baseline-accepted', { 'entry.json': base });
      expect(loadMigrationMaps(subDir)).toEqual([base]);
    });

    it('throws on conflicting duplicate {itemId, fromRevision} across two files', async () => {
      const subDir = await fixture('test-conflict-cross-file', {
        'a-first.json': { ...base, toRevision: 'aaaa000011112222' },
        'b-second.json': { ...base, toRevision: 'bbbb000011112222' },
      });
      expect(() => loadMigrationMaps(subDir)).toThrow(/Conflicting migration entries/);
      expect(() => loadMigrationMaps(subDir)).toThrow(/ex-valid/);
    });

    it('throws on conflicting duplicate {itemId, fromRevision} within one file', async () => {
      const subDir = await fixture('test-conflict-same-file', {
        'both.json': [
          { ...base, toRevision: 'aaaa000011112222' },
          { ...base, toRevision: 'bbbb000011112222' },
        ],
      });
      expect(() => loadMigrationMaps(subDir)).toThrow(/Conflicting migration entries/);
    });

    it('throws on an exact duplicate {itemId, fromRevision, toRevision}', async () => {
      const subDir = await fixture('test-duplicate-exact', {
        'a.json': base,
        'b.json': { ...base, note: 'same link, different note' },
      });
      expect(() => loadMigrationMaps(subDir)).toThrow(/Duplicate migration entry/);
    });

    it('allows the same itemId with different fromRevisions (a revision chain)', async () => {
      const hop1: MigrationEntry = { ...base, note: 'hop 1' };
      const hop2: MigrationEntry = {
        itemId: base.itemId,
        fromRevision: base.toRevision,
        toRevision: '1111222233334444',
        note: 'hop 2',
      };
      const subDir = await fixture('test-chain', { 'chain.json': [hop2, hop1] });

      // Sorted by (itemId, fromRevision): '0123...' < 'fedc...'
      expect(loadMigrationMaps(subDir)).toEqual([hop1, hop2]);
    });

    it('orders entries deterministically by (itemId, fromRevision), not by file order', async () => {
      const zEntry: MigrationEntry = {
        itemId: 'z-item',
        fromRevision: '0000000000000001',
        toRevision: '0000000000000002',
        note: 'z',
      };
      const aEntry: MigrationEntry = {
        itemId: 'a-item',
        fromRevision: '0000000000000003',
        toRevision: '0000000000000004',
        note: 'a',
      };
      const mEntry: MigrationEntry = {
        itemId: 'm-item',
        fromRevision: '0000000000000005',
        toRevision: '0000000000000006',
        note: 'm',
      };

      // File names sort z < ... so neither file order nor in-file order matches the answer.
      const subDir = await fixture('test-order', {
        '0-zzz.json': zEntry,
        '1-aaa.json': [mEntry, aEntry],
      });

      const loaded = loadMigrationMaps(subDir);
      expect(loaded).toEqual([aEntry, mEntry, zEntry]);
      // Stable across repeated loads.
      expect(loadMigrationMaps(subDir)).toEqual(loaded);
    });

    it('does not pollute Object.prototype via a __proto__ key in migration JSON', async () => {
      const subDir = await fixture('test-proto-json', {
        'evil.json': `{"itemId":"ex-evil","fromRevision":"0123456789abcdef","toRevision":"fedcba9876543210","note":"n","__proto__":{"polluted":true}}`,
      });
      const loaded = loadMigrationMaps(subDir);
      expect(loaded).toHaveLength(1);
      expect(({} as Record<string, unknown>).polluted).toBeUndefined();
      expect(Object.getPrototypeOf(loaded[0])).toBe(Object.prototype);
      expect(Object.keys(loaded[0]).sort()).toEqual([
        'fromRevision',
        'itemId',
        'note',
        'toRevision',
      ]);
    });
  });

  it('loads the in-repo content/migrations directory exactly (the shipped example is valid)', () => {
    const entries = loadMigrationMaps(join(process.cwd(), 'content', 'migrations'));
    // Exact expectation: the shipped example-migration.json, and nothing else.
    expect(entries).toEqual([
      {
        itemId: 'example-exercise-001',
        fromRevision: 'a1b2c3d4e5f60001',
        toRevision: 'b2c3d4e5f6071112',
        note: 'Example migration entry - this demonstrates the valid JSON format',
      },
    ]);
  });
});
