/**
 * Copies sandbox/templates/<lessonId> → sandbox/live/<profileId>/<lessonId>.
 * Usage: npm run seed-sandboxes [-- <profileId>]  (defaults to all profiles)
 */
import fs from "node:fs";
import path from "node:path";

const ROOT = process.cwd();
const TEMPLATES = path.join(ROOT, "sandbox", "templates");
const LIVE = path.join(ROOT, "sandbox", "live");
const PROFILES = path.join(ROOT, "data", "profiles.json");

const profileArg = process.argv[2];
let profileIds: string[] = [];
if (profileArg) {
  profileIds = [profileArg];
} else if (fs.existsSync(PROFILES)) {
  profileIds = JSON.parse(fs.readFileSync(PROFILES, "utf-8")).profiles.map(
    (p: { id: string }) => p.id
  );
}

if (!fs.existsSync(TEMPLATES)) {
  console.log("no sandbox/templates yet — nothing to seed");
  process.exit(0);
}

for (const profileId of profileIds) {
  for (const tpl of fs.readdirSync(TEMPLATES)) {
    const src = path.join(TEMPLATES, tpl);
    const dest = path.join(LIVE, profileId, tpl);
    if (!fs.statSync(src).isDirectory()) continue;
    fs.rmSync(dest, { recursive: true, force: true });
    fs.cpSync(src, dest, { recursive: true });
    console.log(`seeded ${profileId}/${tpl}`);
  }
}
console.log("done");
