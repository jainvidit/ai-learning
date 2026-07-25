import { defineCollection, defineConfig, s } from "velite";

/**
 * BUILD-TIME MDX COMPILATION (REQ-CP-01).
 *
 * Lesson MDX is compiled HERE, at build time, and emitted to `.velite/lessons.json`.
 * Nothing compiles MDX in the request path any more — `next-mdx-remote` is removed from
 * the dependency tree entirely.
 *
 * WIRING NOTE (Next.js 16 / Turbopack). Turbopack is the default bundler for BOTH
 * `next dev` and `next build` in 16.x (docs/nextjs-conventions.md, "Build System:
 * Turbopack Now Default"), and Velite ships no Turbopack integration — its only bundler
 * integration is a webpack-era plugin, which would additionally force `next build
 * --webpack` and so is doubly unusable here. Velite is therefore wired by SCRIPT
 * CHAINING in package.json (`velite build --clean && next build`), never by a bundler
 * plugin. `content:watch` (`velite dev`) is the dev-time watch variant; `dev` and
 * `dev:e2e` gain a one-shot `velite build &&` prefix so a dev server never boots against
 * missing compiled output. No other script body changes.
 *
 * SCHEMA OWNERSHIP. This collection schema is deliberately NOT `src/lib/schema.ts`.
 * `schema.ts` is the steward-owned AUTHORING contract
 * (.program/interfaces/content-schema.md) and remains the sole authority for
 * `npm run validate` and for the frontmatter `src/lib/content.ts` hands to pages. The
 * schema below is only Velite's own compile-time gate: it asserts the four core
 * frontmatter fields exist so a malformed lesson fails the BUILD loudly. Authored
 * extension fields (skillIds / tier / objectiveSkills, REQ-CP-03) are intentionally not
 * repeated here — unknown keys are dropped from Velite's output, so they pass through
 * compilation untouched and reach pages via `schema.ts` instead. That is what keeps the
 * two files from drifting into a second, competing authoring contract.
 *
 * BEAT COMPILATION IS NOT THIS ITEM. Emitting the ordered beat array (REQ-CP-02) is
 * ROOT.1.1.2. This config moves MDX compilation to build time and nothing more.
 */
const lessons = defineCollection({
  name: "Lesson",
  // Velite patterns are resolved relative to `root` (below), i.e. `content/`.
  pattern: "modules/*/lessons/*/lesson.mdx",
  schema: s
    .object({
      // Core lesson frontmatter — mirrors LessonFrontmatterSchema's REQUIRED fields only.
      id: s.string().min(1),
      title: s.string().min(1),
      minutes: s.number(),
      objectives: s.array(s.string()).min(1),
      // Path of the source file relative to `root`, used to derive module/lesson identity.
      filePath: s.path(),
      // Compiled MDX. Velite's default `outputFormat` is 'function-body', so this is a
      // JS function BODY (a string) — not raw MDX, and not a path to a module.
      // `<Callout>`, `<Exercise>`, `<TokenVisualizer>` and `<NextWordGame>` are left
      // deliberately unresolved: MDX resolves them from the `components` map supplied at
      // render time, which is exactly how the interim renderer keeps the existing
      // components map (and therefore the existing DOM) alive.
      code: s.mdx(),
    })
    .transform((data) => {
      // filePath looks like "modules/<moduleId>/lessons/<lessonId>/lesson".
      const segments = data.filePath.split("/");
      const moduleId = segments[1] ?? "";
      const lessonId = segments[3] ?? "";
      return {
        ...data,
        moduleId,
        lessonId,
        /** Same shape as `lessonKey()` in src/lib/content.ts. */
        key: `${moduleId}/${lessonId}`,
      };
    }),
});

export default defineConfig({
  root: "content",
  output: {
    data: ".velite",
    // Assets land under public/static so Next serves them at /static/**. No lesson
    // currently references a local asset, so this path is a forward-looking default.
    assets: "public/static",
    base: "/static/",
    name: "[name]-[hash:8].[ext]",
    // `clean: false` here so a Velite run never deletes emitted ASSETS out from under a
    // running server. Staleness of the DATA dir is handled by `--clean` on the
    // `content:build` / `build` scripts instead, which is scoped and explicit.
    clean: false,
  },
  collections: { lessons },
  // Fail the build on any schema violation rather than warning and emitting partial data.
  strict: true,
});
