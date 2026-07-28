/**
 * CONTENT BUNDLE — shape + reader (REQ-CP-04, REQ-CP-05).
 *
 * This module owns the bundle's TYPE contract and the READ side. The emit side is
 * `scripts/build-content-bundle.ts`, which imports these types rather than declaring its
 * own, so producer and consumer cannot drift.
 *
 * WHAT THE BUNDLE IS. One immutable, content-addressed release of all authored content:
 * the curriculum DAG with COMPUTED layout hints, every built lesson's beat array, the
 * exercise bank, the calibration-goldens section, and the revisions sidecar + migration
 * maps. Published under a single version identifier — a short content hash of the payload
 * (ADR-0011 #7) — at `public/content-bundle/<version>/`, alongside a mutable
 * `public/content-bundle/manifest.json` naming the latest version.
 *
 * WHY `public/` SATISFIES "no app redeploy" (REQ-CP-04 scenario 3). Verified against THIS
 * Next version (16.2.11) rather than recalled from training data:
 * `node_modules/next/dist/docs/01-app/03-api-reference/03-file-conventions/public-folder.md`
 * states Next "cannot safely cache assets in the `public` folder because they may change"
 * and serves them with `Cache-Control: public, max-age=0` — i.e. `public/` is read from
 * DISK at request time, not baked into `.next/`. `next.config.ts` sets no `output` key, so
 * there is no `export`/`standalone` copy step to invalidate that. A new version directory
 * appearing after the server started is therefore served by the RUNNING server with no
 * rebuild and no restart. Restated for the local-desktop edition per ADR-0007: the spec's
 * "CDN/static route" is `public/`; there is no CDN.
 *
 * WHAT THIS MODULE DELIBERATELY DOES NOT DO:
 *   - It never CACHES the manifest. The manifest is the mutable pointer; memoising it would
 *     pin a long-lived process to whichever version it first saw and silently defeat
 *     scenario 3. Version PAYLOADS are memoised, which is sound precisely because a
 *     published version's bytes can never change (the emitter refuses).
 *   - It imports no Node built-in at module scope. `node:fs/promises` is reached through a
 *     dynamic import inside the filesystem branch only, so importing this module from a
 *     client component can never drag `fs` into the browser bundle.
 *   - It does not re-derive beats, revisions, or layout. Those are emitter OUTPUT; this
 *     module reads them. Re-deriving would mean two implementations of one truth.
 */

import type { Beat } from "./beats";
import type { Exercise, Track } from "./schema";
import type { MigrationEntry } from "./revisions";

// ---------- Locations ----------

/** Public route prefix the bundle is served from (browser-facing). */
export const CONTENT_BUNDLE_ROUTE = "/content-bundle";
/** Repo-root-relative directory backing {@link CONTENT_BUNDLE_ROUTE}. */
export const CONTENT_BUNDLE_PUBLIC_DIR = "public/content-bundle";
/** The one mutable file in the tree: the latest-version pointer. */
export const MANIFEST_FILENAME = "manifest.json";
/** Whole-payload file inside a version directory (one fetch gets everything). */
export const BUNDLE_FILENAME = "bundle.json";
/** Per-version file inventory + per-file content hashes. */
export const INDEX_FILENAME = "index.json";

/**
 * The per-section files inside a version directory.
 *
 * Both forms are emitted on purpose: `bundle.json` is one fetch for the app, and the
 * per-section files let a consumer that only needs the curriculum DAG (the metro map)
 * avoid pulling the whole exercise bank. They are projections of one payload, so they
 * cannot disagree — a property the emitter's tests assert directly.
 */
export const BUNDLE_SECTION_FILES = {
  curriculum: "curriculum.json",
  beats: "beats.json",
  exercises: "exercises.json",
  goldens: "goldens.json",
  revisions: "revisions.json",
  migrations: "migrations.json",
} as const;

// ---------- Payload shape ----------

/**
 * Metro-map layout hint. COMPUTED from the DAG, never authored: `col` is the module's
 * topological depth over `requires` edges, `lane` its row inside its track's lane band
 * (LANE-DEPENDENCIES "Metro-map layout data" row — "(col,lane) math, not hand-placed").
 * `(col, lane)` is unique across the bundle.
 */
export type BundleLayoutHint = {
  col: number;
  lane: number;
};

export type BundleCurriculumNode = {
  id: string;
  title: string;
  track: Track;
  summary: string;
  status: "built" | "spec";
  /** Prerequisite module ids, verbatim from curriculum.json. */
  requires: string[];
  layout: BundleLayoutHint;
};

/** A requires edge, oriented prerequisite -> dependent (the direction the map draws). */
export type BundleCurriculumEdge = {
  from: string;
  to: string;
};

export type BundleCurriculumLayout = {
  /** Number of topological columns; valid `col` values are 0..columns-1. */
  columns: number;
  /** Number of lanes; valid `lane` values are 0..lanes-1. */
  lanes: number;
  /** Lane band per track, in the order tracks first appear in curriculum.json. */
  bandByTrack: Record<string, { start: number; width: number }>;
};

export type BundleCurriculum = {
  nodes: BundleCurriculumNode[];
  edges: BundleCurriculumEdge[];
  layout: BundleCurriculumLayout;
};

/**
 * One authored exercise in the bank, carrying its location.
 *
 * `itemId` is the stable, collision-free id the revisions sidecar keys on (REQ-CP-05):
 * `<lessonKey>#<exerciseId>`. Authored exercise ids are only LESSON-scoped, so qualifying
 * them is what makes a single flat revisions map well defined — and `lessonKey` +
 * `exerciseId` is already exactly how the progress store addresses an exercise.
 */
export type BundleExerciseBankEntry = {
  itemId: string;
  moduleId: string;
  lessonId: string;
  lessonKey: string;
  exerciseId: string;
  type: Exercise["type"];
  exercise: Exercise;
};

/** The four case kinds REQ-JP-05 scenario 2 requires of every golden family. */
export type BundleGoldenCaseKind =
  | "clear-pass"
  | "clear-fail"
  | "boundary"
  | "adversarial";

export type BundleGoldenCase = {
  caseId: string;
  kind: BundleGoldenCaseKind;
  /** Revision of the item this case was calibrated against. */
  itemRevision?: string;
};

export type BundleGoldenFamily = {
  familyId: string;
  /** Exercise item ids this family covers. */
  itemIds: string[];
  cases: BundleGoldenCase[];
};

/**
 * Calibration goldens (REQ-CP-04, cross-linked from REQ-JP-05).
 *
 * EMPTY-BUT-STRUCTURED in this release — a DEVIATION recorded on ROOT.1.1.4 and
 * pre-authorized by its acceptance criterion ("empty-but-structured section if none exist
 * yet, noted as deviation"). The authored corpus contains no golden sets: nothing under
 * `content/` declares one and the judge lane that produces them (REQ-JP-05) has not
 * shipped. Shipping the section with its shape fixed and zero entries keeps the consumer
 * contract stable and makes the gap explicit and greppable, instead of omitting the key
 * and forcing every consumer into a presence check. Populating `families` later is purely
 * additive and changes no other section.
 */
export type BundleGoldens = {
  goldensFormat: 1;
  /** One entry per exercise family that has goldens. Empty until the judge lane lands them. */
  families: BundleGoldenFamily[];
  /** Total golden cases across families. */
  count: number;
  note: string;
};

/**
 * The revisions sidecar (REQ-CP-05, ADR-0011 #6 — a SIDECAR precisely because
 * `itemRevision` may not be a field on the frozen Beat shape).
 *
 * Three maps, all `id -> 16-hex itemRevision` produced by `src/lib/revisions.ts`:
 *   - `exercises` keyed `<lessonKey>#<exerciseId>` over the authored exercise object;
 *   - `beats` keyed `<lessonKey>#<beatId>` over the compiled beat descriptor;
 *   - `lessons` keyed `<lessonKey>` over frontmatter + MDX body + the lesson's beat ids.
 *
 * `lessons` exists because a beat descriptor carries no prose: editing a paragraph must
 * still flip SOME revision, and the lesson is the smallest unit whose source the bundle
 * actually holds. Deriving per-beat prose slices would mean re-segmenting MDX — i.e.
 * reimplementing the beat compiler, which this item may not do.
 */
export type BundleRevisions = {
  exercises: Record<string, string>;
  beats: Record<string, string>;
  lessons: Record<string, string>;
};

/**
 * The hashed payload. The version id is a content hash OF THIS OBJECT, so the version
 * string lives OUTSIDE it (on the directory name, the index and the manifest) and never
 * inside — a self-referential field could not be hashed.
 */
export type ContentBundlePayload = {
  bundleFormat: 1;
  curriculum: BundleCurriculum;
  /** lessonKey ("moduleId/lessonId") -> ordered beat array. */
  beats: Record<string, Beat[]>;
  exercises: BundleExerciseBankEntry[];
  goldens: BundleGoldens;
  revisions: BundleRevisions;
  migrations: MigrationEntry[];
};

/** A loaded bundle: the payload plus the version it was published under. */
export type ContentBundle = ContentBundlePayload & {
  version: string;
};

export type BundleFileEntry = {
  file: string;
  /** 16-hex content hash of the file's exact bytes (as UTF-8 text). */
  hash: string;
  bytes: number;
};

export type BundleIndex = {
  indexFormat: 1;
  version: string;
  files: BundleFileEntry[];
};

export type BundleManifestVersionEntry = {
  version: string;
  /** Route-relative path of the version directory, e.g. "/content-bundle/<version>". */
  path: string;
};

/** `public/content-bundle/manifest.json` — the mutable latest-version pointer. */
export type ContentBundleManifest = {
  manifestFormat: 1;
  /** Version a fresh reader should load. */
  latest: string;
  /** Every version present on disk, lexicographically sorted. */
  versions: BundleManifestVersionEntry[];
};

// ---------- Source resolution ----------

/**
 * Where to read from. `dir` is a filesystem path to the `public/content-bundle` directory
 * (server, build and test use); `baseUrl` is an HTTP base (browser use, and the only mode
 * that exercises the static route end to end).
 */
export type BundleSource =
  | { kind: "dir"; dir: string }
  | { kind: "url"; baseUrl: string };

export class BundleReadError extends Error {
  readonly cause?: unknown;

  constructor(message: string, cause?: unknown) {
    super(message);
    this.name = "BundleReadError";
    this.cause = cause;
  }
}

/**
 * Default source: the filesystem directory under the repo root when running in Node, the
 * public route when running in a browser.
 */
export function defaultBundleSource(): BundleSource {
  const isNode =
    typeof process !== "undefined" &&
    typeof process.versions?.node === "string" &&
    typeof window === "undefined";
  if (isNode) {
    return { kind: "dir", dir: `${process.cwd()}/${CONTENT_BUNDLE_PUBLIC_DIR}` };
  }
  return { kind: "url", baseUrl: CONTENT_BUNDLE_ROUTE };
}

/** Forward slashes only — Node's fs accepts them on Windows, and URLs require them. */
function joinPath(...parts: string[]): string {
  return parts
    .map((part, i) =>
      i === 0 ? part.replace(/[/\\]+$/, "") : part.replace(/^[/\\]+|[/\\]+$/g, "")
    )
    .filter((part) => part.length > 0)
    .join("/");
}

async function readSourceText(
  source: BundleSource,
  relativePath: string,
  { noStore }: { noStore: boolean }
): Promise<string> {
  if (source.kind === "dir") {
    // Dynamic so this module stays client-importable (see file header).
    const { readFile } = await import("node:fs/promises");
    return readFile(joinPath(source.dir, relativePath), "utf-8");
  }
  const url = joinPath(source.baseUrl, relativePath);
  // `no-store` is stated EXPLICITLY for the manifest rather than relying on this version's
  // fetch-cache defaults. Next 16 does not cache `fetch` by default (docs/nextjs-conventions.md
  // "fetch() is NOT cached by default"), but a cached manifest is precisely how "new version
  // without redeploy" would silently regress, so the guarantee is stated at the call site
  // instead of inherited from a default that a future config could flip.
  const response = await fetch(url, noStore ? { cache: "no-store" } : undefined);
  if (!response.ok) {
    throw new BundleReadError(
      `GET ${url} failed with ${response.status} ${response.statusText}.`
    );
  }
  return response.text();
}

async function readJson<T>(
  source: BundleSource,
  relativePath: string,
  options: { noStore: boolean }
): Promise<T> {
  let text: string;
  try {
    text = await readSourceText(source, relativePath, options);
  } catch (error) {
    if (error instanceof BundleReadError) throw error;
    throw new BundleReadError(
      `Could not read "${relativePath}" from the content bundle ` +
        `(${source.kind === "dir" ? source.dir : source.baseUrl}). Run ` +
        `\`npm run build:content\` to emit it.`,
      error
    );
  }
  try {
    return JSON.parse(text) as T;
  } catch (error) {
    throw new BundleReadError(
      `"${relativePath}" in the content bundle is not valid JSON.`,
      error
    );
  }
}

// ---------- Reader ----------

/**
 * Process-lifetime cache of IMMUTABLE version payloads, keyed by `<source>::<version>`.
 * Sound because a published version can never change its bytes (the emitter refuses to
 * overwrite one), and because it is the manifest — never cached — that decides which
 * version is current.
 */
const bundleCache = new Map<string, ContentBundle>();

function sourceKey(source: BundleSource): string {
  return source.kind === "dir" ? `dir:${source.dir}` : `url:${source.baseUrl}`;
}

/** Drop the cached version payloads. For tests and long-lived processes. */
export function clearBundleCache(): void {
  bundleCache.clear();
}

/** Read the latest-version manifest. NEVER cached — see the file header. */
export async function loadBundleManifest(
  source: BundleSource = defaultBundleSource()
): Promise<ContentBundleManifest> {
  const manifest = await readJson<ContentBundleManifest>(source, MANIFEST_FILENAME, {
    noStore: true,
  });
  if (
    manifest === null ||
    typeof manifest !== "object" ||
    typeof manifest.latest !== "string" ||
    manifest.latest.length === 0
  ) {
    throw new BundleReadError(
      `${MANIFEST_FILENAME} is malformed: expected an object with a non-empty "latest".`
    );
  }
  return manifest;
}

/** Load one named version. Immutable, so memoised. */
export async function loadBundleVersion(
  version: string,
  source: BundleSource = defaultBundleSource()
): Promise<ContentBundle> {
  const key = `${sourceKey(source)}::${version}`;
  const cached = bundleCache.get(key);
  if (cached) return cached;

  const payload = await readJson<ContentBundlePayload>(
    source,
    joinPath(version, BUNDLE_FILENAME),
    { noStore: false }
  );
  if (payload === null || typeof payload !== "object" || payload.bundleFormat !== 1) {
    throw new BundleReadError(
      `${version}/${BUNDLE_FILENAME} is malformed: expected bundleFormat 1.`
    );
  }
  const bundle: ContentBundle = { ...payload, version };
  bundleCache.set(key, bundle);
  return bundle;
}

/**
 * Resolve the manifest, then load the version it names (REQ-CP-04 scenario 3: publishing a
 * new version directory plus a manifest bump is ENOUGH — no rebuild, no redeploy, no
 * cache-invalidation call).
 */
export async function loadLatestBundle(
  source: BundleSource = defaultBundleSource()
): Promise<ContentBundle> {
  const manifest = await loadBundleManifest(source);
  return loadBundleVersion(manifest.latest, source);
}

/** Per-version file inventory, for integrity checks and diagnostics. */
export async function loadBundleIndex(
  version: string,
  source: BundleSource = defaultBundleSource()
): Promise<BundleIndex> {
  return readJson<BundleIndex>(source, joinPath(version, INDEX_FILENAME), {
    noStore: false,
  });
}

// ---------- Item ids + selectors ----------

/** The stable revisions-sidecar item id for an authored exercise (REQ-CP-05). */
export function exerciseItemId(lessonKey: string, exerciseId: string): string {
  return `${lessonKey}#${exerciseId}`;
}

/** The stable revisions-sidecar item id for a compiled beat. */
export function beatItemId(lessonKey: string, beatId: string): string {
  return `${lessonKey}#${beatId}`;
}

/** The ordered beat array for one lesson, or `undefined` if it is not in the bundle. */
export function bundleBeatsFor(
  bundle: ContentBundle,
  lessonKey: string
): Beat[] | undefined {
  return bundle.beats[lessonKey];
}

/** Every exercise-bank entry for one lesson, in authored order. */
export function bundleExercisesFor(
  bundle: ContentBundle,
  lessonKey: string
): BundleExerciseBankEntry[] {
  return bundle.exercises.filter((entry) => entry.lessonKey === lessonKey);
}

/**
 * `itemRevision` of an exercise — i.e. the value an attempt event must record
 * (REQ-CP-05 / REQ-EL-02).
 */
export function exerciseRevision(
  bundle: ContentBundle,
  lessonKey: string,
  exerciseId: string
): string | undefined {
  return bundle.revisions.exercises[exerciseItemId(lessonKey, exerciseId)];
}

/** Migration entries leading FROM a given revision of an item (REQ-CP-05 scenario 2). */
export function migrationsFrom(
  bundle: ContentBundle,
  itemId: string,
  fromRevision: string
): MigrationEntry[] {
  return bundle.migrations.filter(
    (entry) => entry.itemId === itemId && entry.fromRevision === fromRevision
  );
}
