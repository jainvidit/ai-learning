/**
 * Tests for content revision hashing and migration maps.
 * CP-05 scenarios: content change flips hash, determinism, key-order independence,
 * duplicate-id throw, migration map load + validation.
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
    expect(Object.keys(map)).toHaveLength(3);
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
});

describe('loadMigrationMaps', () => {
  const testDir = join(process.cwd(), 'tests', 'fixtures', 'test-migrations');

  beforeAll(async () => {
    await mkdir(testDir, { recursive: true });
  });

  afterAll(async () => {
    await rm(testDir, { recursive: true, force: true });
  });

  it('CP-05 scenario 2: loads valid migration entries', async () => {
    const validEntry: MigrationEntry = {
      itemId: 'exercise-loops-001',
      fromRevision: 'a1b2c3d4e5f6g7h8',
      toRevision: 'b2c3d4e5f6g7h8i9',
      note: 'Fixed typo in prompt',
    };

    await writeFile(
      join(testDir, 'migration-001.json'),
      JSON.stringify(validEntry, null, 2)
    );

    const entries = await loadMigrationMaps(testDir);
    expect(entries).toHaveLength(1);
    expect(entries[0]).toEqual(validEntry);
  });

  it('loads multiple entries from a single file (array format)', async () => {
    const entries: MigrationEntry[] = [
      {
        itemId: 'ex-001',
        fromRevision: 'aaaa111122223333',
        toRevision: 'bbbb222233334444',
        note: 'First migration',
      },
      {
        itemId: 'ex-002',
        fromRevision: 'cccc333344445555',
        toRevision: 'dddd444455556666',
        note: 'Second migration',
      },
    ];

    await writeFile(
      join(testDir, 'batch-migrations.json'),
      JSON.stringify(entries, null, 2)
    );

    const loaded = await loadMigrationMaps(testDir);
    expect(loaded.length).toBeGreaterThanOrEqual(2);
    expect(loaded.some(e => e.itemId === 'ex-001')).toBe(true);
    expect(loaded.some(e => e.itemId === 'ex-002')).toBe(true);
  });

  it('throws on malformed JSON', async () => {
    await writeFile(
      join(testDir, 'malformed.json'),
      '{ invalid json }'
    );

    await expect(loadMigrationMaps(testDir)).rejects.toThrow('Failed to parse JSON');
  });

  it('throws on missing required fields', async () => {
    const invalidEntry = {
      itemId: 'ex-003',
      fromRevision: 'eeee555566667777',
      // missing toRevision and note
    };

    await writeFile(
      join(testDir, 'invalid-entry.json'),
      JSON.stringify(invalidEntry, null, 2)
    );

    await expect(loadMigrationMaps(testDir)).rejects.toThrow('Invalid migration entry');
  });

  it('throws on wrong field types', async () => {
    const invalidEntry = {
      itemId: 123, // should be string
      fromRevision: 'ffff666677778888',
      toRevision: 'gggg777788889999',
      note: 'Invalid itemId type',
    };

    await writeFile(
      join(testDir, 'wrong-type.json'),
      JSON.stringify(invalidEntry, null, 2)
    );

    await expect(loadMigrationMaps(testDir)).rejects.toThrow('Invalid migration entry');
  });

  it('returns empty array if directory does not exist', async () => {
    const nonExistentDir = join(process.cwd(), 'non-existent-migrations-dir');
    const entries = await loadMigrationMaps(nonExistentDir);
    expect(entries).toEqual([]);
  });

  it('ignores non-JSON files in the directory', async () => {
    await writeFile(
      join(testDir, 'README.md'),
      '# Migration Maps\n\nThis directory contains migration entries.'
    );

    const validEntry: MigrationEntry = {
      itemId: 'ex-readme-test',
      fromRevision: 'hhhh888899990000',
      toRevision: 'iiii999900001111',
      note: 'Test with README present',
    };

    await writeFile(
      join(testDir, 'with-readme.json'),
      JSON.stringify(validEntry, null, 2)
    );

    const entries = await loadMigrationMaps(testDir);
    // Should load the JSON file but ignore README.md
    expect(entries.some(e => e.itemId === 'ex-readme-test')).toBe(true);
  });
});
