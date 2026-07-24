/**
 * Validates all content against src/lib/schema.ts.
 * Run: npm run validate
 * Authoring agents MUST pass this before declaring a module done.
 */
import fs from "node:fs";
import path from "node:path";
import matter from "gray-matter";
import {
  CurriculumSchema,
  ModuleMetaSchema,
  ExercisesFileSchema,
  LessonFrontmatterSchema,
} from "../src/lib/schema";

const ROOT = process.cwd();
const CONTENT = path.join(ROOT, "content");
const MODULES = path.join(CONTENT, "modules");
const TEMPLATES = path.join(ROOT, "sandbox", "templates");

let errors = 0;
function fail(msg: string) {
  errors++;
  console.error(`  ✗ ${msg}`);
}

const curriculum = CurriculumSchema.parse(
  JSON.parse(fs.readFileSync(path.join(CONTENT, "curriculum.json"), "utf-8"))
);
console.log(`curriculum.json: ${curriculum.modules.length} modules`);

const ids = new Set(curriculum.modules.map((m) => m.id));
for (const m of curriculum.modules) {
  for (const req of m.requires) {
    if (!ids.has(req)) fail(`${m.id}: unknown prerequisite "${req}"`);
  }
}

// Load verifier registry ids (challenge verifierId must exist)
let verifierIds = new Set<string>();
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { verifiers } = require("../src/lib/verifiers/index");
  verifierIds = new Set(Object.keys(verifiers));
} catch {
  console.log("  (verifier registry not present yet — skipping verifierId checks)");
}

for (const m of curriculum.modules.filter((m) => m.status === "built")) {
  const dir = path.join(MODULES, m.id);
  console.log(`module ${m.id}:`);
  if (!fs.existsSync(path.join(dir, "module.json"))) {
    fail(`missing ${m.id}/module.json`);
    continue;
  }
  const meta = ModuleMetaSchema.parse(
    JSON.parse(fs.readFileSync(path.join(dir, "module.json"), "utf-8"))
  );
  if (meta.id !== m.id) fail(`module.json id "${meta.id}" != folder "${m.id}"`);

  for (const lesson of meta.lessons) {
    const ldir = path.join(dir, "lessons", lesson.id);
    const mdxPath = path.join(ldir, "lesson.mdx");
    if (!fs.existsSync(mdxPath)) {
      fail(`missing ${m.id}/lessons/${lesson.id}/lesson.mdx`);
      continue;
    }
    const { data, content } = matter(fs.readFileSync(mdxPath, "utf-8"));
    const fmResult = LessonFrontmatterSchema.safeParse(data);
    if (!fmResult.success) {
      fail(`${lesson.id}/lesson.mdx frontmatter: ${fmResult.error.message}`);
      continue;
    }

    const exPath = path.join(ldir, "exercises.json");
    const exercises = fs.existsSync(exPath)
      ? ExercisesFileSchema.safeParse(JSON.parse(fs.readFileSync(exPath, "utf-8")))
      : { success: true as const, data: [] };
    if (!exercises.success) {
      fail(`${lesson.id}/exercises.json: ${exercises.error.message}`);
      continue;
    }

    // Every exercise must have an <Exercise id="..."/> anchor in the MDX
    for (const ex of exercises.data) {
      const anchor = new RegExp(`<Exercise\\s+id=["']${ex.id}["']`);
      if (!anchor.test(content))
        fail(`${lesson.id}: exercise "${ex.id}" has no <Exercise id> anchor in lesson.mdx`);
      if ((ex.type === "terminal" || ex.type === "challenge") && !fs.existsSync(path.join(TEMPLATES, ex.sandboxTemplate)))
        fail(`${lesson.id}/${ex.id}: sandbox template "${ex.sandboxTemplate}" not found in sandbox/templates/`);
      if (ex.type === "challenge" && verifierIds.size > 0 && !verifierIds.has(ex.verifierId))
        fail(`${lesson.id}/${ex.id}: verifierId "${ex.verifierId}" not in registry`);
      if (ex.type === "quiz") {
        for (const q of ex.questions) {
          const optIds = new Set(q.options.map((o) => o.id));
          for (const c of q.correctOptionIds)
            if (!optIds.has(c)) fail(`${lesson.id}/${ex.id}/${q.id}: correct option "${c}" not in options`);
          if (q.kind === "single" && q.correctOptionIds.length !== 1)
            fail(`${lesson.id}/${ex.id}/${q.id}: kind "single" must have exactly 1 correct option`);
        }
      }
    }
    console.log(`  ✓ ${lesson.id} (${exercises.data.length} exercises)`);
  }
}

if (errors > 0) {
  console.error(`\n${errors} error(s).`);
  process.exit(1);
}
console.log("\nAll content valid.");
