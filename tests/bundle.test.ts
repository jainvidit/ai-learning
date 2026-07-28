/**
 * Content bundle emitter + reader tests (ROOT.1.1.4 / REQ-CP-04, REQ-CP-05).
 *
 * The describe blocks map onto REQ-CP-04's three scenarios plus the build-failure wiring this
 * item inherited from ROOT.1.1.2's verification note:
 *   - "CP-04 scenario 1" — one bundle, one version id, every required section present.
 *   - "CP-04 scenario 2" — immutability + version reproducibility.
 *   - "CP-04 scenario 3" — a new version is served with no app rebuild.
 *   - "build-failure wiring" — invalid content fails the EMIT PATH with a non-zero exit, so it
 *     fails `npm run build`.
 *
 * TWO EXECUTION MODES, deliberately:
 *   1. IN-PROCESS `emitBundle(tempRoot)` for everything provable against the REAL authored
 *      corpus. Passing a temp root is what keeps these tests from writing into the published
 *      `public/content-bundle/` tree.
 *   2. CHILD PROCESS with a synthetic corpus as its `cwd` for everything needing DIFFERENT
 *      content — `src/lib/content.ts` resolves content from `process.cwd()`, so varying the
 *      corpus means varying the cwd, and vitest cannot portably chdir mid-run. This mode also
 *      proves the thing the build wiring actually claims: a NON-ZERO EXIT, which is what makes
 *      `npm run build` fail and which an in-process `expect(...).toThrow()` cannot demonstrate.
 *
 * `tests/bundle.test.ts` follows the existing convention (vitest.config.ts includes
 * `tests/**\/*.test.*`) — no colocation deviation.
 */

import { describe, it, expect, beforeAll, afterAll } from "vitest";
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import {
  BundleImmutabilityError,
  buildBundlePayload,
  emitBundle,
} from "../scripts/build-content-bundle";
import {
  BUNDLE_FILENAME,
  BUNDLE_SECTION_FILES,
  INDEX_FILENAME,
  MANIFEST_FILENAME,
  beatItemId,
  bundleBeatsFor,
  bundleExercisesFor,
  clearBundleCache,
  exerciseItemId,
  exerciseRevision,
  loadBundleIndex,
  loadBundleManifest,
  loadBundleVersion,
  loadLatestBundle,
  migrationsFrom,
  type BundleSource,
  type ContentBundleManifest,
} from "../src/lib/bundle";

const EMITTER = path.resolve(__dirname, "..", "scripts", "build-content-bundle.ts");

const cleanup: string[] = [];
function disposableDir(prefix: string): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), prefix));
  cleanup.push(dir);
  return dir;
}

afterAll(() => {
  for (const dir of cleanup) fs.rmSync(dir, { recursive: true, force: true });
});

/**
 * Run the emitter as a real child process against a synthetic corpus.
 *
 * `tsx`'s CLI is located with `require.resolve("tsx/cli")` rather than `npx tsx`: the child
 * runs with a TEMP directory as its cwd, where `npx` would find no local `tsx`, and resolving
 * from this file finds the same devDependency `npm run build:content` uses. No new dependency.
 */
function runEmitter(cwd: string): { status: number | null; stdout: string; stderr: string } {
  const cli = require.resolve("tsx/cli");
  const result = spawnSync(process.execPath, [cli, EMITTER], {
    cwd,
    encoding: "utf-8",
    env: process.env,
  });
  return {
    status: result.status,
    stdout: result.stdout ?? "",
    stderr: result.stderr ?? "",
  };
}

/** Minimal but SCHEMA-VALID content corpus: one built module, one lesson, no exercises. */
function writeCorpus(root: string, options: { mdxBody: string; lessonId?: string }): void {
  const lessonId = options.lessonId ?? "01-lesson";
  const moduleId = "01-how-llms-work";
  const lessonDir = path.join(root, "content", "modules", moduleId, "lessons", lessonId);
  fs.mkdirSync(lessonDir, { recursive: true });
  fs.writeFileSync(
    path.join(root, "content", "curriculum.json"),
    JSON.stringify({
      modules: [
        {
          id: moduleId,
          title: "Fixture Module",
          track: "fundamentals",
          summary: "Fixture",
          status: "built",
          requires: [],
        },
      ],
    })
  );
  fs.writeFileSync(
    path.join(root, "content", "modules", moduleId, "module.json"),
    JSON.stringify({
      id: moduleId,
      title: "Fixture Module",
      track: "fundamentals",
      description: "Fixture module",
      lessons: [{ id: lessonId, title: "Fixture Lesson" }],
    })
  );
  fs.writeFileSync(
    path.join(lessonDir, "lesson.mdx"),
    `---\nid: ${lessonId}\ntitle: Fixture Lesson\nminutes: 5\nobjectives:\n  - understand the fixture\n---\n\n${options.mdxBody}\n`
  );
}

/** Every file in a version directory as RAW BYTES — the unit the criterion speaks in. */
function readVersionDirBytes(dir: string): Record<string, string> {
  const out: Record<string, string> = {};
  for (const name of fs.readdirSync(dir).sort()) {
    out[name] = fs.readFileSync(path.join(dir, name)).toString("base64");
  }
  return out;
}

function readManifest(bundleRoot: string): ContentBundleManifest {
  return JSON.parse(
    fs.readFileSync(path.join(bundleRoot, MANIFEST_FILENAME), "utf-8")
  ) as ContentBundleManifest;
}

function readBundleJson(
  bundleRoot: string,
  version: string
): {
  revisions: { beats: Record<string, string>; lessons: Record<string, string> };
  beats: Record<string, unknown[]>;
} {
  return JSON.parse(
    fs.readFileSync(path.join(bundleRoot, version, BUNDLE_FILENAME), "utf-8")
  );
}

// ---------------------------------------------------------------------------
// CP-04 scenario 1 — "the output bundle contains the curriculum DAG (with layout
// hints), all beat arrays, the exercise bank, and calibration goldens, under a
// single version identifier"
// ---------------------------------------------------------------------------

describe("CP-04 scenario 1 — one bundle, one version id, every required section", () => {
  let root: string;
  let version: string;
  let source: BundleSource;

  beforeAll(() => {
    root = disposableDir("bundle-s1-");
    version = emitBundle(root).version;
    source = { kind: "dir", dir: root };
    clearBundleCache();
  });

  it("emits ONE version directory plus the manifest, and nothing else", () => {
    expect(fs.readdirSync(root).sort()).toEqual([MANIFEST_FILENAME, version].sort());
  });

  it("uses a short content hash as the version id (ADR-0011 #7)", () => {
    expect(version).toMatch(/^[0-9a-f]{16}$/);
  });

  it("emits every section file plus the whole-payload and index files", () => {
    expect(fs.readdirSync(path.join(root, version)).sort()).toEqual(
      [BUNDLE_FILENAME, INDEX_FILENAME, ...Object.values(BUNDLE_SECTION_FILES)].sort()
    );
  });

  it("carries the curriculum DAG: a node per module and an edge per requires entry", async () => {
    const bundle = await loadLatestBundle(source);
    const authored = JSON.parse(
      fs.readFileSync(path.join(process.cwd(), "content", "curriculum.json"), "utf-8")
    ) as { modules: Array<{ id: string; requires: string[] }> };

    expect(bundle.curriculum.nodes.map((n) => n.id)).toEqual(authored.modules.map((m) => m.id));
    expect(bundle.curriculum.edges).toHaveLength(
      authored.modules.reduce((sum, m) => sum + m.requires.length, 0)
    );
    for (const edge of bundle.curriculum.edges) {
      const dependent = bundle.curriculum.nodes.find((n) => n.id === edge.to);
      expect(dependent?.requires).toContain(edge.from);
    }
  });

  it("computes layout hints from topology: every module sits strictly right of each prerequisite", async () => {
    const bundle = await loadLatestBundle(source);
    const colById = new Map(bundle.curriculum.nodes.map((n) => [n.id, n.layout.col]));

    for (const node of bundle.curriculum.nodes) {
      for (const req of node.requires) {
        expect(colById.get(node.id)!).toBeGreaterThan(colById.get(req)!);
      }
      // Longest-path layering: col is EXACTLY 1 + max(prereq cols), and 0 with no prereqs.
      const expected =
        node.requires.length === 0
          ? 0
          : 1 + Math.max(...node.requires.map((r) => colById.get(r)!));
      expect(node.layout.col).toBe(expected);
    }
  });

  it("groups lanes by track and never places two modules at the same (col, lane)", async () => {
    const bundle = await loadLatestBundle(source);
    const seen = new Set<string>();
    for (const node of bundle.curriculum.nodes) {
      const cell = `${node.layout.col}:${node.layout.lane}`;
      expect(seen.has(cell)).toBe(false);
      seen.add(cell);

      const band = bundle.curriculum.layout.bandByTrack[node.track];
      expect(band).toBeDefined();
      expect(node.layout.lane).toBeGreaterThanOrEqual(band.start);
      expect(node.layout.lane).toBeLessThan(band.start + band.width);
      expect(node.layout.lane).toBeLessThan(bundle.curriculum.layout.lanes);
      expect(node.layout.col).toBeLessThan(bundle.curriculum.layout.columns);
    }
  });

  it("separates lanes when two modules of ONE track share a column", () => {
    // The authored corpus cannot prove this: measured, it holds at most ONE module per
    // (column, track), so every track band is width 1 and the lane allocator's collision
    // avoidance never runs. Mutation-tested — deleting `while (taken.has(lane)) lane += 1`
    // from computeLayout keeps every other test in this file green, including the
    // (col, lane)-uniqueness one. This synthetic corpus is what actually pins the allocator.
    const corpus = disposableDir("bundle-lanes-");
    writeCorpus(corpus, { mdxBody: "Intro.\n\n## Section\n\nbody" });
    const curriculumPath = path.join(corpus, "content", "curriculum.json");
    const curriculum = JSON.parse(fs.readFileSync(curriculumPath, "utf-8")) as {
      modules: unknown[];
    };
    // Two extra modules, same track, no prerequisites => same column, so they COLLIDE.
    for (const id of ["02-parallel-a", "03-parallel-b"]) {
      curriculum.modules.push({
        id,
        title: id,
        track: "prompting",
        summary: "s",
        status: "spec",
        requires: [],
      });
    }
    fs.writeFileSync(curriculumPath, JSON.stringify(curriculum));

    expect(runEmitter(corpus).status).toBe(0);

    const bundleRoot = path.join(corpus, "public", "content-bundle");
    const emitted = JSON.parse(
      fs.readFileSync(
        path.join(bundleRoot, readManifest(bundleRoot).latest, BUNDLE_SECTION_FILES.curriculum),
        "utf-8"
      )
    ) as {
      nodes: Array<{ id: string; layout: { col: number; lane: number } }>;
      layout: { lanes: number; bandByTrack: Record<string, { start: number; width: number }> };
    };
    const a = emitted.nodes.find((n) => n.id === "02-parallel-a")!;
    const b = emitted.nodes.find((n) => n.id === "03-parallel-b")!;

    expect(a.layout.col).toBe(b.layout.col);
    expect(a.layout.lane).not.toBe(b.layout.lane);
    // The band widened to hold both, rather than one module overflowing into another track.
    const band = emitted.layout.bandByTrack.prompting;
    expect(band.width).toBeGreaterThanOrEqual(2);
    for (const node of [a, b]) {
      expect(node.layout.lane).toBeGreaterThanOrEqual(band.start);
      expect(node.layout.lane).toBeLessThan(band.start + band.width);
    }
  });

  it("derives layout from the DAG rather than from authored order (no hand-placement)", async () => {
    // The authored file carries no col/lane field at all, so a hint can only have been
    // computed. Asserting the ABSENCE at the source is what distinguishes "computed" from
    // "copied", which the per-node arithmetic check above cannot tell apart on its own.
    const authoredText = fs.readFileSync(
      path.join(process.cwd(), "content", "curriculum.json"),
      "utf-8"
    );
    expect(authoredText).not.toMatch(/"col"|"lane"|"layout"/);
    const bundle = await loadLatestBundle(source);
    expect(bundle.curriculum.nodes.every((n) => Number.isInteger(n.layout.col))).toBe(true);
  });

  it("carries an ordered beat array for every BUILT lesson, each beat contract-shaped", async () => {
    const bundle = await loadLatestBundle(source);
    const builtModules = bundle.curriculum.nodes.filter((n) => n.status === "built");
    expect(builtModules.length).toBeGreaterThan(0);

    const keys = Object.keys(bundle.beats);
    expect(keys.length).toBeGreaterThan(0);
    for (const key of keys) {
      const [moduleId] = key.split("/");
      expect(builtModules.map((m) => m.id)).toContain(moduleId);
      const beats = bundleBeatsFor(bundle, key)!;
      expect(beats.length).toBeGreaterThan(0);
      for (const beat of beats) {
        expect(beat.beatId).toBeTruthy();
        expect([
          "prose",
          "quiz",
          "playground",
          "terminal",
          "challenge",
          "widget",
        ]).toContain(beat.type);
        expect(["passed", "verified", "attempted"]).toContain(beat.completion);
        // The frozen field set: nothing extra rode along (beat-model.md "Field shape is frozen").
        expect(Object.keys(beat).sort()).toEqual(
          (beat.persistent === undefined
            ? ["beatId", "completion", "type"]
            : ["beatId", "completion", "persistent", "type"]
          ).sort()
        );
      }
      // Lesson-scoped uniqueness (ADR-0011 #3).
      expect(new Set(beats.map((b) => b.beatId)).size).toBe(beats.length);
    }
  });

  it("carries the exercise bank, and every exercise beat has a matching bank entry", async () => {
    const bundle = await loadLatestBundle(source);
    expect(bundle.exercises.length).toBeGreaterThan(0);

    for (const [lessonKey, beats] of Object.entries(bundle.beats)) {
      for (const beat of beats) {
        if (!beat.beatId.startsWith("ex:")) continue;
        const exerciseId = beat.beatId.slice("ex:".length);
        const entry = bundleExercisesFor(bundle, lessonKey).find(
          (e) => e.exerciseId === exerciseId
        );
        expect(entry, `bank entry for ${lessonKey} ${beat.beatId}`).toBeDefined();
        // The beat type maps 1:1 from the authored exercise type (ADR-0011 #1).
        expect(entry!.type).toBe(beat.type);
        expect(entry!.itemId).toBe(exerciseItemId(lessonKey, exerciseId));
      }
    }
  });

  it("carries an empty-but-structured calibration-goldens section (recorded deviation)", async () => {
    const bundle = await loadLatestBundle(source);
    expect(bundle.goldens.goldensFormat).toBe(1);
    expect(bundle.goldens.families).toEqual([]);
    expect(bundle.goldens.count).toBe(0);
    expect(bundle.goldens.note).toMatch(/deviation/i);
  });

  it("carries the revisions sidecar: a 16-hex revision per exercise, beat and lesson (CP-05)", async () => {
    const bundle = await loadLatestBundle(source);

    for (const entry of bundle.exercises) {
      expect(bundle.revisions.exercises[entry.itemId]).toMatch(/^[0-9a-f]{16}$/);
      expect(exerciseRevision(bundle, entry.lessonKey, entry.exerciseId)).toBe(
        bundle.revisions.exercises[entry.itemId]
      );
    }
    for (const [lessonKey, beats] of Object.entries(bundle.beats)) {
      expect(bundle.revisions.lessons[lessonKey]).toMatch(/^[0-9a-f]{16}$/);
      for (const beat of beats) {
        expect(bundle.revisions.beats[beatItemId(lessonKey, beat.beatId)]).toMatch(
          /^[0-9a-f]{16}$/
        );
      }
    }
    // Item IDs are stable and revision-free: an id never contains its own hash (CP-05 s1).
    for (const [itemId, revision] of Object.entries(bundle.revisions.exercises)) {
      expect(itemId).not.toContain(revision);
    }
  });

  it("carries the migration maps loaded from content/migrations (CP-05 scenario 2)", async () => {
    const bundle = await loadLatestBundle(source);
    expect(Array.isArray(bundle.migrations)).toBe(true);
    for (const entry of bundle.migrations) {
      expect(entry).toMatchObject({
        itemId: expect.any(String),
        fromRevision: expect.any(String),
        toRevision: expect.any(String),
        note: expect.any(String),
      });
      expect(migrationsFrom(bundle, entry.itemId, entry.fromRevision)).toContainEqual(entry);
    }
  });

  it("contains NO timestamp or build counter anywhere in the payload (determinism)", () => {
    const { payload } = buildBundlePayload();
    expect(JSON.stringify(payload)).not.toMatch(
      /"generatedAt"|"builtAt"|"buildNumber"|"timestamp"|"emittedAt"/
    );
  });

  it("publishes a per-version index whose byte counts match the emitted files", async () => {
    const index = await loadBundleIndex(version, source);
    expect(index.version).toBe(version);
    expect(index.files.length).toBeGreaterThan(0);
    for (const file of index.files) {
      const target = path.join(root, version, file.file);
      expect(fs.existsSync(target)).toBe(true);
      expect(fs.readFileSync(target).length).toBe(file.bytes);
      expect(file.hash).toMatch(/^[0-9a-f]{16}$/);
    }
  });

  it("keeps the per-section files exact projections of the whole-payload file", async () => {
    const bundle = await loadBundleVersion(version, source);
    const read = (file: string) =>
      JSON.parse(fs.readFileSync(path.join(root, version, file), "utf-8"));
    expect(read(BUNDLE_SECTION_FILES.curriculum)).toEqual(bundle.curriculum);
    expect(read(BUNDLE_SECTION_FILES.beats)).toEqual(bundle.beats);
    expect(read(BUNDLE_SECTION_FILES.exercises)).toEqual(bundle.exercises);
    expect(read(BUNDLE_SECTION_FILES.goldens)).toEqual(bundle.goldens);
    expect(read(BUNDLE_SECTION_FILES.revisions)).toEqual(bundle.revisions);
    expect(read(BUNDLE_SECTION_FILES.migrations)).toEqual(bundle.migrations);
  });
});

// ---------------------------------------------------------------------------
// CP-04 scenario 2 — "the previously published version's contents are never
// mutated (immutability)" + version reproducibility (ADR-0011 #7)
// ---------------------------------------------------------------------------

describe("CP-04 scenario 2 — immutability and version reproducibility", () => {
  it("reproduces the same version id from unchanged content, byte for byte", () => {
    const a = disposableDir("bundle-repro-a-");
    const b = disposableDir("bundle-repro-b-");

    const first = emitBundle(a);
    const second = emitBundle(b);

    expect(second.version).toBe(first.version);
    expect(readVersionDirBytes(path.join(b, second.version))).toEqual(
      readVersionDirBytes(path.join(a, first.version))
    );
  });

  it("is a no-op on rebuild: same root twice leaves every byte and mtime untouched", () => {
    const root = disposableDir("bundle-noop-");
    const first = emitBundle(root);
    const versionDir = path.join(root, first.version);
    const before = readVersionDirBytes(versionDir);
    const mtimes = () =>
      fs
        .readdirSync(versionDir)
        .sort()
        .map((f) => fs.statSync(path.join(versionDir, f)).mtimeMs);
    const mtimesBefore = mtimes();

    const second = emitBundle(root);

    expect(second.version).toBe(first.version);
    expect(second.unchanged).toBe(true);
    expect(readVersionDirBytes(versionDir)).toEqual(before);
    // Not merely equal CONTENT — nothing was rewritten at all.
    expect(mtimes()).toEqual(mtimesBefore);
  });

  it("REFUSES to overwrite a published version whose bytes differ, and mutates nothing", () => {
    const root = disposableDir("bundle-immutable-");
    const { version } = emitBundle(root);
    const target = path.join(root, version, BUNDLE_SECTION_FILES.goldens);

    const tampered = `${fs.readFileSync(target, "utf-8")}\n// hand edit\n`;
    fs.writeFileSync(target, tampered, "utf-8");
    const otherFilesBefore = readVersionDirBytes(path.join(root, version));

    expect(() => emitBundle(root)).toThrow(BundleImmutabilityError);
    expect(() => emitBundle(root)).toThrow(/immutable/i);
    // The refusal left the directory exactly as it was — no partial rewrite of any file.
    expect(fs.readFileSync(target, "utf-8")).toBe(tampered);
    expect(readVersionDirBytes(path.join(root, version))).toEqual(otherFilesBefore);
  });

  it("REFUSES when a published version is missing a file it should have", () => {
    const root = disposableDir("bundle-missing-");
    const { version } = emitBundle(root);
    fs.rmSync(path.join(root, version, BUNDLE_SECTION_FILES.beats));

    expect(() => emitBundle(root)).toThrow(BundleImmutabilityError);
    expect(() => emitBundle(root)).toThrow(/missing/);
  });

  it("REFUSES when a published version has gained an unexpected extra file", () => {
    const root = disposableDir("bundle-extra-");
    const { version } = emitBundle(root);
    fs.writeFileSync(path.join(root, version, "stowaway.json"), "{}\n", "utf-8");

    expect(() => emitBundle(root)).toThrow(BundleImmutabilityError);
    expect(() => emitBundle(root)).toThrow(/stowaway\.json/);
  });

  it("REFUSES on a BOM-only difference, which changes no visible character", () => {
    // A prepended UTF-8 BOM is the smallest realistic tamper (an editor "helpfully" saving a
    // published file): zero visible change, but the bytes moved.
    const root = disposableDir("bundle-bom-");
    const { version } = emitBundle(root);
    const target = path.join(root, version, BUNDLE_SECTION_FILES.migrations);
    const original = fs.readFileSync(target);
    fs.writeFileSync(target, Buffer.concat([Buffer.from([0xef, 0xbb, 0xbf]), original]));

    expect(() => emitBundle(root)).toThrow(BundleImmutabilityError);
  });

  it("REFUSES on a single appended invalid byte, and leaves the tampered file as-is", () => {
    // An undecodable trailing byte: the file is no longer what was published, and the gate
    // must refuse rather than silently "repair" it.
    //
    // NOTE ON WHAT THIS DOES *NOT* PROVE: it does not demonstrate that the gate's
    // Buffer.compare is necessary. Mutation-tested — swapping bytesDiffer for a decoded-string
    // compare keeps this test AND the BOM test green, because the expected text is always
    // valid UTF-8 and so no tampered bytes can decode to exactly it. Recorded here so a later
    // reader does not mistake these two tests for evidence of a byte-vs-string distinction.
    const root = disposableDir("bundle-bytes-");
    const { version } = emitBundle(root);
    const target = path.join(root, version, BUNDLE_SECTION_FILES.goldens);

    const tampered = Buffer.concat([fs.readFileSync(target), Buffer.from([0x80])]);
    fs.writeFileSync(target, tampered);

    expect(() => emitBundle(root)).toThrow(BundleImmutabilityError);
    expect(fs.readFileSync(target).equals(tampered)).toBe(true);
  });

  it("routes CHANGED content to a NEW version directory, leaving the old one intact", () => {
    // Content varies, so this must run out of process against a synthetic corpus.
    const corpus = disposableDir("bundle-change-");
    writeCorpus(corpus, { mdxBody: "Intro paragraph.\n\n## First Section\n\nBody." });

    expect(runEmitter(corpus).status).toBe(0);
    const bundleRoot = path.join(corpus, "public", "content-bundle");
    const firstVersion = readManifest(bundleRoot).latest;
    const firstBytes = readVersionDirBytes(path.join(bundleRoot, firstVersion));

    // A prose edit: same structure, so the same beat ids, but different content.
    writeCorpus(corpus, { mdxBody: "Intro paragraph, revised.\n\n## First Section\n\nBody." });
    expect(runEmitter(corpus).status).toBe(0);

    const manifest = readManifest(bundleRoot);
    expect(manifest.latest).not.toBe(firstVersion);
    // The old version is still present and byte-identical: never mutated (CP-04 scenario 2).
    expect(readVersionDirBytes(path.join(bundleRoot, firstVersion))).toEqual(firstBytes);
    expect(manifest.versions.map((v) => v.version).sort()).toEqual(
      [firstVersion, manifest.latest].sort()
    );
  });

  it("produces the SAME version id from a CRLF checkout and an LF checkout of identical content", () => {
    // REGRESSION TEST for a real, measured defect. `core.autocrlf` is true on this machine and
    // `.gitattributes` covers only the program ledger, so the same committed corpus is CRLF in
    // one checkout and LF in another. Hashing the raw MDX body made the version id a function
    // of the CHECKOUT rather than the content (measured: ad58bbba2569bb96 vs eb647973722173b3
    // for a byte-identical corpus), which breaks CP-04 scenario 2 across machines.
    const body = "Intro paragraph.\n\n## First Section\n\nBody text.";
    const lessonRel = [
      "content",
      "modules",
      "01-how-llms-work",
      "lessons",
      "01-lesson",
      "lesson.mdx",
    ];

    const lfCorpus = disposableDir("bundle-lf-");
    writeCorpus(lfCorpus, { mdxBody: body });

    const crlfCorpus = disposableDir("bundle-crlf-");
    writeCorpus(crlfCorpus, { mdxBody: body });
    // Rewrite the lesson with CRLF endings — byte for byte identical otherwise.
    const lessonPath = path.join(crlfCorpus, ...lessonRel);
    const lf = fs.readFileSync(lessonPath, "utf-8");
    fs.writeFileSync(lessonPath, lf.replace(/\n/g, "\r\n"), "utf-8");
    expect(fs.readFileSync(lessonPath, "utf-8")).toContain("\r\n");
    // The two corpora really are different on disk, or this test proves nothing.
    expect(fs.readFileSync(lessonPath).equals(fs.readFileSync(path.join(lfCorpus, ...lessonRel))))
      .toBe(false);

    expect(runEmitter(lfCorpus).status).toBe(0);
    expect(runEmitter(crlfCorpus).status).toBe(0);

    const lfVersion = readManifest(path.join(lfCorpus, "public", "content-bundle")).latest;
    const crlfVersion = readManifest(path.join(crlfCorpus, "public", "content-bundle")).latest;
    expect(crlfVersion).toBe(lfVersion);
  });

  it("keeps item IDs fixed while the itemRevision flips on a content change (CP-05 scenario 1)", () => {
    const corpus = disposableDir("bundle-rev-");
    writeCorpus(corpus, { mdxBody: "Intro.\n\n## Section One\n\nOriginal body." });
    expect(runEmitter(corpus).status).toBe(0);
    const bundleRoot = path.join(corpus, "public", "content-bundle");
    const before = readBundleJson(bundleRoot, readManifest(bundleRoot).latest);

    writeCorpus(corpus, { mdxBody: "Intro.\n\n## Section One\n\nEdited body." });
    expect(runEmitter(corpus).status).toBe(0);
    const after = readBundleJson(bundleRoot, readManifest(bundleRoot).latest);

    // Same ids (beat ids AND lesson revision keys) …
    expect(Object.keys(after.revisions.beats)).toEqual(Object.keys(before.revisions.beats));
    expect(Object.keys(after.revisions.lessons)).toEqual(Object.keys(before.revisions.lessons));
    // … different lesson revision, because the prose changed.
    const lessonKey = Object.keys(before.revisions.lessons)[0];
    expect(after.revisions.lessons[lessonKey]).not.toBe(before.revisions.lessons[lessonKey]);
  });

  it("leaves no staging directory behind, so version discovery sees only real versions", () => {
    const root = disposableDir("bundle-staging-");
    const { version } = emitBundle(root);
    // The atomic publish uses a `.tmp-` sibling; it must be gone, and never listed.
    expect(fs.readdirSync(root).filter((n) => n.startsWith(".tmp-"))).toEqual([]);
    expect(readManifest(root).versions.map((v) => v.version)).toEqual([version]);
  });
});

// ---------------------------------------------------------------------------
// CP-04 scenario 3 — "when a new bundle version is released, no app redeploy is
// required" (restated for local desktop per ADR-0007: files under public/, which
// this Next version serves at request time from disk)
// ---------------------------------------------------------------------------

describe("CP-04 scenario 3 — a new version is picked up with no app rebuild", () => {
  it("emits under <root>/<version>/ with a latest-version manifest naming the public route", () => {
    const root = disposableDir("bundle-route-");
    const { version } = emitBundle(root);
    const manifest = readManifest(root);

    expect(manifest.manifestFormat).toBe(1);
    expect(manifest.latest).toBe(version);
    // The path in the manifest is the PUBLIC ROUTE, i.e. what a browser fetches.
    expect(manifest.versions.find((v) => v.version === version)?.path).toBe(
      `/content-bundle/${version}`
    );
    expect(fs.existsSync(path.join(root, version, BUNDLE_FILENAME))).toBe(true);
  });

  it("resolves the manifest on EVERY read, so a newly published version is served immediately", async () => {
    const root = disposableDir("bundle-newver-");
    const source: BundleSource = { kind: "dir", dir: root };
    const { version } = emitBundle(root);
    clearBundleCache();

    expect((await loadLatestBundle(source)).version).toBe(version);

    // Publish a second version the way a content release would: a new directory plus a
    // manifest bump. No rebuild, no process restart, no cache-invalidation call.
    const nextVersion = "ffffffffffffffff";
    fs.mkdirSync(path.join(root, nextVersion), { recursive: true });
    fs.copyFileSync(
      path.join(root, version, BUNDLE_FILENAME),
      path.join(root, nextVersion, BUNDLE_FILENAME)
    );
    const manifest = readManifest(root);
    fs.writeFileSync(
      path.join(root, MANIFEST_FILENAME),
      JSON.stringify({
        ...manifest,
        latest: nextVersion,
        versions: [
          ...manifest.versions,
          { version: nextVersion, path: `/content-bundle/${nextVersion}` },
        ],
      }),
      "utf-8"
    );

    // The SAME live reader, with no invalidation, now serves the new version.
    expect((await loadLatestBundle(source)).version).toBe(nextVersion);
    // …and the previously loaded version is still readable and unchanged.
    expect((await loadBundleVersion(version, source)).version).toBe(version);
  });

  it("re-reads a stale manifest rather than memoising it", async () => {
    const root = disposableDir("bundle-manifest-");
    emitBundle(root);
    const source: BundleSource = { kind: "dir", dir: root };
    const before = await loadBundleManifest(source);

    fs.writeFileSync(
      path.join(root, MANIFEST_FILENAME),
      JSON.stringify({ ...before, latest: "0123456789abcdef" }),
      "utf-8"
    );
    const after = await loadBundleManifest(source);
    expect(after.latest).toBe("0123456789abcdef");
    expect(after.latest).not.toBe(before.latest);
  });

  it("serves a version over the URL source too, proving the route shape (not just the dir)", async () => {
    // `kind: "url"` is the mode a browser uses. Exercising it with a stub `fetch` proves the
    // reader composes `<baseUrl>/<version>/bundle.json` — the actual static route — rather
    // than only ever working through the filesystem branch.
    const root = disposableDir("bundle-url-");
    const { version } = emitBundle(root);
    clearBundleCache();

    const requested: string[] = [];
    const realFetch = globalThis.fetch;
    globalThis.fetch = (async (input: RequestInfo | URL) => {
      const url = String(input);
      requested.push(url);
      const rel = url.replace(/^\/content-bundle\//, "");
      const body = fs.readFileSync(path.join(root, rel), "utf-8");
      return new Response(body, { status: 200 });
    }) as typeof globalThis.fetch;
    try {
      const bundle = await loadLatestBundle({ kind: "url", baseUrl: "/content-bundle" });
      expect(bundle.version).toBe(version);
    } finally {
      globalThis.fetch = realFetch;
    }
    expect(requested).toContain("/content-bundle/manifest.json");
    expect(requested).toContain(`/content-bundle/${version}/${BUNDLE_FILENAME}`);
  });

  it("fails loudly with remediation guidance when no bundle has been emitted", async () => {
    const empty = disposableDir("bundle-absent-");
    await expect(loadLatestBundle({ kind: "dir", dir: empty })).rejects.toThrow(
      /build:content/
    );
  });
});

// ---------------------------------------------------------------------------
// Build-failure wiring — the gap carried into this item from ROOT.1.1.2's
// verification log: beat validation must fail `npm run build`, not just `npm test`.
// ---------------------------------------------------------------------------

describe("build-failure wiring — invalid content fails the emit path", () => {
  it("is chained into npm run build ahead of next build (package.json)", () => {
    const pkg = JSON.parse(
      fs.readFileSync(path.resolve(__dirname, "..", "package.json"), "utf-8")
    ) as { scripts: Record<string, string> };

    expect(pkg.scripts["build:content"]).toBe("tsx scripts/build-content-bundle.ts");
    // The emitter must run BEFORE `next build`, or a content violation would only be
    // discovered after a full app build (and `&&` is what makes the failure fatal).
    expect(pkg.scripts.build).toBe(
      "velite build --clean && npm run build:content && next build"
    );
    expect(pkg.scripts.build.indexOf("build:content")).toBeLessThan(
      pkg.scripts.build.indexOf("next build")
    );
    // Pre-existing entries this item may not disturb (additive-only edit).
    expect(pkg.scripts.test).toBe("vitest run");
    expect(pkg.scripts["content:build"]).toBe("velite build --clean");
    expect(pkg.scripts["verify:e2e"]).toBe("bash scripts/run-e2e-with-server.sh");
    expect(pkg.scripts.dev).toBe("velite build && next dev -H 127.0.0.1");
  });

  it("exits NON-ZERO on a duplicate beat key and publishes nothing (ADR-0011 #3)", () => {
    const corpus = disposableDir("bundle-dup-");
    // Two h2 headings slugging identically => duplicate `prose:<slug>` beat id.
    writeCorpus(corpus, { mdxBody: "## Same Heading\n\nfirst\n\n## Same Heading\n\nsecond" });

    const result = runEmitter(corpus);

    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/BeatCompileError/);
    expect(result.stderr).toMatch(/duplicate beatId "prose:same-heading"/);
    // Nothing was published: a failing build leaves no bundle behind.
    expect(fs.existsSync(path.join(corpus, "public", "content-bundle"))).toBe(false);
  });

  it("exits NON-ZERO when an MDX anchor names an exercise that does not exist", () => {
    const corpus = disposableDir("bundle-anchor-");
    writeCorpus(corpus, { mdxBody: '## Section\n\n<Exercise id="does-not-exist" />' });

    const result = runEmitter(corpus);

    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/BeatCompileError/);
    expect(result.stderr).toMatch(/does-not-exist/);
    expect(fs.existsSync(path.join(corpus, "public", "content-bundle"))).toBe(false);
  });

  it("exits NON-ZERO on a requires cycle, since no layout is derivable", () => {
    const corpus = disposableDir("bundle-cycle-");
    writeCorpus(corpus, { mdxBody: "## Section\n\nbody" });
    fs.writeFileSync(
      path.join(corpus, "content", "curriculum.json"),
      JSON.stringify({
        modules: [
          {
            id: "01-alpha",
            title: "Alpha",
            track: "fundamentals",
            summary: "s",
            status: "spec",
            requires: ["02-beta"],
          },
          {
            id: "02-beta",
            title: "Beta",
            track: "fundamentals",
            summary: "s",
            status: "spec",
            requires: ["01-alpha"],
          },
        ],
      })
    );

    const result = runEmitter(corpus);

    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/cycle/i);
  });

  it("exits NON-ZERO when a requires edge names an unknown module", () => {
    const corpus = disposableDir("bundle-unknown-");
    writeCorpus(corpus, { mdxBody: "## Section\n\nbody" });
    const curriculumPath = path.join(corpus, "content", "curriculum.json");
    const curriculum = JSON.parse(fs.readFileSync(curriculumPath, "utf-8")) as {
      modules: Array<{ requires: string[] }>;
    };
    curriculum.modules[0].requires = ["99-nonexistent"];
    fs.writeFileSync(curriculumPath, JSON.stringify(curriculum));

    const result = runEmitter(corpus);

    expect(result.status).toBe(1);
    expect(result.stderr).toMatch(/99-nonexistent/);
  });

  it("succeeds and publishes on a VALID corpus (the negative control)", () => {
    const corpus = disposableDir("bundle-valid-");
    writeCorpus(corpus, { mdxBody: "Intro.\n\n## Section One\n\nbody" });

    const result = runEmitter(corpus);

    expect(result.status).toBe(0);
    expect(result.stdout).toMatch(/content-bundle: version [0-9a-f]{16} emitted/);
    const bundleRoot = path.join(corpus, "public", "content-bundle");
    expect(fs.existsSync(path.join(bundleRoot, MANIFEST_FILENAME))).toBe(true);
    const payload = readBundleJson(bundleRoot, readManifest(bundleRoot).latest);
    expect(Object.keys(payload.beats)).toEqual(["01-how-llms-work/01-lesson"]);
  });

  it("re-running the emitter on an unchanged corpus reports the no-op and still exits 0", () => {
    const corpus = disposableDir("bundle-rerun-");
    writeCorpus(corpus, { mdxBody: "Intro.\n\n## Section One\n\nbody" });

    expect(runEmitter(corpus).status).toBe(0);
    const second = runEmitter(corpus);

    expect(second.status).toBe(0);
    expect(second.stdout).toMatch(/already published \(no-op, bytes identical\)/);
  });
});
