/**
 * CONTENT BUNDLE EMITTER (REQ-CP-04, REQ-CP-05).
 *
 * Run: `npm run build:content`, which `npm run build` chains
 * (`velite build --clean && npm run build:content && next build`).
 *
 * Emits one immutable, content-addressed release of all authored content into
 * `public/content-bundle/<version>/`, plus the mutable
 * `public/content-bundle/manifest.json` naming the latest version. The bundle TYPE contract
 * lives in `src/lib/bundle.ts`; this file IMPORTS it rather than restating it, so producer
 * and consumer cannot drift.
 *
 * FIVE PROPERTIES THIS FILE EXISTS TO GUARANTEE
 *
 * 1. BEAT VALIDATION FAILS THE BUILD. `compileAllLessonBeats()` (src/lib/content.ts) runs
 *    the compiler over every built lesson, and `assertValidBeats()` re-checks every emitted
 *    array here. A duplicate beat key, an unresolvable anchor, a mis-typed exercise or a
 *    terminal beat missing `persistent: true` therefore throws inside `npm run build`, not
 *    merely inside `npm test` — the gap ROOT.1.1.2's verification log carried into this
 *    item. `assertValidBeats` is called even though `compileBeats` already calls it
 *    internally: the point of the gate is that the BUNDLE is checked at the moment of emit,
 *    so a future change to how beats reach the bundle cannot bypass it.
 *
 * 2. DETERMINISM. Nothing here reads the clock, a counter, a random source, the
 *    environment, or directory order AS DATA. Every collection is sorted by a stable
 *    authored key before it enters the payload, and JSON is written through one canonical
 *    serialiser. Rebuilding unchanged content therefore reproduces the same version id, and
 *    the same bytes. NOTE the deliberate ABSENCE of a `generatedAt` field: a timestamp
 *    anywhere in the payload would change the hash on every build and make immutability
 *    unauditable (ADR-0011, alternatives rejected).
 *
 * 3. IMMUTABILITY IS ENFORCED, NOT DOCUMENTED. If `<version>/` already exists, every file
 *    is compared BYTE for byte (Buffer.compare, not string equality — see
 *    `bytesDiffer`). Identical => a true no-op; nothing is rewritten and no mtime moves.
 *    Different => the emitter REFUSES and exits non-zero (REQ-CP-04 scenario 2). Since the
 *    version IS the hash of the payload, genuinely changed content always lands in a NEW
 *    directory and can never mutate a published one; a byte difference under an UNCHANGED
 *    version id means something outside the payload moved (a hand edit, a serialiser
 *    change), which is exactly the case worth failing on rather than papering over.
 *
 * 4. A PARTIAL DIRECTORY IS NEVER PUBLISHED. Files are written into a temporary sibling and
 *    the directory is moved into place with a single rename (`publishAtomically`). Without
 *    this, a crash or a kill mid-write would leave a half-written `<version>/` that the
 *    immutability gate above would then refuse FOREVER — the correctness property turning
 *    into a permanent, self-inflicted build failure.
 *
 * 5. LAYOUT IS COMPUTED. `(col, lane)` is derived from the requires-edge topology and track
 *    grouping — never hand-placed (LANE-DEPENDENCIES "Metro-map layout data" row).
 *
 * WHAT THIS FILE MAY NOT DO: reimplement the beat compiler or the revision hasher (it
 * consumes `src/lib/beats.ts` through `content.ts`, and `src/lib/revisions.ts`), or touch
 * `src/lib/schema.ts` (steward-owned) — authored shapes are read through the existing
 * schema-backed loaders in `content.ts`.
 */

import fs from "node:fs";
import path from "node:path";
import {
  assertValidBeats,
  compileAllLessonBeats,
  lessonKey as makeLessonKey,
  loadCurriculum,
  loadLesson,
  loadModuleMeta,
  type Beat,
} from "../src/lib/content";
import {
  buildRevisionsMap,
  computeItemRevision,
  loadMigrationMaps,
  type MigrationEntry,
} from "../src/lib/revisions";
import type { CurriculumEntry, Exercise } from "../src/lib/schema";
import {
  BUNDLE_FILENAME,
  BUNDLE_SECTION_FILES,
  CONTENT_BUNDLE_PUBLIC_DIR,
  CONTENT_BUNDLE_ROUTE,
  INDEX_FILENAME,
  MANIFEST_FILENAME,
  beatItemId,
  exerciseItemId,
  type BundleCurriculum,
  type BundleCurriculumEdge,
  type BundleCurriculumNode,
  type BundleExerciseBankEntry,
  type BundleFileEntry,
  type BundleGoldens,
  type BundleIndex,
  type BundleRevisions,
  type ContentBundleManifest,
  type ContentBundlePayload,
} from "../src/lib/bundle";

/** Emit refused because it would have mutated a published version. */
export class BundleImmutabilityError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BundleImmutabilityError";
  }
}

/** Locale-independent code-unit comparison (localeCompare is not stable across ICU builds). */
function cmp(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}

// ---------- Canonical serialisation ----------

/**
 * Canonical JSON text: recursively sorted object keys, two-space indent, one trailing
 * newline.
 *
 * Key sorting matters twice over. It makes the emitted BYTES a pure function of the payload
 * VALUE, so property insertion order in this file cannot change a published file; and it
 * matches the canonicalisation `computeItemRevision` applies internally, so the version hash
 * and the file bytes agree about what "the same content" means.
 *
 * Arrays are walked by INDEX rather than with `Array.prototype.map`, which skips sparse
 * holes — the same bypass ADR-0017 Amendment 1 (A1.1) closed in `revisions.ts`. A hole
 * cannot actually reach here (the payload is hashed by `computeItemRevision` FIRST, which
 * rejects one with a TypeError naming its path), so this is defence in depth against a
 * future reordering of those two steps rather than a live risk.
 */
function canonicalize(value: unknown): unknown {
  if (Array.isArray(value)) {
    const out: unknown[] = [];
    for (let i = 0; i < value.length; i++) out.push(canonicalize(value[i]));
    return out;
  }
  if (value !== null && typeof value === "object") {
    const source = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(source).sort(cmp)) {
      if (source[key] === undefined) continue;
      // defineProperty, not assignment: a key of `__proto__` would otherwise hit the
      // prototype setter and vanish instead of round-tripping (the F3 finding that
      // `revisions.ts` fixed the same way — the two must agree or hash and bytes diverge).
      Object.defineProperty(out, key, {
        value: canonicalize(source[key]),
        enumerable: true,
        writable: true,
        configurable: true,
      });
    }
    return out;
  }
  return value;
}

function canonicalJsonText(value: unknown): string {
  return `${JSON.stringify(canonicalize(value), null, 2)}\n`;
}

/**
 * Normalise line endings to LF before a string enters a hash.
 *
 * NOT cosmetic — this closes an empirically measured determinism defect. `core.autocrlf` is
 * true on the build machine and `.gitattributes` covers only the program ledger, so the SAME
 * committed lesson is CRLF in one checkout and LF in another. Hashing the raw MDX body made
 * the bundle version id depend on the CHECKOUT rather than on the content: version
 * ad58bbba2569bb96 from a CRLF checkout versus eb647973722173b3 from a byte-identical LF
 * corpus. That breaks REQ-CP-04 scenario 2 across machines and would spuriously "change"
 * every lesson revision on a fresh clone.
 *
 * Normalising is the CONSISTENT choice rather than a patch: the beat compiler already splits
 * on `/\r?\n/`, so it treats the two forms as the same content, and every other hashed input
 * (curriculum.json, module.json, exercises.json) arrives JSON-parsed with its source
 * whitespace already discarded. Applied at the READ boundary (`readBuiltLessons`) and to
 * parsed frontmatter (`normalizeStringsDeep`), i.e. to every string that reaches a hash from
 * a text file. Lone CR is normalised too, so no line-ending convention survives into a hash.
 */
function normalizeNewlines(text: string): string {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

/**
 * LF-normalise every string in a parsed structure.
 *
 * Frontmatter reaches the hash as YAML-PARSED values, and a YAML block scalar
 * (`summary: |`) preserves its line terminators inside the resulting string — so a CRLF
 * checkout can carry `\r` into a parsed frontmatter value, not just into the raw MDX body.
 * Normalising the parsed structure closes that path instead of assuming the YAML parser
 * already did it.
 */
function normalizeStringsDeep(value: unknown): unknown {
  if (typeof value === "string") return normalizeNewlines(value);
  if (Array.isArray(value)) {
    const out: unknown[] = [];
    for (let i = 0; i < value.length; i++) out.push(normalizeStringsDeep(value[i]));
    return out;
  }
  if (value !== null && typeof value === "object") {
    const source = value as Record<string, unknown>;
    const out: Record<string, unknown> = {};
    for (const key of Object.keys(source)) {
      Object.defineProperty(out, key, {
        value: normalizeStringsDeep(source[key]),
        enumerable: true,
        writable: true,
        configurable: true,
      });
    }
    return out;
  }
  return value;
}

// ---------- Layout computation (never hand-placed) ----------

/**
 * Topological depth of every module over `requires` edges: `col = 0` for a module with no
 * prerequisites, otherwise `1 + max(col of prerequisites)` — longest-path layering, which is
 * what puts a module strictly to the right of everything it depends on (the property the
 * metro map draws).
 *
 * Unknown prerequisite ids and cycles are BUILD FAILURES, not silently dropped edges: both
 * mean `curriculum.json` does not describe a DAG, so no layout is derivable. (`npm run
 * validate` also rejects unknown prerequisites, but the emitter cannot assume validate ran
 * first, and a cycle is not one of validate's checks.)
 */
function computeColumns(modules: readonly CurriculumEntry[]): Map<string, number> {
  const byId = new Map(modules.map((m) => [m.id, m]));
  const depth = new Map<string, number>();
  const visiting = new Set<string>();

  const resolve = (id: string, trail: readonly string[]): number => {
    const cached = depth.get(id);
    if (cached !== undefined) return cached;
    if (visiting.has(id)) {
      throw new Error(
        `curriculum.json has a requires cycle: ${[...trail, id].join(" -> ")}. Module ` +
          `layout columns are a topological layering, so the graph must be acyclic.`
      );
    }
    const entry = byId.get(id);
    if (!entry) {
      throw new Error(
        `curriculum.json: module "${trail[trail.length - 1] ?? "?"}" requires unknown ` +
          `module "${id}".`
      );
    }
    visiting.add(id);
    let col = 0;
    for (const req of entry.requires) {
      col = Math.max(col, resolve(req, [...trail, id]) + 1);
    }
    visiting.delete(id);
    depth.set(id, col);
    return col;
  };

  // Authored order, so even the (result-irrelevant) recursion order is deterministic.
  for (const m of modules) resolve(m.id, []);
  return depth;
}

/**
 * Lane assignment: modules are grouped into per-track LANE BANDS, and within a band each
 * module takes the lowest free lane in its column — so two modules never collide at the same
 * `(col, lane)` and a track reads as a contiguous set of rows (the metro-line metaphor).
 *
 * Track order and within-track order both come from authored order in `curriculum.json`
 * (module ids are `NN-…`, so authored order IS the curriculum's own numbering). Band width is
 * the maximum number of modules a track has in any single column — the smallest width that
 * cannot overflow.
 */
function computeLayout(modules: readonly CurriculumEntry[]): {
  colById: Map<string, number>;
  laneById: Map<string, number>;
  layout: BundleCurriculum["layout"];
} {
  const colById = computeColumns(modules);

  const trackOrder: string[] = [];
  for (const m of modules) if (!trackOrder.includes(m.track)) trackOrder.push(m.track);

  // Per track, the peak number of modules sharing one column => that track's band width.
  const widthByTrack = new Map<string, number>();
  for (const track of trackOrder) {
    const perColumn = new Map<number, number>();
    for (const m of modules) {
      if (m.track !== track) continue;
      const col = colById.get(m.id) ?? 0;
      perColumn.set(col, (perColumn.get(col) ?? 0) + 1);
    }
    widthByTrack.set(track, Math.max(1, ...perColumn.values()));
  }

  const bandByTrack: Record<string, { start: number; width: number }> = {};
  let nextStart = 0;
  for (const track of trackOrder) {
    const width = widthByTrack.get(track) ?? 1;
    bandByTrack[track] = { start: nextStart, width };
    nextStart += width;
  }

  const laneById = new Map<string, number>();
  const takenPerColumn = new Map<number, Set<number>>();
  for (const m of modules) {
    const col = colById.get(m.id) ?? 0;
    const band = bandByTrack[m.track];
    const taken = takenPerColumn.get(col) ?? new Set<number>();
    let lane = band.start;
    while (taken.has(lane)) lane += 1;
    if (lane >= band.start + band.width) {
      // Unreachable by construction (band width = peak per-column count). Kept because a
      // silent overlap would surface as an invisible layout bug in a downstream renderer.
      throw new Error(
        `layout: module "${m.id}" overflowed track band "${m.track}" (start ${band.start}, ` +
          `width ${band.width}) at column ${col}.`
      );
    }
    taken.add(lane);
    takenPerColumn.set(col, taken);
    laneById.set(m.id, lane);
  }

  const columns = Math.max(1, ...[...colById.values()].map((c) => c + 1));
  const lanes = Math.max(1, nextStart);
  return { colById, laneById, layout: { columns, lanes, bandByTrack } };
}

function buildCurriculumSection(modules: readonly CurriculumEntry[]): BundleCurriculum {
  const { colById, laneById, layout } = computeLayout(modules);

  const nodes: BundleCurriculumNode[] = modules.map((m) => ({
    id: m.id,
    title: m.title,
    track: m.track,
    summary: m.summary,
    status: m.status,
    requires: [...m.requires],
    layout: { col: colById.get(m.id) ?? 0, lane: laneById.get(m.id) ?? 0 },
  }));

  // Oriented prerequisite -> dependent (the direction the map draws), sorted so the edge list
  // is a pure function of the graph rather than of iteration order.
  const edges: BundleCurriculumEdge[] = modules
    .flatMap((m) => m.requires.map((req) => ({ from: req, to: m.id })))
    .sort((a, b) => cmp(a.from, b.from) || cmp(a.to, b.to));

  return { nodes, edges, layout };
}

// ---------- Payload assembly ----------

/**
 * The empty-but-structured calibration-goldens section.
 *
 * DEVIATION, PRE-AUTHORIZED BY THIS ITEM'S ACCEPTANCE CRITERION ("empty-but-structured
 * section if none exist yet, noted as deviation"). REQ-CP-04 scenario 1 requires the bundle
 * to contain calibration goldens; the authored corpus has none — no golden set exists
 * anywhere under `content/`, and the judge lane that produces them (REQ-JP-05) has not
 * shipped. Emitting the section with its shape fixed and zero entries keeps the consumer
 * contract stable and makes the gap explicit and greppable, rather than omitting the key and
 * forcing every consumer into a presence check. Populating `families` later is additive.
 */
function buildGoldensSection(): BundleGoldens {
  return {
    goldensFormat: 1,
    families: [],
    count: 0,
    note:
      "Empty-but-structured: no calibration goldens exist in the authored corpus yet " +
      "(REQ-JP-05 has not shipped). Recorded as a deviation on ROOT.1.1.4. Adding " +
      "families here is additive and changes no other section.",
  };
}

type LessonSource = {
  moduleId: string;
  lessonId: string;
  lessonKey: string;
  mdx: string;
  frontmatter: unknown;
  exercises: Exercise[];
};

/**
 * Read every BUILT lesson's authored source, in curriculum order then module-declared lesson
 * order.
 *
 * Modules whose curriculum `status` is not `"built"` have no lesson files on disk yet and are
 * skipped — the same rule `compileAllLessonBeats()` applies, so the two views can never
 * disagree about which lessons exist.
 *
 * `loadLesson` is the ONLY reader used: it already parses frontmatter through the
 * steward-owned `LessonFrontmatterSchema` and returns the raw MDX body, so nothing here
 * re-parses authored files or duplicates the authoring contract.
 */
function readBuiltLessons(modules: readonly CurriculumEntry[]): LessonSource[] {
  const out: LessonSource[] = [];
  for (const entry of modules) {
    if (entry.status !== "built") continue;
    for (const lesson of loadModuleMeta(entry.id).lessons) {
      const loaded = loadLesson(entry.id, lesson.id);
      out.push({
        moduleId: entry.id,
        lessonId: lesson.id,
        lessonKey: makeLessonKey(entry.id, lesson.id),
        // LF-normalised at the read boundary: see `normalizeNewlines`.
        mdx: normalizeNewlines(loaded.mdx),
        frontmatter: normalizeStringsDeep(loaded.frontmatter),
        exercises: loaded.exercises,
      });
    }
  }
  return out;
}

function buildExerciseBank(lessons: readonly LessonSource[]): BundleExerciseBankEntry[] {
  const bank: BundleExerciseBankEntry[] = [];
  for (const lesson of lessons) {
    for (const exercise of lesson.exercises) {
      bank.push({
        itemId: exerciseItemId(lesson.lessonKey, exercise.id),
        moduleId: lesson.moduleId,
        lessonId: lesson.lessonId,
        lessonKey: lesson.lessonKey,
        exerciseId: exercise.id,
        type: exercise.type,
        exercise,
      });
    }
  }
  return bank;
}

/**
 * The revisions sidecar (REQ-CP-05, ADR-0011 #6) via `buildRevisionsMap` — never a local
 * hash implementation.
 *
 * HASH SOURCES, chosen so that any authored change flips some revision:
 *   - exercise: the whole authored exercise object;
 *   - beat: the compiled beat descriptor plus its lesson key, so the same `beatId` in two
 *     lessons cannot collide;
 *   - lesson: frontmatter + raw MDX body + the ordered beat ids. Prose lives ONLY here,
 *     because a beat descriptor carries no prose and slicing MDX per beat would mean
 *     reimplementing the compiler.
 */
function buildRevisionsSection(
  lessons: readonly LessonSource[],
  beatsByLesson: Readonly<Record<string, Beat[]>>
): BundleRevisions {
  const exerciseItems: Array<{ id: string; content: unknown }> = [];
  const beatItems: Array<{ id: string; content: unknown }> = [];
  const lessonItems: Array<{ id: string; content: unknown }> = [];

  for (const lesson of lessons) {
    for (const exercise of lesson.exercises) {
      exerciseItems.push({
        id: exerciseItemId(lesson.lessonKey, exercise.id),
        content: exercise,
      });
    }
    const beats = beatsByLesson[lesson.lessonKey] ?? [];
    for (const beat of beats) {
      beatItems.push({
        id: beatItemId(lesson.lessonKey, beat.beatId),
        content: { lessonKey: lesson.lessonKey, beat },
      });
    }
    lessonItems.push({
      id: lesson.lessonKey,
      content: {
        frontmatter: lesson.frontmatter,
        mdx: lesson.mdx,
        beatIds: beats.map((b) => b.beatId),
      },
    });
  }

  return {
    exercises: buildRevisionsMap(exerciseItems),
    beats: buildRevisionsMap(beatItems),
    lessons: buildRevisionsMap(lessonItems),
  };
}

/** Records are emitted key-sorted so Map/object iteration order never reaches the bytes. */
function sortedRecord<T>(record: Readonly<Record<string, T>>): Record<string, T> {
  const out: Record<string, T> = {};
  for (const key of Object.keys(record).sort(cmp)) {
    Object.defineProperty(out, key, {
      value: record[key],
      enumerable: true,
      writable: true,
      configurable: true,
    });
  }
  return out;
}

/**
 * Migration entries sorted by (itemId, fromRevision, toRevision).
 *
 * `loadMigrationMaps` already returns this order (ROOT.1.1.3 finding F4); re-sorting here is
 * a one-line guarantee that the BUNDLE's order is a property of the bundle rather than an
 * inherited promise, so a future change upstream cannot silently move published bytes.
 */
function sortMigrations(entries: readonly MigrationEntry[]): MigrationEntry[] {
  return [...entries].sort(
    (a, b) =>
      cmp(a.itemId, b.itemId) ||
      cmp(a.fromRevision, b.fromRevision) ||
      cmp(a.toRevision, b.toRevision)
  );
}

/**
 * Assemble the payload and derive its version id. Reads content; writes nothing.
 */
export function buildBundlePayload(): {
  payload: ContentBundlePayload;
  version: string;
} {
  const modules = loadCurriculum().modules;
  const lessons = readBuiltLessons(modules);

  // (1) Compile beats for every built lesson AND re-assert the gate, so a violation fails
  // the BUILD (see file header, property 1).
  const beats = compileAllLessonBeats();
  for (const [key, lessonBeats] of Object.entries(beats)) {
    assertValidBeats(lessonBeats, key);
  }

  const payload: ContentBundlePayload = {
    bundleFormat: 1,
    curriculum: buildCurriculumSection(modules),
    beats: sortedRecord(beats),
    exercises: buildExerciseBank(lessons),
    goldens: buildGoldensSection(),
    revisions: buildRevisionsSection(lessons, beats),
    migrations: sortMigrations(loadMigrationMaps()),
  };

  // (2) Version = short content hash over the canonical payload (ADR-0011 #7). Reusing
  // `computeItemRevision` rather than hashing here keeps ONE canonicalisation + hash
  // implementation in the tree — and means the payload is validated against the CP-05
  // hash-input domain before any byte is written.
  const version = computeItemRevision(payload);
  return { payload, version };
}

// ---------- Emit ----------

export type EmitResult = {
  version: string;
  versionDir: string;
  manifestPath: string;
  /** True when the version directory already existed with identical bytes. */
  unchanged: boolean;
  files: BundleFileEntry[];
};

/** The whole-payload file, the per-section files, and nothing implicit. */
function bundleFiles(payload: ContentBundlePayload): Array<{ file: string; text: string }> {
  return [
    { file: BUNDLE_FILENAME, text: canonicalJsonText(payload) },
    { file: BUNDLE_SECTION_FILES.curriculum, text: canonicalJsonText(payload.curriculum) },
    { file: BUNDLE_SECTION_FILES.beats, text: canonicalJsonText(payload.beats) },
    { file: BUNDLE_SECTION_FILES.exercises, text: canonicalJsonText(payload.exercises) },
    { file: BUNDLE_SECTION_FILES.goldens, text: canonicalJsonText(payload.goldens) },
    { file: BUNDLE_SECTION_FILES.revisions, text: canonicalJsonText(payload.revisions) },
    { file: BUNDLE_SECTION_FILES.migrations, text: canonicalJsonText(payload.migrations) },
  ];
}

/**
 * True when the file on disk differs from `text` in any BYTE.
 *
 * `Buffer.compare` on raw bytes, because a criterion that says "byte-identical" should be
 * checked on bytes rather than on a decoded projection of them.
 *
 * HONEST SCOPE, established by mutation-testing this line rather than by argument: replacing
 * it with `readFileSync(target, "utf-8") !== text` keeps the whole suite green. It is not
 * catching a bug a string compare would miss. On this Node, a utf-8 read PRESERVES a leading
 * BOM (U+FEFF) and maps invalid bytes to U+FFFD, and the expected `text` is always valid
 * UTF-8 canonical JSON — and UTF-8 decoding is injective on valid input — so no tampered byte
 * sequence can decode to exactly the expected string. The two forms are therefore equivalent
 * HERE. This one is kept anyway because it states the invariant in the units the invariant is
 * about and does not depend on decoder behaviour a Node upgrade could change, not because it
 * fixes anything. Claiming otherwise would be a fabricated justification.
 */
function bytesDiffer(target: string, text: string): boolean {
  return Buffer.compare(fs.readFileSync(target), Buffer.from(text, "utf-8")) !== 0;
}

/**
 * Write `files` into a temporary sibling directory and move it into place with ONE rename.
 *
 * Why not write `<version>/` directly: a crash, a full disk, or a kill between two
 * `writeFileSync` calls would leave a PARTIAL published directory, which the immutability
 * gate would then refuse on every subsequent build — turning a correctness guarantee into a
 * permanent build failure that only a manual delete could clear. A rename is the closest
 * thing to atomic that a filesystem offers, so a published directory is either absent or
 * complete.
 *
 * The temp directory is a SIBLING (same filesystem) because rename across devices fails;
 * `.tmp-` prefixed and removed on failure so a crashed run leaves no residue that
 * `writeManifest`'s version discovery could mistake for a version.
 */
function publishAtomically(
  root: string,
  versionDir: string,
  files: ReadonlyArray<{ file: string; text: string }>
): void {
  const staging = path.join(root, `.tmp-${path.basename(versionDir)}-${process.pid}`);
  fs.rmSync(staging, { recursive: true, force: true });
  fs.mkdirSync(staging, { recursive: true });
  try {
    for (const { file, text } of files) {
      fs.writeFileSync(path.join(staging, file), text, "utf-8");
    }
    fs.renameSync(staging, versionDir);
  } catch (error) {
    fs.rmSync(staging, { recursive: true, force: true });
    throw error;
  }
}

/**
 * Write (or verify) `<root>/<version>/` and refresh the manifest.
 *
 * `bundleRoot` defaults to `<cwd>/public/content-bundle`; tests pass a temp directory so they
 * never touch the published tree.
 */
export function emitBundle(bundleRoot?: string): EmitResult {
  const root =
    bundleRoot ?? path.join(process.cwd(), ...CONTENT_BUNDLE_PUBLIC_DIR.split("/"));
  const { payload, version } = buildBundlePayload();
  const versionDir = path.join(root, version);

  const files = bundleFiles(payload);
  const index: BundleIndex = {
    indexFormat: 1,
    version,
    files: files
      .map(({ file, text }) => ({
        file,
        hash: computeItemRevision(text),
        bytes: Buffer.byteLength(text, "utf-8"),
      }))
      .sort((a, b) => cmp(a.file, b.file)),
  };
  const allFiles = [...files, { file: INDEX_FILENAME, text: canonicalJsonText(index) }];

  // (3) Immutability gate. EVERY file is compared before anything is written, so a refusal
  // leaves the published version completely untouched.
  if (fs.existsSync(versionDir)) {
    const differing: string[] = [];
    for (const { file, text } of allFiles) {
      const target = path.join(versionDir, file);
      if (!fs.existsSync(target)) {
        differing.push(`${file} (missing)`);
        continue;
      }
      if (bytesDiffer(target, text)) differing.push(`${file} (bytes differ)`);
    }
    const expected = new Set(allFiles.map((f) => f.file));
    for (const name of fs.readdirSync(versionDir).sort(cmp)) {
      if (!expected.has(name)) differing.push(`${name} (unexpected extra file)`);
    }

    if (differing.length > 0) {
      throw new BundleImmutabilityError(
        `Refusing to overwrite published content-bundle version "${version}": ` +
          `${differing.join(", ")}. A published version is immutable (REQ-CP-04 scenario 2, ` +
          `ADR-0011 #7) — the version id is a content hash, so genuinely changed content ` +
          `always lands in a NEW directory. Differing bytes under an unchanged version id ` +
          `mean the directory was hand-edited or the serialiser changed; investigate rather ` +
          `than delete.`
      );
    }
    // Identical: a true no-op. Nothing is rewritten, so no mtime moves.
    return {
      version,
      versionDir,
      manifestPath: writeManifest(root, version),
      unchanged: true,
      files: index.files,
    };
  }

  // (4) Publish completely or not at all.
  fs.mkdirSync(root, { recursive: true });
  publishAtomically(root, versionDir, allFiles);
  return {
    version,
    versionDir,
    manifestPath: writeManifest(root, version),
    unchanged: false,
    files: index.files,
  };
}

/**
 * Write the latest-version manifest.
 *
 * The manifest is the ONLY mutable file in the tree — that mutability is exactly what makes a
 * new version reachable with no app rebuild (REQ-CP-04 scenario 3) — and it holds no content,
 * only pointers.
 *
 * `versions` is DISCOVERED FROM DISK so a manifest that was lost or hand-truncated is rebuilt
 * completely, and it is rewritten even when the version was unchanged so a stale pointer
 * self-heals on the next build. `.tmp-` staging directories are excluded: they are never
 * published versions.
 */
function writeManifest(root: string, latest: string): string {
  fs.mkdirSync(root, { recursive: true });
  const versions = fs
    .readdirSync(root, { withFileTypes: true })
    .filter((e) => e.isDirectory() && !e.name.startsWith(".tmp-"))
    .map((e) => e.name);
  if (!versions.includes(latest)) versions.push(latest);
  versions.sort(cmp);

  const manifest: ContentBundleManifest = {
    manifestFormat: 1,
    latest,
    versions: versions.map((version) => ({
      version,
      path: `${CONTENT_BUNDLE_ROUTE}/${version}`,
    })),
  };
  const manifestPath = path.join(root, MANIFEST_FILENAME);
  const text = canonicalJsonText(manifest);
  // Skip the write when identical, so an unchanged rebuild touches literally nothing.
  if (!fs.existsSync(manifestPath) || bytesDiffer(manifestPath, text)) {
    fs.writeFileSync(manifestPath, text, "utf-8");
  }
  return manifestPath;
}

// ---------- CLI ----------

/**
 * True when this module is the process ENTRY POINT rather than an import.
 *
 * Deliberately a `process.argv[1]` basename check, not `import.meta.url` and not
 * `__filename`. This file is run by `tsx` (already a devDependency — no new dependency) and
 * is ALSO imported by `tests/bundle.test.ts` under vitest, so the guard must (a) work
 * whichever module system each loader picks, since the tree declares no `"type"` while
 * tsconfig says `module: esnext`, and (b) never fire under the test runner, whose `argv[1]`
 * is the vitest binary. `import.meta` and `__filename` are each available in only one of
 * those two loader modes; `process.argv` is available in both. Verified empirically: under
 * `tsx <script>`, `argv[1]` is the script path.
 */
function isEntryPoint(): boolean {
  const invoked = process.argv[1];
  if (!invoked) return false;
  return path.basename(invoked).startsWith("build-content-bundle");
}

function main(): void {
  const started = Date.now();
  const result = emitBundle();
  console.log(
    `content-bundle: version ${result.version} ` +
      `${result.unchanged ? "already published (no-op, bytes identical)" : "emitted"} ` +
      `-> ${path.relative(process.cwd(), result.versionDir)} ` +
      `(${result.files.length} files, ${Date.now() - started}ms)`
  );
  console.log(
    `content-bundle: manifest -> ${path.relative(process.cwd(), result.manifestPath)} ` +
      `(latest = ${result.version})`
  );
}

if (isEntryPoint()) {
  try {
    main();
  } catch (error) {
    // A beat-compile failure, a curriculum cycle, an out-of-domain hash input, or an
    // immutability refusal all land here and must fail the build LOUDLY.
    console.error(
      `content-bundle: BUILD FAILED — ${(error as Error).name}: ${(error as Error).message}`
    );
    process.exitCode = 1;
  }
}
